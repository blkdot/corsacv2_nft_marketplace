// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./ICorsacNFTFactory.sol";
import "./ICorsacContract.sol";
import "./IERC721Tradable.sol";
import "./IERC1155Tradable.sol";
import "hardhat/console.sol";

contract CorsacNFTFactory is 
    ICorsacNFTFactory, 
    Ownable, 
    ReentrancyGuard 
{
    using Address for address;

    struct CorsacNFTSale {
        uint256 saleId;
        address creator;
        address seller;
        address sc;
        uint256 tokenId;
        uint256 copy;
        uint256 payment;
        uint256 basePrice;
        uint256 method;
        uint256 startTime;
        uint256 endTime;
        uint256 feeRatio;
        uint256 royaltyRatio;
        uint256 balance;
    }

    struct BookInfo {
        address user;
        uint256 salePrice;
    }

    /*
     delay period to add a creator to the list
     */
    uint256 public DELAY_PERIOD = 3 seconds;

    /*
     deployer for single/multiple NFT collection
     */
    address private singleDeployer;
    address private multipleDeployer;

    /*
     array of collection addresses including ERC721 and ERC1155
     */
    address[] private collections;
    /*
     check if the collection has already been added to this factory
     */
    mapping(address => bool) collectionOccupation;

    /*
     token address for payment
     */
    address[] private paymentTokens;

    /*
     check if it is the creator permitted by owner(admin)
     */
    mapping(address => bool) private creators;
    /*
     epoch timestamp of starting the process that permits one account to be a creator
     */
    mapping(address => uint256) private pendingTime;
    /*
     pending value that presents the creator is enabled/disabled by true/false
     */
    mapping(address => bool) private pendingValue;

    /*
     booking info
     */
    mapping(uint256 => BookInfo[]) private bookInfo;

    /*
     default fee value set by owner of the contract, defaultFeeRatio / 10000 is the real ratio.
     */
    uint256 public defaultFeeRatio;

    /*
     default royalty value set by owner of the contract, defaultRoyaltyRatio / 10000 is the real ratio.
     */
    uint256 public defaultRoyaltyRatio;

    /*
     dev address
     */
    address public devAddress;

    /*
     sale list by its created index
     */
    mapping(uint256 => CorsacNFTSale) saleList;

    /*
     sale list count or future index to be created
     */
    uint256 public saleCount;

    /**
     * event that marks the creator has been permitted by an owner(admin)
     */
    event SetCreatorForFactory(address account, bool set);

    /**
     * event when an owner sets default fee ratio
     */
    event SetDefaultFeeRatio(address owner, uint256 newFeeRatio);

    /**
     * event when an owner sets default royalty ratio
     */
    event SetDefaultRoyaltyRatio(address owner, uint256 newRoyaltyRatio);

    /**
     * event when a new payment token set
     */
    event PaymentTokenSet(uint256 id, address indexed tokenAddress);

    /**
     * event when a new ERC721 contract is created.
     * Do not remove this event even if it is not used.
     */
    event CreatedCorsacERC721(address indexed factory, address indexed newContract);

    /**
     * event when a new ERC1155 contract is created.
     * Do not remove this event even if it is not used.
     */
    event CreatedCorsacERC1155(address indexed factory, address indexed newContract);

    /**
     * event when an seller lists his/her token on sale
     */
    event ListedOnSale(
        uint256 saleId,
        address creator,
        address seller,
        address sc,
        uint256 tokenId,
        uint256 copy,
        uint256 payment,
        uint256 basePrice,
        uint256 method,
        uint256 startTime,
        uint256 endTime,
        uint256 feeRatio,
        uint256 royaltyRatio
    );

    /**
     * event when a seller cancels his sale
     */
    event RemoveFromSale(
        uint256 saleId,
        CorsacNFTSale saleInfo
    );

    /**
     * event when a user makes an offer for unlisted NFTs
     */
    event MakeOffer(
        address indexed user,
        uint256 saleId,
        CorsacNFTSale ti
    );

    /**
     * event when a user accepts an offer
     */
    event AcceptOffer(
        address indexed winner,
        uint256 saleId,
        CorsacNFTSale ti
    );

    /**
     * event when a user makes an offer for fixed-price sale
     */
    event Buy(
        address indexed user,
        uint256 saleId,
        CorsacNFTSale saleInfo,
        uint256 amount
    );

    /**
     * event when a user places a bid for timed-auction sale
     */
    event PlaceBid(
        address indexed user,
        uint256 bidPrice,
        uint256 saleId,
        CorsacNFTSale saleInfo
    );

    /**
     * event when timed-auction times out
     */
    event AuctionResult(
        address indexed winner,
        uint256 salePrice,
        uint256 saleId,
        CorsacNFTSale saleInfo
    );

    /**
     * event when a trade is successfully made.
     */
    event Trade(
        uint256 saleId,
        CorsacNFTSale sale,
        uint256 amount,
        uint256 timestamp,
        uint256 paySeller,
        address owner,
        address winner,
        uint256 fee,
        uint256 royalty,
        address devAddress,
        uint256 devFee
    );

    /**
     * event when deployers are updated
     */
    event UpdateDeployers(
        address indexed singleCollectionDeployer,
        address indexed multipleCollectionDeployer
    );

    /**
     * event when NFT are transferred
     */
    event TransferNFTs(
        address from,
        address to,
        address collection,
        uint256[] ids,
        uint256[] amounts
    );

    /**
     * event when seller cancel his timed auction created
     */
    event CancelAuction(
        address indexed user,
        uint256 saleId,
        CorsacNFTSale saleInfo
    );

    /**
     * event when user cancel his bid from timed auction
     */
    event CancelBid(
        address indexed user,
        uint256 saleId
    );

    /**
     * event when owner mint NFT
     */
    event MintTo(
        address collectionAddr,
        address _to,
        string _uri,
        uint256 _quantity,
        bytes data,
        uint256 tokenId
    );

    /**
     * this modifier restricts some privileged action
     */
    modifier creatorOnly() {
        address ms = msg.sender;
        require(
            ms == owner() || creators[ms] == true,
            "neither owner nor creator"
        );
        _;
    }

    /**
     * constructor of the factory does not have parameters
     */
    constructor(
        address singleCollectionDeployer,
        address multipleCollectionDeployer
    ) payable {
        paymentTokens.push(address(0)); // native currency
        
        setDefaultFeeRatio(250);
        setDefaultRoyaltyRatio(300);
        updateDeployers(singleCollectionDeployer, multipleCollectionDeployer);
    }

    receive() external payable {}

    /**
     * @dev this function updates the deployers for ERC721, ERC1155
     * @param singleCollectionDeployer - deployer for ERC721
     * @param multipleCollectionDeployer - deployer for ERC1155
     */
    function updateDeployers(
        address singleCollectionDeployer,
        address multipleCollectionDeployer
    ) public onlyOwner {
        singleDeployer = singleCollectionDeployer;
        multipleDeployer = multipleCollectionDeployer;

        emit UpdateDeployers(singleCollectionDeployer, multipleCollectionDeployer);
    }

    /**
     * This function modifies or adds a new payment token
     */
    function setPaymentToken(uint256 tId, address tokenAddr) public onlyOwner {
        // IERC165(tokenAddr).supportsInterface(type(IERC20).interfaceId);
        require(tokenAddr != address(0), "null address for payment token");

        if (tId >= paymentTokens.length ) {
            tId = paymentTokens.length;
            paymentTokens.push(tokenAddr);
        } else {
            require(tId < paymentTokens.length, "invalid payment token id");
            paymentTokens[tId] = tokenAddr;
        }

        emit PaymentTokenSet(tId, tokenAddr);
    }

    /**
     * This function gets token addresses for payment
     */
    function getPaymentToken() public view returns (address[] memory) {
        return paymentTokens;
    }

    /**
     * start the process of adding a creator to be enabled/disabled
     */
    function startPendingCreator(address account, bool set) external onlyOwner {
        require(pendingTime[account] == 0);

        pendingTime[account] = block.timestamp;
        pendingValue[account] = set;
    }

    /**
     * end the process of adding a creator to be enabled/disabled
     */
    function endPendingCreator(address account) external onlyOwner {
        require((pendingTime[account] + DELAY_PERIOD) < block.timestamp);

        bool curVal = pendingValue[account];
        creators[account] = curVal;
        pendingTime[account] = 0;

        emit SetCreatorForFactory(account, curVal);
    }

    /**
     * set developer address
     */
    function setDevAddr(address addr) public onlyOwner {
        devAddress = addr;
    }

    /**
     * @dev this function creates a new collection of ERC721, ERC1155 to the factory
     * @param collectionType - ERC721 = 0, ERC1155 = 1
     * @param _name - collection name
     * @param _symbol - collection symbol
     * @param _uri - base uri of NFT token metadata
     */
    function createNewCollection(
        ICorsacNFTFactory.CollectionType collectionType,
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) external override returns (address) {
        if (collectionType == ICorsacNFTFactory.CollectionType.ERC721) {
            // create a new ERC721 contract and returns its address
            address newContract = ICorsacERC721(singleDeployer).createContract(_name, _symbol, _uri, address(this));

            require(collectionOccupation[newContract] == false);

            collections.push(newContract);
            collectionOccupation[newContract] = true;

            Ownable(newContract).transferOwnership(msg.sender);

            return newContract;
        } else if (collectionType == ICorsacNFTFactory.CollectionType.ERC1155) {
            // create a new ERC1155 contract and returns its address
            address newContract = ICorsacERC1155(multipleDeployer).createContract(_name, _symbol, _uri, address(this));

            require(collectionOccupation[newContract] == false);

            collections.push(newContract);
            collectionOccupation[newContract] = true;

            Ownable(newContract).transferOwnership(msg.sender);

            return newContract;
        } else revert("Unknown collection contract");
    }

    /**
     * @dev this function adds a collection of ERC721, ERC1155 to the factory
     * @param from - address of NFT collection contract
     */
    function addCollection(address from) external override {
        require(from.isContract());

        if (IERC165(from).supportsInterface(type(IERC721).interfaceId)) {
            require(collectionOccupation[from] == false);

            collections.push(from);
            collectionOccupation[from] = true;

            emit CollectionAdded(ICorsacNFTFactory.CollectionType.ERC721, from);
        } else if (
            IERC165(from).supportsInterface(type(IERC1155).interfaceId)
        ) {
            require(collectionOccupation[from] == false);

            collections.push(from);
            collectionOccupation[from] = true;

            emit CollectionAdded(
                ICorsacNFTFactory.CollectionType.ERC1155,
                from
            );
        } else {
            revert("Error adding unknown NFT collection");
        }
    }

    /**
     * @dev this function creates/mints new NFT by owner
     * @param collectionAddr - collection
     * @param _to - to account
     * @param _uri - uri for NFT
     * @param _quantity - NFT quantity
     */
    function mintTo(
        address collectionAddr, 
        address _to, 
        string memory _uri,
        uint256 _quantity
    ) external {
        require(collectionOccupation[collectionAddr] == true);

        if (IERC165(collectionAddr).supportsInterface(type(IERC721).interfaceId)) {
            IERC721Tradable(collectionAddr).mintTo(_to, _uri);
            bytes memory nbytes = new bytes(0);
            emit MintTo(collectionAddr, _to, _uri, _quantity, nbytes, IERC721Tradable(collectionAddr).getTokenId() - 1);
        } else if (IERC165(collectionAddr).supportsInterface(type(IERC1155).interfaceId)) {
            bytes memory nbytes = new bytes(0);
            emit MintTo(collectionAddr, _to, _uri, _quantity, nbytes, IERC1155Tradable(collectionAddr).create(_to, _quantity, _uri, nbytes));
        } else revert("Not supported NFT contract");
    }

    /**
     * @dev this function transfers NFTs of 'sc' from account 'from' to account 'to' for token ids 'ids'
     * @param sc - address of NFT collection contract
     * @param from - owner of NFTs at the moment
     * @param to - future owner of NFTs
     * @param ids - array of token id to be transferred
     * @param amounts - array of token amount to be transferred
     */
    function transferNFT(
        address sc,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal {
        // require(collectionOccupation[sc] == true);

        if (IERC165(sc).supportsInterface(type(IERC721).interfaceId)) {
            // ERC721 transfer, amounts has no meaning in this case
            uint256 i;
            bytes memory nbytes = new bytes(0);
            for (i = 0; i < ids.length; i++) {
                IERC721(sc).safeTransferFrom(from, to, ids[i], nbytes);
            }
        } else if (IERC165(sc).supportsInterface(type(IERC1155).interfaceId)) {
            // ERC1155 transfer
            bytes memory nbytes = new bytes(0);
            IERC1155(sc).safeBatchTransferFrom(from, to, ids, amounts, nbytes);
        }

        emit TransferNFTs(from, to, sc, ids, amounts);
    }

    /**
     * @dev this function retrieves array of all collections registered to the factory
     */
    function getCollections()
        public
        view
        returns (address[] memory)
    {
        return collections;
    }

    /**
     * @dev this function returns last collection
     */
    function getRecentCollection() public view returns (address) {
        require(collections.length > 0, 'No collections');
        return collections[collections.length - 1];
    }

    /**
     * @dev this function returns collection by index
     * @param index - index of collection
     */
    function getCollection(uint256 index) public view returns (address) {
        require(collections.length > 0, 'No collections');
        require(collections.length > index, 'Invalid index');
        return collections[index];
    }

    /**
     * @dev this function returns token ID from collection
     * @param collectionAddr - collection address
     */
    function getTokenId(address collectionAddr) external view returns (uint256) {
        return IERC721Tradable(collectionAddr).getTokenId();
    }

    /**
     * @dev this function sets default fee ratio.
     */
    function setDefaultFeeRatio(uint256 newFeeRatio) public onlyOwner {
        defaultFeeRatio = newFeeRatio;
        emit SetDefaultFeeRatio(owner(), newFeeRatio);
    }

    /**
     * @dev this function sets default royalty ratio.
     */
    function setDefaultRoyaltyRatio(uint256 newRoyaltyRatio) public onlyOwner {
        defaultRoyaltyRatio = newRoyaltyRatio;
        emit SetDefaultRoyaltyRatio(owner(), newRoyaltyRatio);
    }

    /**
     * @dev this function returns URI string by checking its ERC721 or ERC1155 type.
     */
    function getURIString(address sc, uint256 tokenId) 
        internal 
        view 
        returns (string memory uri, uint256 sc_type) 
    {
        if (IERC165(sc).supportsInterface(type(IERC721).interfaceId)) {
            uri = IContractInfoWrapper(sc).tokenURI(tokenId);
            sc_type = 1;
        } else if (IERC165(sc).supportsInterface(type(IERC1155).interfaceId)) {
            uri = IContractInfoWrapper(sc).uri(tokenId);
            sc_type = 2;
        } else sc_type = 0;
    }

    /**
     * @dev this function sets default royalty ratio.
     * @param sc - address of NFT collection contract
     * @param tokenId - token index in 'sc'
     * @param payment - payment method for buyer/bidder/offerer/auctioner, 0: BNB, 1: BUSD, 2: Corsac, ...
     * @param method - method of sale, 0: fixed price, 1: timed auction, 2: offer
     * @param duration - duration of sale in seconds
     * @param basePrice - price in 'payment' coin
     * @param feeRatio - fee ratio (1/10000) for transaction
     * @param royaltyRatio - royalty ratio (1/10000) for transaction
     * @param isOther - create salse from other ERC721
     */
    function createSale(
        address sc,
        uint256 tokenId,
        uint256 payment,
        uint256 copy,
        uint256 method,
        uint256 duration,
        uint256 basePrice,
        uint256 feeRatio,
        uint256 royaltyRatio,
        uint256 isOther
    ) public {
        (, uint256 sc_type) = getURIString(sc, tokenId);
        address creator = address(0);
        
        if (sc_type == 1) {
            require(
                IERC721(sc).ownerOf(tokenId) == msg.sender,
                "not owner of the ERC721 token to be on sale"
            );
            require(copy == 1, "ERC721 token sale amount is not 1");

            if (isOther == 0) {
                creator = IContractInfoWrapper(sc).getCreator(tokenId);
            } else {
                creator = msg.sender;
            }
            
        } else if (sc_type == 2) {
            uint256 bl = IERC1155(sc).balanceOf(msg.sender, tokenId);
            require(
                bl >= copy && copy > 0,
                "exceeded amount of ERC1155 token to be on sale"
            );

            if (isOther == 0) {
                creator = IContractInfoWrapper(sc).getCreator(tokenId);
            } else {
                creator = msg.sender;
            }
            
        } else revert("Not supported NFT contract");

        uint256 curSaleIndex = saleCount;
        saleCount++;

        CorsacNFTSale storage csns = saleList[curSaleIndex];

        csns.saleId = curSaleIndex;

        csns.creator = creator;
        csns.seller = msg.sender;

        csns.sc = sc;
        csns.tokenId = tokenId;
        csns.copy = copy;
        csns.balance = copy;

        csns.payment = payment;
        csns.basePrice = basePrice;

        csns.method = method;

        csns.startTime = block.timestamp;
        csns.endTime = block.timestamp + duration;

        csns.feeRatio = (feeRatio == 0) ? defaultFeeRatio : feeRatio;
        csns.royaltyRatio = (royaltyRatio == 0)
            ? defaultRoyaltyRatio
            : royaltyRatio;

        emit ListedOnSale(
            curSaleIndex,
            csns.creator,
            csns.seller,
            csns.sc,
            csns.tokenId,
            csns.copy,
            csns.payment,
            csns.basePrice,
            csns.method,
            csns.startTime,
            csns.endTime,
            csns.feeRatio,
            csns.royaltyRatio
        );
    }

    /**
     * @dev this function removes an existing sale
     * @param saleId - index of the sale
     */
    function removeSale(uint256 saleId) external {
        CorsacNFTSale storage csns = saleList[saleId];
        require(msg.sender == csns.seller || msg.sender == owner(), "unprivileged remove");

        _removeSale(saleId);
    }

    /**
     * @dev this function removes an existing sale
     * @param saleId - index of the sale
     */
    function _removeSale(uint256 saleId) internal {
        CorsacNFTSale storage csns = saleList[saleId];

        emit RemoveFromSale(
            saleId,
            csns
        );
        
        csns.seller = address(0);
    }

    /**
     * @dev this function sets default royalty ratio.
     * @param sc - address of NFT collection contract
     * @param tokenId - token index in 'sc'
     * @param payment - payment method for buyer/bidder/offerer/auctioner, 0: BNB, 1: BUSD, 2: Corsac, ...
     * @param duration - duration of sale in seconds
     * @param unitPrice - price in 'payment' coin
     */
    function makeOffer(
        address sc,
        uint256 tokenId,
        address owner,
        uint256 copy,
        uint256 payment,
        uint256 unitPrice,
        uint256 duration
    ) public payable nonReentrant{
        (, uint256 sc_type) = getURIString(sc, tokenId);
        address creator = address(0);

        if (sc_type == 1) {
            require(
                IERC721(sc).ownerOf(tokenId) == owner,
                "invalid owner of the ERC721 token to be offered"
            );
            require(copy == 1, "ERC721 token offer is not 1");
            creator = IContractInfoWrapper(sc).getCreator(tokenId);
        } else if (sc_type == 2) {
            uint256 bl = IERC1155(sc).balanceOf(owner, tokenId);
            require(
                bl >= copy && copy > 0,
                "exceeded amount of ERC1155 token to be offered"
            );
            creator = IContractInfoWrapper(sc).getCreator(tokenId);
        } else revert("Not supported NFT contract");

        require(msg.sender != owner, "Owner is not allowed to make an offer on his NFT");

        uint256 curSaleIndex = saleCount;
        saleCount++;

        CorsacNFTSale storage csns = saleList[curSaleIndex];

        csns.saleId = curSaleIndex;

        csns.creator = creator;
        csns.seller = owner;

        csns.sc = sc;
        csns.tokenId = tokenId;
        csns.copy = copy;
        csns.balance = copy;

        csns.payment = payment;
        csns.basePrice = unitPrice;

        csns.method = 2; // 0: fixed price, 1: timed auction, 2: offer

        csns.startTime = block.timestamp;
        csns.endTime = block.timestamp + duration;

        csns.feeRatio = defaultFeeRatio;
        csns.royaltyRatio = defaultRoyaltyRatio;

        uint256 salePrice = csns.copy * csns.basePrice;
        uint256 serviceFee = salePrice * csns.feeRatio / 10000;
        uint256 royaltyFee = salePrice * csns.royaltyRatio / 10000;
        uint256 totalPay = salePrice + serviceFee + royaltyFee;

        BookInfo[] storage bi = bookInfo[curSaleIndex];
        BookInfo memory newBI = BookInfo(msg.sender, salePrice);
        bi.push(newBI);

        if (csns.payment == 0) {
            require(
                msg.value >= totalPay,
                "insufficient native currency to buy"
            );
            if (msg.value > totalPay) {
                address payable py = payable(msg.sender);
                py.transfer(msg.value - totalPay);
            }
        } else {
            IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
            tokenInst.transferFrom(msg.sender, address(this), totalPay);
        }

        emit MakeOffer(
            newBI.user,
            curSaleIndex,
            csns
        );
    }

    /**
     * @dev this function lets a buyer buy NFTs on sale
     * @param saleId - index of the sale
     * @param amount - amount to purchase from sale
     */
    function buy(uint256 saleId, uint256 amount) public payable nonReentrant {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(csns.startTime <= block.timestamp, "sale not started yet");
        require(
            csns.endTime <= csns.startTime || csns.endTime >= block.timestamp,
            "sale already ended"
        );
        require(csns.method == 0, "offer not for fixed-price sale");
        require(msg.sender != csns.seller, "Seller is not allowed to buy his NFT");
        require(csns.balance >= amount, "exceeded amount than balance of sale");

        uint256 salePrice = amount * csns.basePrice;
        uint256 serviceFee = salePrice * csns.feeRatio / 10000;
        uint256 royaltyFee = salePrice * csns.royaltyRatio / 10000;
        uint256 totalPay = salePrice + serviceFee + royaltyFee;
        
        if (csns.payment == 0) {
            require(
                msg.value >= totalPay,
                "insufficient native currency to buy"
            );
            if (msg.value > totalPay) {
                address payable py = payable(msg.sender);
                py.transfer(msg.value - totalPay);
            }
        } else {
            IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
            tokenInst.transferFrom(msg.sender, address(this), totalPay);
        }

        BookInfo[] storage bi = bookInfo[saleId];
        BookInfo memory newBI = BookInfo(msg.sender, salePrice);

        bi.push(newBI);

        emit Buy(msg.sender, saleId, csns, amount);

        trade(saleId, bi.length - 1, amount);
    }

    /**
     * @dev this function places an bid from a user
     * @param saleId - index of the sale
     * @param price - index of the sale
     */
    function placeBid(uint256 saleId, uint256 price) public payable nonReentrant {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(csns.startTime <= block.timestamp, "sale not started yet");
        require(
            csns.endTime <= csns.startTime || csns.endTime >= block.timestamp,
            "sale already ended"
        );
        require(csns.method == 1, "bid not for timed-auction sale");
        require(msg.sender != csns.seller, "Seller is not allowed to place a bid on his NFT");

        uint256 startingPrice = csns.copy * csns.basePrice;
        uint256 bidPrice = csns.copy * price;
        uint256 serviceFee = bidPrice * csns.feeRatio / 10000;
        uint256 royaltyFee = bidPrice * csns.royaltyRatio / 10000;
        uint256 totalPrice = bidPrice + serviceFee + royaltyFee;
        
        BookInfo[] storage bi = bookInfo[saleId];
        require((bi.length == 0 && startingPrice < bidPrice) || bi[0].salePrice < bidPrice, "bid price is not larger than the last bid's");

        if (csns.payment == 0) {
            if (bi.length > 0) {
                address payable pyLast = payable(bi[0].user);
                uint256 totalPriceLast = bi[0].salePrice + bi[0].salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000;
                pyLast.transfer(totalPriceLast);
            }
            if (msg.value > totalPrice) {
                address payable py = payable(msg.sender);
                py.transfer(msg.value - totalPrice);
            }
        } else {
            IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
            if (bi.length > 0) {
                uint256 totalPriceLast = bi[0].salePrice + bi[0].salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000;
                tokenInst.transfer(bi[0].user, totalPriceLast);
            }
            tokenInst.transferFrom(msg.sender, address(this), totalPrice);
        }

        if (bi.length == 0)  {
            BookInfo memory newBI = BookInfo(msg.sender, bidPrice);
            bi.push(newBI);
        } else {
            bi[0].user = msg.sender;
            bi[0].salePrice = bidPrice;
        }

        emit PlaceBid(
            msg.sender,
            price,
            saleId,
            csns
        );
    }

    /**
     * @dev this function puts an end to timed-auction sale
     * @param saleId - index of the sale of timed-auction
     */
    function finalizeAuction(uint256 saleId) public payable nonReentrant onlyOwner {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(csns.startTime <= block.timestamp, "sale not started yet");
        // finalize timed-auction anytime by owner of this factory contract.
        require(csns.method == 1, "bid not for timed-auction sale");

        BookInfo[] storage bi = bookInfo[saleId];

        // winning to the highest bid
        if (bi.length > 0) {
            uint256 loop;
            uint256 maxPrice = bi[0].salePrice;
            uint256 bookId = 0;

            for (loop = 0; loop < bi.length; loop++) {
                BookInfo memory biItem = bi[loop];
                if (maxPrice < biItem.salePrice) {
                    maxPrice = biItem.salePrice;
                    bookId = loop;
                }
            }

            emit AuctionResult(
                bi[bookId].user,
                bi[bookId].salePrice,
                saleId,
                csns
            );
            trade(saleId, bookId, csns.copy);
        } else {
            _removeSale(saleId);
        }
    }

    /**
     * @dev this function puts an end to offer sale
     * @param saleId - index of the sale of offer
     */
    function acceptOffer(uint256 saleId) public payable nonReentrant {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(csns.startTime <= block.timestamp, "sale not started yet");
        // finalize timed-auction anytime by owner of this factory contract.
        require(csns.method == 2, "not sale for offer");
        require(csns.seller == msg.sender, "only seller can accept offer for his NFT");

        BookInfo[] storage bi = bookInfo[saleId];
        require(bi.length > 0, "nobody made an offer");

        // winning to the highest bid
        if (bi.length > 0) {
            emit AcceptOffer(
                bi[0].user,
                saleId,
                csns
            );
            trade(saleId, 0, csns.copy);
        }
    }

    /**
     * @dev this function transfers NFTs from the seller to the buyer
     * @param saleId - index of the sale to be treated
     * @param bookId - index of the booked winner on a sale
     * @param amount - amount to be traded
     */
    function trade(uint256 saleId, uint256 bookId, uint256 amount) internal {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(csns.balance >= amount, "exceeded amount than balance of sale");

        BookInfo[] storage bi = bookInfo[saleId];
        
        uint256 loop;
        for (loop = 0; loop < bi.length; loop++) {
            BookInfo memory biItem = bi[loop];
            
            if (loop == bookId) {
                // winning bid
                //fee policy
                uint256 fee = biItem.salePrice * csns.feeRatio / 10000;
                uint256 royalty = biItem.salePrice * csns.royaltyRatio / 10000;
                uint256 devFee = 0;
                if (devAddress != address(0)) {
                    devFee = (biItem.salePrice * 30) / 10000;
                }

                uint256 pySeller = biItem.salePrice - devFee;

                if (csns.payment == 0) {
                    address payable py = payable(csns.seller);
                    py.transfer(pySeller);

                    if (fee > 0) {
                        py = payable(owner());
                        py.transfer(fee);
                    }

                    if (royalty > 0) {
                        py = payable(csns.creator);
                        py.transfer(royalty);
                    }

                    if (devFee > 0) {
                        py = payable(devAddress);
                        py.transfer(devFee);
                    }
                } else {
                    IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
                    tokenInst.transfer(
                        csns.seller,
                        pySeller
                    );

                    if (fee > 0) {
                        tokenInst.transfer(owner(), fee);
                    }

                    if (royalty > 0) {
                        tokenInst.transfer(
                            csns.creator,
                            royalty
                        );
                    }

                    if (devFee > 0) {
                        tokenInst.transfer(
                            devAddress,
                            devFee
                        );
                    }
                }

                uint256[] memory ids = new uint256[](1);
                ids[0] = csns.tokenId;
                uint256[] memory amounts = new uint256[](1);
                amounts[0] = amount;
                csns.balance -= amount;

                transferNFT(csns.sc, csns.seller, biItem.user, ids, amounts);

                emit Trade(
                    saleId,
                    csns,
                    amount,
                    block.timestamp,
                    pySeller,
                    owner(),
                    biItem.user,
                    fee,
                    royalty,
                    devAddress,
                    devFee
                );
            } else {
                // failed bid, refund
                if (csns.payment == 0) {
                    address payable py = payable(biItem.user);
                    py.transfer(biItem.salePrice + biItem.salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000);
                } else {
                    IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
                    tokenInst.transfer(
                        biItem.user,
                        biItem.salePrice + biItem.salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000
                    );
                }
            }
        }

        if (csns.balance == 0) {
            // purchased all nfts on the sale
            _removeSale(saleId);
        } else {
            // purchased some nfts on the sale
            bookInfo[saleId].pop();
        }
    }

    /**
     * @dev this function returns all items on sale
     * @param startIdx - starting index in all items on sale
     * @param count - count to be retrieved, the returned array will be less items than count because some items are invalid
     */
    function getSaleInfo(uint256 startIdx, uint256 count)
        external
        view
        returns (CorsacNFTSale[] memory)
    {
        uint256 i;
        uint256 endIdx = startIdx + count;

        uint256 realCount = 0;
        for (i = startIdx; i < endIdx; i++) {
            if (i >= saleCount) break;

            if (!isSaleValid(i)) continue;

            realCount++;
        }

        CorsacNFTSale[] memory ret = new CorsacNFTSale[](realCount);

        uint256 nPos = 0;
        for (i = startIdx; i < endIdx; i++) {
            if (i >= saleCount) break;

            if (!isSaleValid(i)) continue;

            ret[nPos] = saleList[i];
            nPos++;
        }

        return ret;
    }

    /**
     * @dev this function returns validity of the sale
     * @param saleId - index of the sale
     */
    function isSaleValid(uint256 saleId) internal view returns (bool) {
        if (saleId >= saleCount) return false;
        
        CorsacNFTSale storage csns = saleList[saleId];
        
        if (csns.seller == address(0) || csns.balance == 0) return false;
        
        return true;
    }

    /**
     * @dev this function returns bid list of the timed auction
     * @param saleId - index of the sale
     */
    function getBidList(uint256 saleId) external view returns (BookInfo[] memory) {
        require(isSaleValid(saleId), "sale is not valid");

        require(saleList[saleId].method == 1, "bid not for timed-auction sale");

        return bookInfo[saleId];
    }

    /**
     * @dev this function cancels an auction from a seller
     * @param saleId - index of the sale
     */
    function cancelAuction(uint256 saleId) external {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(
            csns.endTime <= csns.startTime || csns.endTime >= block.timestamp,
            "sale already ended"
        );
        require(csns.method == 1, "bid not for timed-auction sale");
        require(msg.sender == csns.seller, "You are not allowed to cancel this auction");

        BookInfo[] storage bi = bookInfo[saleId];
        
        if (csns.payment == 0) {
            if (bi.length > 0) {
                address payable pyLast = payable(bi[0].user);
                pyLast.transfer(bi[0].salePrice + bi[0].salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000);
            }
        } else {
            IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
            if (bi.length > 0) {
                tokenInst.transfer(bi[0].user, bi[0].salePrice + bi[0].salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000);
            }
        }

        _removeSale(saleId);

        emit CancelAuction(
            msg.sender,
            saleId,
            csns
        );
    }

    /**
     * @dev this function cancels a bid placed from a user
     * @param saleId - index of the sale
     */
    function cancelBid(uint256 saleId) external {
        require(isSaleValid(saleId), "sale is not valid");

        CorsacNFTSale storage csns = saleList[saleId];

        require(
            csns.endTime <= csns.startTime || csns.endTime >= block.timestamp,
            "sale already ended"
        );
        require(csns.method == 1, "bid not for timed-auction sale");
        
        BookInfo[] storage bi = bookInfo[saleId];
        
        if (csns.payment == 0) {
            if (bi.length > 0) {
                require(msg.sender == bi[0].user, "Your bid rejected or canceled already");
                address payable pyLast = payable(bi[0].user);
                pyLast.transfer(bi[0].salePrice + bi[0].salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000);

                bi.pop();
            }
        } else {
            IERC20 tokenInst = IERC20(paymentTokens[csns.payment]);
            if (bi.length > 0) {
                require(msg.sender == bi[0].user, "Your bid rejected or canceled already");
                tokenInst.transfer(bi[0].user, bi[0].salePrice + bi[0].salePrice * (csns.feeRatio + csns.royaltyRatio) / 10000);

                bi.pop();
            }
        }

        emit CancelBid(
            msg.sender,
            saleId
        );
    }

    /**
     * @dev this function gets creator of NFT
     * @param collectionAddr - collection address
     * @param tokenId - tokenId
     */
    function getNFTCreator(address collectionAddr, uint256 tokenId) external view returns(address) {
        require(collectionOccupation[collectionAddr] == true);
        return IContractInfoWrapper(collectionAddr).getCreator(tokenId);
    }
}

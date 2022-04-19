const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Corsac V2 NFT Marketplace Testing...", function () {
  let uba;
  let c721;
  let c1155;
  let cERC721;
  let cERC1155;
  let nftFactory;

  let c721Inst;
  let c1155Inst;
  let cERC721Inst;
  let cERC1155Inst;
  let nftFactoryInst;

  let owner, owner1, owner2;
  let user = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199";

  let peabot;
  let peabotAddress = "0x1a4300eBb74AC59CC29ebBa01c78a737B804b16c";

  let blkdot;
  let blkdotAddress = "0xd7DAc4870894bC1614dc2E9235c003BCb86F6AF0";

  const provider = waffle.provider;

  it("deploy contracts", async function() {
    [owner, owner1, owner2] = await ethers.getSigners();
    
    console.log('\nstarting to deploy token--------------------------------------------------');
    console.log("Owner Address: ", owner.address);
    console.log("Owner1 Address: ", owner1.address);
    console.log("Owner2 Address: ", owner2.address);
    console.log("User Address: ", user);

    // 1. Deploy Test Token
    const UBAToken = await hre.ethers.getContractFactory("UBAToken");
    uba = await UBAToken.deploy();
    console.log("UBA Token deployed to: ", uba.address);
    console.log("UBA Token Total Supply: ", await uba.totalSupply());
    await uba.transfer(owner1.address, 50000000000000);
    await uba.transfer(owner2.address, 50000000000000);
    await uba.transfer(user, 50000000000000);
    console.log("UBA Balance of owner: ", await uba.balanceOf(owner.address));
    console.log("UBA Balance of owner1: ", await uba.balanceOf(owner1.address));
    console.log("UBA Balance of owner2: ", await uba.balanceOf(owner2.address));
    console.log("UBA Balance of user: ", await uba.balanceOf(user));

    // 2. Deploy Tradable ERC-721 Contract
    const ERC721Tradable = await hre.ethers.getContractFactory("ERC721Tradable");
    c721 = await ERC721Tradable.deploy("My ERC721 NFT Test", "NENT7", "https://baseuri/", "0x0000000000000000000000000000000000000000");

    c721Inst = await c721.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("ERC721Tradable deployed to: ", c721.address);

    // 3. Deploy Tradable ERC-1155 Contract
    const ERC1155Tradable = await hre.ethers.getContractFactory("ERC1155Tradable");
    c1155 = await ERC1155Tradable.deploy("My ERC1155 NFT Test", "NENT1", "test-uri", "0x0000000000000000000000000000000000000000");

    c1155Inst = await c1155.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("ERC1155Tradable deployed to: ", c1155.address);

    // 4. Deploy Corsac ERC-721 Contract
    const CorsacERC721 = await hre.ethers.getContractFactory("CorsacERC721");
    cERC721 = await CorsacERC721.deploy();

    cERC721Inst = await cERC721.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacERC721 deployed to: ", cERC721Inst.address);

    // 5. Deploy Corsac ERC-1155 Contract
    const CorsacERC1155 = await hre.ethers.getContractFactory("CorsacERC1155");
    cERC1155 = await CorsacERC1155.deploy();

    cERC1155Inst = await cERC1155.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacERC1155 deployed to: ", cERC1155Inst.address);
    
    // 6. Deploy Corsac NFT Factory Contract with 1 ether
    const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
    // nftFactory = await CorsacNFTFactory.deploy(cERC721.address, cERC1155.address, {value: ethers.utils.parseUnits("1", "ether").toHexString()});
    nftFactory = await CorsacNFTFactory.deploy(cERC721.address, cERC1155.address);

    nftFactoryInst = await nftFactory.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacNFTFactory deployed to: ", nftFactory.address);

    // await nftFactoryInst.connect(owner).receive();
    console.log('\n--------------------------------------------------------------------------');
    console.log("Marketplace was charged! balance=", await provider.getBalance(nftFactory.address));
  });

  it("set payment tokens", async function() {
    console.log('\nstarting set payment tokens------------------------------------------------');
    await nftFactory.connect(owner).setPaymentToken(
      1, // 0: Default Ether
      uba.address
    );
    
    const tokens = await nftFactory.getPaymentToken();
    console.log("payment tokens:", tokens);
  });

  it("set contract factories", async function() {
    console.log('\nstarting set contract factories--------------------------------------------');
    let tx = await c721Inst.setFactoryContract(nftFactory.address);
    tx = await c1155Inst.setFactoryContract(nftFactory.address);

    console.log("Factories of tradable ERC721, 1155 were set!");
  });

  it("create new collection", async function() {
    console.log('\nstarting create collection-------------------------------------------');
    console.log('\ncreating new collection 721 for Owner1...');
    let tx = await nftFactoryInst.connect(owner1).createNewCollectionByUser(
      0, 
      "New Collection 721 - 1 - Owner1", 
      "NC721-1-O1", 
      "https://implicit721"
    );  
  });

  it("get collections", async function() {
    console.log('\nstarting get collections-------------------------------------------');
    let cols = await nftFactory.getCollections();
    console.log("collections registered to the factory");
    console.log(cols);
    console.log('\n----------------------------------------------------------------------------');
  });

  it("mint NFT", async function() {
    console.log('\nstarting NFT mint-------------------------------------------');
    const collection = await nftFactory.getRecentCollection();
    
    console.log('last collection address:', collection);

    const mintTx = await nftFactory.connect(owner1).mintToByUser(collection, owner1.address, "https://stc.com/1.json");
    await mintTx.wait();

    const tokenID = await nftFactory.getTokenId(collection);
    
    console.log("NFT minted, token ID:", tokenID - 1);

    const mintedNFT = await ethers.getContractAt("@openzeppelin/contracts/token/ERC721/IERC721.sol:IERC721", collection);

    expect(await mintedNFT.ownerOf(tokenID - 1)).to.equal(owner1.address);
    console.log("minted NFT owner:", await mintedNFT.ownerOf(tokenID - 1));
  });
});

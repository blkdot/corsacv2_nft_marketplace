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
    console.log("UBA Token Total Supply: ", await uba.totalSupply());

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
    nftFactory = await CorsacNFTFactory.deploy(cERC721Inst.address, cERC1155Inst.address, {value: ethers.utils.parseUnits("1", "ether").toHexString()});

    nftFactoryInst = await nftFactory.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacNFTFactory deployed to: ", nftFactory.address);

    // await nftFactoryInst.connect(owner).receive();
    console.log('\n--------------------------------------------------------------------------');
    console.log("Marketplace was charged! balance=", await provider.getBalance(nftFactoryInst.address));
  });

  it("set contract factories", async function() {
    let tx = await c721Inst.setFactoryContract(nftFactory.address);
    tx = await c1155Inst.setFactoryContract(nftFactory.address);

    console.log('\n--------------------------------------------------------------------------');
    console.log("Factories of tradable ERC721, 1155 were set!");
  });

  it("creator permission", async function() {
    console.log('\nstarting permission--------------------------------------------------------');
    console.log('\nowner1 setting as creator....');
    await nftFactoryInst.startPendingCreator(owner1.address, true);
    
    await new Promise(r => setTimeout(r, 4000));

    await nftFactoryInst.endPendingCreator(owner1.address);
    console.log("address-%s as a creator", owner1.address);

    console.log('\nowner2 setting as creator....');
    await nftFactoryInst.startPendingCreator(owner2.address, true);
    
    await new Promise(r => setTimeout(r, 4000));

    await nftFactoryInst.endPendingCreator(owner2.address);
    console.log("address-%s as a creator", owner2.address);

    console.log('\nuser setting as creator....');
    await nftFactoryInst.startPendingCreator(user, true);
    
    await new Promise(r => setTimeout(r, 4000));

    await nftFactoryInst.endPendingCreator(user);
    console.log("address-%s as a creator", user);
  });

  it("create new collection", async function() {
    console.log('\nstarting create collection-------------------------------------------');
    console.log('\ncreating new collection 721 for owner1...');
    let tx = await nftFactoryInst.connect(owner1).createNewCollection(
      0, 
      "New Collection 721 - 1 - Owner1", 
      "NC721-1-O1", 
      "https://implicit721"
    );
    console.log('\ncreating new collection 721 for owner1...');
    tx = await nftFactoryInst.connect(owner1).createNewCollection(
      0, 
      "New collection 721 - 2 - Owner1", 
      "NC721-2-O1", 
      "https://implicit1155"
    );
    console.log('\ncreating new collection 1155 for owner1...');
    tx = await nftFactoryInst.connect(owner1).createNewCollection(
      1, 
      "New collection 1155 - Owner1", 
      "NC1155-O1", 
      "https://implicit1155"
    );
    console.log('\n---------------------------------------------------------------------------');
    console.log('\ncreating new collection 721 for owner2...');
    tx = await nftFactoryInst.connect(owner2).createNewCollection(
      0, 
      "New Collection 721 - Owner2", 
      "NC721-O2", 
      "https://implicit721"
    );
    console.log('\ncreating new collection 1155 for owner2...');
    tx = await nftFactoryInst.connect(owner2).createNewCollection(
      1, 
      "New collection 1155 - Owner2", 
      "NC1155-O2", 
      "https://implicit1155"
    );

    console.log('\nstarting get collections-------------------------------------------');
    let cols = await nftFactory.getCollections();
    console.log("collections registered to the factory");
    console.log(cols);
  });

  it("add collection", async function() {
    console.log('\nstarting add collection-------------------------------------------');
    console.log('\nadding a collection 721 for owner1...');
    let tx = await nftFactoryInst.connect(owner1).addCollection(c721Inst.address);

    // console.log('\nadding a collection 1155 for owner2...');
    // tx = await nftFactoryInst.connect(owner2).addCollection(c1155Inst.address);
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

    const mintTx = await nftFactory.connect(owner).mintTo(collection, owner1.address, "https://stc.com/1.json");
    await mintTx.wait();

    const tokenID = await nftFactory.getTokenId(collection);
    
    console.log("NFT minted, token ID:", tokenID);

    const mintedNFT = await ethers.getContractAt("@openzeppelin/contracts/token/ERC721/IERC721.sol:IERC721", collection);

    expect(await mintedNFT.ownerOf(1)).to.equal(owner1.address);
    console.log("minted NFT owner:", await mintedNFT.ownerOf(1));

    const transferTx = await mintedNFT.connect(owner1).transferFrom(owner1.address, owner.address, 1);
    await transferTx.wait();

    expect(await mintedNFT.ownerOf(1)).to.equal(owner.address);
    console.log("minted NFT transfered from owner1 to owner:", await mintedNFT.ownerOf(1));
    console.log('\n----------------------------------------------------------------------------');
  });

  it("buy NFT", async function() {
    console.log('\nstarting buy NFT-------------------------------------------');

    let balance1 = await provider.getBalance(owner.address);
    let balance2 = await provider.getBalance(owner1.address);

    console.log("balance of owner:", balance1);
    console.log("balance of owner1:", balance2);

    const collection = await nftFactory.getRecentCollection();
    const mintTx = await nftFactory.connect(owner).mintTo(collection, owner1.address, "https://stc.com/2.json");
    await mintTx.wait();

    const tokenID = await nftFactory.getTokenId(collection);
    
    console.log("NFT minted, token ID:", tokenID);

    const mintedNFT = await ethers.getContractAt("@openzeppelin/contracts/token/ERC721/IERC721.sol:IERC721", collection);

    const marketApproveTx = await mintedNFT.connect(owner).setApprovalForAll(nftFactory.address, true);
    await marketApproveTx.wait();

    const amount = 0.02 * 1e18;
    const createSaleTx = await nftFactory.connect(owner1).createSale(
      collection, // sc, address of NFT collection contract
      2, // token ID
      0, // payment method, 0: BNB, 1: BUSD, 2: Corsac, ...
      1, // copy, if type of sc is ERC721, copy should be 1 and if ERC1155, copy > 0
      0, // method of sale, 0: fixed price, 1: timed auction, 2: offer
      86400, // duration
      String(amount), // basePrice
      0, // fee ratio, (1/10000) for transaction, 0: default
      0 // royalty ratio, (1/10000) for transaction, 0: default
    );
    await createSaleTx.wait();
    console.log("owner1 created sale! price =", amount);

    const buyTx = await nftFactory.connect(owner).buy(0, {value: String(0.03 * 1e18)});
    await buyTx.wait();

    expect(await mintedNFT.ownerOf(2)).to.equal(owner.address);
    console.log("owner bought from owner1!");
    console.log("balance of owner:", await provider.getBalance(owner.address));
    console.log("balance of owner1:", await provider.getBalance(owner1.address));
  });

  it("timed auction", async function() {
    console.log('\nstarting timed auction-------------------------------------------');
    console.log("balance of marketplace:", await provider.getBalance(nftFactoryInst.address));
    console.log("balance of owner:", await provider.getBalance(owner.address));
    console.log("balance of owner1:", await provider.getBalance(owner1.address));
    console.log("balance of owner2:", await provider.getBalance(owner2.address));

    const collection = await nftFactory.getRecentCollection();
    const amount = 0.02 * 1e18;
    const createSaleTx = await nftFactory.connect(owner).createSale(
      collection, // sc, address of NFT collection contract
      2, // token ID
      0, // payment method, 0: BNB, 1: BUSD, 2: Corsac, ...
      1, // copy, if type of sc is ERC721, copy should be 1 and if ERC1155, copy > 0
      1, // method of sale, 0: fixed price, 1: timed auction, 2: offer
      100, // duration
      String(amount), // basePrice
      0, // fee ratio, (1/10000) for transaction, 0: default
      0 // royalty ratio, (1/10000) for transaction, 0: default
    );
    await createSaleTx.wait();
    console.log("owner created timed auction! price =", amount);

    const bidTx1 = await nftFactory.connect(owner1).placeBid(1, String(0.03 * 1e18), {value: String(0.03 * 1e18)});
    await bidTx1.wait();
    console.log("owner1 placed bid! price =", String(0.03 * 1e18));

    const bidTx2 = await nftFactory.connect(owner2).placeBid(1, String(0.04 * 1e18), {value: String(0.04 * 1e18)});
    await bidTx2.wait();
    console.log("owner2 placed bid! price =", String(0.04 * 1e18));

    const finalizeAuctionTx = await nftFactory.connect(owner).finalizeAuction(1);
    await finalizeAuctionTx.wait();
    console.log("finalizing auction...");

    console.log("balance of marketplace:", await provider.getBalance(nftFactoryInst.address));
    console.log("balance of owner:", await provider.getBalance(owner.address));
    console.log("balance of owner1:", await provider.getBalance(owner1.address));
    console.log("balance of owner2:", await provider.getBalance(owner2.address));
  });
});

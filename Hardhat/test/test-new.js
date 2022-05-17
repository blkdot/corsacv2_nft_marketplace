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

    // 7. Get and approve all peabot ERC721 token contract for testing
    peabot = await ethers.getContractAt("ITERC721", peabotAddress);
    await peabot.connect(owner).setApprovalForAll(nftFactory.address, true);

    blkdot = await ethers.getContractAt("ITERC721", blkdotAddress);
    await blkdot.connect(owner).setApprovalForAll(nftFactory.address, true);
    console.log('\n--------------------------------------------------------------------------');
    console.log('Getting and approve all peabot & blkdot ERC721 tokens for testing...');
    console.log("peabot amount of owner:", await peabot.balanceOf(owner.address));
    console.log("peabot amount of owner1:", await peabot.balanceOf(owner1.address));
    console.log("blkdot amount of owner:", await blkdot.balanceOf(owner.address));
    console.log("blkdot amount of owner1:", await blkdot.balanceOf(owner1.address));
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

  it("creator permission", async function() {
    console.log('\nstarting permission--------------------------------------------------------');
    console.log('\nowner1 setting as creator....');
    // await nftFactoryInst.startPendingCreator(owner.address, true);
    
    // await new Promise(r => setTimeout(r, 4000));

    // await nftFactoryInst.endPendingCreator(owner.address);
    // console.log("address-%s as a creator", owner.address);

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

  it("create new 1155 collection", async function() {
    console.log('\nstarting create collection-------------------------------------------');
    console.log('\ncreating new collection 1155 for owner1...');
    let tx = await nftFactoryInst.connect(owner1).createNewCollection(
      1, 
      "New collection 1155 - Owner1", 
      "NC1155-O1", 
      "https://implicit1155"
    );
    console.log('\n---------------------------------------------------------------------------');
    
    console.log('\nstarting get collections-------------------------------------------');
    let cols = await nftFactory.getCollections();
    console.log("collections registered to the factory");
    console.log(cols);
  });

  it("ERC1155 testing", async function() {
    console.log('\nstarting 1155 NFT mint-------------------------------------------');
    let collections = await nftFactory.getCollections();
    
    const mintTx1155 = await nftFactory.connect(owner1).mintTo(
      collections[0], 
      owner1.address, 
      "https://ipfs.moralis.io:2053/ipfs/QmaCwgHMXbZ8wor6j98GG9EMYnuxQMU68sFQ5Y5UsiPCcX",
      20);
    const tokenID1155 = await mintTx1155.wait();
    const event = tokenID1155.events?.filter((e) => {return e.event === "MintTo"});
    const tokenId = event[0].args.tokenId;

    console.log("1155 NFT minted, token ID:", tokenId);

    const mintedNFT1155 = await ethers.getContractAt("@openzeppelin/contracts/token/ERC1155/IERC1155.sol:IERC1155", collections[0]);
    const marketApproveTx = await mintedNFT1155.connect(owner).setApprovalForAll(nftFactory.address, true);
    await marketApproveTx.wait();

    console.log("owner balance:", await owner.getBalance());
    console.log("owner1 balance:", await owner1.getBalance());

    const basePrice = 0.01 * 1e18;
    let tx = await nftFactory.connect(owner1).createSale(
      collections[0], //collection
      tokenId, //token id
      0, //payment
      9, //copy
      0, //mehtod
      0, //duration
      String(basePrice),
      0, //fee ratio
      0, //royalty ratio
      0 //isOther
    );
    await tx.wait();
    console.log(`Owner1 created sale with copy = 9, basePrice=${basePrice}`);

    let sales = await nftFactory.getSaleInfo(0, 10000);
    console.log("sales:", sales);

    //purchase only 5 items
    tx = await nftFactory.connect(owner).buy(0, 5, {value: String(1 * 1e18)});
    await tx.wait();
    console.log(`Owner purchased items from sale = 0, amount = 4`);

    //checking balance
    console.log("owner balance:", await owner.getBalance());
    console.log("owner1 balance:", await owner1.getBalance());

    //checking sales
    sales = await nftFactory.getSaleInfo(0, 10000);
    console.log("sales:", sales);

    //purchase 4 items
    tx = await nftFactory.connect(owner).buy(0, 4, {value: String(1 * 1e18)});
    await tx.wait();
    console.log(`Owner purchased items from sale = 0, amount = 4`);

    //checking balance
    console.log("owner balance:", await owner.getBalance());
    console.log("owner1 balance:", await owner1.getBalance());

    //checking sales
    sales = await nftFactory.getSaleInfo(0, 10000);
    console.log("sales:", sales);

    console.log('\n----------------------------------------------------------------------------');
  });
});

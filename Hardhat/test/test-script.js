const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Corsac V2 NFT Marketplace Testing...", function () {
  let uba;
  let c721;
  let c1155;
  let nftFactory;

  let c721Inst;
  let c1155Inst;
  let nftFactoryInst;

  let owner, owner1, owner2;
  let user = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

  it("contract creation should be work", async function () {
    // // 1. Deploy Test Token
    // const UBAToken = await hre.ethers.getContractFactory("UBAToken");
    // const uba = await UBAToken.deploy();

    // await uba.deployed();

    // console.log('\n--------------------------------------------------------------------------');
    // console.log("UBA Token deployed to: ", uba.address);
    // console.log("UBA Token Total Supply: ", await uba.totalSupply());

    // // 2. Deploy Corsac ERC-721 Contract
    // const CorsacERC721 = await hre.ethers.getContractFactory("CorsacERC721");
    // const c721 = await CorsacERC721.deploy();

    // await c721.deployed();

    // console.log('\n--------------------------------------------------------------------------');
    // console.log("CorsacERC721 deployed to: ", c721.address);

    // // 3. Deploy Corsac ERC-1155 Contract
    // const CorsacERC1155 = await hre.ethers.getContractFactory("CorsacERC1155");
    // const c1155 = await CorsacERC1155.deploy();

    // await c1155.deployed();

    // console.log('\n--------------------------------------------------------------------------');
    // console.log("CorsacERC1155 deployed to: ", c1155.address);

    // // 4. Deploy Corsac NFT Factory Contract
    // const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
    // const nftFactory = await CorsacNFTFactory.deploy(c721.address, c1155.address);

    // await nftFactory.deployed();

    // console.log('\n--------------------------------------------------------------------------');
    // console.log("CorsacNFTFactory deployed to: ", nftFactory.address);


    // const [owner] = await ethers.getSigners();

    // console.log('\n--------------------------------------------------------------------------');
    // console.log("Owner address:", owner.address);
    // console.log("Owner UBA Token Balance: ", await uba.balanceOf(owner.address));
    
    // // create 
    // const createTx = await c721.connect(owner).createContract(
    //   'My First NFT',
    //   'Cotte',
    //   'https://ipfs.moralis.io:2053/ipfs/QmW6JZWTEat4h6wKADqeCpRqkNQPHFaTR1CqVq1vfictai/metadata/10.json',
    //   null
    // );
    // await createTx.wait();

    // console.log('owner of NFT', await testtoken.ownerOf(1));
    [owner, owner1, owner2] = await ethers.getSigners();
    
    console.log('\n--------------------------------------------------------------------------');
    console.log("Owner Address: ", owner.address);
    console.log("Owner1 Address: ", owner1.address);
    console.log("Owner2 Address: ", owner2.address);

    // 1. Deploy Test Token
    const UBAToken = await hre.ethers.getContractFactory("UBAToken");
    uba = await UBAToken.deploy();
    console.log("UBA Token Total Supply: ", await uba.totalSupply());

    // 2. Deploy Corsac ERC-721 Contract
    const ERC721Tradable = await hre.ethers.getContractFactory("ERC721Tradable");
    c721 = await ERC721Tradable.deploy("My ERC721 NFT Test", "NENT7", "https://baseuri/", "0x0000000000000000000000000000000000000000");

    c721Inst = await c721.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("ERC721Tradable deployed to: ", c721.address);

    // 3. Deploy Corsac ERC-1155 Contract
    const ERC1155Tradable = await hre.ethers.getContractFactory("ERC1155Tradable");
    c1155 = await ERC1155Tradable.deploy("My ERC1155 NFT Test", "NENT1", "test-uri", "0x0000000000000000000000000000000000000000");

    c1155Inst = await c1155.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("ERC1155Tradable deployed to: ", c1155.address);
    
    // 4. Deploy Corsac NFT Factory Contract
    const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
    nftFactory = await CorsacNFTFactory.deploy(c721.address, c1155.address);

    nftFactoryInst = await nftFactory.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacNFTFactory deployed to: ", nftFactory.address);
  })

  it("nftFactory setFactoryContract", async () => {
    let tx = await c721Inst.setFactoryContract(nftFactory.address);
    tx = await c1155Inst.setFactoryContract(nftFactory.address);

    console.log('\n--------------------------------------------------------------------------');
    console.log("Factories of ERC721, 1155 were set!");

    // tx = c721Inst.setFactoryContract(nftFactory.address);
    // let vv = await tx.catch(e => e.message);
    // console.log(vv);

    // tx = c1155Inst.setFactoryContract(nftFactory.address);
    // vv = await tx.catch(e => e.message);
    // console.log(vv);
    
    // assert.equal(await c721Inst.factory(), nftFactoryInst.address);
    // assert.equal(await c1155Inst.factory(), nftFactoryInst.address);
})

  it("creator permission", async () => {
    console.log('\nstarting permission--------------------------------------------------------');
    console.log('\n-----------------1---------------------------------------------------------');
    await nftFactoryInst.startPendingCreator(owner.address, true);
    let tx = nftFactoryInst.endPendingCreator(owner.address);
    let vv = await tx.catch(e => e.message);
    console.log(vv);
    
    console.log('\n-----------------2---------------------------------------------------------');
    tx = nftFactoryInst.startPendingCreator(owner.address, true);
    vv = await tx.catch(e => e.message);
    console.log(vv);

    console.log('\n-----------------3---------------------------------------------------------');
    await new Promise(r => setTimeout(r, 4000));

    await nftFactoryInst.endPendingCreator(owner.address);
    console.log("user-%s as a creator", owner.address);
  })


  it("should work createNewCollection and addCollection", async function () {
    console.log('\nstarting create and add collection-------------------------------------------');
    
    let tx = await nftFactoryInst.createNewCollection(
      0, 
      "New collection 721 added", 
      "NCA721", 
      "https://implicit721"
    );
    // console.log(tx);
    // let i;
    // for (i = 0; i < tx.receipt.logs.length; i ++) {
    //     console.log(tx.receipt.logs[i]);
    //     if (tx.receipt.logs[i].event == 'NewCollectionCreated') {
    //         console.log(tx.receipt.logs[i].args.collectionType.toString());
    //     }
    // }

    // tx = nftFactoryInst.createNewCollection(
    //   1, 
    //   "New collection 1155 added", 
    //   "NCA1155", 
    //   "https://implicit1155"
    // );
    // let vv = await tx.catch(e => e.message);
    // console.log(vv);

    // tx = await nftFactoryInst.createNewCollection(
    //   1, 
    //   "New collection 721 added", 
    //   "NCA1155", 
    //   "https://implicit1155"
    // );

    // for (i = 0; i < tx.receipt.logs.length; i ++) {
    //     console.log(tx.receipt.logs[i]);
    //     if (tx.receipt.logs[i].event == 'NewCollectionCreated') {
    //         console.log(tx.receipt.logs[i].args.collectionType.toString());
    //     }
    // }

    // tx = nftFactoryInst.createNewCollection(
    //   2, 
    //   "New collection 1155 added", 
    //   "NCA1155", 
    //   "https://implicit1155"
    // );
    // vv = await tx.catch(e => e.message);
    // console.log(vv);
  });
});

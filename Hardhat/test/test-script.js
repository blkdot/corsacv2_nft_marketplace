const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Corsac V2 NFT Marketplace Testing...", function () {
  it("event should occur when calling offer function", async function () {
    // 1. Deploy Test Token
    const UBAToken = await hre.ethers.getContractFactory("UBAToken");
    const uba = await UBAToken.deploy();

    await uba.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("UBA Token deployed to: ", uba.address);
    console.log("UBA Token Total Supply: ", await uba.totalSupply());

    // 2. Deploy Corsac ERC-721 Contract
    const CorsacERC721 = await hre.ethers.getContractFactory("CorsacERC721");
    const c721 = await CorsacERC721.deploy();

    await c721.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacERC721 deployed to: ", c721.address);

    // 3. Deploy Corsac ERC-1155 Contract
    const CorsacERC1155 = await hre.ethers.getContractFactory("CorsacERC1155");
    const c1155 = await CorsacERC1155.deploy();

    await c1155.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacERC1155 deployed to: ", c1155.address);

    // 4. Deploy Corsac NFT Factory Contract
    const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
    const nftFactory = await CorsacNFTFactory.deploy(c721.address, c1155.address);

    await nftFactory.deployed();

    console.log('\n--------------------------------------------------------------------------');
    console.log("CorsacNFTFactory deployed to: ", nftFactory.address);


    const [owner] = await ethers.getSigners();

    console.log('\n--------------------------------------------------------------------------');
    console.log("Owner address:", owner.address);
    console.log("Owner UBA Token Balance: ", await uba.balanceOf(owner.address));
    
    // create 
    const createTx = await c721.connect(owner).createContract(
      'My First NFT',
      'Cotte',
      'https://ipfs.moralis.io:2053/ipfs/QmW6JZWTEat4h6wKADqeCpRqkNQPHFaTR1CqVq1vfictai/metadata/10.json',
      null
    );
    await createTx.wait();

    console.log('owner of NFT', await testtoken.ownerOf(1));
  });
});

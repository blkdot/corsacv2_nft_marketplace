// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  
  console.log('\n--------------------------------------------------------------------------');

  // 1. Deploy Test Token
  console.log("\ndeploying UBA Token...");
  const UBAToken = await hre.ethers.getContractFactory("UBAToken");
  const uba = await UBAToken.deploy();

  console.log("UBA deployed to: ", uba.address);
  console.log("UBA Token Total Supply: ", await uba.totalSupply());
  console.log('\n--------------------------------------------------------------------------');

  // 2. Deploy Tradable ERC-721 Contract
  console.log("\ndeploying ERC721Tradable contract...");
  const ERC721Tradable = await hre.ethers.getContractFactory("ERC721Tradable");
  const tradable721 = await ERC721Tradable.deploy("Corsac NFT", "CSCT-NFT", "https://baseuri/", "0x0000000000000000000000000000000000000000");

  // await tradable721.deployed();

  console.log("ERC721Tradable deployed to: ", tradable721.address);
  console.log('\n--------------------------------------------------------------------------');

  // 3. Deploy Tradable ERC-1155 Contract
  console.log("\ndeploying ERC1155Tradable contract...");
  const ERC1155Tradable = await hre.ethers.getContractFactory("ERC1155Tradable");
  const tradable1155 = await ERC1155Tradable.deploy("My ERC1155 NFT Test", "NENT1", "test-uri", "0x0000000000000000000000000000000000000000");

  // await tradable1155.deployed();

  console.log("ERC1155Tradable deployed to: ", tradable1155.address);
  console.log('\n--------------------------------------------------------------------------');

  // 4. Deploy Corsac ERC-721 Contract
  console.log("\ndeploying CorsacERC721 contract...");
  const CorsacERC721 = await hre.ethers.getContractFactory("CorsacERC721");
  const cERC721 = await CorsacERC721.deploy();

  // const cERC721Inst = await cERC721.deployed();

  console.log("CorsacERC721 deployed to: ", cERC721.address);
  console.log('\n--------------------------------------------------------------------------');

  // 5. Deploy Corsac ERC-1155 Contract
  console.log("\ndeploying CorsacERC1155 contract...");
  const CorsacERC1155 = await hre.ethers.getContractFactory("CorsacERC1155");
  const cERC1155 = await CorsacERC1155.deploy();

  // const cERC1155Inst = await cERC1155.deployed();

  console.log("CorsacERC1155 deployed to: ", cERC1155.address);
  console.log('\n--------------------------------------------------------------------------');
  
  // 6. Deploy Corsac NFT Factory Contract
  console.log("\ndeploying CorsacNFTFactory contract...");
  const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
  const nftFactory = await CorsacNFTFactory.deploy(cERC721.address, cERC1155.address);

  // const nftFactoryInst = await nftFactory.deployed();

  console.log("CorsacNFTFactory deployed to: ", nftFactory.address);
  console.log('\n--------------------------------------------------------------------------');

  console.log('\nDone!!!');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

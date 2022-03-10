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

  // 1. Deploy Test Token
  const UBAToken = await hre.ethers.getContractFactory("UBAToken");
  const uba = await UBAToken.deploy();

  await uba.deployed();

  console.log("UBA Token deployed to:", uba.address);

  // 2. Deploy Corsac ERC-721 Contract
  const CorsacERC721 = await hre.ethers.getContractFactory("CorsacERC721");
  const c721 = await CorsacERC721.deploy();

  await c721.deployed();

  console.log("CorsacERC721 deployed to:", c721.address);

  // 3. Deploy Corsac ERC-1155 Contract
  const CorsacERC1155 = await hre.ethers.getContractFactory("CorsacERC1155");
  const c1155 = await CorsacERC1155.deploy();

  await c1155.deployed();

  console.log("CorsacERC1155 deployed to:", c1155.address);

  // 4. Deploy Corsac NFT Factory Contract
  const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
  const nftFactory = await CorsacNFTFactory.deploy(c721.address, c1155.address);

  await nftFactory.deployed();

  console.log("CorsacNFTFactory deployed to:", nftFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

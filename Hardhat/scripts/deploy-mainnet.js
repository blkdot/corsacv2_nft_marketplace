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

  // 1. Deploy Tradable ERC-721 Contract
  console.log("\ndeploying ERC721Tradable contract...");
  const ERC721Tradable = await hre.ethers.getContractFactory("ERC721Tradable");
  const tradable721 = await ERC721Tradable.deploy("ERC721Tradable", "ERC721Tradable", "https://apinftv2.corsac.io/api/tokenuri/", "0x0000000000000000000000000000000000000000");

  // await tradable721.deployed();

  console.log("ERC721Tradable deployed to: ", tradable721.address);
  console.log('\n--------------------------------------------------------------------------');

  // 2. Deploy Tradable ERC-1155 Contract
  console.log("\ndeploying ERC1155Tradable contract...");
  const ERC1155Tradable = await hre.ethers.getContractFactory("ERC1155Tradable");
  const tradable1155 = await ERC1155Tradable.deploy("ERC1155Tradable", "ERC1155Tradable", "https://apinftv2.corsac.io/api/tokenuri/", "0x0000000000000000000000000000000000000000");

  // await tradable1155.deployed();

  console.log("ERC1155Tradable deployed to: ", tradable1155.address);
  console.log('\n--------------------------------------------------------------------------');

  // 3. Deploy Corsac ERC-721 Contract
  console.log("\ndeploying CorsacERC721 contract...");
  const CorsacERC721 = await hre.ethers.getContractFactory("CorsacERC721");
  const cERC721 = await CorsacERC721.deploy();

  // const cERC721Inst = await cERC721.deployed();

  console.log("CorsacERC721 deployed to: ", cERC721.address);
  console.log('\n--------------------------------------------------------------------------');

  // 4. Deploy Corsac ERC-1155 Contract
  console.log("\ndeploying CorsacERC1155 contract...");
  const CorsacERC1155 = await hre.ethers.getContractFactory("CorsacERC1155");
  const cERC1155 = await CorsacERC1155.deploy();

  // const cERC1155Inst = await cERC1155.deployed();

  console.log("CorsacERC1155 deployed to: ", cERC1155.address);
  console.log('\n--------------------------------------------------------------------------');
  
  // 5. Deploy Corsac NFT Factory Contract
  console.log("\ndeploying CorsacNFTFactory contract...");
  const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
  const nftFactory = await CorsacNFTFactory.deploy(cERC721.address, cERC1155.address);

  // const nftFactoryInst = await nftFactory.deployed();

  console.log("CorsacNFTFactory deployed to: ", nftFactory.address);
  console.log('\n--------------------------------------------------------------------------');

  // 6. Set factories
  console.log("\nsetting nft factory address to factory of 721 and 1155 contract...");
  let setFactoryContractTx = await tradable721.setFactoryContract(nftFactory.address);
  setFactoryContractTx = await tradable1155.setFactoryContract(nftFactory.address);

  // 7. Set address to receive fee
  console.log('\nsetting fee address...');
  let setFeeAddressTx = await nftFactory.setFeeAddr('0x7b2F0260C4afc79227DBB163402Ab269BcDF1Ba2');
  await setFeeAddressTx.wait();

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

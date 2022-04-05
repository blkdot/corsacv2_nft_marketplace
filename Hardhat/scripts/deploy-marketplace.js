// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { ethers, waffle } = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ubaToken = "0x0b1B6859b760911D8d60BDB46728D96dbdc3062c";
  const cERC721 = "0x00D41D72be2ABa3Bf1a5F9a90d86f21a13A31A95";
  const cERC1155 = "0xF6a715dFE984683D0eA3DF3DC3980F221f87c949";
  
  console.log('\n--------------------------------------------------------------------------');

  // 6. Deploy Corsac NFT Factory Contract
  console.log("\ndeploying CorsacNFTFactory contract...");
  const CorsacNFTFactory = await hre.ethers.getContractFactory("CorsacNFTFactory");
  const nftFactory = await CorsacNFTFactory.deploy(cERC721, cERC1155);

  console.log("CorsacNFTFactory deployed to: ", nftFactory.address);
  console.log('\n--------------------------------------------------------------------------');

  console.log('\nstarting set payment tokens------------------------------------------------');
  [owner] = await ethers.getSigners();
  const setPaymentTokenTx = await nftFactory.connect(owner).setPaymentToken(
    1, // 0: Default Ether
    ubaToken
  );
  await setPaymentTokenTx.wait();
  
  const tokens = await nftFactory.getPaymentToken();
  console.log("payment tokens:", tokens);

  const user = "0x7E1325d452e472B81098c62F071D32Ee7f4e10d7";
  await nftFactory.startPendingCreator(user, true);
    
  await new Promise(r => setTimeout(r, 4000));

  await nftFactory.endPendingCreator(user);
  console.log("address-%s as a creator", user);

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

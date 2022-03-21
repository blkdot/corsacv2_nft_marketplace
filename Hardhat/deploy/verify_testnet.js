const {ethers} = require('hardhat');

require('dotenv').config();

module.exports = async ({deployments, getChainId}) => {
    const ERC721Tradable = await ethers.getContract("ERC721Tradable");
    console.log('Verifying contract at ', ERC721Tradable.address);
    try {
        await run("verify:verify", {
            address: ERC721Tradable.address,
            contract: "contracts/ERC721Tradable.sol:ERC721Tradable",
            constructorArguments: [
                "My ERC1155 NFT Test",
                "NENT1",
                "https://baseuri/",
                "0x0000000000000000000000000000000000000000"
            ]
        });
    } catch (e) {
        console.log('Error has been occurred. ', e)
    }
};

module.exports.tags = ["testnet_verify"];
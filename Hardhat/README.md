# Corsac V2 NFT Marketplace Hardhat Project

This project demonstrates a Hardhat use case. It comes with several contracts, a test for those contracts, a test script that deploys those contracts, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell for testing on bsc testnet
npx hardhat node --fork https://data-seed-prebsc-1-s1.binance.org:8545/
npx hardhat test test/test-script.js --network localhost
```

```shell for deploying only marketplace contract
```check file: scripts/deploy-marketplace.js
npx hardhat clean
npx hardhat run scripts/deploy-marketplace.js --network testnet

```shell for deploying marketplace
```check file: scripts/deploy-script.js
npx hardhat clean
npx hardhat run scripts/deploy-script.js --network testnet

```shell for verifing marketplace contract
```shell format (will be formated as constructor)
npx hardhat verify --network testnet {deployed marketplace address} "singleCollectionDeployer(CorsacERC721 address)" "multipleCollectionDeployer(CorsacERC1155 address)"
npx hardhat verify --network testnet 0xFE3CCA7Ce5E2E93cDf39478Ef2F5aaB44f9ca855 "0x00D41D72be2ABa3Bf1a5F9a90d86f21a13A31A95" "0xF6a715dFE984683D0eA3DF3DC3980F221f87c949"

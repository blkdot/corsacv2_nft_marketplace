# Corsac V2 NFT Marketplace

This project will contain Hardhat project for nft marketplace contracts, front-end and back-end apis etc.

Corsac V2 NFT Marketplace has 3 main features - sale, timed-auction, offer.

This marketplace supports not only BEP-721 but also BEP-1155 on BSC network, and BNB, WBNB, and Corsac V2 token(BEP-20) as payments.
Also, you can add other BEP-20 tokens as payments.

```Launch Process
Deploys contracts (Please refer the shells on Hardhat/README)
Copy and paste marketplace contract address and ABI into front-end and back-end
Creates Moralis Server and configurates "Sync and Watch Contract Events" on moralis server admin
Configurates front-end server(netlify or others) and .env on front-end from moralis server info and others
Configurates back-end server(nginx, pm2, mongodb) and .env on back-end
Launch back-end server
Launch front-end server
```

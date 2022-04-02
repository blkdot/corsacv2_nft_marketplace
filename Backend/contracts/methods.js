const Web3 = require('web3')
const dotenv = require('dotenv');
const HDWalletProvider = require("truffle-hdwallet-provider");
const marketABI = require('./market.json');
const { collection } = require('../models/collection.model');

dotenv.config();

const provider = new HDWalletProvider(
  process.env.PRIVATE_KEY,
  process.env.RPC_URL
);

const web3 = new Web3(provider);

const feeAddress = async () => {
  let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
  let feeAddress = await contract.methods.feeAddress().call();
}

const createCollection = async (name, symbol, uri) => {
  try {
    let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
    await contract.methods.createCollection(name, symbol, uri).send({from: process.env.PUBLIC_KEY});
    let collection = await contract.methods.getRecentCollection().call();
    return collection;
  } catch (e) {
    console.log(e);
    return "";
  }
}

const getTokenId = async (addr) => {
  let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
  let id = await contract.methods.getTokenId(addr).call();
  return id;
}

const mintTo = async (collectionAddr, to, uri) => {
  try {
    let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
    await contract.methods.mintTo(collectionAddr, to, uri).send({from: process.env.PUBLIC_KEY});
  } catch (e) {
    console.log(e);
  }
}

const transferMoney = async (addr, amount) => {
  let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
  await contract.methods.transferMoney(addr, amount).send({from: process.env.PUBLIC_KEY});
}

const poll_method = async () => {
  let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
  let offerSize = await contract.methods.getOfferSize().call();
  let i;
  let bidSales = [];
  for (i = 0; i < offerSize; i += 100) {
    let cc = offerSize - i;
    if (cc > 100) {
        cc = 100;
    }

    let temp = await contract.methods.getBidOffersDump(i, cc).call();
    bidSales = [...bidSales, ...temp];
  }

  let nowTime = new Date().getTime() / 1000;
  // let aa = bidSales.map(t => parseInt(t.endTime) - nowTime);
  // console.log('--------------', bidSales);
  // console.log('aaa', bidSales[i].endTime, nowTime);
  for (i = 0; i < bidSales.length; i++) {
    if (parseInt(bidSales[i].endTime) < nowTime) {
        // console.log('>>>>>>>>>>>>>', bidSales[i]);
        console.log('------------before');
        await contract.methods.finalizeAuction(parseInt(bidSales[i].offerId)).send({from: process.env.PUBLIC_KEY});
        console.log('okkk');
        // if (tx !== undefined) {
        //     // tx.events.AuctionResult?.returnValues && console.log('---------------- AuctionResult', tx.events.AuctionResult.returnValues);
        //     // tx.events.TransferNFTs?.returnValues && console.log('---------------- TransferNFTs', tx.events.TransferNFTs.returnValues);
        //     // tx.events.Trade?.returnValues && console.log('---------------- Trade', tx.events.Trade.returnValues);
        //     // tx.events.RemoveFromSale?.returnValues && console.log('---------------- Trade', tx.events.RemoveFromSale.returnValues);

        //     tx.events.Trade?.returnValues && await tradeResult(tx.events.Trade?.returnValues);
        //     tx.events.RemoveFromSale?.returnValues && await removeSale(parseInt(tx.events.RemoveFromSale?.returnValues.saleId));
        //     tx.events.AuctionResult?.returnValues && await removeBids(parseInt(tx.events.AuctionResult?.returnValues.saleId));
        // }
    }
  }
}

module.exports = { feeAddress, createCollection, getTokenId, mintTo, transferMoney, poll_method };

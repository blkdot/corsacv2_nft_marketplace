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

const createCollection = async (type, name, symbol, uri) => {
  try {
    let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
    await contract.methods.createNewCollection(type, name, symbol, uri).send({from: process.env.PUBLIC_KEY});
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
  let nowTime = new Date().getTime() / 1000;
  
  let contract = await new web3.eth.Contract(marketABI, process.env.CONTRACT_ADDRESS);
  const salesCount = await contract.methods.saleCount().call();
  const sales = await contract.methods.getSaleInfo(0, salesCount).call();

  for (let i = 0; i < sales.length; i++) {
    // console.log(global.endedAuctionList);
    const sIds = global.endedAuctionList.filter((id, index) => {
      return parseInt(sales[i].saleId) === id;
    });
    if (sIds.length > 0) {
      continue;
    }

    // console.log("saleId=", sales[i].saleId, nowTime, ":", sales[i].endTime, " - ", parseInt(sales[i].endTime) - nowTime);

    if (parseInt(sales[i].method) === 1 && parseInt(sales[i].endTime) < nowTime) {
      console.log("finalizing auction...saleId=", sales[i].saleId);
      try {
        const nonce = await web3.eth.getTransactionCount(process.env.PUBLIC_KEY);
        
        await contract.methods.finalizeAuction(parseInt(sales[i].saleId)).send({
          from: process.env.PUBLIC_KEY,
          nonce: nonce
        });
        
        if (global.endedAuctionList.length > 10000) {
          global.endedAuctionList = [];
        }
        global.endedAuctionList.push(parseInt(sales[i]));

        console.log(".....ok");
      } catch (e) {
        console.log(e);
      }
      
    }
  }
}

module.exports = { feeAddress, createCollection, getTokenId, mintTo, transferMoney, poll_method };

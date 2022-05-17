const mongoose = require("mongoose");

const NFTItem = mongoose.model(
  "NFTItem",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    // payment: {
    //   type: Number,
    //   default: 0
    // },
    tokenId: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: 'untitled title'
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    royalty: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 1
    },
    timeStamp: {
      type: Number,
      default: 0
    },
    creator: {
      type: String,
      default: ''
    },
    stars: {
      type: Number,
      default: 0
    }
  })
);

module.exports = NFTItem;

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
    metadata: {
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
    views: {
      type: Number,
      default: 0
    },
    blocked: {
      type: Number,
      default: 0
    },
    attributes: {
      type: Array,
      default: []
    }
  })
);

module.exports = NFTItem;

const mongoose = require("mongoose");

const NFTItem = mongoose.model(
  "NFTItem",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'untitled title'
    },
    uri: {
      type: String,
      default: 'https://'
    },
    category: {
      type: String,
      default: "Art"
    },
    image: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: mongoose.Types.Decimal128,
      default: 0
    },
    offerMethod: {
      type: Number,
      default: 0
    },
    timeStamp: {
      type: Number,
      default: 0
    },
    status: {
      type: Number,
      default: 0 // 0: open sale 1: //close sale
    },
    pending: {
      type: Number,
      default: 0
    },
    stars: {
      type: Number,
      default: 0
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection"
    }
  })
);

module.exports = NFTItem;

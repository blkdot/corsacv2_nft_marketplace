const mongoose = require("mongoose");

const Like = mongoose.model(
  "Like",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    collectionAddr: {
      type: String,
      default: ''
    },
    tokenId: {
      type: Number,
      default: 0
    },
    timeStamp: {
      type: Number,
      default: 0
    }
  })
);

module.exports = Like;

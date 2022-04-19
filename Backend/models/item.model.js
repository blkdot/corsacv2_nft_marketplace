const mongoose = require("mongoose");

const NFTItem = mongoose.model(
  "NFTItem",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    // collection: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Collection"
    // },
    payment: {
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
    timeStamp: {
      type: Number,
      default: 0
    },
    stars: {
      type: Number,
      default: 0
    }
  })
);

module.exports = NFTItem;

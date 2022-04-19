const mongoose = require("mongoose");

const Collection = mongoose.model(
  "Collection",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    collectionType: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: 'untitled'
    },
    symbol: {
      type: String,
      default: 'untitled symbol'
    },
    url: {
      type: String,
      default: 'https:///aaa.com',
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
    collectionAddr: {
      type: String,
      default: ''
    },
    timeStamp: {
      type: Number,
      default: 0
    },
    stars: {
      type: Object,
      default: {}
    },
    created: {
      type: Number,
      default: 0
    }
  })
);

module.exports = Collection;

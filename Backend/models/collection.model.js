const mongoose = require("mongoose");

const Collection = mongoose.model(
  "Collection",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'untitled title',
      unique: true
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

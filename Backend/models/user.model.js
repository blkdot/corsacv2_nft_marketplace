const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    cent: {
      type: String,
      default: ''
    },
    reddit: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    }
  })
);

module.exports = User;

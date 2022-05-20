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
    banner: {
      type: String,
      default: ''
    },
    about: {
      type: String,
      default: ''
    },
    twitter: {
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
    },
    created_at: {
      type: Number,
      default: 0
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  })
);

module.exports = User;

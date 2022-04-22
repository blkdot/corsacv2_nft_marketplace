const mongoose = require("mongoose");

const Payment = mongoose.model(
  "Payment",
  new mongoose.Schema({
    id: {
      type: Number,
      default: 0
    },
    type: {
      type: Number,
      default: 1
    },
    addr: {
      type: String,
      default: '',
      unique: true
    },
    title: {
      type: String,
      default: 'untitled'
    },
    symbol: {
      type: String,
      default: 'untitled symbol'
    },
    decimals: {
      type: Number,
      default: 0
    },
    allowed: {
      type: Number,
      default: 0
    }
  })
);

module.exports = Payment;

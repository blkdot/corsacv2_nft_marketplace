const mongoose = require("mongoose");

const Bid = mongoose.model(
  "Bid",
  new mongoose.Schema({
    walletAddr: {
      type: String,
      default: ''
    },
    price: {
      type: mongoose.Types.Decimal128,
      default: 0
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NFTItem"
    }
  })
);

module.exports = Bid;

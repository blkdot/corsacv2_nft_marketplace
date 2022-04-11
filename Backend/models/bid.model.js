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
    // itemId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "NFTItem"
    // }
    saleId: {
      type: Number,
      default: -1
    },
    created_at: {
      type: Number,
      default: 0
    }
  })
);

module.exports = Bid;

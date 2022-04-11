const db = require("../models");
const NFTItem = db.item;
const Collection = db.collection;
// const { createCollection, getTokenId, mintTo } = require('../contracts/methods');
const { item } = require("../models");
const Bid = require("../models/bid.model");

exports.addBid = (req, res) => {
  let bid = new Bid({
    walletAddr: req.body.walletAddr,
    price: req.body.price,
    saleId: req.body.saleId,
    created_at: new Date().getTime()
    // itemId: req.body.itemId,
  });
  bid.save((err1) => {
    if (err1) {
        res.status(500).send({ message: err1 });
        return;
    }
    res.send({
        message: "Bid was added successfully",
    });
  });
};

exports.getBidsBySaleId = (req, res) => {
  db.bid.find({
    saleId: { $in: req.query.saleId }
  }).then((bids) => {
    res.send(bids);
  }).catch((e) => res.status(500).send({ message: e }));
};
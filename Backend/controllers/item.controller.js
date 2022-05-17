const db = require("../models");
const mongoose = require("mongoose");
const { getFavorites } = require("./like.controller");

const NFTItem = db.item;
const Collection = db.collection;
const Activity = db.activity;
const User = db.user;

const { createCollection, getTokenId, mintTo, transferMoney } = require('../contracts/methods');

exports.createItem = (req, res) => {
  if (req.body.collectionId) {
    Collection.findOne({
      _id: new mongoose.Types.ObjectId(req.body.collectionId)
    },
    (err, collection) => {
      if (err) {
        res.status(500).send({
          type: 'error',
          message: "Internal database server error!",
        });
        return;
      }

      if (collection) {
        let item = new NFTItem({
          walletAddr: req.body.walletAddr,
          collectionId: req.body.collectionId,
          // payment: req.body.payment,
          tokenId: req.body.tokenId,
          title: req.body.title,
          description: req.body.description,
          image: req.body.image,
          royalty: req.body.royalty,
          amount: req.body.amount,
          timeStamp: req.body.timeStamp,
          creator: req.body.creator
        });
        
        item.save(async (err1) => {
          if (err1) {
            res.status(500).send({
              type: 'error',
              message: "Internal database server error!",
            });
            return;
          }
          
          //get user info
          let user = await User.findOne({walletAddr: req.body.walletAddr});

          //save activity
          const activity = new Activity({
            actor: req.body.walletAddr,
            actionType: 2,
            description: `${user ? user.name : req.body.walletAddr} : created new items(amount: ${req.body.amount}) - ${req.body.title}`,
            from: '',
            timeStamp: Math.floor(new Date().getTime() / 1000),
            collectionAddr: collection.collectionAddr,
            tokenId: parseInt(req.body.tokenId)
          });

          activity.save((err2) => {
            if (err1) {
              res.status(500).send({ message: err2 });
              return;
            }

            res.send({
              type: 'success',
              message: "Item was created successfully!",
            });
            return;
          });
        });
      } else {
        res.status(500).send({
          type: 'error',
          message: "Cannot find collection!",
        });
        return;
      }
    });
  } else {
    res.status(500).send({
      type: 'error',
      message: "Cannot find collection!",
    });
    return;
  }
};

exports.getRecentItems = (req, res) => {
  NFTItem.aggregate([
    {
      $sort: {
        timeStamp: -1
      }
    },
    {
      $limit: 100
    },
    {
      $lookup: {
        from: "collections", 
        localField: "collectionId", 
        foreignField: "_id", 
        as: "collections"
      }
    }
  ], async (err, items) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    let result = [];
    for (let item of items) {
      let temp = JSON.parse(JSON.stringify(item));
      const collectionAddr = item.collections[0].collectionAddr;
      const favorites = await getFavorites(collectionAddr, item.tokenId);
      temp.favorites = favorites;

      result.push(temp);
    }
    
    res.status(200).send({
      items: result
    })
  });
};

exports.getItemsByWallet = (req, res) => {
  NFTItem.find({
    walletAddr: { $in: req.query.walletAddr }
  }).then(async (items) => {
    let result = [];
    for (let item of items) {
      let temp = JSON.parse(JSON.stringify(item));
      const favorites = await getFavorites(item.collectionAddr, item.tokenId);
      temp.favorites = favorites;

      result.push(temp);
    }
    res.send(result);
  }).catch((e) => res.status(500).send({ message: e }));
};

exports.getItemsByCollection = (req, res) => {
  NFTItem.find({
    collectionId: { $in: new mongoose.Types.ObjectId(req.query.collectionId) }
  }).then((items) => {
    res.send(items);
  }).catch((e) => res.status(500).send({ message: e }));
};

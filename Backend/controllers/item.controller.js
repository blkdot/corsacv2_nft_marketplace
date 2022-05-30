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
          metadata: req.body.metadata,
          royalty: req.body.royalty,
          amount: req.body.amount,
          timeStamp: req.body.timeStamp,
          creator: req.body.creator,
          blocked: 0,
          attributes: req.body.attributes
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
  NFTItem.aggregate([
    {
      $lookup: {
        from: "collections", 
        localField: "collectionId", 
        foreignField: "_id", 
        as: "collections"
      }
    },
    {
      $match: {
        "collections.collectionAddr": req.query.collectionAddr
      }
    },
    {
      $project : { 
        "collections.collectionAddr": 1,
        "tokenId": 1,
        "collections.traits": 1,
        "attributes": 1
      }
    }
  ], (err, items) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    const newItems = [];
    for (let item of items) {
      newItems.push({
        collectionAddr: item.collections ? item.collections[0].collectionAddr : '',
        tokenId: item.tokenId,
        attributes: item.attributes
      });
    }
    
    res.status(200).send({
      items: newItems
    })
  });
};

exports.getAllItems = (req, res) => {
  NFTItem.aggregate([
    {
      $sort: {
        timeStamp: -1
      }
    },
    {
      $lookup: {
        from: "collections", 
        localField: "collectionId", 
        foreignField: "_id", 
        as: "collections"
      }
    }
  ], (err, items) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      items: items
    })
  });
}

exports.updateBlacklist = (req, res) => {
  NFTItem.updateOne({
    _id: new mongoose.Types.ObjectId(req.body.id)
  }, 
  {$set: {
    blocked: parseInt(req.body.blocked)
  }}).then(() => {
    res.send({
      updated: true,
    });
    return;
  }).catch((e) => {
    res.status(500).send({ message: err });
    return;
  });
}

exports.getBlacklist = (req, res) => {
  NFTItem.aggregate([
    {
      $match: {
        blocked: 1
      }
    },
    {
      $lookup: {
        from: "collections", 
        localField: "collectionId", 
        foreignField: "_id", 
        as: "collections"
      }
    }
  ], (err, items) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      items: items
    })
  });
}

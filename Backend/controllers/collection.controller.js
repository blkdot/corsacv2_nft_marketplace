const db = require("../models");
const Collection = db.collection;
const Activity = db.activity;
const User = db.user;
const { createCollection: createCollectionToken } = require('../contracts/methods');

exports.createCollection = (req, res) => {
  const title = req.body.title;
  const collectionType = req.body.collectionType;
  
  //check if collection exists
  Collection.find({
    title: { $eq: title },
    collectionType: { $eq: collectionType },
  },
  (err, collections) => {
    if (err) {
      res.status(500).send({
        type: 'error',
        message: "Internal database server error!",
      });
      return;
    }
    if (collections.length > 0) {
      res.status(200).send({
        type: 'error',
        message: "Collection name was duplicated!",
      });
      return;
    }

    const collection = new Collection({
      walletAddr: req.body.walletAddr,
      collectionType: req.body.collectionType,
      collectionAddr: req.body.collectionAddr,
      title: req.body.title,
      symbol: req.body.symbol,
      url: req.body.url,
      category: req.body.category,
      image: req.body.image,
      description: req.body.description,
      timeStamp: req.body.timeStamp,
      created: 1
    });

    collection.save(async (err) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      //get user info
      let user = await User.findOne({walletAddr: req.body.walletAddr});

      //save activity
      const activity = new Activity({
        actor: req.body.walletAddr,
        actionType: 1,
        description: (user ? user.name : 'Unknown') + ": " + "created new collection - " + req.body.title,
        from: '',
        timeStamp: Math.floor(new Date().getTime() / 1000)
      });

      activity.save((err1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }

        res.send({
          type: 'success',
          message: "Collection was created successfully!",
        });
        return;
      });
    });
  });
}

exports.getCollection = (req, res) => {
  Collection.find({
    walletAddr: { $in: req.query.walletAddr }
  },
  (err, collections) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      collections: collections
    })
  });
}

exports.getCollectionByAddress = (req, res) => {
  Collection.find({
    collectionAddr: { $in: req.query.collectionAddr }
  },
  (err, collections) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      collection: collections.length > 0 ? collections[0] : {}
    })
  });
}

exports.getCollectionStars = (req, res) => {

  Collection.find({
    collectionAddr: { $in: req.query.collectionAddr },
    created: 0
  },
  (err, collections) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      collections: collections
    })
  });
}

exports.updateCollectionStars = (req, res) => {
  Collection.findOne({
    collectionAddr: { $in: req.body.collectionAddr },
    created: 0
  }).then((collection) => {
    collection.stars = req.body.stars;
    collection.save((err1) => {
      if (err1) {
        res.status(500).send({ message: err1 });
        return;
      }
      res.send({
        message: "Collection was updated successfully",
      })
      
    })
  })
}

exports.getAllCollections = (req, res) => {
  Collection.find({}).then((collections) => {
    res.send({collections: collections});
  }).catch((e) => console.log('error', e));
}
const db = require("../models");
const NFTItem = db.item;
const Collection = db.collection;
const { createCollection, getTokenId, mintTo, transferMoney } = require('../contracts/methods');

exports.createItem = (req, res) => {

  const {path, mimetype} = req.file;

  if (req.body.collectionTitle) {
    Collection.find({
      walletAddr: req.body.walletAddr,
      title: req.body.collectionTitle
    },
    (err, collection) => {
      if (err) {
        res.status(500).send({message: err});
        return;
      }

      let item = new NFTItem({
        walletAddr: req.body.walletAddr,
        title: req.body.title,
        uri: req.body.uri,
        category: req.body.category,
        image: path,
        description: req.body.description,
        price: req.body.price,
        offerMethod: req.body.offerMethod,
        timeStamp: req.body.timeStamp
      })
      item.collectionId = collection[0].id;

      item.save((err1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }

        res.send({
          message: "NFT item was created successfully",
        });
        
      })
    })
  }
};

exports.getAllItems = (req, res) => {
  NFTItem.find({}).then((items) => {
    res.send(items.filter((item) => item.status === 0));
  }).catch((e) => console.log('error', e));
};

exports.getItems = (req, res) => {
  NFTItem.find({
    walletAddr: { $in: req.query.walletAddr },
    status: { $in: 0 }
  }).then((items) => {
    res.send(items);
  }).catch((e) => res.status(500).send({ message: e }));
};

// exports.getItem = (req, res) => {
//   NFTItem.findOne({
//     walletAddr: { $in: req.query.walletAddr },
//     title: {$in: req.query.title }
//   },
//   (item) => {
//     res.status(200).send({
//       item: item
//     })
//   });
// }


exports.getItem = (req, res) => {
  const ObjectId = require('mongodb').ObjectId;
  var good_id = new ObjectId(req.query._id);
  NFTItem.findOne({
    _id: { $in: good_id },
  }).then((user) => {
    res.status(200).send({
      user: user
    })
  })
}

exports.buyItem =  (req, res) => {
  const ObjectId = require('mongodb').ObjectId;
  var good_id = new ObjectId(req.body.collectionId);
  if (req.body.collectionId) {
    Collection.findOne({
      _id: good_id
    }).then((collection) => {
      if (collection.collectionAddr === '') {
        try {
          createCollection(collection.title, 'Symbol', collection.url)
          .then((addr) => {
            collection.collectionAddr = addr;
            collection.save((err) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }
              if (addr !== '') mintTo(addr, req.body.account, req.body.uri);
              let item_id = new ObjectId(req.body.itemId);
              NFTItem.findOne({
                _id: item_id
              },
              (item) => {
                // if (err) {
                //   res.status(500).send({ message: err });
                //   return;
                // }
                transferMoney(item.walletAddr, parseFloat(item.price.toString()) * 1e18);
                item.status = 1;
                item.save((err1) => {
                  if (err1) {
                    res.status(500).send({ message: err1 });
                    return;
                  }
          
                  res.send({
                    message: "NFT item was bought successfully",
                  });
                  
                })
              });

            })
          });
        } catch (e) {
          console.log('error in creating collection');
        }
        
      } else {
        mintTo(collection.collectionAddr, req.body.account, req.body.uri);
        let item_id = new ObjectId(req.body.itemId);
        NFTItem.findOne({
          _id: item_id
        },
        (item) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          item.status = 1;
          item.save((err1) => {
            if (err1) {
              res.status(500).send({ message: err1 });
              return;
            }
    
            res.send({
              message: "NFT item was bought successfully",
            });
            
          })
        });
      }
    }).catch((e) => {
      console.log('error', e)
      res.status(500).send({ message: err });
      return;
    });
  }
}

exports.increaseItemStar = (req, res) => {
  const ObjectId = require('mongodb').ObjectId;
  var good_id = new ObjectId(req.body._id);
  NFTItem.findOne({
    _id: good_id,
  }).then((item) => {
    item.stars = item.stars + 1;
    item.save((err1) => {
      if (err1) {
        res.status(500).send({ message: err1 });
        return;
      }

      res.send({
        message: "NFT item was updated successfully",
      });
      
    })
  });
}

exports.decreaseItemStar = (req, res) => {
  const ObjectId = require('mongodb').ObjectId;
  var good_id = new ObjectId(req.body._id);
  NFTItem.findOne({
    _id: good_id,
  }).then((item) => {
    item.stars = item.stars - 1;
    item.save((err1) => {
      if (err1) {
        res.status(500).send({ message: err1 });
        return;
      }

      res.send({
        message: "NFT item was updated successfully",
      });
      
    })
  });
}

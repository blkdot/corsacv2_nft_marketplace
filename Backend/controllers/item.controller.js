const db = require("../models");
const mongoose = require("mongoose");
const NFTItem = db.item;
const Collection = db.collection;
const Activity = db.activity;
const User = db.user;
const { createCollection, getTokenId, mintTo, transferMoney } = require('../contracts/methods');

exports.createItem = (req, res) => {
  if (req.body.collectionId) {
    Collection.find({
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
            description: (user ? user.name : 'Unknown') + ": " + "created new item - " + req.body.title,
            from: '',
            timeStamp: Math.floor(new Date().getTime() / 1000)
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

// exports.getAllItems = (req, res) => {
//   NFTItem.find({}).then((items) => {
//     res.send(items.filter((item) => item.status === 0));
//   }).catch((e) => console.log('error', e));
// };

exports.getItemsByWallet = (req, res) => {
  NFTItem.find({
    walletAddr: { $in: req.query.walletAddr }
  }).then((items) => {
    res.send(items);
  }).catch((e) => res.status(500).send({ message: e }));
};

exports.getItemsByCollection = (req, res) => {
  NFTItem.find({
    collectionId: { $in: new mongoose.Types.ObjectId(req.query.collectionId) }
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


// exports.getItem = (req, res) => {
//   const ObjectId = require('mongodb').ObjectId;
//   var good_id = new ObjectId(req.query._id);
//   NFTItem.findOne({
//     _id: { $in: good_id },
//   }).then((user) => {
//     res.status(200).send({
//       user: user
//     })
//   })
// }

// exports.buyItem =  (req, res) => {
//   const ObjectId = require('mongodb').ObjectId;
//   var good_id = new ObjectId(req.body.collectionId);
//   if (req.body.collectionId) {
//     Collection.findOne({
//       _id: good_id
//     }).then((collection) => {
//       if (collection.collectionAddr === '') {
//         try {
//           createCollection(collection.title, 'Symbol', collection.url)
//           .then((addr) => {
//             collection.collectionAddr = addr;
//             collection.save((err) => {
//               if (err) {
//                 res.status(500).send({ message: err });
//                 return;
//               }
//               if (addr !== '') mintTo(addr, req.body.account, req.body.uri);
//               let item_id = new ObjectId(req.body.itemId);
//               NFTItem.findOne({
//                 _id: item_id
//               },
//               (item) => {
//                 // if (err) {
//                 //   res.status(500).send({ message: err });
//                 //   return;
//                 // }
//                 transferMoney(item.walletAddr, parseFloat(item.price.toString()) * 1e18);
//                 item.status = 1;
//                 item.save((err1) => {
//                   if (err1) {
//                     res.status(500).send({ message: err1 });
//                     return;
//                   }
          
//                   res.send({
//                     message: "NFT item was bought successfully",
//                   });
                  
//                 })
//               });

//             })
//           });
//         } catch (e) {
//           console.log('error in creating collection');
//         }
        
//       } else {
//         mintTo(collection.collectionAddr, req.body.account, req.body.uri);
//         let item_id = new ObjectId(req.body.itemId);
//         NFTItem.findOne({
//           _id: item_id
//         },
//         (item) => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }
//           item.status = 1;
//           item.save((err1) => {
//             if (err1) {
//               res.status(500).send({ message: err1 });
//               return;
//             }
    
//             res.send({
//               message: "NFT item was bought successfully",
//             });
            
//           })
//         });
//       }
//     }).catch((e) => {
//       console.log('error', e)
//       res.status(500).send({ message: err });
//       return;
//     });
//   }
// }

// exports.increaseItemStar = (req, res) => {
//   const ObjectId = require('mongodb').ObjectId;
//   var good_id = new ObjectId(req.body._id);
//   NFTItem.findOne({
//     _id: good_id,
//   }).then((item) => {
//     item.stars = item.stars + 1;
//     item.save((err1) => {
//       if (err1) {
//         res.status(500).send({ message: err1 });
//         return;
//       }

//       res.send({
//         message: "NFT item was updated successfully",
//       });
      
//     })
//   });
// }

// exports.decreaseItemStar = (req, res) => {
//   const ObjectId = require('mongodb').ObjectId;
//   var good_id = new ObjectId(req.body._id);
//   NFTItem.findOne({
//     _id: good_id,
//   }).then((item) => {
//     item.stars = item.stars - 1;
//     item.save((err1) => {
//       if (err1) {
//         res.status(500).send({ message: err1 });
//         return;
//       }

//       res.send({
//         message: "NFT item was updated successfully",
//       });
      
//     })
//   });
// }

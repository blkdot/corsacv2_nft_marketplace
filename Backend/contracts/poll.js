const { poll_method } = require('./methods');
const { createCollection, getTokenId, mintTo, transferMoney } = require('./methods');

const db = require("../models");
const NFTItem = db.item;
const Bid = db.bid;
const Collection = db.collection;

const poll_method1 = () => {
  NFTItem.find({}).then((items) => {
    for (const item of items) {
      let nowTime = new Date().getTime() / 1000;
      if ((nowTime > item.timeStamp) && (item.status === 0) && (item.pending === 0) && (item.offerMethod === 1)) {
        let maxPrice = item.price;
        let maxBid = null;
        Bid.find({
          itemId: item._id
        }).then((bids) => {
          if (bids.length > 0) {
            for (const bid of bids) {
              if (maxPrice <= parseFloat(bid.price.toString())) {
                maxPrice = parseFloat(bid.price.toString())
                maxBid = bid;
              }
            }
            if (maxBid !== null) {
              Collection.findOne({
                _id: item.collectionId
              }).then((collection) => {
                if (collection.collectionAddr === '') {
                  item.pending = 1;
                  item.save((err1) => {
                    if (err1) {
                      return;
                    }
                  })
                  createCollection(collection.title, 'Symbol', collection.url)
                  .then((addr) => {
                    collection.collectionAddr = addr;
                    collection.save((err) => {
                      if (err || addr == '') {
                        return;
                      }
                      mintTo(addr, maxBid.walletAddr, item.uri).then((res) => {
                        for (const bid of bids) {
                          if (bid._id == maxBid._id) {
                            transferMoney(item.walletAddr, parseFloat(maxBid.price.toString()) * 1e18);
                          } else {
                            transferMoney(bid.walletAddr, parseFloat(bid.price.toString()) * 1e18);
                          }
                        }
                      })
                    })
                  });
                } else {
                  item.pending = 1;
                  item.save((err1) => {
                    if (err1) {
                      return;
                    }
                  }) 
                  mintTo(collection.collectionAddr, maxBid.walletAddr, item.uri).then((res) => {
                    for (const bid of bids) {
                      if (bid._id == maxBid._id) {
                        transferMoney(item.walletAddr, parseFloat(maxBid.price.toString()) * 1e18);
                      } else {
                        transferMoney(bid.walletAddr, parseFloat(bid.price.toString()) * 1e18);
                      }
                    }
                  })
                }
              })
            }
          } else {
            item.pending = 1;
            item.save((err1) => {
              if (err1) {
                return;
              }
            })
          }
        })
      }
    }
  }).catch((e) => console.log('error', e));
}
const poll_func = async () => {
  let i = 0;

  const polling = async () => {
    // i = i + 1;
    // console.log(i);
    await poll_method();
    poll_method1();
  }

  const recursive_run = () => {
    polling()
      .then(() => {
        setTimeout(recursive_run, 2000);
      })
      .catch(err => {
        setTimeout(recursive_run, 2000);
      });
  }

  recursive_run();
}

module.exports.poll_func = poll_func;
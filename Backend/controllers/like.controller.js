const db = require("../models");
const Like = db.like;
const User = db.user;
const Activity = db.activity;

const addLike = (req, res) => {
  const walletAddr = req.body.walletAddr;
  const collectionAddr = req.body.collectionAddr;
  const tokenId = req.body.tokenId;

  if (!walletAddr || !collectionAddr || !tokenId) {
    res.status(500).send({ message: 'Missing data' });
    return;
  }

  Like.findOne({
    walletAddr: walletAddr,
    collectionAddr: collectionAddr,
    tokenId: tokenId
  }).then((data) => {
    if (data) {
      res.send({
        added: false,
        message: "Liked already!"
      });
      return;
    } else {
      const like = new Like({
        walletAddr: walletAddr,
        collectionAddr: collectionAddr,
        tokenId: tokenId,
        timeStamp: Math.floor(new Date().getTime() / 1000),
      });

      like.save(async (err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        //get user info
        let user = await User.findOne({walletAddr: walletAddr});

        //save activity
        const activity = new Activity({
          actor: walletAddr,
          actionType: 12,
          description: (user ? user.name : 'Unknown') + ": " + `liked item - ${collectionAddr}#${tokenId}`,
          from: '',
          timeStamp: Math.floor(new Date().getTime() / 1000),
          collectionAddr: collectionAddr,
          tokenId: parseInt(tokenId)
        });

        activity.save((err1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }

          res.send({
            added: true,
            message: "Like was added successfully!",
          });
          return;
        });
      });
    }
    
  }).catch((e) => res.status(500).send({ message: e }));
}

const removeLike = (req, res) => {
  const walletAddr = req.body.walletAddr;
  const collectionAddr = req.body.collectionAddr;
  const tokenId = req.body.tokenId;

  if (!walletAddr || !collectionAddr || !tokenId) {
    res.status(500).send({ message: 'Missing data' });
    return;
  }
  
  Like.deleteMany({
    walletAddr: walletAddr,
    collectionAddr: collectionAddr,
    tokenId: tokenId
  }).then(async () => {
    //get user info
    let user = await User.findOne({walletAddr: walletAddr});

    //save activity
    const activity = new Activity({
      actor: walletAddr,
      actionType: 15,
      description: (user ? user.name : 'Unknown') + ": " + `unliked item - ${collectionAddr}#${tokenId}`,
      from: '',
      timeStamp: Math.floor(new Date().getTime() / 1000),
      collectionAddr: collectionAddr,
      tokenId: parseInt(tokenId)
    });

    activity.save((err1) => {
      if (err1) {
        res.status(500).send({ message: err1 });
        return;
      }

      res.send({
        removed: true,
        message: "Unliked successfully!",
      });
      return;
    });
  }).catch((e) => res.status(500).send({ message: e }));
}

const getFavoriteItems = (req, res) => {
  const walletAddr = req.query.walletAddr;

  if (!walletAddr) {
    res.status(500).send({ message: 'Missing data' });
    return;
  }

  Like.find({
    walletAddr: walletAddr
  }).then((items) => {
    res.send({ items: items });
  }).catch((e) => res.status(500).send({ message: e }));
}

const getFavorites = async (collectionAddr, tokenId, walletAddr = null) => {
  if (!collectionAddr || !tokenId) {
    return 0;
  }
  
  let likes = [];
  let liked = false;
  try {
    likes = await Like.find({
      collectionAddr: collectionAddr,
      tokenId: tokenId
    });

    if (walletAddr) {
      const ls = likes.filter((like, index) => {
        return like.walletAddr === walletAddr;
      });

      liked = ls.length > 0 ? true : false;
    }
  } catch(e) {
    console.log(e);
    likes = [];
    liked = false;
  }
  return {count: likes.length, liked: liked};
}

const getFavoriteCount = async (req, res) => {
  const collectionAddr = req.query.collectionAddr;
  const tokenId = req.query.tokenId;
  const walletAddr = req.query.walletAddr;

  if (!collectionAddr || !tokenId) {
    res.status(500).send({ message: 'Missing data' });
    return;
  }

  const result = await getFavorites(collectionAddr, tokenId, walletAddr);
  res.send(result);
  return;
}

module.exports = { addLike, removeLike, getFavoriteItems, getFavoriteCount, getFavorites }

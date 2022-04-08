const db = require("../models");
const User = db.user;

exports.saveUser = (req, res) => {

  let filePath;
  if (req.file) {
    const {path, mimetype} = req.file;
    filePath = path;
  } else {
    filePath = null;
  }
  
  if (req.body.walletAddr) {
    User.findOne({
      walletAddr: req.body.walletAddr,
    }).then((user) => {
      console.log(user);
      if (user) {
        user.name = req.body.name;
        user.avatar = filePath;
        user.twitter = req.body.twitter;
        user.cent = req.body.cent;
        user.reddit = req.body.reddit;
        user.youtube = req.body.youtube;
        user.instagram = req.body.instagram;
      } else {
        user = new User({
          walletAddr: req.body.walletAddr,
          name: req.body.name,
          avatar: filePath,
          twitter: req.body.twitter,
          cent: req.body.cent,
          reddit: req.body.reddit,
          youtube: req.body.youtube,
          instagram: req.body.instagram
        })
      }

      user.save((err1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }

        res.send({
          message: "User was saved successfully",
        });
        
      })
    })
  }
};

// exports.getUser = (req, res) => {
//   User.findOne({
//     walletAddr: { $in: req.query.walletAddr },
//   }.then((user) => {
//     res.status(200).send({
//       user: user
//     })
//   }));
// };

exports.getUser = (req, res) => {
  User.findOne({
    walletAddr: { $in: req.query.walletAddr },
  }).then((user) => {
    res.status(200).send({
      user: user
    })
  })
}
const db = require("../models");
const User = db.user;

/*
*
* please use this function 
* if you want upload and save avatar and banner into backend
*
*/
// exports.saveUser = (req, res) => {
//   let avatarPath;
//   if (req.files.avatar && req.files.avatar.length > 0) {
//     const {path, mimetype} = req.files.avatar[0];
//     avatarPath = path;
//   } else {
//     avatarPath = null;
//   }

//   let bannerPath;
//   if (req.files.banner && req.files.banner.length > 0) {
//     const {path, mimetype} = req.files.banner[0];
//     bannerPath = path;
//   } else {
//     bannerPath = null;
//   }
  
//   if (req.body.walletAddr) {
//     User.findOne({
//       walletAddr: req.body.walletAddr,
//     }).then((user) => {
//       if (user) {
//         user.name = req.body.name;
//         user.avatar = avatarPath ? avatarPath : user.avatar;
//         user.banner = bannerPath ? bannerPath : user.banner;
//         user.about = req.body.about;
//         user.twitter = req.body.twitter;
//         user.youtube = req.body.youtube;
//         user.instagram = req.body.instagram;
//         user.created_at = Math.floor(new Date().getTime() / 1000);
//       } else {
//         user = new User({
//           walletAddr: req.body.walletAddr,
//           name: req.body.name,
//           avatar: avatarPath,
//           banner: bannerPath,
//           about: req.body.about,
//           twitter: req.body.twitter,
//           youtube: req.body.youtube,
//           instagram: req.body.instagram,
//           created_at: Math.floor(new Date().getTime() / 1000)
//         })
//       }

//       user.save((err) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         res.send({
//           message: "User was saved successfully",
//         });
        
//       })
//     })
//   }
// };

/*
*
* please use this function 
* if you want to upload and save avatar and banner into ipfs
*
*/
exports.saveUser = (req, res) => {
  if (req.body.walletAddr) {
    User.findOne({
      walletAddr: req.body.walletAddr,
    }).then((user) => {
      if (user) {
        user.name = req.body.name;
        user.avatar = req.body.avatar ? req.body.avatar : user.avatar;
        user.banner = req.body.banner ? req.body.banner : user.banner;
        user.about = req.body.about;
        user.twitter = req.body.twitter;
        user.youtube = req.body.youtube;
        user.instagram = req.body.instagram;
        user.created_at = Math.floor(new Date().getTime() / 1000);
      } else {
        user = new User({
          walletAddr: req.body.walletAddr,
          name: req.body.name,
          avatar: req.body.avatar,
          banner: req.body.banner,
          about: req.body.about,
          twitter: req.body.twitter,
          youtube: req.body.youtube,
          instagram: req.body.instagram,
          created_at: Math.floor(new Date().getTime() / 1000)
        })
      }

      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({
          message: "User was saved successfully",
        });
        
      })
    })
  }
};

exports.getAllUsers = (req, res) => {
  User.find({}.then((users) => {
    res.status(200).send({
      users: users
    })
  }));
};

exports.getUser = (req, res) => {
  User.findOne({
    walletAddr: { $in: req.query.walletAddr },
  }).then((user) => {
    res.status(200).send({
      user: user
    })
  })
};
const db = require("../models");
const Collection = db.collection;

exports.createCollection = (req, res) => {
  const {path, mimetype} = req.file;

  const collection = new Collection({
    walletAddr: req.body.walletAddr,
    title: req.body.title,
    url: req.body.url,
    category: req.body.category,
    image: path,
    description: req.body.description,
    created: 1
  })

  collection.save((err) => {
    if (err) {
      res.status(500).send({ message: err });

      return;
    }

    res.send({
      message: "Collection was created successfully!",
    });
  });
};

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
};

exports.getAllCollections = (req, res) => {
  Collection.find({}).then((collections) => {
    res.send({collections: collections});
  }).catch((e) => console.log('error', e));
}
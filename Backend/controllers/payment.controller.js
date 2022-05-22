const db = require("../models");
const Payment = db.payment;
// const { createCollection: createCollectionToken } = require('../contracts/methods');

exports.getPayments = (req, res) => {
  Payment.find({},
  (err, payments) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      payments: payments
    })
  }).sort({id: 1});
}

exports.getAllowedPayments = (req, res) => {
  Payment.find({
    allowed: 1
  },
  (err, payments) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      payments: payments
    })
  }).sort({id: 1});
}

exports.addPayment = (req, res) => {
  const addr = req.body.addr;
    
  //check if payment exists
  Payment.find({
    addr: { $eq: addr }
  },
  (err, payments) => {
    if (err) {
      res.status(500).send({
        type: 'error',
        message: "Internal database server error!",
      });
      return;
    }
    if (payments.length > 0) {
      res.status(200).send({
        type: 'error',
        message: "Payment was duplicated!",
      });
      return;
    }

    //add payment
    const payment = new Payment({
      id: req.body.id,
      type: req.body.type,
      addr: req.body.addr,
      title: req.body.title,
      symbol: req.body.symbol,
      decimals: req.body.decimals,
      allowed: req.body.allowed
    });

    payment.save((err) => {
      if (err) {
        res.status(500).send({ message: err });
      }

      res.send({
        added: true
      });
      return;
    });
    
  });
}

exports.updatePayment = (req, res) => {
  Payment.updateOne({
    addr: req.body.addr
  }, 
  {$set: {
    allowed: req.body.allowed
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

exports.removePayment = (req, res) => {
  Payment.deleteMany({
    addr: req.body.addr
  }).then(() => {
    res.send({
      removed: true
    });
    return;
  }).catch((e) => res.status(500).send({ message: e }));
}

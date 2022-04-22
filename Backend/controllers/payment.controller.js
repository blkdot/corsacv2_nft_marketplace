const db = require("../models");
const Payment = db.payment;
// const { createCollection: createCollectionToken } = require('../contracts/methods');

exports.createPayment = (req, res) => {
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

    //create payment
    const payment = new Payment({
      id: Payment.find({}).count() + 1,
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
        type: 'success',
        message: "Payment was created successfully!",
      });
    });
    
  });
}

exports.getPayments = (req, res) => {
  Payment.find({
    allowed: req.query.allowed 
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

exports.updatePayment = (req, res) => {
  Payment.findOne({
    id: req.body.id
  }).then((payment) => {
    payment.type = (req.body.type != null) ? req.body.type : payment.type;
    payment.addr = (req.body.addr != null) ? req.body.addr : payment.addr;
    payment.title = (req.body.title != null) ? req.body.title : payment.title;
    payment.symbol = (req.body.symbol != null) ? req.body.symbol : payment.symbol;
    payment.decimals = (req.body.decimals != null) ? req.body.decimals : payment.decimals;
    payment.allowed = (req.body.allowed != null) ? req.body.allowed : payment.allowed;
    payment.save((err) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.send({
        message: "Payment was updated successfully",
      });
    });
  });
}

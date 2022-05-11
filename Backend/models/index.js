const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.collection = require("./collection.model");
db.payment = require("./payment.model");
db.item = require("./item.model");
db.bid = require("./bid.model");
db.user = require("./user.model");
db.activity = require("./activity.model");
db.like = require("./like.model");

module.exports = db;
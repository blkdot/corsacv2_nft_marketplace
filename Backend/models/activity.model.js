const mongoose = require("mongoose");

// action types
// 0: Global
// 1: Create collection
// 2: Create item
// 3: Create sale
// 4: Create auction
// 5: Make offer
// 6: Buy item
// 7: Place a bid
// 8: Win bid
// 9: Cancel sale
//10: Cancel auction
//11: Cancel offer
//12: Like
//13: Follow
//14: Cancel bid
//15: Unlike
//16: Unfollow
//17: Ended timed auction without bids
//99: Other
const Activity = mongoose.model(
  "Activity",
  new mongoose.Schema({
    actor: {
      type: String,
      default: ''
    },
    actionType: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    },
    from: {
      type: String,
      default: ''
    },
    timeStamp: {
      type: Number,
      default: 0
    },
    collectionAddr: {
      type: String,
      default: ''
    },
    tokenId: {
      type: Number,
      default: 0
    },
    read: {
      type: Boolean,
      default: false
    }
  })
);

module.exports = Activity;

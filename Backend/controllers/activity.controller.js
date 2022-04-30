const db = require("../models");
const Activity = db.activity;
const actionTypes = [
  { value: 0, label: 'Global'},
  { value: 1, label: 'Create collection'},
  { value: 2, label: 'Create item'},
  { value: 3, label: 'Create sale'},
  { value: 4, label: 'Create auction'},
  { value: 5, label: 'Make offer'},
  { value: 6, label: 'Buy item'},
  { value: 7, label: 'Place a bid'},
  { value: 8, label: 'Win bid'},
  { value: 9, label: 'Cancel sale'},
  { value: 10, label: 'Cancel auction'},
  { value: 11, label: 'Cancel offer'},
  { value: 12, label: 'Like'},
  { value: 13, label: 'Follow'},
  { value: 99, label: 'Other'},
];

exports.saveActivity = (req, res) => {
  const actor = req.body.actor;
  
  if (actor == undefined || actor == null || actor == '') {
    res.status(500).send({ message: 'No actor' });
    return;
  }

  const actions = actionTypes.filter((a, index) => {
    return parseInt(req.body.actionType) === a.value;
  });

  if (actions.length == 0) {
    res.status(500).send({ message: 'Uknown action' });
    return;
  }

  const activity = new Activity({
    actor: req.body.actor,
    actionType: req.body.actionType,
    description: req.body.description,
    from: req.body.from,
    timeStamp: Math.floor(new Date().getTime() / 1000)
  });

  activity.save((err) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.send({
      type: 'success',
      message: "Activity was saved successfully!",
    });
    return;
  });
}

exports.getAllActivities = (req, res) => {
  Activity.find({}).
  limit(100).
  sort({timeStamp: -1}).
  exec((err, activities) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      activities: activities
    })
  });
}

exports.getActivities = (req, res) => {
  Activity.find({
    actor: { $eq: req.query.actor }
  }).
  limit(100).
  sort({timeStamp: -1}).
  exec((err, activities) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      activities: activities
    })
  });
}

exports.getActivitiesByType = (req, res) => {
  Activity.find({
    actionType: { $eq: req.query.actionType }
  }).
  sort({timeStamp: -1}).
  exec((err, activities) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      activities: activities
    })
  });
}

exports.getBestSellers = (req, res) => {
  Activity.aggregate([
    {
      $match: {"actionType": { $eq: 6, $eq: 8}}
    },
    {
      $group: {
        _id: "$from",
        sales: { $sum: 1}
      }
    },
    {
      $sort: { sales: -1 }
    }
  ], (err, sellers) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      sellers: sellers
    })
  });
}

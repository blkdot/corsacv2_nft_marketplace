const controller = require('../controllers/activity.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/activity/save",
    controller.saveActivity
  );

  app.get("/api/activity/all", controller.getAllActivities);

  app.get("/api/activity", controller.getActivities);

  app.get("/api/activity/type", controller.getActivitiesByType);

  app.get("/api/activity/bestseller", controller.getBestSellers);
};
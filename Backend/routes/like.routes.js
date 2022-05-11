const controller = require('../controllers/like.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/like/add",
    controller.addLike
  );

  app.post(
    "/api/like/remove",
    controller.removeLike
  );

  app.get("/api/like/user", controller.getFavoriteItems);

  app.get("/api/like/item", controller.getFavoriteCount);
};

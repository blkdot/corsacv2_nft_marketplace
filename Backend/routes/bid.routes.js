const multer = require('multer');
const controller = require('../controllers/bid.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/bid/add",
    controller.addBid
  );

  app.get("/api/bid/getBids", controller.getBidsBySaleId);
};
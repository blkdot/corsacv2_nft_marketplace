const controller = require('../controllers/payment.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/payment/create",
    controller.createPayment
  );

  app.post(
    "/api/payment/update",
    controller.updatePayment
  );

  app.get(
    "/api/payments", 
    controller.getPayments
  );
  
};
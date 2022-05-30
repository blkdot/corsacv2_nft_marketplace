const multer = require('multer');
const fs = require('fs');
const controller = require('../controllers/item.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     const dir = 'images/items'
  //     if (!fs.existsSync(dir)) fs.mkdir(dir, err => cb(err, dir))
  //     cb(null, 'images/items/')
  //   },
  //   filename: (req, file, cb) => {
  //     cb(null, file.originalname + "-" + Date.now())
  //   },
  // })

  // const upload = multer({ storage: storage })

  app.post(
    "/api/item/create",
    controller.createItem
  );
  
  // app.post("/api/item/buy", controller.buyItem);
  app.get("/api/item/all", controller.getAllItems);
  app.get("/api/item/recent", controller.getRecentItems);
  app.get("/api/item/wallet", controller.getItemsByWallet);
  app.get("/api/item/collection", controller.getItemsByCollection);
  app.get("/api/item/blacklist", controller.getBlacklist);
  
  app.post("/api/item/updateBlacklist", controller.updateBlacklist);
  app.post("/api/item/views", controller.increaseItemViews);
};
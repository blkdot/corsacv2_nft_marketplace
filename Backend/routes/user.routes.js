const multer = require('multer');
const path =  require('path');
const fs = require('fs');
const controller = require('../controllers/user.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'images/users/' + file.fieldname;
      if (!fs.existsSync(dir)) fs.mkdir(dir, err => cb(err, dir));
      cb(null, 'images/users/' + file.fieldname);
    },
    filename: (req, file, cb) => {
      cb(null, req.body.walletAddr + "_" + new Date().getTime().toString() +  path.extname(file.originalname))
    },
  });

  const upload = multer({ storage: storage })
  
  app.post(
    "/api/user/save",
    upload.fields([
      {name: 'avatar', maxCount: 1},
      {name: 'banner', maxCount: 1}
    ]),
    controller.saveUser
  );

  app.get("/api/user/all", controller.getAllUsers);

  app.get("/api/user", controller.getUser);
};
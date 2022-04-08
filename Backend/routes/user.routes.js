const multer = require('multer');
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
      const dir = 'images/users'
      if (!fs.existsSync(dir)) fs.mkdir(dir, err => cb(err, dir))
      cb(null, 'images/users/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname + "-" + Date.now())
    },
  })

  const upload = multer({ storage: storage })

  app.post(
    "/api/user/save",
    upload.single('file'),
    controller.saveUser
  );
  app.get("/api/user", controller.getUser);
};
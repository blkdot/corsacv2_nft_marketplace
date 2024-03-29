const { createCollection, getTokenId, poll_func } = require('./contracts/poll');
const { feeAddress, offerList } = require('./contracts/methods');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const dbConfig = require("./config/db.config");

const app = express();

global.endedAuctionList = [];

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./'));

const db = require("./models");

db.mongoose
  .connect(`mongodb://${process.env.HOST}:${process.env.DBPORT}/${process.env.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    // initial();
  })
  
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

poll_func();
// set port, listen for requests
const PORT = process.env.PORT || 8080;
// const PORT = process.env.NODE_ENV === 'production' ? 8080 : process.env.PORT;

require("./routes/collection.routes")(app);
require("./routes/item.routes")(app);
require("./routes/bid.routes")(app);
require("./routes/user.routes")(app);
require("./routes/payment.routes")(app);
require("./routes/activity.routes")(app);
require("./routes/like.routes")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
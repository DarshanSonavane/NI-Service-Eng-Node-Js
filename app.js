var express =  require("express"); // This is to include ExpressJs Library in the nodej)s.
// const multer = require("multer");
const mongoose = require("mongoose");
// mongoose.Promise = require("bluebird");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const ejs = require('ejs');
var path=require('path');    

// intializePassport(passport);
var app = new express(); // Create a object for express library
app.set("view engine", "ejs");
//app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize());

// app.use(passport.session());
app.use(cookieParser());

app.use(bodyParser.json({ limit: '10mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

//define next middleware to fire res status when api goes wrong.
app.use(cors()); // adding middleware.. https://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
const routes = require("./config/routes.js");
// use res.render to load up an ejs view file
app.use(flash());
app.use("/", express.static(__dirname + "/assets"));

/* app.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: false,
  })
); */

// app.use("/", express.static(__dirname + "/assets"));

mongoose
  .connect("mongodb://localhost:27017/ni-service")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", routes);
/* app.post('/', (req, res) => {
  res.send('Running!!');
}); */

app.listen(3000, function () {
  console.log("Listing port: " + 3000);
});


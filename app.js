// import config from "./config/config";
import express from "express"; // This is to include ExpressJs Library in the nodejs.
// const multer = require("multer");
import fs from "fs";
import mongoose from "mongoose";
// mongoose.Promise = require("bluebird");
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import flash from "express-flash";
import cookieParser from "cookie-parser";
// import session from "express-session";
import path from "path";

// import intializePassport from "./config/passport-config";

// intializePassport(passport);
var app = new express(); // Create a object for express library
app.set("view engine", "ejs");
//app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize());

// app.use(passport.session());
app.use(cookieParser());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
//define next middleware to fire res status when api goes wrong.
app.use(cors()); // adding middleware.. https://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
import routes from "./config/routes.js";
// use res.render to load up an ejs view file
app.use(flash());
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

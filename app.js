const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
//const mongooseStore = require("connect-mongo")(session);

// Tracking login sessions
app.use(session({ secret: "Caramba$18", resave: true, saveUninitialized: false }));

// parsing incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serving static files
app.use(express.static(__dirname + "/public"));

// routes
const routes = require("./routes/router");
app.use("/", routes);

// Route Not Found
app.use((req, res, next) => {
  const err = new Error("File Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message, error: {} }));

mongoose.connection.on("error", console.error.bind(console, "Connection error:"));

mongoose.connect(
  "mongodb://localhost:27017/authentication",
  { useNewUrlParser: true, useCreateIndex: true },
  err => {
    if (!err) {
      app.listen(3000, console.log.bind(console, "Listening on port 3000..."));
    }
  }
);
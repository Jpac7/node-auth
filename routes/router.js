const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const requiresAuth = require("../middlewares/requiresLogin");

router.get("/", (req, res) => res.sendFile(path.join(__dirname + "/public/index.html")));

router.post("/", (req, res, next) => {
  const { email, username, password, passwordConf } = req.body;

  if (!email || !username || !password || !passwordConf) {
    const err = new Error("Missing request parameters.");
    err.status = 400;
    return next(err);
  }

  if (password != passwordConf) {
    const err = new Error("Passwords do not match.");
    err.status = 400;
    return next(err);
  }

  const userData = { email, username, password, passwordConf };

  userModel.create(userData, (err, user) => {
    if (err) {
      return next(err);
    }
    req.session.userId = user._id;
    res.redirect("/profile");
  });
});

router.post("/login", (req, res, next) => {
  const { logemail, logpassword } = req.body;

  if (!logemail || !logpassword) {
    const err = new Error("Missing request parameters.");
    err.status = 400;
    return next(err);
  }

  userModel.authenticate(logemail, logpassword, (err, user) => {
    if (err || !user) {
      const err = new Error("Wrong email or password.");
      err.status = 401;
      return next(err);
    }
    req.session.userId = user._id;
    res.redirect("/profile");
  });
});

router.get("/profile", requiresAuth, (req, res, next) => {
  userModel.findById(req.session.userId).exec((err, user) => {
    if (err) {
      return next(err);
    } else if (user === null) {
      const err = new Error("Not authorized!");
      err.status = 400;
      return next(err);
    }

    res.send(
      "<h1>Name: </h1>" +
        user.username +
        "<h2>Mail: </h2>" +
        user.email +
        '<br><a type="button" href="/logout">Logout</a>'
    );
  });
});

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }
});

module.exports = router;

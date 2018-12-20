const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  passwordConf: {
    type: String,
    required: true
  }
});

userSchema.pre("save", function(next) {
  const user = this;

  bcrypt.hash(user.password, 11, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    user.passwordConf = hash;
    next();
  });
});

userSchema.statics.authenticate = function(email, password, done) {
  this.findOne({ email }, (err, user) => {
    if (err) {
      return done(err);
    } else if (!user) {
      const err = new Error("User not found.");
      return done(err);
    }

    bcrypt.compare(password, user.password, (err, same) => {
      if (err) {
        return done(err);
      }
      if (!same) {
        return done();
      }
      done(null, user);
    });
  });
};

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  roles: {
    dev_admin: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    manager: {
      type: Boolean,
      default: false,
    },
    camper: {
      type: Boolean,
      default: true,
    },
  },
  expiresDateCheck: {
    type: Date,
    default: undefined,
    // if user is not verified then the account will be removed in 24 hours
    expires: 86400,
  },
});

UserSchema.plugin(passportLocalMongoose, {
  limitAttempts: true,
  interval: 100,
  // 300000ms is 5 min
  maxInterval: 300000,
  // This will completely lock out an account and requires user intervention.
  maxAttempts: 10,
});

module.exports = mongoose.model("User", UserSchema);

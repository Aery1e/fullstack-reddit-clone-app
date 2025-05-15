const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  reputation: {
    type: Number,
    default: 100,
    required: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Virtual for url
usersSchema.virtual("url").get(function () {
  return "users/" + this._id;
});

module.exports = mongoose.model("User", usersSchema);

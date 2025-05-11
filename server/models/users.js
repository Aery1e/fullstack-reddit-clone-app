// Community Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  firstName: [{
    type: String,
    required: true
  }],
  lastName: {
    type: String,
    required: true
  },
  passwordHash: [{
    type: String,
    required: true
  }],
  reputation: [{
    type: Integer,
    required: true
  }],
  joinDate: [{
    type: Date,
    default: Date.now,
    required: true
  }]
});

// Virtual for url
usersSchema.virtual('url').get(function() {
  return 'users/' + this._id;
});

module.exports = mongoose.model('Users', usersSchema);
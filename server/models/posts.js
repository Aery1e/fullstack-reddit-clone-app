// Post Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  content: {
    type: String,
    required: true
  },
  linkFlairID: {
    type: Schema.Types.ObjectId,
    ref: 'LinkFlair'
  },
  postedBy: {
    type: String,
    required: true
  },
  postedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  commentIDs: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  views: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    userId: String,
    vote: String
  }]
});

// Virtual for url
postSchema.virtual('url').get(function() {
  return 'posts/' + this._id;
});

module.exports = mongoose.model('Post', postSchema);
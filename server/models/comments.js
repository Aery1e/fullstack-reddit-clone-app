// Comment Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  commentIDs: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentedBy: {
    type: String,
    required: true
  },
  commentedDate: {
    type: Date,
    default: Date.now,
    required: true
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
commentSchema.virtual('url').get(function() {
  return 'comments/' + this._id;
});

module.exports = mongoose.model('Comment', commentSchema);
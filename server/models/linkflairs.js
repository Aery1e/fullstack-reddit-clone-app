// LinkFlair Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linkFlairSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 30
  }
});

// Virtual for url
linkFlairSchema.virtual('url').get(function() {
  return 'linkFlairs/' + this._id;
});

module.exports = mongoose.model('LinkFlair', linkFlairSchema);
// Community Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communitySchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 500,
  },
  postIDs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  members: [
    {
      type: String,
      required: true,
    },
  ],
  createdBy: [
    {
      type: String,
      required: true,
    },
  ],
});

// Virtual for url
communitySchema.virtual("url").get(function () {
  return "communities/" + this._id;
});

// Virtual for memberCount
communitySchema.virtual("memberCount").get(function () {
  return this.members.length;
});

module.exports = mongoose.model("Community", communitySchema);

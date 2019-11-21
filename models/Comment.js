const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  beer: {
    type: Schema.Types.ObjectId,
    ref: "Beer"
  },
  comment: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;

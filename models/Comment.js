const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: String,
  comment: String
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;

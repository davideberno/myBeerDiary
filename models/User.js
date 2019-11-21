const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  username: String,
  password: String,
  githubId: String,
  profilePicture: {
    type: String,
    default: "https://res.cloudinary.com/dj6au0ai7/image/upload/v1574329547/image/default-profile-pic_r6q1oi.png"
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

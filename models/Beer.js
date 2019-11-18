const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const beerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  brewery: String,
  abv: Number,
  image: String,
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

const Beer = mongoose.model("Beer", beerSchema);

module.exports = Beer;

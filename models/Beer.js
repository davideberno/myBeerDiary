const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const beerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  brewery: {
    type: String,
    required: false
  },
  abv: {
    type: Number,
    required: false
  },
  image: {
    type: ObjectId,
    required: false
  },
  comments: {
    type: String
  }
});

const Beer = mongoose.model("Beer", beerSchema);

module.exports = Beer;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const beerSchema = new Schema({
  fields: {
    name: String,
    name_breweries: String,
    style_name: String,
    cat_name: String,
    country: String,
    coordinates: [],
    abv: Number,
    ibu: Number,
    image: String,
    price: Number,
    lastComment: Date,
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
  }
});

beerSchema.index({ "fields.name": "text", "fields.name_breweries": "text" });

const Beer = mongoose.model("Beer", beerSchema);

module.exports = Beer;

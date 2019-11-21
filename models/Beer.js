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
    image: {
      type: String,
      default: "https://res.cloudinary.com/dj6au0ai7/image/upload/v1574329546/image/default-beer-pic_p1upv8.png"
    },

    price: Number,
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

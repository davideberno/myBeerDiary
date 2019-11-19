const mongoose = require("mongoose");
const Beer = require("./Beer");
const beers = require("./db.json");

mongoose.connect("mongodb://localhost/mybeerdiary");

Beer.insertMany(beers)
  .then(documents => {
    console.log(`Success! ${documents.length} beers were added`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.log(err);
  });

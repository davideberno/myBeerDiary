const express = require("express");
const router = express.Router();
const loginCheck = require("../middleware/loginCheck");
const Beer = require("../models/Beer");
const Comment = require("../models/Comment");

router.get("/", (req, res) => res.render("index"));

router.get("/dashboard", loginCheck(), (req, res) => {
  res.render("dashboard", {
    user: req.user.name
  });
});

router.get("/beer", loginCheck(), (req, res) => {
  res.render("beer");
});

router.get("/submit-beer", loginCheck(), (req, res) => {
  res.render("submit-beer");
});

router.post("/submit-beer", loginCheck(), (req, res) => {
  const { name, name_breweries, abv, image, price, comment } = req.body;
  Comment.create({ user: req.user._id, comment: comment })
    .then(newComment => {
      Beer.create({ name, name_breweries, abv, image, price }).then(newBeer => {
        newComment.beer = newBeer._id;
        newBeer.comments.push(newComment._id);
      });
    })
    .catch(err => console.log(err));
});

router.post("/search", (req, res) => {
  Beer.find({ $text: { $search: req.body.search } })
    .then(found => {
      res.send(found);
    })
    .catch(err => console.log(err));
});
module.exports = router;

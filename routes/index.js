const express = require("express");
const router = express.Router();
const loginCheck = require("../middleware/loginCheck");
const Beer = require("../models/Beer");
const Comment = require("../models/Comment");
const User = require("../models/User");

router.get("/", (req, res) => res.render("index"));

router.get("/dashboard", loginCheck(), (req, res) => {
  Comment.find({ user: req.user._id })
    .populate({
      path: "beer"
    })
    .then(comments => {
      //res.send(comments);
      res.render("dashboard", {
        user: req.user.name,
        comments: comments
      });
    })
    .catch(err => console.log(err));
  // res.render("dashboard", {
  //   user: req.user.name
  // });
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
      Beer.create({
        "fields.name": name,
        "fields.name_breweries": name_breweries,
        "fields.abv": abv,
        "fields.image": image,
        "fields.price": price,
        "fields.comments": [newComment._id]
      }).then(newBeer => {
        Comment.findOneAndUpdate(
          { _id: newComment._id },
          { beer: newBeer._id }
        ).then(comment => {
          User.findOneAndUpdate(
            { _id: req.user._id },
            { $push: { comments: newComment._id } },
            { new: true }
          ).then(user => {
            res.redirect("/dashboard");
          });
        });
      });
    })
    .catch(err => console.log(err));
});

router.post("/search", (req, res) => {
  Beer.find({ $text: { $search: req.body.search } })
    .then(found => {
      res.render("submit-beer", { searchResult: found });
      //res.send(found);
    })
    .catch(err => console.log(err));
});
module.exports = router;

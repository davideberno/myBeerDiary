const express = require("express");
const router = express.Router();
const loginCheck = require("../middleware/loginCheck");
const Beer = require("../models/Beer");
const Comment = require("../models/Comment");
const User = require("../models/User");
const uploadBeerCloud = require("../config/beer-cloudinary");

router.get("/", (req, res) => {
  if (req.user) {
    res.redirect("/feeds");
  } else {
    res.render("index", { user: req.user });
  }
});

router.get("/feeds", loginCheck(), (req, res) => {
  Comment.find()
    .limit(5)
    .populate({
      path: "beer"
    })
    .populate({
      path: "user"
    })
    .then(comments => {
      res.render("feeds", {
        user: req.user.name,
        comments: comments
      });
    })
    .catch(err => console.log(err));
});

router.get("/dashboard", loginCheck(), (req, res) => {
  Comment.find({ user: req.user._id })
    .populate({
      path: "beer"
    })
    .then(comments => {
      console.log(comments);
      res.render("dashboard", {
        user: req.user,
        comments: comments
      });
    })
    .catch(err => console.log(err));
});

router.get("/beer", loginCheck(), (req, res) => {
  res.render("beer", { user: req.user });
});

router.get("/submit-beer", loginCheck(), (req, res) => {
  res.render("submit-beer", { user: req.user });
});

router.get("/beer/:beerId", (req, res) => {
  Beer.findOne({ _id: req.params.beerId })
    .populate({
      path: "fields.comments",
      populate: {
        path: "fields.comments"
      },
      populate: { path: "user" }
    })
    .then(beer => {
      res.render("beer.hbs", { beer: beer, user: req.user });
    })
    .catch(err => console.log(err));
});

router.post(
  "/submit-beer",
  uploadBeerCloud.single("beerPicture"),
  loginCheck(),
  (req, res) => {
    const { name, name_breweries, abv, price, comment } = req.body;
    const defaultBeerImage =
      "https://res.cloudinary.com/dj6au0ai7/image/upload/v1574329546/image/default-beer-pic_p1upv8.png";
    let beerPicture = req.file ? req.file.url : defaultBeerImage;
    Comment.create({ user: req.user._id, comment: comment })
      .then(newComment => {
        Beer.create({
          "fields.name": name,
          "fields.name_breweries": name_breweries,
          "fields.abv": abv,
          "fields.image": beerPicture,
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
  }
);

router.get("/search", (req, res) => {
  res.render("search", { user: req.user });
});

router.post("/search", (req, res) => {
  Beer.find({ $text: { $search: req.body.search } })
    .then(found => {
      res.render("search", { searchResult: found, user: req.user });
    })
    .catch(err => console.log(err));
});

router.post("/beer/:id/comment", (req, res, next) => {
  Comment.create({
    comment: req.body.newComment,
    user: req.user._id,
    beer: req.params.id
  })
    .then(comment => {
      return Beer.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: {
            "fields.comments": comment._id
          }
        },
        {
          new: true
        }
      )
        .populate({
          path: "fields.comments"
        })
        .then(beer => {
          res.redirect(`/beer/${beer._id}`);
          //res.json(beer.fields.comments);
        });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;

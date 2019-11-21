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
    .sort({ _id: -1 })
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
  User.findOne({ _id: req.user._id })
    .populate({
      path: "comments",
      populate: {
        path: "beer"
      }
    })
    .then(user => {
      res.render("dashboard", { user: req.user, comments: user.comments });
    })
    .catch(err => {
      console.log(err);
    });
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
    const { name, name_breweries, abv, price, comment, style_name } = req.body;
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
          "fields.comments": [newComment._id],
          "fields.style_name": style_name
        }).then(newBeer => {
          Comment.findOneAndUpdate(
            { _id: newComment._id },
            { beer: newBeer._id }
          ).then(comment => {
            User.findOneAndUpdate(
              { _id: req.user._id },
              {
                $push: { comments: { $each: [comment._id], $position: 0 } }
              },
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
          $push: { "fields.comments": { $each: [comment._id], $position: 0 } }
        },
        {
          new: true
        }
      )
        .populate({
          path: "fields.comments"
        })
        .then(beer => {
          User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $push: {
                comments: { $each: [comment._id], $position: 0 }
              }
            },
            {
              new: true
            }
          ).then(user => {
            res.redirect(`/beer/${beer._id}`);
            //res.json(beer.fields.comments);
          });
        });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;

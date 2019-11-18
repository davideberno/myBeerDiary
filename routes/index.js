const express = require("express");
const beers = require("../open-beer-database.json");
const router = express.Router();

const loginCheck = () => {
  return (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/");
    }
  };
};

router.get("/", (req, res) => res.render("index"));

router.get("/dashboard", loginCheck(), (req, res) => {
  res.render("dashboard", {
    user: req.user.name
  });
});

router.get("/beers", (req, res) => {
  res.send(beers);
});

module.exports = router;

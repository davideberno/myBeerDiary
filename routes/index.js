const express = require("express");
const router = express.Router();
const loginCheck = require("../middleware/loginCheck");

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

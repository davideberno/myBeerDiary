const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const Comment = require("../models/Comment");
const hbs = require("hbs");

hbs.registerPartials(__dirname + "/views/partials");

router.get("/login", (req, res) => res.render("login"));

router.get("/register", (req, res) => res.render("signin"));

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
  }

  if (password2 !== password2) {
    errors.push({ msg: "Passwords don't match!" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters long!" });
  }

  if (errors.length > 0) {
    res.render("signin", { errors });
  } else {
    User.findOne({ email: email })
      .then(found => {
        if (found) {
          errors.push({ msg: "Email already in use!" });
          res.render("signin", { errors });
        } else {
          bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(password, salt).then(hash => {
              User.create({
                name: name,
                email: email,
                password: hash
              }).then(newUser => {
                req.login(newUser, err => {
                  if (err) next(err);
                  else res.redirect("/dashboard");
                });
              });
            });
          });
        }
      })
      .catch(err => console.log(err));
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/users/login",
    successRedirect: "/dashboard"
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.render("index", { msg: "Logged out" });
});

module.exports = router;

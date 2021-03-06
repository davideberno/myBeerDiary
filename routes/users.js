const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const Comment = require("../models/Comment");
const uploadCloud = require("../config/cloudinary");

router.get("/login", (req, res) =>
  res.render("login", { user: req.user, message: req.flash("error") })
);

router.get("/register", (req, res) => res.render("signin", { user: req.user }));

router.post("/register", uploadCloud.single("profilePicture"), (req, res) => {
  const { name, username, password, password2 } = req.body;
  const defaultUserImage =
    "https://res.cloudinary.com/dj6au0ai7/image/upload/v1574329547/image/default-profile-pic_r6q1oi.png";
  let profilePicture = req.file ? req.file.url : defaultUserImage;
  let errors = [];
  if (!name || !username || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords don't match!" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters long!" });
  }

  if (errors.length > 0) {
    res.render("signin", { errors: errors, user: req.user });
  } else {
    User.findOne({ username: username })
      .then(found => {
        if (found) {
          errors.push({ msg: "Username already in use!" });
          res.render("signin", { errors: errors, user: req.user });
        } else {
          bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(password, salt).then(hash => {
              User.create({
                name: name,
                username: username,
                password: hash,
                profilePicture: profilePicture
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
  res.render("index", { msg: "Logged out", user: req.user });
});

module.exports = router;

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");
const GithubStrategy = require("passport-github").Strategy;
const passport = require("passport");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return done(null, false, { msg: "Invalid credentials" });
        }
        bcrypt.compare(password, user.password).then(match => {
          if (!match) {
            return done(null, false, { msg: "Invalid credentials" });
          } else {
            return done(null, user);
          }
        });
      })
      .catch(err => {
        done(err);
      });
  })
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/users/github/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ githubId: profile.id })
        .then(user => {
          if (user) {
            console.log(profile);
            done(null, user);
          } else {
            return User.create({
              githubId: profile.id,
              name: profile.displayName,
              username: profile.username,
              profilePicture: profile.photos[0].value
            }).then(newUser => {
              done(null, newUser);
            });
          }
        })
        .catch(err => {
          done(err);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

module.exports = app => {
  app.use(passport.initialize());
  app.use(passport.session());
};

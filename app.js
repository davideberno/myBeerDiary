require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/User");
const GithubStrategy = require("passport-github").Strategy;

const app = express();

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
mongoose
  .connect("mongodb://localhost/project-logi", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to database..."))
  .catch(err => console.log(err));

//Session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

//Passport
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        bcrypt.compare(password, user.password).then(match => {
          if (!match) {
            return done(null, false, { message: "Invalid credentials" });
          } else {
            // passwords match
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
            // log the user in
            done(null, user);
          } else {
            return User.create({ githubId: profile.id }).then(newUser => {
              // log user in
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

app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

// Hbs setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(__dirname + "/views/partials");

//Static folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

app.listen(3000, console.log("Server started on port 3000"));

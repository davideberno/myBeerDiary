require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

const app = express();

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/mybeerdiary", {
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

//Flash
app.use(flash());

//Passport
require("./passport/passport")(app);

// Hbs setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(__dirname + "/views/partials");

//Static folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

app.listen(process.env.PORT, console.log("Server started on port 3000"));

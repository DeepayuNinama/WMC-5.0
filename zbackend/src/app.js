const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const hbs = require('hbs');
<<<<<<< HEAD
=======
const paypal = require('paypal-rest-sdk');
require('dotenv').config();
>>>>>>> features

const app = express();
const mongoURL = "mongodb://127.0.0.1:27017/GTA5";
const port = process.env.PORT || 3000;

mongoose.connect(mongoURL)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  { usernameField: 'emailid' },
  async (emailid, password, done) => {
    try {
      const user = await User.findOne({ emailid });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const partialsPath = path.join(__dirname, "../templates/views");
hbs.registerPartials(partialsPath);

const static_path = path.join(__dirname, "../public"); 
const templates_path = path.join(__dirname, "../templates/views");

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

<<<<<<< HEAD
=======
paypal.configure({
  'mode': process.env.PAYPAL_MODE,
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

>>>>>>> features
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);

const authRoutes = require("./routes/authRoute");
const productRoutes = require("./routes/productRoute");

app.use("/", authRoutes);
app.use("/", productRoutes);

app.listen(port, () => {
  console.log(`Server is running at Port no. ${port}`);
});

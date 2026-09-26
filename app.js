if(process.env.NODE_ENV !="production"){
 require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const reviewRouter = require("./routes/review.js");


const dbUrl = process.env.ATLASDB_URL;
// --------------------
// MongoDB Connection
// --------------------

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// --------------------
// App Configuration
// --------------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Session Configuration
// --------------------

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,

});

store.on("error" , ()=>{
  console.log("Error in MONGO SESSION STORE",err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,

  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));

// --------------------
// Flash Messages
// --------------------

app.use(flash());

// --------------------
// Passport Configuration
// --------------------

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash messages available in all EJS files
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// --------------------
// Test Route
// --------------------

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// --------------------
// Demo User
// --------------------

// app.get("/demouser", async (req, res, next) => {
//   try {
//     const fakeUser = new User({
//       email: "student@gmail.com",
//       username: "delta-student",
//     });

//     const registeredUser = await User.register(
//       fakeUser,
//       "helloworld"
//     );

//     res.send(registeredUser);
//   } catch (err) {
//     next(err);
//   }
// });

// --------------------
// Routes
// --------------------

app.use("/listings", listingsRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);

// --------------------
// Error Handling
// --------------------

app.use((err, req, res, next) => {
  const {
    statusCode = 500,
    message = "Something went wrong. Please try again.",
  } = err;

  console.error(err);

  res.status(statusCode).render("listings/error.ejs", {
    err: { message },
  });
});

// --------------------
// Start Server
// --------------------

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

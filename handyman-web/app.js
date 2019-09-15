require("dotenv").config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Customer = require("./models/customer");
var Vendor = require("./models/vendor");
var Comment = require("./models/comment");
var indexRoutes = require("./routes/index");
var customerRoutes = require("./routes/customer");
var vendorRoutes = require("./routes/vendor");
var commentRoutes = require("./routes/comment");
var isCustomer = null;

mongoose.connect("mongodb://localhost:27017/handyman", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(function (req, res, next) {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
  next();
});

//PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "services at one stop destination",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use("customer", new LocalStrategy(
  function (username, password, done) {
    Customer.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      else if (!user) { return done(null, false); }
      else {
        user.authenticate(password, function (err, user) {
          if (err) {
            return done(null, false);
          } else {
            isCustomer = true;
            return done(null, user);
          }
        });
      }
    });
  }
));

passport.use("vendor", new LocalStrategy(
  function (username, password, done) {
    Vendor.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      else if (!user) { return done(null, false); }
      else {
        user.authenticate(password, function (err, user) {
          if (err) {
            return done(null, false);
          } else {
            isCustomer = false;
            return done(null, user);
          }
        });
      }
    });
  }
));

passport.serializeUser(function (user, done) {
  if (isCustomer) {
    // isCustomer = user.isCustomer;
    done(null, user.id);
  } else if (!isCustomer) {
    // isCustomer = user.isCustomer;
    done(null, user.id);
  }
});

passport.deserializeUser(function (id, done) {
  if (isCustomer) {
    Customer.findById({ _id: id }, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        done(err, user);
      }
    });
  } else if (!isCustomer) {
    Vendor.findById({ _id: id }, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        done(err, user);
      }
    });
  }
});

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use(customerRoutes);
app.use(vendorRoutes);
app.use(commentRoutes);

//Route for logout
app.get("/logout", function (req, res) {
  req.logout();
  isCustomer = null;
  req.flash("success", "Logged you out!");
  res.redirect("/services");
});


app.listen(process.env.PORT, function () {
  console.log("Handyman has started on server with PORT: 3000");
});
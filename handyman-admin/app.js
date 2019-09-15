require("dotenv").config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Admin = require("./models/admin");
var indexRoutes = require("./routes/index");
var adminRoutes = require("./routes/admin");
var customerRoutes = require("./routes/customer");
var vendorRoutes = require("./routes/vendor");
var commentRoutes = require("./routes/comment");

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

passport.use("admin", new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use(adminRoutes);
app.use(customerRoutes);
app.use(vendorRoutes);
app.use(commentRoutes);

//Route for logout
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/services");
});

app.listen(process.env.PORT, function () {
    console.log("Handyman admin panel has started on server with PORT: 3001");
});
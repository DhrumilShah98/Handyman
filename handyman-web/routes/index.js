var express = require("express");
var router = express.Router();
var passport = require("passport");
var Vendor = require("../models/vendor");
var middleware = require("../middleware");

//ROUTE FOR THE HANDYMAN LANDING PAGE
router.get("/", function (req, res) {
	res.render("landing");
});

//ROUTE FOR THE ABOUT US PAGE
router.get("/about", function (req, res) {
	res.render("about");
});

//ROUTE FOR THE CONTACT US PAGE
router.get("/contact", function (req, res) {
	res.render("contact");
});


//ROUTE FOR THE SERVICES PAGE
router.get("/services", function (req, res) {
	res.render("services", { currentUser: req.user });
});

//ROUTE FOR ALL SUBSERVICES PAGE
router.get("/services/:subservice", function (req, res) {
	var subservice = req.params.subservice;
	res.render("subservices/" + subservice);
});

module.exports = router;

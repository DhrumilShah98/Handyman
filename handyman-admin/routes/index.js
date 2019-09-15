var express = require("express");
var router = express.Router();

//ROUTE FOR THE HANDYMAN LANDING PAGE
router.get("/", function (req, res) {
	res.render("landing");
});

//ROUTE FOR THE SERVICES PAGE
router.get("/services", function (req, res) {
	res.render("services");
});

//ROUTE FOR ALL SUBSERVICES PAGE
router.get("/services/:subservice", function (req, res) {
	var subservice = req.params.subservice;
	res.render("subservices/" + subservice);
});
module.exports = router;
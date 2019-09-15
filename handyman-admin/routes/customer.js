var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Customer = require("../models/customer");
var middleware = require("../middleware");

//ROUTE FOR LIST OF ALL THE CUSTOMERS PAGE
router.get("/customer/list", middleware.isLoggedIn, function (req, res) {
    Customer.find(function (err, customers) {
        if (err) {
            req.flash("error", "Oops!! Something went wrong. Please try again.")
            res.redirect("back");
        } else {
            res.render("customer/c_list", { customers: customers });
        }
    });
});

//ROUTE FOR THE CUSTOMER EDIT PAGE
router.get("/customer/:id/edit", middleware.isLoggedIn, function (req, res) {
    Customer.findById(req.params.id, function (err, customer) {
        if (err) {
            req.flash("error", "Oops!! Something went wrong. Please try again.")
            res.redirect("back");
        } else {
            res.render("customer/c_edit", { customer: customer });
        }
    })
});

//ROUTE FOR THE CUSTOMER UPDATE
router.put("/customer/:id", middleware.isLoggedIn, function (req, res) {

    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;

    req.checkBody("fname", "First Name can only have letters").isAlpha();
    req.checkBody("lname", "Last Name can only have letters").isAlpha();
    req.checkBody("email", "Email is not valid").isEmail();

    var errors = req.validationErrors();
    if (errors) {
        req.flash("error", errors[0].msg);
        res.redirect("back");
    } else {
        var customer = {
            fname: fname,
            lname: lname,
            email: email
        };
        Customer.findByIdAndUpdate(req.params.id, customer, function (err, updatedCustomer) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("/customer/" + req.params.id + "/edit");
            } else {
                req.flash("success", "Successfully updated details for " + updatedCustomer.username);
                res.redirect("/customer/list");
            }
        });
    }
});

//ROUTE FOR THE CUSTOMER DELETE
router.delete("/customer/:id", middleware.isLoggedIn, function (req, res) {
    Customer.findById(req.params.id, function (err, foundCustomer) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        foundCustomer.remove();
        req.flash("success", "Customer deleted successfully!");
        res.redirect("/customer/list");

    });
});
module.exports = router;
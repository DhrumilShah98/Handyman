var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Customer = require("../models/customer");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


//ROUTE FOR THE CUSTOMER LOGIN PAGE
router.get("/customer/login", function (req, res) {
   res.render("customer/c_login");
});

//ROUTE FOR CUSTOMER LOGIN
router.post("/customer/login", passport.authenticate("customer", {
   successRedirect: "/services",
   failureRedirect: "/customer/login",
   failureFlash: "Incorrect username or Password",
   successFlash: "Welcome to Handyman!"
}), function (req, res) {
});

//ROUTE FOR THE CUSTOMER REGISTERATION PAGE
router.get("/customer/register", function (req, res) {
   res.render("customer/c_register");
});

//ROUTE FOR CUSTOMER REGISTER
router.post("/customer/register", function (req, res) {
   var fname = req.body.fname;
   var lname = req.body.lname;
   var username = req.body.username;
   var email = req.body.email;
   var confirmemail = req.body.confirmemail;
   var password = req.body.password;
   var confirmpassword = req.body.confirmpassword;

   req.checkBody("fname", "First Name can only have letters").isAlpha();
   req.checkBody("lname", "Last Name can only have letters").isAlpha();
   req.checkBody("username", "Username can only have  letters and numbers").isAlphanumeric();
   req.checkBody("email", "Email is not valid").isEmail();
   req.checkBody("confirmemail", "Emails do not match").equals(req.body.email);
   req.checkBody("password", "Password must be 8 - 20 characters long with one uppercase letter, one lowercase letter and one number").matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$");
   req.checkBody("confirmpassword", "Passwords do not match").equals(req.body.password);

   var errors = req.validationErrors();
   if (errors) {
      res.render("customer/c_register", {
         error: errors[0].msg
      });
   } else {
      var newCustomer = new Customer({
         isCustomer: true,
         fname: fname,
         lname: lname,
         username: username,
         email: email
      });
      Customer.register(newCustomer, password, function (err, customer) {
         if (err) {
            req.flash("error", err.msg);
            return res.render("customer/c_register");
         }
         passport.authenticate("customer")(req, res, function () {
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
            res.redirect("/services");
         });
      });
   }
});

//ROUTE FOR THE CUSTOMER EDIT PAGE
router.get("/customer/:id/edit", middleware.isLoggedIn, function (req, res) {
   res.render("customer/c_edit");
});

//ROUTE FOR THE CUSTOMER UPDATE PAGE
router.put("/customer/:id", middleware.isLoggedIn, function (req, res) {

   var fname = req.body.fname;
   var lname = req.body.lname;
   var email = req.body.email;

   req.checkBody("fname", "First Name can only have letters").isAlpha();
   req.checkBody("lname", "Last Name can only have letters").isAlpha();
   req.checkBody("email", "Email is not valid").isEmail();

   var errors = req.validationErrors();
   if (errors) {
      res.render("customer/c_edit", {
         error: errors[0].msg
      });
   } else {
      var customer = {
         fname: fname,
         lname: lname,
         email: email
      };
      Customer.findByIdAndUpdate(req.params.id, customer, function (err, updatedCustomer) {
         if (err) {
            req.flash("error", err.msg);
            res.redirect("/customer/" + req.params.id + "/edit");
         } else {
            req.flash("success", "Successfully updated details for " + updatedCustomer.username);
            res.redirect("/services");
         }
      });
   }
});

//ROUTE FOR THE CUSTOMER FORGET PASSWORD PAGE
router.get("/customer/forgot", function (req, res) {
   res.render("customer/c_forgotpassword");
});

//ROUTE FOR THE CUSTOMER FORGET PASSWORD
router.post("/customer/forgot", function (req, res, next) {
   async.waterfall([
      function (done) {
         crypto.randomBytes(20, function (err, buf) {
            var token = buf.toString("hex");
            done(err, token);
         });
      },
      function (token, done) {
         Customer.findOne({ email: req.body.email }, function (err, user) {
            if (!user) {
               req.flash("error", "No account with that email address exists.");
               return res.redirect("/customer/forgot");
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function (err) {
               done(err, token, user);
            });
         });
      },
      function (token, user, done) {
         var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
               user: "YOUR_EMAIL_ID",
               pass: process.env.GMAILPW
            }
         });
         var mailOptions = {
            to: user.email,
            from: "YOUR_EMAIL_ID",
            subject: "Handyman Password Reset",
            text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
               "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
               "http://" + req.headers.host + "/customer/reset/" + token + "\n\n" +
               "If you did not request this, please ignore this email and your password will remain unchanged.\n"
         };
         smtpTransport.sendMail(mailOptions, function (err) {
            req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
            done(err, "done");
         });
      }
   ], function (err) {
      if (err) return next(err);
      res.redirect("/customer/forgot");
   });
});

//ROUTE FOR THE CUSTOMER RESET PASSWORD PAGE
router.get("/customer/reset/:token", function (req, res) {
   Customer.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
      if (!user) {
         req.flash("error", "Password reset token is invalid or has expired.");
         return res.redirect("/customer/forgot");
      }
      res.render("customer/c_resetpassword", { token: req.params.token });
   });
});

//ROUTE FOR THE CUSTOMER RESET PASSWORD
router.post("/customer/reset/:token", function (req, res) {
   async.waterfall([
      function (done) {
         Customer.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
            if (!user) {
               req.flash("error", "Password reset token is invalid or has expired.");
               return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
               user.setPassword(req.body.password, function (err) {
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;

                  user.save(function (err) {
                     req.logIn(user, function (err) {
                        done(err, user);
                     });
                  });
               })
            } else {
               req.flash("error", "Passwords do not match.");
               return res.redirect("back");
            }
         });
      },
      function (user, done) {
         var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
               user: "YOUR_EMAIL_ID",
               pass: process.env.GMAILPW
            }
         });
         var mailOptions = {
            to: user.email,
            from: "YOUR_EMAIL_ID",
            subject: "Handyman: Your password has been changed",
            text: "Hello,\n\n" +
               "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
         };
         smtpTransport.sendMail(mailOptions, function (err) {
            req.flash("success", "Success! Your password has been changed.");
            done(err);
         });
      }
   ], function (err) {
      res.redirect("/services");
   });
});

module.exports = router;
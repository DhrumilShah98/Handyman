var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Admin = require("../models/admin");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

//ROUTE FOR THE ADMIN LOGIN PAGE
router.get("/admin/login", function (req, res) {
   res.render("admin/a_login");
});

//ROUTE FOR ADMIN LOGIN
router.post("/admin/login", passport.authenticate("admin", {
   successRedirect: "/services",
   failureRedirect: "/admin/login",
   failureFlash: "Incorrect username or Password",
   successFlash: "Welcome to Handyman!"
}), function (req, res) {
});

//ROUTE FOR THE ADMIN REGISTERATION PAGE
// router.get("/admin/register", function (req, res) {
//    res.render("admin/a_register");
// });

//ROUTE FOR ADMIN REGISTER
// router.post("/admin/register", function (req, res) {
//    var fname = req.body.fname;
//    var lname = req.body.lname;
//    var username = req.body.username;
//    var email = req.body.email;
//    var confirmemail = req.body.confirmemail;
//    var password = req.body.password;
//    var confirmpassword = req.body.confirmpassword;

//    req.checkBody("fname", "First Name can only have letters").isAlpha();
//    req.checkBody("lname", "Last Name can only have letters").isAlpha();
//    req.checkBody("username", "Username can only have  letters and numbers").isAlphanumeric();
//    req.checkBody("email", "Email is not valid").isEmail();
//    req.checkBody("confirmemail", "Emails do not match").equals(req.body.email);
//    req.checkBody("password", "Password must be 8 - 20 characters long with one uppercase letter, one lowercase letter and one number").matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$");
//    req.checkBody("confirmpassword", "Passwords do not match").equals(req.body.password);

//    var errors = req.validationErrors();
//    if (errors) {
//       res.render("admin/a_register", {
//          error: errors[0].msg
//       });
//    } else {
//       var newAdmin = new Admin({
//          fname: fname,
//          lname: lname,
//          username: username,
//          email: email
//       });
//       Admin.register(newAdmin, password, function (err, admin) {
//          if (err) {
//             return res.render("admin/a_register", {
//                error: err.msg
//             });
//          }
//          req.flash("success", "Registeration Successful!!");
//          res.redirect("/services");
//       });
//    }
// });

//ROUTE FOR THE ADMIN EDIT PAGE
router.get("/admin/:id/edit", middleware.isLoggedIn, function (req, res) {
   res.render("admin/a_edit");
});

//ROUTE FOR THE ADMIN UPDATE PAGE
router.put("/admin/:id", middleware.isLoggedIn, function (req, res) {

   var fname = req.body.fname;
   var lname = req.body.lname;
   var email = req.body.email;

   req.checkBody("fname", "First Name can only have letters").isAlpha();
   req.checkBody("lname", "Last Name can only have letters").isAlpha();
   req.checkBody("email", "Email is not valid").isEmail();

   var errors = req.validationErrors();
   if (errors) {
      res.render("admin/a_edit", {
         error: errors[0].msg
      });
   } else {
      var admin = {
         fname: fname,
         lname: lname,
         email: email
      };
      Admin.findByIdAndUpdate(req.params.id, admin, function (err, updatedAdmin) {
         if (err) {
            req.flash("error", err.msg);
            res.redirect("/admin/" + req.params.id + "/edit");
         } else {
            req.flash("success", "Successfully updated details for " + updatedAdmin.username);
            res.redirect("/services");
         }
      });
   }
});

//ROUTE FOR THE ADMIN FORGET PASSWORD PAGE
router.get("/admin/forgot", function (req, res) {
   res.render("admin/a_forgotpassword");
});

//ROUTE FOR THE ADMIN FORGET PASSWORD
router.post("/admin/forgot", function (req, res, next) {
   async.waterfall([
      function (done) {
         crypto.randomBytes(20, function (err, buf) {
            var token = buf.toString("hex");
            done(err, token);
         });
      },
      function (token, done) {
         Admin.findOne({ email: req.body.email }, function (err, user) {
            if (!user) {
               req.flash("error", "No account with that email address exists.");
               return res.redirect("/admin/forgot");
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
               "http://" + req.headers.host + "/admin/reset/" + token + "\n\n" +
               "If you did not request this, please ignore this email and your password will remain unchanged.\n"
         };
         smtpTransport.sendMail(mailOptions, function (err) {
            req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
            //  done(err, "done");
            res.redirect("/services");
         });
      }
   ], function (err) {
      if (err) return next(err);
      res.redirect("/admin/forgot");
   });
});

//ROUTE FOR THE ADMIN RESET PASSWORD PAGE
router.get("/admin/reset/:token", function (req, res) {
   Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
      if (!user) {
         req.flash("error", "Password reset token is invalid or has expired.");
         return res.redirect("/admin/forgot");
      }
      res.render("admin/a_resetpassword", { token: req.params.token });
   });
});

//ROUTE FOR THE ADMIN RESET PASSWORD
router.post("/admin/reset/:token", function (req, res) {
   async.waterfall([
      function (done) {
         Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
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
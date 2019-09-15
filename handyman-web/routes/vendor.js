var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var passport = require("passport");
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var multer = require("multer");

//CLOUDINARY RELATED CODE
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
    return cb(new Error("Only jpg, jpeg and png files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })
var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dhrumilshah98",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//ROUTE FOR THE VENDOR LOGIN PAGE
router.get("/vendor/login", function (req, res) {
  res.render("vendor/v_login");
});

// ROUTE FOR THE VENDOR LOGIN
router.post("/vendor/login", passport.authenticate("vendor",
  {
    successRedirect: "/services",
    failureRedirect: "/vendor/login",
    failureFlash: "Incorrect username or Password",
    successFlash: "Welcome to Handyman!"
  }), function (req, res) {
  });

// router.post("/vendor/login", function (req, res, next) {
//   passport.authenticate("vendor", function (err, vendor, info) {
//     if (err) {
//       req.flash("error", err.message);
//       return res.redirect("/vendor/login");
//     }
//     if (!vendor) {
//       req.flash("error", "Incorrect username or Password");
//       return res.redirect("/vendor/login");
//     }
//     if(!vendor.isApproved){
//       req.flash("error", "Your request is not approved! Please wait for Approval. Our Handyman team will contact you soon.");
//       return res.redirect("/vendor/login");
//     }
//     req.logIn(vendor, function (err) {
//       if (err) {
//         req.flash("error", err.message);
//         return res.redirect("/vendor/login");
//       }
//       return res.redirect("/services");
//     });
//   })(req, res, next);
// });
//ROUTE FOR THE VENDOR REGISTERATION PAGE
router.get("/vendor/register", function (req, res) {
  res.render("vendor/v_register");
});

//ROUTE FOR THE VENDOR REGISTERATION
router.post("/vendor/register", upload.single("image"), function (req, res) {

  var fname = req.body.fname;
  var lname = req.body.lname;
  var username = req.body.username;
  var email = req.body.email;
  var confirmemail = req.body.confirmemail;
  var password = req.body.password;
  var confirmpassword = req.body.confirmpassword;
  var address = req.body.address;
  var area = req.body.area;
  var city = req.body.city;
  var state = req.body.state;
  var pincode = req.body.pincode;
  var mobile = req.body.mobile;
  var service = req.body.service;
  var subservice = req.body.subservice;
  var description = req.body.description;
  var experience = req.body.experience;
  var visitCharge = req.body.visitCharge;

  req.checkBody("fname", "First Name can only have letters").isAlpha();
  req.checkBody("lname", "Last Name can only have letters").isAlpha();
  req.checkBody("username", "Username can only have  letters and numbers").isAlphanumeric();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("confirmemail", "Emails do not match").equals(req.body.email);
  req.checkBody("password", "Password must be 8 - 20 characters long with one uppercase letter, one lowercase letter and one number").matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,30}$");
  req.checkBody("confirmpassword", "Passwords do not match").equals(req.body.password);
  req.checkBody("area", "Area is not valid").isAlpha();
  req.checkBody("city", "City is not valid").isAlpha();
  req.checkBody("state", "State is not valid").isAlpha();
  req.checkBody("pincode", "Pincode is not valid").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number can only have numbers").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number is not valid").matches("^[6-9][0-9]{9}$");

  var errors = req.validationErrors();
  if (errors) {
    res.render("vendor/v_register", {
      error: errors[0].msg
    });
  } else {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      var newVendor = new Vendor({
        isCustomer: false,
        fname: fname,
        lname: lname,
        username: username,
        email: email,
        address: address,
        area: area,
        city: city,
        state: state,
        pincode: pincode,
        mobile: mobile,
        service: service,
        subservice: subservice,
        experience: experience,
        visitCharge: visitCharge,
        description: description,
        image: result.secure_url,
        imageId: result.public_id
      });

      Vendor.register(newVendor, password, function (err, vendor) {
        if (err) {
          req.flash("error", err.message);
          return res.render("vendor/v_register");
        }
        passport.authenticate("vendor")(req, res, function () {
          req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
          res.redirect("/services");
        });
      });
    });
  }
});

//ROUTE FOR THE VENDOR EDIT PAGE
router.get("/vendor/:id/edit", middleware.isLoggedIn, function (req, res) {
  res.render("vendor/v_edit");
});

//ROUTE FOR THE VENDOR UPDATE PAGE
router.put("/vendor/:id", middleware.isLoggedIn, upload.single("image"), function (req, res) {

  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var area = req.body.area;
  var city = req.body.city;
  var state = req.body.state;
  var pincode = req.body.pincode;
  var mobile = req.body.mobile;
  var description = req.body.description;
  var experience = req.body.experience;
  var visitCharge = req.body.visitCharge;

  req.checkBody("fname", "First Name can only have letters").isAlpha();
  req.checkBody("lname", "Last Name can only have letters").isAlpha();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("area", "Area is not valid").isAlpha();
  req.checkBody("city", "City is not valid").isAlpha();
  req.checkBody("state", "State is not valid").isAlpha();
  req.checkBody("pincode", "Pincode is not valid").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number can only have numbers").isNumeric({ no_symbols: true });
  req.checkBody("mobile", "Mobile number is not valid").matches("^[6-9][0-9]{9}$");

  var errors = req.validationErrors();
  if (errors) {
    res.render("vendor/v_edit", {
      error: errors[0].msg
    });
  } else {
    Vendor.findById(req.params.id, async function (err, vendor) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/vendor/" + req.params.id + "/edit");
      } else {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(vendor.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            vendor.image = result.secure_url;
            vendor.imageId = result.public_id;
          } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        vendor.fname = fname;
        vendor.lname = lname;
        vendor.email = email;
        vendor.area = area;
        vendor.city = city;
        vendor.state = state;
        vendor.pincode = pincode;
        vendor.mobile = mobile;
        vendor.description = description;
        vendor.experience = experience;
        vendor.visitCharge = visitCharge;
        vendor.save();
        req.flash("success", "Successfully updated details for " + vendor.username);
        res.redirect("/services");
      }
    });
  }
});

//ROUTE FOR VENDOR FORGOT PASSWORD PAGE
router.get("/vendor/forgot", function (req, res) {
  res.render("vendor/v_forgotpassword");
});

//ROUTE FOR VENDOR FORGOT PASSWORD
router.post("/vendor/forgot", function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function (token, done) {
      Vendor.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/vendor/forgot");
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
          "http://" + req.headers.host + "/vendor/reset/" + token + "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect("/vendor/forgot");
  });
});

//ROUTE FOR VENDOR RESET PASSWORD PAGE
router.get("/vendor/reset/:token", function (req, res) {
  Vendor.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/vendor/forgot");
    }
    res.render("vendor/v_resetpassword", { token: req.params.token });
  });
});

//ROUTE FOR VENDOR RESET PASSWORD
router.post("/vendor/reset/:token", function (req, res) {
  async.waterfall([
    function (done) {
      Vendor.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
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

//ROUTE TO SEE ALL THE VENDORS LIST DEPENDING ON SERVICE AND SUBSERVICE
router.get("/:service/:subservice", function (req, res) {
  Vendor.find({ isApproved: true, service: req.params.service, subservice: req.params.subservice }, function (err, foundVendors) {
    if (err) {
      req.flash("error", err.message);
    } else {
      res.render("vendor/v_list", { foundVendors: foundVendors });
    }
  });
});

//ROUTE TO SEE THE SPECIFIC VENDOR DEPENDING ON SERVICE, SUBSERVICE AND VENDOR ID
router.get("/:service/:subservice/:id", middleware.isLoggedIn, function (req, res) {
  Vendor.findById(req.params.id).populate("comments").exec(function (err, foundVendor) {
    if (err) {
      req.flash("error", err.message);
    } else if (!foundVendor.isApproved) {
      if (res.locals.currentUser.isCustomer) {
        req.flash("error", "Not Allowed!");
        res.redirect("/services");
      } else {
        if (res.locals.currentUser.username != foundVendor.username) {
          req.flash("error", "Not Allowed!");
          res.redirect("/services");
        } else {
          res.render("vendor/v_show", { vendor: foundVendor, error: "Your profile is not verified yet and will not be visible to others. Handyman team will contact you soon for verification." });
        }
      }
    } else {
      res.render("vendor/v_show", { vendor: foundVendor });
    }
  });
});

module.exports = router;
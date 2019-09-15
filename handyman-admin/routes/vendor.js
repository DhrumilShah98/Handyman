var express = require("express");
var expressValidator = require("express-validator");
var router = express.Router();
router.use(expressValidator());
var Vendor = require("../models/vendor");
var middleware = require("../middleware");
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

//ROUTE FOR THE VENDOR EDIT PAGE
router.get("/vendor/:id/edit", middleware.isLoggedIn, function (req, res) {
  Vendor.findOne({ _id: req.params.id }, function (err, foundVendor) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render("vendor/v_edit", { currentVendor: foundVendor });
    }
  });
});

//ROUTE FOR THE VENDOR UPDATE
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
        res.redirect("/" + vendor.service + "/" + vendor.subservice + "/" + vendor._id);
      }
    });
  }
});

//ROUTE FOR THE VENDOR DELETE
router.delete("/vendor/:id", middleware.isLoggedIn, function (req, res) {
  Vendor.findById(req.params.id, async function (err, foundVendor) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(foundVendor.imageId);
      foundVendor.remove();
      req.flash("success", "Vendor deleted successfully!");
      res.redirect("/services");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
  });
});

//ROUTE TO SEE ALL THE VENDORS WHO ARE NOT APPROVED
router.get("/vendor/vendor_approve_request", middleware.isLoggedIn, function (req, res) {
  Vendor.find({ isApproved: false }, function (err, foundVendors) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render("vendor/v_list", { foundVendors: foundVendors });
    }
  });
});

//ROUTE TO APPROVE THE VENDOR
router.put("/vendor/:id/approve", middleware.isLoggedIn, function (req, res) {
  Vendor.findByIdAndUpdate(req.params.id, { isApproved: true }, function (err, updatedVendor) {
    if (err) {
      req.flash("error", "Oops!! Something went wrong. Please try again.")
      res.redirect("back");
    } else {
      req.flash("success", "Vendor Approved.")
      res.redirect("/" + updatedVendor.service + "/" + updatedVendor.subservice + "/" + updatedVendor._id);
    }
  });
});

//ROUTE TO SEE ALL THE VENDORS LIST DEPENDING ON SERVICE AND SUBSERVICE
router.get("/:service/:subservice", function (req, res) {
  Vendor.find({ isApproved: true, service: req.params.service, subservice: req.params.subservice }, function (err, foundVendors) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
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
      res.redirect("back");
    } else {
      res.render("vendor/v_show", { vendor: foundVendor });
    }
  });
});

module.exports = router;
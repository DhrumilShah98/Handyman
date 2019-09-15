var express = require("express");
var router = express.Router();
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//ROUTE FOR DISPLAYING THE COMMENT PAGE
router.get("/:service/:subservice/:id/comments/new", middleware.isLoggedIn, function (req, res) {
  Vendor.findById({ _id: req.params.id }, function (err, foundVendor) {
    if (err) {
      req.flash("error", err.message);
    } else {
      res.render("comments/new", { vendor: foundVendor });
    }
  });
});

//ROUTE FOR ADDING THE COMMENT
router.post("/:service/:subservice/:id/comments/", middleware.isLoggedIn, function (req, res) {
  Vendor.findById(req.params.id, function (err, foundVendor) {
    if (err) {
      req.flash("error", err.message);
      redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", err.message);
        } else {
          comment.author.id = req.user._id;
          comment.author.fname = req.user.fname;
          comment.author.lname = req.user.lname;
          comment.author.username = req.user.username;
          comment.save();
          foundVendor.comments.push(comment);
          foundVendor.save();
          req.flash("success", "Successfully added comment");
          res.redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
        }
      });
    }
  });
});


//ROUTE FOR COMMENT EDIT PAGE
router.get("/:service/:subservice/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
  Vendor.findById(req.params.id, function (err, foundVendor) {
    if (err) {
      req.flash("error", err.message);
      redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
    } else {
      Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          res.render("comments/edit", { vendor: foundVendor, comment: foundComment });
        }
      });
    }
  });
});

//ROUTE FOR UPDATING THE COMMENT
router.put("/:service/:subservice/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      req.flash("success", "Successfully updated comment");
      res.redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
    }
  });
});

//ROUTE FOR DESTROYING THE COMMENT
router.delete("/:service/:subservice/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function (err) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
    } else {
      req.flash("success", "Comment deleted");
      res.redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
    }
  });
});


module.exports = router;
var express = require("express");
var router = express.Router();
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//ROUTE FOR COMMENT EDIT PAGE
router.get("/:service/:subservice/:id/comments/:comment_id/edit", middleware.isLoggedIn, function (req, res) {
    Vendor.findById(req.params.id, function (err, foundVendor) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
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
router.put("/:service/:subservice/:id/comments/:comment_id", middleware.isLoggedIn, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            Vendor.findById(req.params.id, function (err, foundVendor) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully updated comment");
                    res.redirect("/" + foundVendor.service + "/" + foundVendor.subservice + "/" + foundVendor.id);
                }
            });
        }
    });
});

//ROUTE FOR DESTROYING THE COMMENT
router.delete("/:service/:subservice/:id/comments/:comment_id", middleware.isLoggedIn, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/" + req.params.service + "/" + req.params.subservice + "/" + req.params.id);
        }
    });
});



module.exports = router;
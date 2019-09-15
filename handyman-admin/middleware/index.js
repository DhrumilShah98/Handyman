var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/services");
    }
}

module.exports = middlewareObj
var Campground = require("../models/campground");
var Comment = require("../models/comment");


//all the middleware goes here

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    //is a user logged in?
    if (req.isAuthenticated()) {
        //get campground from database
        Campground.findById(req.params.id, function(err, foundCampground) {
            if (err) { 
                req.flash("error", "Campground not found");
                res.redirect("back");
            }
            else {
                // does campground belong to this user requesting?
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        
        //use "back" to send user to previous page they were on
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //is a user logged in?
    if (req.isAuthenticated()) {
        //get comment from database
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) { 
                res.redirect("back");
            }
            else {
                // does comment belong to this user requesting?
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        //they need to sign in
        //use "back" to send user to previous page they were on
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    //is a user logged in?
    if (req.isAuthenticated()) {
        return next();  //move on to route handler
    }
    
    //this "adds to the flash" and won't be displayed until the next thing we see
    // flash(key, value)
    req.flash("error", "You need to be logged in to do that");  
    
    res.redirect("/login");  //otherwise show login form
}

module.exports = middlewareObj;
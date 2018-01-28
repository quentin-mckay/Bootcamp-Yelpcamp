var express = require("express");
var router = express.Router({mergeParams: true});

// bring in 
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middleware = require("../middleware");

// ==============
// COMMENTS ROUTES
// ==============

//NEW route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // console.log(req.params.id);
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) { console.log(err) }
        else {
            res.render("comments/new", {campground: foundCampground});
        }
    });
    
});


//CREATE route
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup campground using :id
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            // create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if (err) { 
                    req.flash("error", "Database error -- Comment not created")
                    console.log(err) 
                }
                else {
                    //add username and id to comment
                    // console.log(`New comment's username will be ${req.user.username} and id is ${req.user.id}`);
                    comment.author.id = req.user.id;
                    comment.author.username = req.user.username;
                    comment.save();
                    // connect new comment to campground by storing comment.id in Campground.comments
                    campground.comments.push(comment);
                    campground.save();
                    
                    req.flash("success", "Successfully created comment");
                    
                    // redirect to campground show page
                    res.redirect("/campgrounds/" + campground.id);
                }
            })
        }
    })
})

//EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    })
    
})

//UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    })
})

//DESTROY route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    })
})



module.exports = router;
var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");

var middleware = require("../middleware")  //if we require a directory, it automatically requires contents of index.js in directory

// ==============
// CAMPGROUND ROUTES
// ==============

// INDEX - show all campgrounds
router.get("/", function(req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
       if (err) {
           console.log(err);
       } else {
           res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user}); // don't need currentUser: req.user now because of our own middleware above
       }
    });
    
    // res.render("campgrounds", {campgrounds: campgrounds});
});

// CREATE - add new campground
router.post("/", middleware.isLoggedIn, function(req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user.id,
        username: req.user.username
    }
    
    var newCampground = { name: name, image: image, description: desc, author: author };
    
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            // if it works redirect to GET campgrounds
            res.redirect("/campgrounds");
        }
    });
});

// NEW - display form to make new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
       if (err) {
           console.log(err);
       } else {
           // render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
})



//EDIT - show form for editing campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    //get campground from database
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
    })
})

//UPDATE - place where form submit toA
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    
    //find and update correct campground
    var id = req.params.id;
    var newData = req.body.campground;  //simple because in form we did name="campground[name]" etc...
    
    Campground.findByIdAndUpdate(id, newData, function(err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            //redirect to show page
            res.redirect(`/campgrounds/${req.params.id}`);  
        }
    })
})

//DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
})




module.exports = router;
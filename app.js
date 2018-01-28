var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose");
    
    
//user auth
var passport      = require('passport'),
    LocalStrategy = require("passport-local")

//allows use of PUT, DELETE, etc in forms
var methodOverride = require('method-override');


//bring in models
var Campground = require("./models/campground");
var Comment    = require("./models/comment");
var User       = require("./models/user");

// seedDB();  //seed the database
var seedDB = require("./seeds");


var flash = require("connect-flash");


//requiring routes
var indexRoutes      = require("./routes/index");
var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes    = require("./routes/comments");


// if this environment variable exists use it, otherwise connect to local running database
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v11";



mongoose.connect(url);
//mongoose.connect("mongodb://localhost/yelpcamp-v11");
//mongoose.connect("mongodb://quentin:rusty@ds133211.mlab.com:33211/yelpcamp-v11");
//Database username: quentin
//Database password: rusty



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public")); //to "serve up" /public/stylesheets/main.css
app.use(methodOverride("_method")); //so that forms can use PUT (for our campground EDIT form sending to campground UPDATE)


app.use(flash()); //this must come before passport configuration

// Session config
app.use(require("express-session")({
    secret: "this can be anything",
    resave: false,
    saveUninitialized: false
}));



// PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());


// User.methods comes from passport-local-mongoose use in user.js
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// this allows every page(even the header) to have access to req.user variable
// whatever we put in res.locals is available inside our template
// this must come after passport configuration
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})



// ---------ROUTES----------

app.use("/", indexRoutes);  // don't need the "/" because nothing to DRY but let's keep it consistent
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp server started!!!");
});
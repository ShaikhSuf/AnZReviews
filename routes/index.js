var express =require("express");
var router = express.Router();
var passport = require("passport");
var User 	 = require("../models/user");

// Root Route
router.get("/", function(req, res){
	//res.send("This Will be the landing Page Soon.");
	res.render("landing");
});

// Show registration Form
router.get("/register", function(req, res){
	res.render("register");
});

//Handles sign up logic
router.post("/register", function(req, res,next){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp, " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// Show Login Form
router.get("/login", function(req, res){
	res.render("login");
});

// Handles Login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login",
		failureFlash: true
	}),function(req, res){
});

// Logout Route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success","Logged you out!");
	res.redirect("/campgrounds");
});

module.exports = router;

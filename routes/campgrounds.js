var express =require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// INDEX Route - Show All Campgrounds.
router.get("/", function(req, res){
	// Get all the campgrounds from DB
	Campground.find({}, function(err, allcampgrounds){
		if(err || !allcampgrounds){
			req.flash("error", "Campgrounds not found!.");
			res.redirect("back");
		}else{
			res.render("campgrounds/index",{campgrounds: allcampgrounds});
		}
	});
	//
});

// NEW Route - Show form to create a new campground.
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// CREATE Route - Add a New Capground to DB.
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add to campground array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var descr = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, price: price, image: image, description: descr, author: author};
	
	// Create a new campground and save to DB.
	Campground.create(newCampground, function(err, newlyCreated){
		if(err || !newlyCreated){
			req.flash("error", err.message);
			res.redirect("back");
		} else{
			// redirect back to campground page.
			req.flash("success", "Campground added.");
			res.redirect("/campgrounds");
		}
	});
	
});

// SHOW Route - Shows Info About a Campground.
router.get("/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if (err || !foundCampground){
			req.flash("error", "Campground not found!.");
		   	res.redirect("back");
		   } else{
			   //console.log(foundCampground);
			   // render show template with that campground.
				res.render("campgrounds/show",{campground: foundCampground});
		   }
	})
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found!.");
		   	res.redirect("back");
		}else{
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	// find and update the correct campground 
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err || !updatedCampground){
			req.flash("error", err.message);
			res.redirect("back");
		}else{
			// redirect somewhere
			req.flash("success", "Campground " + updatedCampground.name + " updated.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DELETE/DESTROY CAMPGROUND ROUTE
// router.delete("/:id/", checkCampgroundOwnership, function(req, res){
// 	Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
// 		if(err){
// 			console.log(err);
// 			res.redirect("/campgrounds");
// 		} else{
// 			Comment.deleteMany( {_id: { $in: deletedCampground.comments } }, function(err){
// 				if(err){
// 					console.log(err);
// 					res.redirect("/campgrounds");
// 				} else{
// 					res.redirect("/campgrounds");	
// 				}
// 			});
// 		}
// 	});
// });
router.delete("/:id/", middleware.checkCampgroundOwnership, function(req, res){
	try{
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", err.message);
				res.redirect("/campgrounds");
			} else{
				foundCampground.remove();
				req.flash("success", "Campground deleted.");
				res.redirect("/campgrounds");
			}
		});
		
	} catch(err){
		
	}
});

	
module.exports = router;
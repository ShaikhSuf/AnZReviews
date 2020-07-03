var express =require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var	Comment	= require("../models/comment");
var middleware = require("../middleware");

// NEW Route - Show form to create a new comments.
router.get("/new", middleware.isLoggedIn, function(req, res){
	// find capground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err || !campground){
			req.flash("error", "Campground not found.");
			res.redirect("back")
		} else{
			res.render("comments/new", {campground: campground});
		}				
	})
});

// CREATE Route - Add a New Comment to DB.
router.post("/", middleware.isLoggedIn, function(req, res){
	// Look up campground using ID
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found.");
			res.redirect("back");
		} else{
			//console.log(req.body.comment);
			// Crate new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err || !comment){
					req.flash("error", err.message);
					res.redirect("back");
				} else{
					// Add username and id to comments 
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// Save Comments
					comment.save();
					// Connect new comment to campground
					foundCampground.comments.push(comment);
					// Save the Comments
					foundCampground.save();
					// Redirect to campground show page
					req.flash("success", "Successfully added comment.");
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			});
		}			
	});
});

// Comments Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found.");
			res.redirect("back");
		} else{
			Comment.findById(req.params.comment_id, function(err, foundComment){
				if(err){
					req.flash("error", "Comment not found.");
					res.redirect("back");
				}else{
					res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
				}
			});
		}
	});
});

//Comments Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


//Comments Destroy/Delete Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // Find the comment and Remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
		  // Find the comment references in the campground and delete. 
		  Campground.findByIdAndUpdate(req.params.id, {
                $pull: {
                    comments: req.params.comment_id
                }
            }, function (err, campground){
			  if (err) {
				  res.redirect("back");
			  } else{
				  req.flash("success", "Comment deleted.");
				  res.redirect("/campgrounds/" + req.params.id);
			  }
		  }); 
       	}
    });
});
	

module.exports = router;
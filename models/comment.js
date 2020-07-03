var mongoose = require("mongoose");
var Campground = require("../models/campground");
 
var commentSchema = new mongoose.Schema({
    text: String,
    author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

 
module.exports = mongoose.model("Comment", commentSchema);

// const Comment = require('./comment');
// campgroundSchema.pre('remove', async function() {
// 	await Comment.remove({
// 		_id: {
// 			$in: this.comments
// 		}
// 	});
// });
var express 		= require("express"),
	app 			= express(),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	flash 			= require("connect-flash"),
	passport 		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	methodOverride 	= require("method-override"),
	Campground 		= require("./models/campground"),
	Comment			= require("./models/comment"),
	User 			= require("./models/user"),
	seedDB			= require("./seeds");

var indexRoutes 		= require("./routes/index"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	commentRoutes 		= require("./routes/comments");

mongoose.connect(process.env.DATABASEURL, {useUnifiedTopology: true, useNewUrlParser: true},function(err){
	if(err){
		console.log("ERROR: ", err.message);
	}
});


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
mongoose.set('useFindAndModify', false);

// seedDB(); // Seed the database.

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "This app is going to rock!!!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	// flash set up
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
}); 

//Requiring Routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("The YelpCamp Server Has Started!");
});
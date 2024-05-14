require("dotenv").config();


const express = require("express");

const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path= require("path");
const methodOverride =  require("method-override");
const ejsMate= require("ejs-mate");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Use the Review model as needed

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
  
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
  secret: process.env.SECRET,

  },
  touchAfter:24 * 3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE", err);
});


const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUnintialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
     
    
  },
};
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");  
// });




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
 
  next();
});


// app.get("/demouser", async(req,res)=>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//    let registeredUser = await User.register(fakeUser,"helloworld");
//    res.send(registeredUser);
// });





// const validateListing = (req, res, next)=>{
//   let {error}= listingSchema.validate(req.body);
//   if(error){
//     let errMsg = error.details.map((el)=> el.message).join(",");
//     throw new ExpressError(400,errMsg);
//   }
//   else{
//     next();
//   }
// };


const validateReview = (req, res, next)=>{
  let {error}= reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }
};


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// Define wrapAsync function
function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// //index route
// app.get("/listings", async(req,res)=>{
//   const allListings= await Listing.find({});
//   res.render("listings/index.ejs",{allListings});
// });

//new route
app.get("/listing/new",(req,res)=>{
  res.render("listings/new.ejs");
});

// //show route
// app.get("/listings/:id", async (req,res)=>{
//   let {id}=req.params;
//   const listing= await Listing.findById(id).populate("reviews"); 
//   res.render("listings/show.ejs",{listing});
// });

//admin route
app.get("/admin", (req, res, next) => {
  next(new ExpressError(403, "Access to admin is forbidden"));
});

// Error handler middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});




//reviews post route


app.post("/listings/:id/reviews", validateReview, wrapAsync( async (req, res) => {
  let listing =  await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

//reviews delete route

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res)=>{
  let { id, reviewId }= req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
   await Review.findByIdAndDelete(reviewId);

   res.redirect(`/listings/${id}`);

})
);


// List all listings
app.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Error handler middleware
app.use((err, req, res, next)=>{
  res.send("something went wrong!");
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

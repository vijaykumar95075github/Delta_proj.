const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const Review = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


const listingController = require("../controllers/listings.js");
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/'});







//index route
router.get("/",wrapAsync(listingController.index));
  
  
//new route
router.get("/new", isLoggedIn,listingController.renderNewForm);

  
  //show route
  router.get("/:id",wrapAsync(listingController.showListing));

  //create route
router.post("/",isLoggedIn, validateListing,  isAuthenticated, wrapAsync(listingController.createListing));


  // Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  req.flash("error", "You must be logged in to create listings!");
  res.redirect("/login");
}
  
  //edit route
  router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editListing));
  
  //update route
  router.put("/:id", isLoggedIn, isOwner, wrapAsync( async (req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    
    res.redirect(`/listings/${id}`);
  }));
  
  //delete route
  router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

  // Define wrapAsync function
function wrapAsync(fn) {
    return function(req, res, next) {
      fn(req, res, next).catch(next);
    };
  }
  
  module.exports = router;


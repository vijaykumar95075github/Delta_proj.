const express = require("express");
const router = express.Router({mergeParams: true});

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {  reviewSchema } = require("../schema.js");
const {isLoggedIn, isReviewAuthor } = require("../middleware.js");



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

  const reviewController = require("../controllers/reviews.js");
  

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
  
  //reviews delete route
  
  router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

    // Define wrapAsync function
function wrapAsync(fn) {
    return function(req, res, next) {
      fn(req, res, next).catch(next);
    };
  }

  module.exports = router;
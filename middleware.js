const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next)=>{
    
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listings!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id)

    if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error", "you are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next)=>{
    let {error}= listingSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
  };

  module.exports.validateReview = (req, res, next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
  };

//   module.exports.isReviewAuthor = async (req, res, next)=>{
//     const { id, reviewId } = req.params;
//     const review = await Review.findById(reviewId);

//     if(!Review.author.equals(res.locals.currUser._id)){
//       req.flash("error", "you are not the author of this review");
//       return res.redirect(`/listings/${id}`);
//     }
//     next();
// }

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

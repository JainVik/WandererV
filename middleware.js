const Listing = require("./models/listing")
const Review = require("./models/review.js")
const { listingSchema,reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){ //to authenticate if the user is logged in to create a listing
       req.session.redirectUrl = req.originalUrl
        req.flash("error", "you must be logged in!!")
        return res.redirect("/login")
    }
    next()
}

module.exports.saveRedirectUrl= (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}

module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params
    let listing = await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

//middleware for server side validation for listings:
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    // Create a comma-separated error message for all error details
    const errMsg = error.details.map((el) => el.message).join(", ");
    
    // Log the error for debugging purposes (optional)
    console.error("Validation Error: ", errMsg);

    // Throw a custom error to be handled by the error handler middleware
    throw new ExpressError(400, `Validation failed: ${errMsg}`);
  } else {
    // Proceed to the next middleware or controller if validation is successful
    next();
  }
};


  //middleware for server side validation for reviews:
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

  module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params
    let review = await Review.findById(reviewId)
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review")
        return res.redirect(`/listings/${id}`)
    }
    next()
}
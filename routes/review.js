const express = require("express"); // Importing the Express framework
const router = express.Router({mergeParams:true});//usomg merge to merge the parent and children routes from app to this file.that is if parent route has some parameter which can be used in our call back we use this merge params
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controllers/reviews.js")



//Reviews- POST route
router.post("/",isLoggedIn, validateReview,wrapAsync(reviewController.createReview))
    
//Reviews-Delete route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview))

    module.exports=router; 
const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema , reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        return next(new ExpressError(400, message));
    }

    next();
};

module.exports.isLoggedIn = (req, res, next) => {
    
    if (!req.isAuthenticated()) {
        //redirect url
       req.session.redirectUrl=req.originalUrl;
        req.flash("error", "You should be logged in");
        return res.redirect("/login");
    }

    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();

};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","you are not the owner of this listing");
        return res.redirect('/listing/${id}');
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id , reviewId } = req.params;

    let listing = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
const { response } = require("express");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}); // Retrieving all listings from MongoDB
  res.render("listings/index.ejs", { allListings }); // Rendering the index page with listings data
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs"); // Rendering the new listing form page
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params; // Extracting the listing ID from the URL
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner"); // Fetching the listing from the database
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing }); // Rendering the show page with listing details
};

module.exports.createListing = async (req, res, next) => {
let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit:1,
})
.send();


  let url = req.file.path;
let filename = req.file.filename
  const newListing = new Listing(req.body.listing); // Creating a new Listing document with form data
  newListing.owner = req.user._id;
  newListing.image={url, filename}

  newListing.geometry = response.body.features[0].geometry;

  await newListing.save(); // Saving the new listing to MongoDB
  req.flash("success", "New Listing Created!");
  res.redirect("/listings"); // Redirecting back to the listings page after saving
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params; // Extracting the listing ID from the URL
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_150");
    res.render("listings/edit.ejs", { listing ,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  if(typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename
listing.image= {url, filename}
await listing.save()
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.index = async (req, res) => {
  const { category } = req.query; // Get category from query string

  let listings;

  if (category) {
    // Log to see what category value we are filtering by
    // Ensure you're using the correct case-sensitive category value
    listings = await Listing.find({ category: category }); // Fetch listings filtered by category
  } else {
    listings = await Listing.find(); // Fetch all listings if no category is specified
  }

  if (!listings || listings.length === 0) {
    // If no listings are found, you can pass a message to show on the front end
    return res.render('listings/index', { allListings: [], message: 'No listings found for this category.' });
  }

  // Render the page with the filtered listings
  res.render('listings/index', { allListings: listings });
};

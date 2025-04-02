if(process.env.NODE_ENV!="production"){
  require('dotenv').config()
}

const express = require("express"); // Importing the Express framework
const app = express(); // Creating an Express application instance
const mongoose = require("mongoose"); // Importing Mongoose for MongoDB interaction
const path = require("path"); // Importing the Path module for handling file paths
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session")
const MongoStore = require('connect-mongo')
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // Defining the MongoDB connection URL

const dbUrl = process.env.ATLASDB_URL

// Function to connect to the MongoDB database
async function main() {
  try {
    await mongoose.connect(dbUrl); // Connecting to MongoDB using Mongoose
    console.log("DB connected"); // Logging successful database connection
  } catch (err) {
    console.error("Failed to connect to the database:", err); // Logging connection error
  }
}

main(); // Calling the function to connect to the database

// main().then(()=>{
//   console.log("connected to DB")
//   }).catch((err)=>{
//   console.log(err)
//   })
//   async function main() {
//     await mongoose.connect(dbUrl)
//   }


app.set("view engine", "ejs"); // Setting EJS as the templating/view engine
app.set("views", path.join(__dirname, "views")); // Setting the views directory path
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data (URL-encoded)
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto: {
    secret:process.env.SECRET
  },
  touchAfter:24*3600
})
 
store.on("error",()=>{
  console.log("ERROR in mongo Store", err)
})

const sessionOptions = {
  store,
secret : process.env.SECRET,
resave : false,
saveUninitialized: true,
cookie:{
  expires: Date.now() + 7*24*60*60*1000,
  maxAge: 7*24*60*60*1000,
  httpOnly: true,
}
}



// Root route (Home page)
// app.get("/", (req, res) => {
//   res.send("hii"); // Sending a simple response to the root route
// });

app.use(session(sessionOptions))
app.use(flash())


app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
res.locals.success = req.flash("success")
res.locals.error = req.flash("error")
res.locals.currUser = req.user; //to show log in and sign in when logged out and show logout when sign in , here in req.user we get the user details when we login else it remains undefined 
next()
})
 
app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter)

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});


app.listen(8080, () => {
  console.log("server is listening to port 8080"); // Logging that the server is running
});





// Uncommenting the following code allows testing by inserting a sample listing into the database
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     })

//     await sampleListing.save();  // Saving the sample listing to the database
//     console.log("sample was saved")  // Logging that the sample was saved
//     res.send("success testing")  // Sending a success message as response
// })

// Starting the Express server on port 8080

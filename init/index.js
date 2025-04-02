const mongoose=require("mongoose")
const initData=require("./data.js")
const Listing=require("../models/listing.js")



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("DB connected");
    } catch (err) {
        console.error("Failed to connect to the database:", err);
    }
}

main();

const initDB = async()=> {
    await Listing.deleteMany({})
    initData.data= initData.data.map((obj)=>({...obj, owner:"67bd58ddfadadab928624558"}))
    await Listing.insertMany(initData.data)
    console.log("data initialised")
}

 initDB(); 
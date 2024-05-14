const mongoose = require("mongoose");
const initData = require("./data.js"); // Assuming this is the correct path to your data module
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    initDB(); // Call the initDB function after connecting to the database
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); // Delete all existing data
  initData.data =  initData.data.map((obj)=>(
    {...obj, owner: "663dc3b5f304cfe74e9c063a"}));
  await Listing.insertMany(initData.data); // Insert new data from initData module

  console.log("Data was initialized");
};

initDB();

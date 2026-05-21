const mongoose = require("mongoose");
const env = require("../config/env");
const Application = require("../models/Application");
const User = require("../models/User");

async function cleanDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Connected!");

    // Clean up applications
    const appsRes = await Application.updateMany(
      { photo: "[object FileList]" },
      { $set: { photo: "" } }
    );
    console.log(`Cleaned up ${appsRes.modifiedCount} applications with invalid photo values.`);

    // Clean up users
    const usersPhotoUrlRes = await User.updateMany(
      { photoUrl: "[object FileList]" },
      { $set: { photoUrl: "" } }
    );
    const usersPictureRes = await User.updateMany(
      { picture: "[object FileList]" },
      { $set: { picture: "" } }
    );
    console.log(`Cleaned up ${usersPhotoUrlRes.modifiedCount} users with invalid photoUrl values.`);
    console.log(`Cleaned up ${usersPictureRes.modifiedCount} users with invalid picture values.`);

  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

cleanDatabase();

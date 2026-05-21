const mongoose = require("mongoose");
const env = require("../config/env");
const Application = require("../models/Application");

async function checkPhotos() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Connected!");

    const apps = await Application.find({ photo: { $exists: true } }).limit(5);
    console.log(`Found ${apps.length} applications with photos:`);
    apps.forEach((app, i) => {
      console.log(`\n--- App ${i + 1} ---`);
      console.log(`ID: ${app._id}`);
      console.log(`Name: ${app.name}`);
      console.log(`Photo string length: ${app.photo ? app.photo.length : 0}`);
      console.log(`Photo starting characters: "${app.photo ? app.photo.substring(0, 100) : ''}"`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

checkPhotos();

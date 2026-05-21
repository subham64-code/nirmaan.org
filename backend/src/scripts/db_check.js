const mongoose = require("mongoose");
const env = require("../config/env");
const Application = require("../models/Application");
const User = require("../models/User");
const generateNirmaanId = require("../utils/generateNirmaanId");
const QRCode = require("qrcode");

async function check() {
  try {
    console.log("Connecting to MongoDB at:", env.mongoUri);
    await mongoose.connect(env.mongoUri);
    console.log("Connected successfully!");

    // Check total users
    const userCount = await User.countDocuments({});
    console.log("Total users in database:", userCount);

    const users = await User.find({});
    console.log("Users:", users.map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, nirmaanId: u.nirmaanId, isApproved: u.isApproved })));

    // Check applications
    const appCount = await Application.countDocuments({});
    console.log("Total applications:", appCount);

    const apps = await Application.find({});
    console.log("Applications:", apps.map(a => ({ _id: a._id, name: a.name, email: a.email, status: a.status })));

    // Find a pending application
    const pendingApp = await Application.findOne({ status: "pending" });
    if (!pendingApp) {
      console.log("No pending applications found to simulate.");
      mongoose.disconnect();
      return;
    }

    console.log("Simulating review for pending application:", pendingApp._id, pendingApp.name);
    
    // Simulate what PATCH /:id/review does:
    const nirmaanId = generateNirmaanId(pendingApp.course);
    const qrText = `${pendingApp.name} | ${nirmaanId} | ${pendingApp.course}`;
    const idCardQr = await QRCode.toDataURL(qrText);

    console.log("Generated Nirmaan ID:", nirmaanId);

    // Let's see if User creation or lookup fails
    let student = await User.findOne({ email: pendingApp.email });
    console.log("Existing student found:", student ? student._id : "None");

    if (!student) {
      console.log("Creating new student...");
      try {
        student = await User.create({
          role: "student",
          name: pendingApp.name,
          email: pendingApp.email,
          phone: pendingApp.phone,
          qualification: pendingApp.qualification,
          course: pendingApp.course,
          nirmaanId,
          idCardQr,
          isApproved: true,
          photoUrl: pendingApp.photo,
          picture: pendingApp.photo,
        });
        console.log("Student created successfully!", student._id);
      } catch (err) {
        console.error("User.create failed! Error details:", err);
      }
    } else {
      console.log("Updating existing student...");
      try {
        student.nirmaanId = nirmaanId;
        student.idCardQr = idCardQr;
        student.isApproved = true;
        student.photoUrl = pendingApp.photo;
        student.picture = pendingApp.photo;
        await student.save();
        console.log("Student updated successfully!");
      } catch (err) {
        console.error("student.save failed! Error details:", err);
      }
    }

  } catch (error) {
    console.error("General error in script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

check();

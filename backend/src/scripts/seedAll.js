const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nirmaan";

const facultyData = [
  { name: "Krishan Kumar", email: "krishan.kumar@nirmaan.edu", phone: "+91-XXXXXXXXXX", designation: "Soft Skill Trainer", photo: "/assets/faculty/Krishan Kumar(Soft Skill Trainer).jpeg", department: "Soft Skills", bio: "Experienced Soft Skill Trainer with expertise in communication and personality development" },
  { name: "Stuthikantha Mohanty", email: "stuthikantha.mohanty@nirmaan.edu", phone: "+91-XXXXXXXXXX", designation: "Soft Skill Trainer", photo: "/assets/faculty/Stithikantha Mohanty(Soft Skill Traniner).jpeg", department: "Soft Skills", bio: "Soft Skill Trainer specializing in team dynamics and leadership development" },
  { name: "Mihir Pattnaik", email: "mihir.pattnaik@nirmaan.edu", phone: "+91-XXXXXXXXXX", designation: "Master Trainer", photo: "/assets/faculty/Mihir Pattanaik(AI Master Trainer).png", department: "AI/ML", bio: "Master Trainer in AI and Machine Learning with industry experience" },
  { name: "Kalpa Pandit", email: "kalpa.pandit@nirmaan.edu", phone: "+91-XXXXXXXXXX", designation: "Master Trainer", photo: "/assets/faculty/Kalpa Pandit(AI Master Trainer).jpeg", department: "AI/ML", bio: "Expert Master Trainer in Artificial Intelligence and Deep Learning" },
  { name: "Mahapatra Girashree Sahu", email: "girashree.sahu@nirmaan.edu", phone: "+91-XXXXXXXXXX", designation: "Master Trainer", photo: "/assets/faculty/placement-trainer.jpeg", department: "AI/ML", bio: "Master Trainer with expertise in Machine Learning applications" },
  { name: "Pratyush Rath", email: "pratyush.rath@nirmaan.edu", phone: "+91-XXXXXXXXXX", designation: "Manager/Admin", photo: "/assets/faculty/Pratyush Ratha(Manager).jpeg", department: "Administration", bio: "Program Manager overseeing Nirmaan operations and student coordination" },
];

const studentData = [
  { name: "Abhijit Patra", registrationNumber: "2301298082", nirmaanId: "REDINGTON/ODISHA/GIFT/001", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Ananya Bishoyi", registrationNumber: "2405432008", nirmaanId: "REDINGTON/ODISHA/GIFT/002", course: "MCA", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Animesh Samantaray", registrationNumber: "2301298315", nirmaanId: "REDINGTON/ODISHA/GIFT/003", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Ankit Kumar Manjhi", registrationNumber: "2301298317", nirmaanId: "REDINGTON/ODISHA/GIFT/004", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Ashis Kumar Bhuyan", registrationNumber: "2301298103", nirmaanId: "REDINGTON/ODISHA/GIFT/005", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Asmit Singh", registrationNumber: "2301298334", nirmaanId: "REDINGTON/ODISHA/GIFT/006", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Debasmita Swain", registrationNumber: "2405432026", nirmaanId: "REDINGTON/ODISHA/GIFT/007", course: "MCA", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Eleena Jena", registrationNumber: "2405432029", nirmaanId: "REDINGTON/ODISHA/GIFT/008", course: "MCA", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Jaychandra Das", registrationNumber: "2301298146", nirmaanId: "REDINGTON/ODISHA/GIFT/009", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Kishor Kumar Sahoo", registrationNumber: "2301298155", nirmaanId: "REDINGTON/ODISHA/GIFT/010", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "MD Salik Ubair", registrationNumber: "2301298683", nirmaanId: "REDINGTON/ODISHA/GIFT/011", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "MD Wasiq Anwer", registrationNumber: "2301298167", nirmaanId: "REDINGTON/ODISHA/GIFT/012", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Mohammad Hassan", registrationNumber: "2301298431", nirmaanId: "REDINGTON/ODISHA/GIFT/013", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Mohammad Kashif Iqubal", registrationNumber: "2421298047", nirmaanId: "REDINGTON/ODISHA/GIFT/014", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Om Prakash Behura", registrationNumber: "2301298177", nirmaanId: "REDINGTON/ODISHA/GIFT/015", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Pradeep Kumar Singha", registrationNumber: "2301298186", nirmaanId: "REDINGTON/ODISHA/GIFT/016", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Prajayakta Patra", registrationNumber: "2405432050", nirmaanId: "REDINGTON/ODISHA/GIFT/017", course: "MCA", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Sai Premananda Das", registrationNumber: "2301298501", nirmaanId: "REDINGTON/ODISHA/GIFT/018", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Shibani Bardhan", registrationNumber: "2405432079", nirmaanId: "REDINGTON/ODISHA/GIFT/019", course: "MCA", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Sisir Pradhan", registrationNumber: "2421298050", nirmaanId: "REDINGTON/ODISHA/GIFT/020", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Spandan Kumar Behera", registrationNumber: "2301298551", nirmaanId: "REDINGTON/ODISHA/GIFT/021", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Subham Behera", registrationNumber: "2301298564", nirmaanId: "REDINGTON/ODISHA/GIFT/022", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Subrat Narayan Nanda", registrationNumber: "2301298077", nirmaanId: "REDINGTON/ODISHA/GIFT/023", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Suman Sourav Dash", registrationNumber: "2301298261", nirmaanId: "REDINGTON/ODISHA/GIFT/024", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
  { name: "Sumit Raj", registrationNumber: "2301298581", nirmaanId: "REDINGTON/ODISHA/GIFT/025", course: "B.Tech", center: "REDINGTON/ODISHA/GIFT" },
];

async function seedAll() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Drop the cnic index if it exists (from prior schema)
    try {
      await mongoose.connection.db.collection("users").dropIndex("cnic_1");
      console.log("Dropped stale cnic_1 index");
    } catch (e) {
      // index might not exist, that's fine
    }

    // --- CLEAR EXISTING DATA ---
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Faculty.deleteMany({}),
    ]);
    console.log("Cleared all existing data");

    // --- ADMIN ---
    const admins = await User.insertMany([
      { name: "Pratyush Rath", email: "pratyush.rath@nirmaan.org", role: "admin", isApproved: true, otpRequired: false, phone: "9861289418" },
      { name: "Subham Admin", email: "admin@nirmaan.org", role: "admin", isApproved: true, otpRequired: false, phone: "9861289418" },
    ]);
    console.log(`✅ ${admins.length} admin(s) added`);

    // --- TEACHERS (Faculty members as teacher Users) ---
    const teacherUsers = [];
    for (const f of facultyData) {
      const u = await User.create({
        name: f.name,
        email: f.email,
        role: "teacher",
        isApproved: true,
        otpRequired: false,
        phone: "9861289418",
      });
      teacherUsers.push(u);
    }
    const extraTeacher = await User.create({
      name: "Demo Teacher",
      email: "teacher@nirmaan.org",
      role: "teacher",
      isApproved: true,
      otpRequired: false,
      phone: "9861289418",
    });
    teacherUsers.push(extraTeacher);
    console.log(`✅ ${teacherUsers.length} teachers added`);

    // --- FACULTY (display only) ---
    const facultyDocs = await Faculty.insertMany(facultyData);
    console.log(`✅ ${facultyDocs.length} faculty members added`);

    // --- STUDENTS ---
    let studentCount = 0;
    for (const sData of studentData) {
      const email = `${sData.registrationNumber}@nirmaan.local`;
      const newUser = await User.create({
        name: sData.name,
        email,
        nirmaanId: sData.nirmaanId,
        course: sData.course,
        role: "student",
        isApproved: true,
        otpRequired: false,
        phone: "7992894181",
      });
      await Student.create({
        ...sData,
        email,
        linkedUserId: newUser._id,
      });
      studentCount++;
    }
    console.log(`✅ ${studentCount} students added and linked to User accounts`);

    console.log("\n✅✅✅ SEEDING COMPLETED SUCCESSFULLY ✅✅✅");
    console.log("\n--- LOGIN CREDENTIALS ---");
    console.log("Admin:     pratyush.rath@nirmaan.org  (or admin@nirmaan.org)");
    console.log("Teacher:   krishan.kumar@nirmaan.edu  (or any faculty email)");
    console.log("           Also: teacher@nirmaan.org");
    console.log("Student:   2301298082@nirmaan.local   (or any regno@nirmaan.local)");
    console.log("\nOTP (DEMO MODE): 123456");
    console.log("---");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
}

seedAll();

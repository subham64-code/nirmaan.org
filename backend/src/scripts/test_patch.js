const mongoose = require("mongoose");
const env = require("../config/env");
const Application = require("../models/Application");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AdminLog = require("../models/AdminLog");
const generateNirmaanId = require("../utils/generateNirmaanId");
const QRCode = require("qrcode");
const { sendMail } = require("../utils/mailer");

async function testReview() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Connected!");

    // Find the application for test@example.com
    const app = await Application.findOne({ email: "test@example.com" });
    if (!app) {
      console.log("Could not find test@example.com application!");
      return;
    }

    console.log("Simulating PATCH review for application:", app._id, app.name);
    
    // Simulate req.user
    const reqUser = {
      sub: "6a00a37afb34c14791dd3598", // ADMIN user ID
      email: "subhambehera89418@gmail.com",
      role: "admin",
    };

    const action = "approved";
    const remarks = "Looks great!";

    // 1. Update Application status
    console.log("Step 1: Saving application state...");
    app.status = action;
    app.reviewedBy = reqUser.sub;
    app.reviewedAt = new Date();
    app.remarks = remarks;
    await app.save({ validateBeforeSave: false });
    console.log("Application saved.");

    // 2. Process Approval
    console.log("Step 2: Processing approval...");
    const nirmaanId = generateNirmaanId(app.course);
    const qrText = `${app.name} | ${nirmaanId} | ${app.course}`;
    const idCardQr = await QRCode.toDataURL(qrText);

    // Check for email collision
    const existingNonStudent = await User.findOne({ email: app.email, role: { $ne: "student" } });
    if (existingNonStudent) {
      console.log("Collision check caught non-student email!");
      return;
    }

    let student = await User.findOne({ email: app.email, role: "student" });
    if (!student) {
      console.log("Creating new student user...");
      student = new User({
        role: "student",
        name: app.name,
        email: app.email,
        phone: app.phone,
        qualification: app.qualification,
        course: app.course,
        nirmaanId,
        idCardQr,
        isApproved: true,
        photoUrl: app.photo || "",
        picture: app.photo || "",
      });
      await student.save({ validateBeforeSave: false });
      console.log("Student user created.");
    } else {
      console.log("Updating existing student user...");
      student.nirmaanId = nirmaanId;
      student.idCardQr = idCardQr;
      student.isApproved = true;
      if (app.photo) {
        student.photoUrl = app.photo;
        student.picture = app.photo;
      }
      await student.save({ validateBeforeSave: false });
      console.log("Student user updated.");
    }

    // 3. Send mail
    console.log("Step 3: Sending email...");
    try {
      await sendMail({
        to: app.email,
        subject: "Nirmaan Application Approved",
        html: `<p>Congratulations ${app.name}, your application is approved.</p><p>Nirmaan ID: <strong>${nirmaanId}</strong></p>`,
      });
      console.log("Email sent successfully!");
    } catch (mailError) {
      console.error("Mail sending failed (caught):", mailError.message);
    }

    // 4. Create Notification
    console.log("Step 4: Creating notification...");
    await Notification.create({
      userId: student._id,
      title: "Application approved",
      message: `Your application has been approved. Nirmaan ID: ${nirmaanId}.`,
      type: "success",
      category: "general",
      link: "/dashboard/student",
    });
    console.log("Notification created.");

    // 5. Admin Log
    console.log("Step 5: Logging action...");
    await AdminLog.create({
      actor: reqUser.sub,
      action: "application.review",
      payload: {
        applicationId: app._id,
        action,
      },
    });
    console.log("Action logged successfully!");

    console.log("ALL STEPS COMPLETED FLAWLESSLY!");

    // Reset status to pending so it can be re-tested in real life
    app.status = "pending";
    await app.save({ validateBeforeSave: false });
    console.log("Application reset to pending.");

  } catch (err) {
    console.error("EXCEPTION CAUGHT:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

testReview();

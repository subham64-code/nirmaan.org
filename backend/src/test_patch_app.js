const mongoose = require('mongoose');
const env = require('./config/env');
const Application = require('./models/Application');
const User = require('./models/User');
const QRCode = require('qrcode');
const generateNirmaanId = require('./utils/generateNirmaanId');

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log("Connected");
  const app = await Application.findOne({ status: 'pending' });
  if (!app) {
    console.log("No pending app");
    process.exit(0);
  }
  console.log("Found app:", app.name, app.email);
  try {
    const nirmaanId = generateNirmaanId(app.course);
    const qrText = `${app.name} | ${nirmaanId} | ${app.course}`;
    const idCardQr = await QRCode.toDataURL(qrText);
    
    let student = await User.findOne({ email: app.email, role: 'student' });
    if (!student) {
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
      });
      await student.save({ validateBeforeSave: false });
      console.log("Student saved");
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
run();

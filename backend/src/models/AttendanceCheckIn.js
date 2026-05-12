const mongoose = require("mongoose");

const attendanceCheckInSchema = new mongoose.Schema(
  {
    checkInKey: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    nirmaanId: { type: String, trim: true },
    userId: { type: String, trim: true },
    status: { type: String, enum: ["Present", "Absent", "Late", "Excused"], default: "Present" },
    centerId: { type: String, trim: true, default: "general" },
    centerName: { type: String, trim: true, default: "General Center" },
    city: { type: String, trim: true, default: "India" },
    state: { type: String, trim: true, default: "India" },
    locationName: { type: String, trim: true, default: "" },
    mediaId: { type: String, trim: true, default: "" },
    mediaTitle: { type: String, trim: true, default: "" },
    mediaType: { type: String, enum: ["photo", "video", "none"], default: "none" },
    deviceLat: { type: Number },
    deviceLng: { type: Number },
    deviceAccuracy: { type: Number },
    distanceKm: { type: Number },
    note: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "web" },
    checkInAt: { type: Date, default: Date.now },
    dateKey: { type: String, required: true, index: true },
    // Verification fields
    verified: { type: Boolean, default: false },
    verificationApprovedBy: { type: String, trim: true },
    verificationApprovedAt: { type: Date },
  },
  { timestamps: true }
);

attendanceCheckInSchema.index({ dateKey: 1, centerId: 1 });

module.exports = mongoose.model("AttendanceCheckIn", attendanceCheckInSchema);
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String },
    registrationNumber: { type: String, required: true, unique: true },
    nirmaanId: { type: String, required: true, unique: true },
    course: { type: String }, // e.g., "AI/ML"
    batch: { type: String }, // e.g., "2023-2024"
    enrollmentDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    linkedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User for login
    center: { type: String }, // e.g., "REDINGTON/ODISHA/GIFT"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);

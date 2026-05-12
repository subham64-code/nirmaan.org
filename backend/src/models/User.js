const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    phone: { type: String, default: "" },
    qualification: { type: String, default: "" },
    course: { type: String, default: "" },
    nirmaanId: { type: String, unique: true, sparse: true },
    photoUrl: { type: String, default: "" },
    picture: { type: String, default: "" },
    googleId: { type: String, default: "" },
    tenthMarks: { type: Number, default: 0 },
    twelfthMarks: { type: Number, default: 0 },
    degreeMarks: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    idCardQr: { type: String, default: "" },
    otpRequired: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

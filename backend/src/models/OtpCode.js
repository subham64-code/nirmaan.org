const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpCode", otpCodeSchema);

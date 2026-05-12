const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    nirmaanId: { type: String, required: true, index: true },
    course: { type: String, default: "" },
    leaveDate: { type: Date, required: true, index: true },
    returnDate: { type: Date, default: null },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ studentId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
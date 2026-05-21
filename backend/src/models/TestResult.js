const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [Number], default: [] },
    score: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, required: true },
    status: { type: String, enum: ["submitted", "auto_failed", "cheated"], default: "submitted" },
    cheatingDetails: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

testResultSchema.index({ test: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("TestResult", testResultSchema);

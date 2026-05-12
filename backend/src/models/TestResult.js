const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [Number], default: [] },
    score: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

testResultSchema.index({ test: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("TestResult", testResultSchema);

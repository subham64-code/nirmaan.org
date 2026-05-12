const mongoose = require("mongoose");

const testAssessmentSchema = new mongoose.Schema(
  {
    testResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestResult",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F", "Pass", "Fail"],
      default: "Pass",
    },
    marks: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasForImprovement: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: String,
      default: "",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for quick queries
testAssessmentSchema.index({ testResult: 1, teacher: 1 });
testAssessmentSchema.index({ student: 1, test: 1 });
testAssessmentSchema.index({ test: 1 });

module.exports = mongoose.model("TestAssessment", testAssessmentSchema);

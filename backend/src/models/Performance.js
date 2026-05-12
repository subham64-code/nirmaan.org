const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    selfAssessmentMarks: { type: Number, default: 0 },
    practicalMarks: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Performance", performanceSchema);

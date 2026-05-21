const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: Number, required: true },
    marks: { type: Number, default: 1 },
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: String, required: true },
    targetAudience: { type: String, default: "" },
    durationMinutes: { type: Number, default: 60 },
    totalMarks: { type: Number, default: 60 },
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    questions: { type: [questionSchema], default: [] },
    assignedStudents: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    // Type of question: 'mcq' | 'coding' | 'essay' | 'ai' | 'omr'
    type: { type: String, enum: ['mcq', 'coding', 'essay', 'ai', 'omr'], default: 'mcq' },
    // Options are used for MCQ/OMR type questions
    options: { type: [String], default: [] },
    // For MCQ/OMR questions, `answer` is the correct option index. For other types it may be undefined.
    answer: { type: Number },
    marks: { type: Number, default: 1 },
    // Optional meta field for coding questions (starter code, language, tests)
    meta: { type: mongoose.Schema.Types.Mixed },
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

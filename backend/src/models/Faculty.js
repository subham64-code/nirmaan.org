const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    designation: {
      type: String,
      enum: ["Soft Skill Trainer", "Master Trainer", "Manager/Admin"],
      required: true,
    },
    photo: { type: String }, // URL to photo
    bio: { type: String },
    department: { type: String }, // e.g., "AI/ML", "Soft Skills"
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    linkedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User if they have login
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);

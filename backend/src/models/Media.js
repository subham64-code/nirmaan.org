const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["about", "gallery", "trainer", "inauguration", "video"],
      required: true,
    },
    title: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    publicId: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);

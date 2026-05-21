const mongoose = require("mongoose");

const proctoringFlagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "multiple_tab_switches",
        "repeated_fullscreen_exits",
        "copy_paste_detected",
        "excessive_violations",
        "manual_review_requested",
        "network_anomaly",
        "other",
      ],
    },
    description: String,
    flaggedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending_review", "reviewed", "approved", "rejected"],
      default: "pending_review",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNotes: String,
    proctoringReport: {
      integrityScore: Number,
      totalEvents: Number,
      criticalViolations: Number,
      highViolations: Number,
    },
  },
  { timestamps: true }
);

proctoringFlagSchema.index({ userId: 1, testId: 1 });
proctoringFlagSchema.index({ status: 1, flaggedAt: -1 });

module.exports = mongoose.model("ProctoringFlag", proctoringFlagSchema);

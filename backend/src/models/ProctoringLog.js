const mongoose = require("mongoose");

const proctoringLogSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        "tab_switch",
        "fullscreen_exit",
        "copy_paste",
        "right_click",
        "window_blur",
        "network_change",
        "keyboard_shortcut",
        "page_reload",
        "devtools_open",
        "text_selection",
        "screenshot_attempt",
        "copy_attempt",
        "paste_attempt",
        "cut_attempt",
        "camera_denied",
        "face_not_visible",
        "eyes_closed",
        "gaze_away",
        "multiple_people",
        "facial_expression_alert",
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "low",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

proctoringLogSchema.index({ userId: 1, testId: 1, timestamp: 1 });

module.exports = mongoose.model("ProctoringLog", proctoringLogSchema);

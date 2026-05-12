const express = require("express");
const Performance = require("../models/Performance");
const auth = require("../middleware/auth");
const { ok } = require("../utils/apiResponse");

const router = express.Router();

router.post("/:studentId", auth(["teacher", "admin"]), async (req, res) => {
  const { studentId } = req.params;
  const { selfAssessmentMarks, practicalMarks, feedback } = req.body;

  const performance = await Performance.findOneAndUpdate(
    { student: studentId },
    { selfAssessmentMarks, practicalMarks, feedback },
    { upsert: true, new: true }
  );

  return ok(res, performance, "Performance updated");
});

router.get("/:studentId", auth(["student", "teacher", "admin"]), async (req, res) => {
  const performance = await Performance.findOne({ student: req.params.studentId });
  return ok(res, performance || {});
});

module.exports = router;

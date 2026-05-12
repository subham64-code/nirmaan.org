const express = require("express");
const User = require("../models/User");
const Application = require("../models/Application");
const Test = require("../models/Test");
const TestResult = require("../models/TestResult");
const AdminLog = require("../models/AdminLog");
const auth = require("../middleware/auth");
const { ok } = require("../utils/apiResponse");

const router = express.Router();

router.get("/dashboard", auth(["admin"]), async (req, res) => {
  const [
    totalStudents,
    pendingApplications,
    totalTeachers,
    totalTests,
    totalResults,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Application.countDocuments({ status: "pending" }),
    User.countDocuments({ role: "teacher" }),
    Test.countDocuments({}),
    TestResult.countDocuments({}),
    AdminLog.find().sort({ createdAt: -1 }).limit(20).populate("actor", "name email role"),
  ]);

  return ok(res, {
    totalStudents,
    pendingApplications,
    totalTeachers,
    totalTests,
    totalResults,
    recentLogs,
  });
});

module.exports = router;

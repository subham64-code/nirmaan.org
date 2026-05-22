const express = require("express");
const User = require("../models/User");
const AttendanceCheckIn = require("../models/AttendanceCheckIn");
const Test = require("../models/Test");
const TestResult = require("../models/TestResult");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");

const router = express.Router();

router.get("/dashboard", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const [totalStudents, totalTests, todayAttendance, testResults, recentTests, recentAttendance] = await Promise.all([
      User.countDocuments({ role: "student", isApproved: true }),
      Test.countDocuments(req.user.role === "teacher" ? { createdBy: req.user.sub } : {}),
      AttendanceCheckIn.countDocuments({ dateKey: new Date().toISOString().slice(0, 10), status: "Present" }),
      TestResult.find().sort({ submittedAt: -1 }).limit(50).populate("student", "name"),
      Test.find(req.user.role === "teacher" ? { createdBy: req.user.sub } : {}).sort({ createdAt: -1 }).limit(5).select("title createdAt"),
      AttendanceCheckIn.find().sort({ checkInAt: -1 }).limit(5).select("name status dateKey checkInAt"),
    ]);

    const avgPerformance = testResults.length
      ? Math.round((testResults.reduce((sum, row) => sum + (Number(row.score) || 0), 0) / Math.max(testResults.length, 1)) * 10) / 10
      : 0;

    const recentActivity = [
      ...recentTests.map((test) => ({ action: `Test created: ${test.title}`, student: "System", timestamp: test.createdAt })),
      ...recentAttendance.map((record) => ({ action: `Attendance ${record.status}`, student: record.name || "Student", timestamp: record.checkInAt || record.dateKey })),
    ].slice(0, 10);

    return ok(res, {
      totalStudents,
      totalTests,
      todayAttendance,
      avgPerformance,
      recentActivity,
    }, "Teacher dashboard loaded");
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return fail(res, 500, "Failed to load teacher dashboard: " + error.message);
  }
});

// Register teacher (admin only)
router.post("/register-teacher", auth(["admin"]), async (req, res) => {
  const { name, email, phone, course } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return fail(res, 400, "Email already exists");

  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const teacher = await User.create({
    role: "teacher",
    name,
    email,
    phone,
    course,
    passwordHash,
    isApproved: true,
    otpRequired: false,
  });

  await logAction(req.user.sub, "teacher.create", { teacherId: teacher._id, name });
  return created(res, { teacher, tempPassword }, "Teacher created. Share temporary password.");
});

// Update teacher
router.patch("/:id", auth(["admin"]), async (req, res) => {
  const { name, phone, course } = req.body;
  const teacher = await User.findByIdAndUpdate(
    req.params.id,
    { name, phone, course },
    { new: true }
  );
  if (!teacher) return fail(res, 404, "Teacher not found");

  await logAction(req.user.sub, "teacher.update", { teacherId: teacher._id });
  return ok(res, teacher, "Teacher updated");
});

// Delete teacher
router.delete("/:id", auth(["admin"]), async (req, res) => {
  const teacher = await User.findByIdAndDelete(req.params.id);
  if (!teacher) return fail(res, 404, "Teacher not found");

  await logAction(req.user.sub, "teacher.delete", { teacherId: teacher._id, name: teacher.name });
  return ok(res, {}, "Teacher deleted");
});

module.exports = router;

const express = require("express");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const TestResult = require("../models/TestResult");
const Performance = require("../models/Performance");
const auth = require("../middleware/auth");
const { ok } = require("../utils/apiResponse");
const Student = require("../models/Student");
const { created, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");

const router = express.Router();

router.get("/predefined", async (_req, res) => {
  try {
    const users = await User.find({ role: "student", isApproved: true })
      .select("name email nirmaanId qualification course")
      .sort({ name: 1 })
      .limit(500);

    const students = users.map((row, index) => ({
      id: row.nirmaanId || `STU${String(index + 1).padStart(3, "0")}`,
      name: row.name,
      email: row.email,
      nirmaanId: row.nirmaanId || "",
      course: row.course || "AI/ML",
      qualification: row.qualification || "-",
      status: "approved",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=4F46E5&color=fff&size=128`,
    }));

    return ok(res, students, "Approved students directory loaded");
  } catch (error) {
    console.error("Predefined students error:", error);
    return fail(res, 500, "Failed to load students");
  }
});

router.get("/me", auth(["student", "admin", "teacher"]), async (req, res) => {
  const user = await User.findById(req.user.sub).select("-passwordHash");
  const attendance = await Attendance.find({ student: req.user.sub });
  const present = attendance.filter((a) => a.status === "Present").length;
  const percentage = attendance.length ? Number(((present / attendance.length) * 100).toFixed(2)) : 0;

  const testResults = await TestResult.find({ student: req.user.sub }).populate("test", "title");
  const performance = await Performance.findOne({ student: req.user.sub });

  return ok(res, {
    profile: user,
    attendance: { records: attendance, percentage },
    testResults,
    performance,
  });
});

router.get("/search", auth(["admin", "teacher"]), async (req, res) => {
  const q = req.query.q || "";
  const students = await User.find({
    role: "student",
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { nirmaanId: { $regex: q, $options: "i" } },
    ],
  }).select("name email nirmaanId course isApproved");

  return ok(res, students);
});

// Get all students with pagination
router.get("/list/all", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const students = await Student.find({ isActive: true })
      .select("name registrationNumber nirmaanId course center email phone enrollmentDate")
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments({ isActive: true });

    return ok(
      res,
      {
        students,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
      "Students retrieved"
    );
  } catch (error) {
    console.error("Get students error:", error);
    return fail(res, 500, "Failed to retrieve students: " + error.message);
  }
});

// Get student by Nirmaan ID
router.get("/by-id/:nirmaanId", async (req, res) => {
  try {
    const { nirmaanId } = req.params;
    const student = await Student.findOne({ nirmaanId, isActive: true });

    if (!student) {
      return fail(res, 404, "Student not found");
    }

    return ok(res, student, "Student retrieved");
  } catch (error) {
    console.error("Get student error:", error);
    return fail(res, 500, "Failed to retrieve student: " + error.message);
  }
});

// Get student by Registration Number
router.get("/by-reg/:registrationNumber", async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const student = await Student.findOne({ registrationNumber, isActive: true });

    if (!student) {
      return fail(res, 404, "Student not found");
    }

    return ok(res, student, "Student retrieved");
  } catch (error) {
    console.error("Get student error:", error);
    return fail(res, 500, "Failed to retrieve student: " + error.message);
  }
});

// Get students by course
router.get("/course/:course", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { course } = req.params;
    const students = await Student.find({ course, isActive: true }).sort({ name: 1 });

    return ok(res, students, `Students from ${course} retrieved`);
  } catch (error) {
    console.error("Get students by course error:", error);
    return fail(res, 500, "Failed to retrieve students: " + error.message);
  }
});

// Get students by center
router.get("/center/:center", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { center } = req.params;
    const students = await Student.find({ center, isActive: true }).sort({ name: 1 });

    return ok(res, students, `Students from ${center} retrieved`);
  } catch (error) {
    console.error("Get students by center error:", error);
    return fail(res, 500, "Failed to retrieve students: " + error.message);
  }
});

// Add student (admin only)
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, registrationNumber, nirmaanId, course, center } = req.body;

    const existingStudent = await Student.findOne({
      $or: [{ registrationNumber }, { nirmaanId }, { email }],
    });

    if (existingStudent) {
      return fail(res, 400, "Student already exists with this registration number or Nirmaan ID");
    }

    const student = await Student.create({
      name,
      email,
      registrationNumber,
      nirmaanId,
      course,
      center,
    });

    await logAction(req.user.sub, "student.create", { studentId: student._id, name });

    return created(res, student, "Student added");
  } catch (error) {
    console.error("Create student error:", error);
    return fail(res, 500, "Failed to add student: " + error.message);
  }
});

// Update student (admin only)
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, course, center, isActive, linkedUserId } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        course,
        center,
        isActive,
        linkedUserId,
      },
      { new: true }
    );

    if (!student) {
      return fail(res, 404, "Student not found");
    }

    await logAction(req.user.sub, "student.update", { studentId: student._id, name });

    return ok(res, student, "Student updated");
  } catch (error) {
    console.error("Update student error:", error);
    return fail(res, 500, "Failed to update student: " + error.message);
  }
});

module.exports = router;

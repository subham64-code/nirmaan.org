const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");

const router = express.Router();

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

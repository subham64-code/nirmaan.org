const express = require("express");
const LeaveRequest = require("../models/LeaveRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");

const router = express.Router();

function toDateOnly(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function notifyAdmins(title, message, category = "attendance") {
  const admins = await User.find({ role: "admin" }).select("_id");
  if (!admins.length) {
    return [];
  }

  return Promise.all(
    admins.map((admin) =>
      Notification.create({
        userId: admin._id,
        title,
        message,
        type: "info",
        category,
        link: "/dashboard/admin/leave-requests",
      })
    )
  );
}

async function notifyStudent(studentId, title, message, type = "info") {
  return Notification.create({
    userId: studentId,
    title,
    message,
    type,
    category: "attendance",
    link: "/dashboard/student/leave-requests",
  });
}

router.get("/", auth(["student", "admin"]), async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { studentId: req.user.sub };
    const leaveRequests = await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("studentId", "name email nirmaanId course")
      .populate("reviewedBy", "name email");

    return ok(res, leaveRequests, "Leave requests retrieved");
  } catch (error) {
    console.error("Get leave requests error:", error);
    return fail(res, 500, "Failed to retrieve leave requests");
  }
});

router.post("/", auth(["student"]), async (req, res) => {
  try {
    const { leaveDate, returnDate, reason } = req.body;
    const leaveStart = toDateOnly(leaveDate);
    const leaveEnd = toDateOnly(returnDate);

    if (!leaveStart) {
      return fail(res, 400, "Leave date is required");
    }

    if (!reason || !reason.trim()) {
      return fail(res, 400, "Reason is required");
    }

    if (leaveEnd && leaveEnd < leaveStart) {
      return fail(res, 400, "Return date cannot be earlier than leave date");
    }

    const student = await User.findById(req.user.sub).select("name nirmaanId course");
    if (!student) {
      return fail(res, 404, "Student profile not found");
    }

    const leaveRequest = await LeaveRequest.create({
      studentId: student._id,
      studentName: student.name,
      nirmaanId: student.nirmaanId,
      course: student.course || "",
      leaveDate: leaveStart,
      returnDate: leaveEnd,
      reason: reason.trim(),
    });

    await notifyAdmins(
      "New leave request",
      `${student.name} (${student.nirmaanId}) requested leave for ${leaveStart.toLocaleDateString()}.`,
      "attendance"
    );

    return created(res, leaveRequest, "Leave request submitted");
  } catch (error) {
    console.error("Create leave request error:", error);
    return fail(res, 500, "Failed to submit leave request");
  }
});

router.patch("/:id/review", auth(["admin"]), async (req, res) => {
  try {
    const { action, remarks } = req.body;
    if (!["approved", "rejected"].includes(action)) {
      return fail(res, 400, "Action must be approved or rejected");
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return fail(res, 404, "Leave request not found");
    }

    if (leaveRequest.status !== "pending") {
      return fail(res, 400, "Leave request has already been reviewed");
    }

    leaveRequest.status = action;
    leaveRequest.reviewedBy = req.user.sub;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.remarks = remarks || "";
    await leaveRequest.save();

    const reviewDateText = leaveRequest.leaveDate.toLocaleDateString();
    const statusLabel = action === "approved" ? "approved" : "rejected";
    const statusType = action === "approved" ? "success" : "error";

    await notifyStudent(
      leaveRequest.studentId,
      `Leave request ${statusLabel}`,
      `Your leave request for ${reviewDateText} has been ${statusLabel}${remarks ? `: ${remarks}` : "."}`,
      statusType
    );

    return ok(res, leaveRequest, `Leave request ${statusLabel}`);
  } catch (error) {
    console.error("Review leave request error:", error);
    return fail(res, 500, "Failed to review leave request");
  }
});

module.exports = router;
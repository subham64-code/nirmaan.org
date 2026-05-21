const express = require("express");
const LeaveRequest = require("../models/LeaveRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const { sendMail } = require("../utils/mailer");
const logAction = require("../utils/logAction");

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

async function sendEmailToAdmins(title, message, studentName, studentEmail) {
  const admins = await User.find({ role: "admin" }).select("email name");
  if (admins.length === 0) {
    console.log("No admins found to notify");
    return;
  }

  const emailPromises = admins.map((admin) =>
    sendMail({
      to: admin.email,
      subject: `${title} - ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">${title}</h2>
          <p style="font-size: 16px; color: #555;">${message}</p>
          <p style="font-size: 14px; color: #999;">Student Email: ${studentEmail}</p>
          <p style="margin-top: 20px; font-size: 12px; color: #ccc;">Please review this request in the admin dashboard.</p>
        </div>
      `,
    }).catch((err) => console.error("Email sending error:", err))
  );
  
  try {
    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.error("Error sending emails to admins:", error);
  }
}

router.get("/", auth(["student", "admin"]), async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { studentId: req.user.sub };
    const leaveRequests = await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("studentId", "name email nirmaanId course")
      .populate("reviewedBy", "name email");

    return ok(res, leaveRequests, "Leave requests retrieved successfully");
  } catch (error) {
    console.error("Get leave requests error:", error);
    return fail(res, 500, "Failed to retrieve leave requests");
  }
});

// Get single leave request details
router.get("/:id", auth(["student", "admin"]), async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate("studentId", "name email nirmaanId course")
      .populate("reviewedBy", "name email");

    if (!leaveRequest) {
      return fail(res, 404, "Leave request not found");
    }

    // Check authorization
    if (req.user.role === "student" && leaveRequest.studentId._id.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    return ok(res, leaveRequest, "Leave request retrieved");
  } catch (error) {
    console.error("Get leave request error:", error);
    return fail(res, 500, "Failed to retrieve leave request");
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

    const student = await User.findById(req.user.sub).select("name nirmaanId course email");
    if (!student) {
      return fail(res, 404, "Student profile not found");
    }

    // Check for duplicate pending requests on same date
    const existingRequest = await LeaveRequest.findOne({
      studentId: student._id,
      leaveDate: leaveStart,
      status: "pending",
    });

    if (existingRequest) {
      return fail(res, 400, "You already have a pending leave request for this date");
    }

    const leaveRequest = await LeaveRequest.create({
      studentId: student._id,
      studentName: student.name,
      nirmaanId: student.nirmaanId || "N/A",
      course: student.course || "",
      leaveDate: leaveStart,
      returnDate: leaveEnd,
      reason: reason.trim(),
    });

    // Notify admins via notification and email
    try {
      await notifyAdmins(
        "New leave request",
        `${student.name} (${student.nirmaanId}) requested leave for ${leaveStart.toLocaleDateString()}.`,
        "attendance"
      );
    } catch (e) {
      console.error("Failed to notify admins:", e);
    }

    // Send email to admins
    await sendEmailToAdmins(
      "New Leave Request Submission",
      `Student ${student.name} (Nirmaan ID: ${student.nirmaanId}) has submitted a leave request for ${leaveStart.toLocaleDateString()}. Reason: ${reason}. Please review and approve/reject in the admin dashboard.`,
      student.name,
      student.email
    );

    // Notify student
    try {
      await notifyStudent(
        student._id,
        "Leave request submitted",
        `Your leave request for ${leaveStart.toLocaleDateString()} has been submitted. You will be notified once it is reviewed.`,
        "info"
      );
    } catch (e) {
      console.error("Failed to notify student:", e);
    }

    return created(res, leaveRequest, "Leave request submitted successfully");
  } catch (error) {
    console.error("Create leave request error:", error);
    return fail(res, 500, "Failed to submit leave request");
  }
});

// Update leave request (for student to modify pending requests)
router.put("/:id", auth(["student"]), async (req, res) => {
  try {
    const { leaveDate, returnDate, reason } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return fail(res, 404, "Leave request not found");
    }

    if (leaveRequest.studentId.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized to update this leave request");
    }

    if (leaveRequest.status !== "pending") {
      return fail(res, 400, "Cannot modify a reviewed leave request");
    }

    const leaveStart = toDateOnly(leaveDate);
    const leaveEnd = toDateOnly(returnDate);

    if (!leaveStart) {
      return fail(res, 400, "Leave date is required");
    }

    leaveRequest.leaveDate = leaveStart;
    leaveRequest.returnDate = leaveEnd;
    leaveRequest.reason = reason || leaveRequest.reason;
    await leaveRequest.save();

    return ok(res, leaveRequest, "Leave request updated");
  } catch (error) {
    console.error("Update leave request error:", error);
    return fail(res, 500, "Failed to update leave request");
  }
});

// Cancel leave request (student can cancel pending requests)
router.delete("/:id", auth(["student"]), async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return fail(res, 404, "Leave request not found");
    }

    if (leaveRequest.studentId.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized to delete this leave request");
    }

    if (leaveRequest.status !== "pending") {
      return fail(res, 400, "Cannot cancel a reviewed leave request");
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);

    return ok(res, null, "Leave request cancelled");
  } catch (error) {
    console.error("Delete leave request error:", error);
    return fail(res, 500, "Failed to cancel leave request");
  }
});

router.patch("/:id/review", auth(["admin"]), async (req, res) => {
  try {
    const { action, remarks } = req.body;
    if (!["approved", "rejected"].includes(action)) {
      return fail(res, 400, "Action must be approved or rejected");
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate("studentId", "name email");
    if (!leaveRequest) {
      return fail(res, 404, "Leave request not found");
    }

    if (leaveRequest.status !== "pending") {
      return fail(res, 400, `Leave request has already been ${leaveRequest.status}`);
    }

    leaveRequest.status = action;
    leaveRequest.reviewedBy = req.user.sub;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.remarks = remarks || "";
    await leaveRequest.save();

    const reviewDateText = leaveRequest.leaveDate ? leaveRequest.leaveDate.toLocaleDateString() : "N/A";
    const statusLabel = action === "approved" ? "approved" : "rejected";
    const statusType = action === "approved" ? "success" : "error";

    // Get student email for notification
    const student = leaveRequest.studentId;
    
    // Notify student via notification and email
    try {
      await notifyStudent(
        leaveRequest.studentId._id || leaveRequest.studentId,
        `Leave request ${statusLabel}`,
        `Your leave request for ${reviewDateText} has been ${statusLabel}${remarks ? `: ${remarks}` : "."}`,
        statusType
      );
    } catch (e) {
      console.error("Failed to notify student about review:", e);
    }

    // Send email to student
    if (student && student.email) {
      const emailSubject = `Leave Request ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`;
      const emailMessage = `Your leave request for ${reviewDateText} has been ${statusLabel}. ${remarks ? `Remarks: ${remarks}` : ""}`;
      
      await sendMail({
        to: student.email,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: ${statusLabel === "approved" ? "#28a745" : "#dc3545"};">${emailSubject}</h2>
            <p style="font-size: 16px; color: #555;">${emailMessage}</p>
            <p style="margin-top: 20px; font-size: 12px; color: #ccc;">This is an automated notification from Nirmaan platform.</p>
          </div>
        `,
      }).catch((err) => console.error("Error sending email to student:", err));
    }

    return ok(res, leaveRequest, `Leave request ${statusLabel}`);
  } catch (error) {
    console.error("Review leave request error:", error);
    return fail(res, 500, "Failed to review leave request");
  }
});

// Get leave request statistics for admin
router.get("/admin/stats", auth(["admin"]), async (req, res) => {
  try {
    const total = await LeaveRequest.countDocuments();
    const pending = await LeaveRequest.countDocuments({ status: "pending" });
    const approved = await LeaveRequest.countDocuments({ status: "approved" });
    const rejected = await LeaveRequest.countDocuments({ status: "rejected" });

    return ok(res, { total, pending, approved, rejected }, "Leave request stats retrieved");
  } catch (error) {
    console.error("Get stats error:", error);
    return fail(res, 500, "Failed to retrieve statistics");
  }
});

module.exports = router;
const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const Application = require("../models/Application");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const generateNirmaanId = require("../utils/generateNirmaanId");
const { sendMail } = require("../utils/mailer");
const logAction = require("../utils/logAction");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post("/", upload.single('photo'), async (req, res) => {
  try {
    const payload = req.body;
    
    // Parse JSON fields that were stringified
    if (payload.extracurricular) {
      try {
        payload.extracurricular = JSON.parse(payload.extracurricular);
      } catch (e) {
        payload.extracurricular = [];
      }
    }
    
    if (payload.workExperience) {
      try {
        payload.workExperience = JSON.parse(payload.workExperience);
      } catch (e) {
        payload.workExperience = [];
      }
    }
    
    // Convert string numbers to actual numbers
    if (payload.age) payload.age = parseInt(payload.age);
    
    // Handle photo upload
    if (req.file) {
      payload.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    if (!payload.agreedToTerms) {
      return fail(res, 400, "Terms and conditions agreement is required");
    }
    
    const application = await Application.create(payload);
    return created(res, application, "Application submitted");
  } catch (error) {
    console.error("Application submission error:", error);
    return fail(res, 500, "Failed to submit application. Please try again.");
  }
});

router.get("/", auth(["admin", "teacher"]), async (req, res) => {
  const status = req.query.status || "pending";
  const applications = await Application.find({ status }).sort({ createdAt: -1 });
  return ok(res, applications);
});

router.patch("/:id/review", auth(["admin"]), async (req, res) => {
  const { action, remarks } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) return fail(res, 404, "Application not found");

  if (!["approved", "rejected"].includes(action)) {
    return fail(res, 400, "Action must be approved or rejected");
  }

  application.status = action;
  application.reviewedBy = req.user.sub;
  application.reviewedAt = new Date();
  application.remarks = remarks || "";
  await application.save();

  if (action === "approved") {
    const nirmaanId = generateNirmaanId(application.course);
    const qrText = `${application.name} | ${nirmaanId} | ${application.course}`;
    const idCardQr = await QRCode.toDataURL(qrText);

    let student = await User.findOne({ email: application.email });
    if (!student) {
      student = await User.create({
        role: "student",
        name: application.name,
        email: application.email,
        phone: application.phone,
        qualification: application.qualification,
        course: application.course,
        tenthMarks: application.tenthMarks,
        twelfthMarks: application.twelfthMarks,
        degreeMarks: application.degreeMarks,
        nirmaanId,
        idCardQr,
        isApproved: true,
      });
    } else {
      student.nirmaanId = nirmaanId;
      student.idCardQr = idCardQr;
      student.isApproved = true;
      await student.save();
    }

    await sendMail({
      to: application.email,
      subject: "Nirmaan Application Approved",
      html: `<p>Congratulations ${application.name}, your application is approved.</p><p>Nirmaan ID: <strong>${student.nirmaanId}</strong></p>`,
    });

    await Notification.create({
      userId: student._id,
      title: "Application approved",
      message: `Your application has been approved. Nirmaan ID: ${student.nirmaanId}.`,
      type: "success",
      category: "general",
      link: "/dashboard/student",
    });
  } else {
    await sendMail({
      to: application.email,
      subject: "Nirmaan Application Update",
      html: `<p>Hi ${application.name}, your application was not approved at this time.</p>`,
    });

    const existingStudent = await User.findOne({ email: application.email }).select("_id");
    if (existingStudent) {
      await Notification.create({
        userId: existingStudent._id,
        title: "Application not approved",
        message: remarks ? `Your application was not approved: ${remarks}` : "Your application was not approved at this time.",
        type: "error",
        category: "general",
        link: "/dashboard/student",
      });
    }
  }

  await logAction(req.user.sub, "application.review", {
    applicationId: application._id,
    action,
  });

  return ok(res, application, `Application ${action}`);
});

module.exports = router;

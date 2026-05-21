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
    
    // Coerce agreedToTerms: FormData sends booleans as strings
    const agreed = payload.agreedToTerms === true ||
      payload.agreedToTerms === "true" ||
      payload.agreedToTerms === 1 ||
      payload.agreedToTerms === "1";
    if (!agreed) {
      return fail(res, 400, "Terms and conditions agreement is required");
    }
    payload.agreedToTerms = true;
    
    const application = await Application.create(payload);

    // Send email verification link
    try {
      const verifyLink = `http://localhost:3000/verify-email?email=${encodeURIComponent(application.email)}&id=${application._id}`;
      await sendMail({
        to: application.email,
        subject: "Nirmaan Education - Please Verify your Application Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Welcome to Nirmaan Education!</h2>
            <p>Dear ${application.name},</p>
            <p>Thank you for applying to the <strong>${application.course}</strong> course at Nirmaan Education.</p>
            <p>To complete your application and activate your student account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #666; font-size: 13px;">If you did not submit this application, please disregard this email.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
            <p style="text-align: center; font-size: 12px; color: #999;">Nirmaan Education Collaborative with GIFT</p>
          </div>
        `,
      });
      console.log(`✓ Verification email sent to ${application.email}`);
    } catch (mailError) {
      console.error(`⚠ Email verification sending failed:`, mailError.message);
    }

    return created(res, application, "Application submitted successfully! Please check your email to verify and activate your student account.");
  } catch (error) {
    console.error("Application submission error:", error);
    return fail(res, 500, "Failed to submit application. Please try again.");
  }
});

// Verify Email & Auto-Approve Student
router.post("/verify-email", async (req, res) => {
  try {
    const { email, id } = req.body;
    if (!email || !id) {
      return fail(res, 400, "Email and ID are required");
    }

    const application = await Application.findById(id);
    if (!application) {
      return fail(res, 404, "Application not found");
    }

    if (application.email.toLowerCase() !== email.toLowerCase()) {
      return fail(res, 400, "Email does not match application");
    }

    // Approve the application automatically
    application.status = "approved";
    application.reviewedAt = new Date();
    application.remarks = "Verified by Student Email Link";
    await application.save({ validateBeforeSave: false });

    // Create the Student User record
    const nirmaanId = generateNirmaanId(application.course);
    const qrText = `${application.name} | ${nirmaanId} | ${application.course}`;
    const idCardQr = await QRCode.toDataURL(qrText);

    let student = await User.findOne({ email: application.email, role: "student" });
    if (!student) {
      student = new User({
        role: "student",
        name: application.name,
        email: application.email,
        phone: application.phone,
        qualification: application.qualification,
        course: application.course,
        nirmaanId,
        idCardQr,
        isApproved: true,
        photoUrl: application.photo || "",
        picture: application.photo || "",
      });
      await student.save({ validateBeforeSave: false });
      console.log(`✓ Created verified student account for ${application.email}`);
    } else {
      student.nirmaanId = nirmaanId;
      student.idCardQr = idCardQr;
      student.isApproved = true;
      if (application.photo) {
        student.photoUrl = application.photo;
        student.picture = application.photo;
      }
      await student.save({ validateBeforeSave: false });
      console.log(`✓ Updated verified student account for ${application.email}`);
    }

    // Send final approval welcome email
    try {
      await sendMail({
        to: application.email,
        subject: "Nirmaan Application Approved & Account Activated",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #10B981; text-align: center;">Account Activated successfully!</h2>
            <p>Dear ${application.name},</p>
            <p>Congratulations! Your email has been verified, and your application is officially approved and your account is active.</p>
            <p>Your unique Nirmaan ID is: <strong style="color: #4F46E5; font-size: 18px;">${nirmaanId}</strong></p>
            <p>You can now go to the Nirmaan Educational Portal Student Login page, select your name from the list, and log in with your email and OTP.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login/student" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Student Login</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
            <p style="text-align: center; font-size: 12px; color: #999;">Nirmaan Education Collaborative with GIFT</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error(`⚠ Approval email sending failed:`, mailError.message);
    }

    // Create Notification
    try {
      await Notification.create({
        userId: student._id,
        title: "Account Activated",
        message: `Your student profile has been verified and activated. Nirmaan ID: ${nirmaanId}`,
        type: "success",
        category: "general",
        link: "/dashboard/student",
      });
    } catch (notifError) {
      console.error(`⚠ Verification notification failed:`, notifError.message);
    }

    return ok(res, { student, application }, "Email verified and student account approved successfully");
  } catch (error) {
    console.error("Verification endpoint error:", error);
    return fail(res, 500, "Verification failed: " + error.message);
  }
});

router.get("/", auth(["admin", "teacher"]), async (req, res) => {
  const status = req.query.status || "pending";
  const applications = await Application.find({ status }).sort({ createdAt: -1 });
  return ok(res, applications);
});

router.patch("/:id/review", auth(["admin"]), async (req, res) => {
  try {
    const { action, remarks } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return fail(res, 404, "Application not found");

    if (!["approved", "rejected"].includes(action)) {
      return fail(res, 400, "Action must be approved or rejected");
    }

    // Check if already reviewed - just warn in logs but allow override
    if (application.status !== "pending") {
      console.warn(`Application ${application._id} already ${application.status}, admin is re-reviewing...`);
    }

    application.status = action;
    application.reviewedBy = req.user.sub;
    application.reviewedAt = new Date();
    application.remarks = remarks || "";
    await application.save({ validateBeforeSave: false });

    if (action === "approved") {
      try {
        const nirmaanId = generateNirmaanId(application.course);
        const qrText = `${application.name} | ${nirmaanId} | ${application.course}`;
        const idCardQr = await QRCode.toDataURL(qrText);

        // Check if there is already a user with this email but a different role (admin/teacher)
        const existingNonStudent = await User.findOne({ email: application.email, role: { $ne: "student" } });
        if (existingNonStudent) {
          // Rollback the application status
          application.status = "pending";
          application.reviewedBy = null;
          application.reviewedAt = null;
          await application.save({ validateBeforeSave: false });
          return fail(res, 400, `This email is already registered as a ${existingNonStudent.role} account.`);
        }

        let student = await User.findOne({ email: application.email, role: "student" });
        try {
          if (!student) {
            student = new User({
              role: "student",
              name: application.name,
              email: application.email,
              phone: application.phone,
              qualification: application.qualification,
              course: application.course,
              nirmaanId,
              idCardQr,
              isApproved: true,
              photoUrl: application.photo || "",
              picture: application.photo || "",
            });
            await student.save({ validateBeforeSave: false });
            console.log(`✓ Created student account for ${application.email}`);
          } else {
            student.nirmaanId = nirmaanId;
            student.idCardQr = idCardQr;
            student.isApproved = true;
            if (application.photo) {
              student.photoUrl = application.photo;
              student.picture = application.photo;
            }
            await student.save({ validateBeforeSave: false });
            console.log(`✓ Updated student account for ${application.email}`);
          }
        } catch (dbError) {
          console.error("Student DB Error:", dbError);
          // Rollback the application status
          application.status = "pending";
          application.reviewedBy = null;
          application.reviewedAt = null;
          await application.save({ validateBeforeSave: false });
          return fail(res, 500, `Database error while creating student account: ${dbError.message}`);
        }

        // Send approval email
        try {
          await sendMail({
            to: application.email,
            subject: "Nirmaan Application Approved",
            html: `<p>Congratulations ${application.name}, your application is approved.</p><p>Nirmaan ID: <strong>${nirmaanId}</strong></p>`,
          });
          console.log(`✓ Approval email sent to ${application.email}`);
        } catch (mailError) {
          console.error(`⚠ Email sending failed for ${application.email}:`, mailError.message);
        }

        // Create notification
        try {
          await Notification.create({
            userId: student._id,
            title: "Application approved",
            message: `Your application has been approved. Nirmaan ID: ${nirmaanId}.`,
            type: "success",
            category: "general",
            link: "/dashboard/student",
          });
          console.log(`✓ Notification created for ${application.email}`);
        } catch (notifError) {
          console.error(`⚠ Notification creation failed:`, notifError.message);
        }
      } catch (approvalError) {
        // Rollback the application status on approval failure
        application.status = "pending";
        application.reviewedBy = null;
        application.reviewedAt = null;
        await application.save({ validateBeforeSave: false });
        throw approvalError;
      }
    } else if (action === "rejected") {
      try {
        // Send rejection email
        try {
          await sendMail({
            to: application.email,
            subject: "Nirmaan Application Update",
            html: `<p>Hi ${application.name}, your application was not approved at this time.</p>${remarks ? `<p>Remarks: ${remarks}</p>` : ''}`,
          });
          console.log(`✓ Rejection email sent to ${application.email}`);
        } catch (mailError) {
          console.error(`⚠ Email sending failed for ${application.email}:`, mailError.message);
        }

        // Create rejection notification
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
          console.log(`✓ Rejection notification created for ${application.email}`);
        }
      } catch (rejectionError) {
        console.error(`⚠ Rejection process failed:`, rejectionError.message);
        // Don't rollback for rejection - it's less critical
      }
    }

    // Log the action
    try {
      await logAction(req.user.sub, "application.review", {
        applicationId: application._id,
        action,
        remarks: remarks || "",
      });
      console.log(`✓ Action logged for application ${application._id}`);
    } catch (logError) {
      console.error(`⚠ Action logging failed:`, logError.message);
    }

    // Fetch fresh data from database
    const updatedApplication = await Application.findById(application._id);
    return ok(res, updatedApplication, `Application ${action} successfully`);
  } catch (error) {
    console.error("Application review error:", error);
    return fail(res, 500, `Failed to update application: ${error.message}`);
  }
});

module.exports = router;

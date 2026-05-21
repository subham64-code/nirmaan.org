const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const OtpCode = require("../models/OtpCode");
const { ok, fail } = require("../utils/apiResponse");
const { sendMail } = require("../utils/mailer");
const { sendSMS } = require("../utils/sms");
const auth = require("../middleware/auth");
const {
  validateOtpRequest,
  validateOtpVerification,
  validateUserLogin,
  validateUserRegistration
} = require("../middleware/validation");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiry }
  );
}

// Role-based OTP routing configuration
const ROLE_OTP_CONFIG = {
  student: {
    deliveryMethod: "email",
    phone: null,
    description: "Student"
  },
  teacher: {
    deliveryMethod: "email",
    phone: null,
    description: "Teacher"
  },
  admin: {
    deliveryMethod: "email",
    phone: null, // Uses input email
    description: "Admin"
  }
};

router.post("/request-otp", validateOtpRequest, async (req, res) => {
  const { email, role, name, course, mobile } = req.body;

  try {
    console.log("🔐 OTP Request:", { email, role, course, mobile, deliveryMethod: req.body.deliveryMethod });

    // Prevent accidental display for specific protected accounts (emails and phones)
    const protectedEmails = ["animesh.samantaray@nirmaan.edu"];
    const protectedPhones = [
      "+917992894181", // students default target
      "+919861289418"  // admin/teacher default target
    ];

    // Check if user already exists with password (can't request OTP in that case)
    const existingUser = await User.findOne({ email, role });
    if (existingUser && existingUser.passwordHash) {
      console.log("❌ Account already exists:", email);
      return fail(res, 400, "Account already exists. Please login instead.");
    }

    // Demo mode detection and override support
    const isDemoRequest = Boolean(req.body.demo) || String(process.env.DEMO_MODE || "").toLowerCase() === "true";
    const demoOtpOverride = (req.body.demoOtp || process.env.DEMO_OTP || "").toString().trim();

    // Decide OTP value: demo override when present, otherwise random
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    const code = isDemoRequest && demoOtpOverride ? String(demoOtpOverride) : generatedCode;
    const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
    console.log("🎲 Generated OTP (mask in logs for production):", { code: isDemoRequest ? "[demo-mode]" : "[redacted]", expiresAt, isDemoRequest });

    // Determine delivery target phone
    let deliveryMethod = "email";
    let targetPhone = null;
    let rawPhone = mobile || req.body.phone || existingUser?.phone;

    if (!rawPhone && role === "teacher") {
      const teacherList = [
        { email: "krishan.kumar@nirmaan.edu", phone: "+919876543210" },
        { email: "stithikantha.mohanty@nirmaan.edu", phone: "+919876543211" },
        { email: "mihir.pattanaik@nirmaan.edu", phone: "+919876543212" },
        { email: "kalpa.pandit@nirmaan.edu", phone: "+919876543213" }
      ];
      const match = teacherList.find(t => t.email.toLowerCase() === email.toLowerCase());
      if (match) rawPhone = match.phone;
    }

    // If no phone provided, route to the configured default testing numbers
    if (!rawPhone) {
      if (role === "student") rawPhone = "7992894181";
      if (role === "teacher" || role === "admin") rawPhone = "9861289418";
    }

    if (rawPhone) {
      rawPhone = String(rawPhone).trim();
      if (!rawPhone.startsWith("+")) {
        targetPhone = rawPhone.length === 10 ? "+91" + rawPhone : "+" + rawPhone;
      } else {
        targetPhone = rawPhone;
      }
    }

    // Store OTP record (always store actual code so verification works)
    await OtpCode.deleteMany({ email, role });
    await OtpCode.create({ email, phone: targetPhone, role, code, expiresAt });
    console.log("✅ OTP stored in database (code hidden in logs)", { email, role, targetPhone });

    // Send via email
    const roleConfig = ROLE_OTP_CONFIG[role] || { description: "User" };
    const recipientName = (name || existingUser?.name || roleConfig.description || "User").trim();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Nirmaan</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 20px 0; font-size: 16px;">${roleConfig.description || "User"} Login Verification</p>
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; margin: 0 0 8px 0; font-size: 14px;">Hi ${recipientName},</p>
            <p style="color: #333; margin: 0 0 10px 0; font-size: 14px;">Your One-Time Password (OTP) is:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 12px; margin: 0;">This code is valid for ${env.otpExpiryMinutes} minutes. Do not share it with anyone.</p>
          </div>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">Powered by Nirmaan</p>
        </div>
      </div>
    `;

    const sendPromises = [];
    sendPromises.push(sendMail({ to: email, subject: `🔐 Nirmaan ${roleConfig.description || "User"} OTP Verification`, html: emailHtml }).catch(err => console.error("Email send failed:", err)));

    if (targetPhone && env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber) {
      sendPromises.push(sendSMS({ to: targetPhone, message: `🔐 Nirmaan ${roleConfig.description || "User"} OTP for ${recipientName}: ${code}. Valid for ${env.otpExpiryMinutes} minutes.` }).catch(err => console.error("SMS send failed:", err)));
      deliveryMethod = "both";
    }

    await Promise.all(sendPromises);
    console.log("✅ OTP sent successfully (delivery):", { deliveryMethod, email, targetPhone });

    // Prepare response: never include production OTPs. Only include `debugOtp` when demo-mode and override present and email is not protected
    const responsePayload = {
      role,
      deliveryMethod,
      otpSent: true,
      target: targetPhone ? `${email} & ${targetPhone}` : email,
      recipientName,
      expiresAt,
      deliveryMethods: targetPhone ? ["email", "sms"] : ["email"],
    };

    const phoneLower = targetPhone ? String(targetPhone).trim() : null;
    const isPhoneProtected = phoneLower ? protectedPhones.includes(phoneLower) : false;
    const allowDebug = isDemoRequest && Boolean(demoOtpOverride) && !protectedEmails.includes(String(email).toLowerCase()) && !isPhoneProtected;
    if (allowDebug) {
      responsePayload.debugOtp = String(code);
    }

    return ok(res, responsePayload, `${roleConfig.description || "User"} OTP sent successfully.`);
  } catch (error) {
    console.error("❌ OTP request error:", error);
    return fail(res, 500, "Failed to send OTP. Please try again.");
  }
});

router.post("/verify-otp", validateOtpVerification, async (req, res) => {
  const { email, role, otp, name } = req.body;

  try {
    // normalize inputs
    const emailNorm = String(email || "").toLowerCase().trim();
    const roleNorm = String(role || "").toLowerCase().trim();
    const otpClean = String(otp || "").trim();

    console.log("🔍 OTP Verification Attempt:", { email: emailNorm, role: roleNorm, otp: otpClean, name });

    // primary lookup: match email, role and exact code
    let record = await OtpCode.findOne({ email: emailNorm, role: roleNorm, code: otpClean });
    console.log("📋 OTP Record Found (primary):", record ? { email: record.email, role: record.role, code: record.code, expiresAt: record.expiresAt, isExpired: record.expiresAt < new Date() } : "No primary record");

    // fallback: if not found, try matching by email+code (helps when role was omitted or mismatched)
    if (!record) {
      record = await OtpCode.findOne({ email: emailNorm, code: otpClean });
      console.log("📋 OTP Record Found (fallback email+code):", record ? { email: record.email, role: record.role, code: record.code, expiresAt: record.expiresAt, isExpired: record.expiresAt < new Date() } : "No fallback record");
    }

    if (!record || record.expiresAt < new Date()) {
      console.log("❌ OTP Verification Failed: Invalid or expired OTP");
      return fail(res, 400, "Invalid or expired OTP");
    }

    await OtpCode.deleteMany({ email, role });
    console.log("✅ OTP deleted after verification");

    let user = await User.findOne({ email });
    if (user?.isBlocked) {
      return fail(res, 403, "Your account is blocked. Please contact admin.");
    }
    if (!user) {
      user = await User.create({ 
        name: name || role.toUpperCase(), 
        email, 
        role, 
        otpRequired: true, 
        isApproved: true 
      });
      console.log("✅ New user created:", { email, role, name });
    }

    const token = signToken(user);
    console.log("✅ Login successful for:", email);
    return ok(res, { token, user }, "Login successful");
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    return fail(res, 500, "Failed to verify OTP. Please try again.");
  }
});

router.post("/student-register", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "student", isApproved: true });
  if (!user) return fail(res, 404, "Approved student not found");

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  return ok(res, {}, "Student account activated");
});

router.post("/student-login", validateUserLogin, async (req, res) => {
  const { email, password, nirmaanId } = req.body;

  try {
    const user = await User.findOne({
      role: "student",
      isApproved: true,
      $or: [{ email }, { nirmaanId }],
    });

    if (!user || !user.passwordHash) return fail(res, 401, "Invalid credentials");
    if (user.isBlocked) return fail(res, 403, "Your account is blocked. Please contact admin.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 401, "Invalid credentials");

    const token = signToken(user);
    return ok(res, { token, user }, "Login successful");
  } catch (error) {
    console.error("Student login error:", error);
    return fail(res, 500, "Failed to login. Please try again.");
  }
});

module.exports = router;

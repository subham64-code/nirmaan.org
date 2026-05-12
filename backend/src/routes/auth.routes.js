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
    deliveryMethod: "sms",
    phone: "+917992894181", // Fixed number for students
    description: "Student"
  },
  teacher: {
    deliveryMethod: "sms",
    phone: "+919861289418", // Fixed number for teachers
    description: "Teacher"
  },
  admin: {
    deliveryMethod: "email",
    phone: null, // Uses input email
    description: "Admin"
  }
};

router.post("/request-otp", validateOtpRequest, async (req, res) => {
  const { email, role } = req.body;

  try {
    console.log("🔐 OTP Request:", { email, role, deliveryMethod: req.body.deliveryMethod });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email, role });
    if (existingUser && existingUser.passwordHash) {
      console.log("❌ Account already exists:", email);
      return fail(res, 400, "Account already exists. Please login instead.");
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
    console.log("🎲 Generated OTP:", { code, expiresAt });

    // Get role-based configuration
    const roleConfig = ROLE_OTP_CONFIG[role] || { deliveryMethod: "email", phone: null };
    let deliveryMethod = roleConfig.deliveryMethod;
    // allow client to request a delivery method override (email|sms)
    const requestedMethod = req.body.deliveryMethod;
    if (requestedMethod && ["email", "sms"].includes(requestedMethod)) {
      deliveryMethod = requestedMethod;
    }

    let targetPhone = roleConfig.phone;
    // If SMS is requested but Twilio isn't configured, fallback to email
    if (deliveryMethod === "sms" && (!env.twilioAccountSid || !env.twilioAuthToken || !env.twilioFromNumber)) {
      console.log("⚠️ Twilio not configured, falling back to email");
      deliveryMethod = "email";
      targetPhone = null;
    }

    await OtpCode.deleteMany({ email, role });
    await OtpCode.create({ email, phone: targetPhone, role, code, expiresAt });
    console.log("✅ OTP stored in database:", { email, role, code, targetPhone, deliveryMethod });

    // Send OTP based on role configuration
    const promises = [];
    
    if (deliveryMethod === "email") {
      promises.push(
        sendMail({
          to: email,
          subject: `🔐 Nirmaan ${roleConfig.description} OTP Verification`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Nirmaan</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 20px 0; font-size: 16px;">${roleConfig.description} Login Verification</p>
                <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #333; margin: 0 0 10px 0; font-size: 14px;">Your One-Time Password (OTP) is:</p>
                  <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
                  </div>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">This OTP expires in ${env.otpExpiryMinutes} minutes.</p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 11px;">Sent to: ${email}</p>
                </div>
                <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">Powered by Gmail • Twilio SMS • DeepSeek AI</p>
              </div>
            </div>
          `,
        })
      );
    }

    if (deliveryMethod === "sms" && targetPhone) {
      promises.push(
        sendSMS({
          to: targetPhone,
          message: `🔐 Nirmaan ${roleConfig.description} OTP: ${code}. Valid for ${env.otpExpiryMinutes} minutes. Do not share this code.`,
        })
      );
    }

    await Promise.all(promises);
    console.log("✅ OTP sent successfully:", { deliveryMethod, target: deliveryMethod === "email" ? email : targetPhone });

    return ok(res, { 
      role,
      deliveryMethod, 
      otpSent: true,
      target: deliveryMethod === "email" ? email : targetPhone,
      expiresAt,
      deliveryMethods: [deliveryMethod]
    }, `${roleConfig.description} OTP sent via ${deliveryMethod === "email" ? "Email" : "SMS to " + targetPhone}`);
  } catch (error) {
    console.error("❌ OTP request error:", error);
    return fail(res, 500, "Failed to send OTP. Please try again.");
  }
});

router.post("/verify-otp", validateOtpVerification, async (req, res) => {
  const { email, role, otp, name } = req.body;

  try {
    console.log("🔍 OTP Verification Attempt:", { email, role, otp, name });
    
    const record = await OtpCode.findOne({ email, role, code: otp });
    console.log("📋 OTP Record Found:", record ? { 
      email: record.email, 
      role: record.role, 
      code: record.code, 
      expiresAt: record.expiresAt,
      isExpired: record.expiresAt < new Date()
    } : "No record found");
    
    if (!record || record.expiresAt < new Date()) {
      console.log("❌ OTP Verification Failed: Invalid or expired OTP");
      return fail(res, 400, "Invalid or expired OTP");
    }

    await OtpCode.deleteMany({ email, role });
    console.log("✅ OTP deleted after verification");

    let user = await User.findOne({ email });
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

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 401, "Invalid credentials");

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    return ok(res, { token, user }, "Login successful");
  } catch (error) {
    console.error("Student login error:", error);
    return fail(res, 500, "Login failed. Please try again.");
  }
});

module.exports = router;

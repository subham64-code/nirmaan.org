const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { ok, fail } = require("../utils/apiResponse");

const router = express.Router();
const client = new OAuth2Client(env.googleOauthClientId);

// Verify Google ID Token
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.googleOauthClientId,
  });
  return ticket.getPayload();
}

// Google OAuth Login
router.post("/google", async (req, res) => {
  const { token, role } = req.body;

  if (!token) {
    return fail(res, 400, "Google token is required");
  }

  try {
    // Verify the Google ID token
    console.log("验证 Google Token:", { audience: env.googleOauthClientId, role });
    const payload = await verifyGoogleToken(token);
    const { email, name, picture, sub: googleId } = payload;
    console.log("Google Payload:", { email, name });

    if (!email) {
      return fail(res, 400, "Email not provided by Google");
    }

    // Find or create user
    let user = await User.findOne({ email, role });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        role,
        googleId,
        picture,
        isApproved: role === "admin" ? true : false, // Auto-approve admin
        otpRequired: false,
      });
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    }

    if (user.isBlocked) {
      return fail(res, 403, "Your account is blocked. Please contact admin.");
    }

    // Only approved teacher/student accounts are allowed to sign in.
    if (["teacher", "student"].includes(role) && !user.isApproved) {
      return fail(res, 403, "Your account is pending approval or blocked. Please contact admin.");
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiry }
    );

    return ok(
      res,
      {
        token: authToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    // Detect common verification errors and provide actionable guidance for local/dev
    const msg = (error && error.message) ? error.message.toLowerCase() : '';
    if (msg.includes('origin_mismatch') || msg.includes('origin mismatch') || msg.includes('audience')) {
      return fail(
        res,
        400,
        "Google token verification failed (origin/audience mismatch). For local development use the /api/auth/google-mock endpoint or register your origin in the Google Cloud Console."
      );
    }

    return fail(res, 401, "Invalid Google token or authentication failed");
  }
});

// Mock Google OAuth Login for testing approved/blocked flows without Google Cloud Console constraints
router.post("/google-mock", async (req, res) => {
  const { role, status } = req.body; // status: "approved" | "blocked"

  try {
    let email, name;
    if (role === "teacher") {
      email = status === "approved" ? "krishan.kumar@nirmaan.edu" : "blocked.teacher@nirmaan.edu";
      name = status === "approved" ? "Mr. Krishan Kumar" : "Blocked Teacher";
    } else if (role === "admin") {
      email = "subhambehera2023@gift.edu.in";
      name = "Subham Behera";
    } else {
      email = status === "approved" ? "approved.student@nirmaan.edu" : "blocked.student@nirmaan.edu";
      name = status === "approved" ? "Approved Student" : "Blocked Student";
    }

    // Find or create user
    let user = await User.findOne({ email, role });
    if (!user) {
      user = await User.create({
        name,
        email,
        role,
        isApproved: status === "approved" || role === "admin",
        otpRequired: false
      });
    } else {
      user.isApproved = status === "approved" || role === "admin";
      await user.save();
    }

    if (user.isBlocked) {
      return fail(res, 403, "Your account is blocked. Please contact admin.");
    }

    if (role !== "admin" && !user.isApproved) {
      return fail(res, 403, "Your account is pending approval or blocked. Please contact admin.");
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiry }
    );

    return ok(
      res,
      {
        token: authToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`
        }
      },
      "Mock Login successful"
    );
  } catch (error) {
    console.error("Mock Google OAuth error:", error);
    return fail(res, 500, "Mock Authentication failed: " + error.message);
  }
});

// Get current user info
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return fail(res, 401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) {
      return fail(res, 404, "User not found");
    }

    if (user.isBlocked) {
      return fail(res, 403, "Your account is blocked. Please contact admin.");
    }

    return ok(res, user, "User retrieved");
  } catch (error) {
    return fail(res, 401, "Invalid token");
  }
});

module.exports = router;

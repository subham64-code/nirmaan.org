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
    const payload = await verifyGoogleToken(token);
    const { email, name, picture, sub: googleId } = payload;

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
    return fail(res, 401, "Invalid Google token or authentication failed");
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

    return ok(res, user, "User retrieved");
  } catch (error) {
    return fail(res, 401, "Invalid token");
  }
});

module.exports = router;

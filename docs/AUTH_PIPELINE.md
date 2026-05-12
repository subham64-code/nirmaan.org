# Authentication and Authorization Pipeline Documentation

## Overview

The authentication and authorization system for the Nirmaan Educational Platform uses a secure, stateless JWT-based authentication mechanism with OTP verification for initial login. This document outlines the complete authentication flow, authorization mechanisms, security measures, and implementation details.

## Authentication Architecture

### Authentication Flow Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Enter Email/Phone
     ▼
┌─────────────────┐
│ Frontend (OTP)  │
└────┬────────────┘
     │
     │ 2. POST /api/auth/request-otp
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     ├─► 3a. Generate OTP (6-digit)
     ├─► 3b. Store OTP in DB with expiry
     ├─► 3c. Send via SendGrid (Email)
     └─► 3d. Send via Twilio (SMS - optional)
     │
     │ 4. Return success
     ▼
┌─────────────────┐
│ Frontend (OTP)  │
└────┬────────────┘
     │
     │ 5. User enters OTP
     ▼
┌─────────────────┐
│ Frontend (OTP)  │
└────┬────────────┘
     │
     │ 6. POST /api/auth/verify-otp
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     ├─► 7a. Verify OTP
     ├─► 7b. Check expiry
     ├─► 7c. Check user role
     ├─► 7d. Generate JWT token
     ├─► 7e. Return token + user data
     └─► 7f. Clear OTP from DB
     │
     │ 8. Store token in localStorage
     ▼
┌─────────────────┐
│ Frontend (Auth) │
└────┬────────────┘
     │
     │ 9. Include token in headers
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 10. Verify JWT token
     ▼
┌─────────────────┐
│  Protected Route│
└─────────────────┘
```

## Authentication Components

### 1. OTP Generation Service

```javascript
// src/services/otpService.js

const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a secure OTP with crypto
 * @returns {string} Secure OTP
 */
exports.generateSecureOTP = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
};

/**
 * Calculate OTP expiry time
 * @param {number} minutes - Minutes until expiry
 * @returns {Date} Expiry date
 */
exports.calculateOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Verify OTP
 * @param {string} storedOTP - OTP stored in database
 * @param {string} providedOTP - OTP provided by user
 * @param {Date} expiryTime - OTP expiry time
 * @returns {boolean} True if valid
 */
exports.verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  if (!storedOTP || !providedOTP) {
    return false;
  }

  if (storedOTP !== providedOTP) {
    return false;
  }

  if (new Date() > expiryTime) {
    return false;
  }

  return true;
};
```

### 2. Email Service (SendGrid)

```javascript
// src/services/emailService.js

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY_NODE);

/**
 * Send OTP via email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - Recipient name (optional)
 */
exports.sendOTP = async (email, otp, name = 'User') => {
  const msg = {
    to: email,
    from: 'nirmaan@gift.edu.in',
    subject: 'Your Nirmaan Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nirmaan</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Educational Platform</p>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hello ${name},<br><br>
            Your verification code is:
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; 
                      font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                      margin: 30px 0; border-radius: 10px; color: #667eea;">
            ${otp}
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This code will expire in <strong>10 minutes</strong>.<br><br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
          <p>© 2024 Nirmaan Educational Platform. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 */
exports.sendWelcomeEmail = async (email, name) => {
  const msg = {
    to: email,
    from: 'nirmaan@gift.edu.in',
    subject: 'Welcome to Nirmaan Educational Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Nirmaan!</h1>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #333;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Nirmaan Educational Platform. We're excited to have you on board!
          </p>
          <p style="color: #666; line-height: 1.6;">
            You can now access our AI/ML courses, take assessments, and track your progress.
          </p>
        </div>
      </div>
    `
  };

  await sgMail.send(msg);
};
```

### 3. SMS Service (Twilio)

```javascript
// src/services/smsService.js

const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number (with country code)
 * @param {string} otp - OTP code
 */
exports.sendSMS = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your Nirmaan OTP is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone
    });

    console.log(`SMS sent to ${phone}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Twilio error:', error);
    throw new Error('Failed to send SMS');
  }
};

/**
 * Send attendance alert via SMS
 * @param {string} phone - Phone number
 * @param {string} status - Attendance status
 * @param {string} date - Date
 */
exports.sendAttendanceAlert = async (phone, status, date) => {
  try {
    const message = await client.messages.create({
      body: `Attendance marked: ${status} on ${date}. - Nirmaan`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone
    });

    return message;
  } catch (error) {
    console.error('Twilio error:', error);
    throw error;
  }
};
```

### 4. JWT Token Service

```javascript
// src/services/jwtService.js

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {string} expiry - Token expiry (e.g., '7d', '1h')
 * @returns {string} JWT token
 */
exports.generateToken = (payload, secret, expiry) => {
  return jwt.sign(payload, secret, { expiresIn: expiry });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Object} Decoded token payload
 */
exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
exports.decodeToken = (token) => {
  return jwt.decode(token);
};
```

## Authentication Controllers

### Auth Controller

```javascript
// src/controllers/authController.js

const User = require('../models/User');
const { generateOTP, verifyOTP, calculateOTPExpiry } = require('../services/otpService');
const { sendOTP } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const { generateToken, verifyToken } = require('../services/jwtService');

/**
 * Request OTP
 * POST /api/auth/request-otp
 */
exports.requestOTP = async (req, res) => {
  try {
    const { email, phone, role, deliveryMethod } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate role
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Validate delivery method
    if (!['email', 'sms', 'both'].includes(deliveryMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery method'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = calculateOTPExpiry(10); // 10 minutes

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        phone,
        role,
        otp,
        otpExpiry: expiry,
        name: email.split('@')[0], // Default name from email
        isActive: true
      });
    } else {
      // Update existing user
      user.otp = otp;
      user.otpExpiry = expiry;
      if (role) user.role = role;
      if (phone) user.phone = phone;
    }

    await user.save();

    // Send OTP based on delivery method
    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
      await sendOTP(email, otp, user.name);
    }

    if ((deliveryMethod === 'sms' || deliveryMethod === 'both') && phone) {
      await sendSMS(phone, otp);
    }

    res.json({
      success: true,
      message: `OTP sent via ${deliveryMethod === 'both' ? 'email and SMS' : deliveryMethod}`,
      data: {
        email,
        phone,
        role
      }
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

/**
 * Verify OTP and Login
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    // Verify OTP
    const isValid = verifyOTP(user.otp, otp, user.otpExpiry);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Generate JWT token
    const token = generateToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY || '7d'
    );

    // Update last login
    user.lastLogin = new Date();
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

/**
 * Register User (Alternative to OTP)
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      phone,
      role: role || 'student',
      isActive: true
    });

    await user.save();

    // Generate token
    const token = generateToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY || '7d'
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/**
 * Login with Password (Alternative to OTP)
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Generate token
    const token = generateToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY || '7d'
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
```

## Authorization Middleware

### Auth Middleware

```javascript
// src/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * @param {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Optional Auth Middleware
 * Attaches user if token is present, but doesn't require it
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};
```

## Role-Based Access Control (RBAC)

### User Roles

**1. Admin**
- Full system access
- User management (create, update, delete)
- System configuration
- View all data
- Approve/reject applications
- Manage teachers

**2. Teacher**
- Create and manage tests
- View and grade student submissions
- Mark attendance
- View assigned students
- Create study materials
- Access AI question generator

**3. Student**
- View available courses
- Take tests
- View own results
- View own attendance
- Download study materials
- View syllabus

### Route Protection Examples

```javascript
// src/routes/admin.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Only admin can access
router.get('/dashboard', auth, authorize('admin'), adminController.getDashboard);
router.get('/users', auth, authorize('admin'), adminController.getAllUsers);
router.patch('/users/:id/status', auth, authorize('admin'), adminController.updateUserStatus);

module.exports = router;

// src/routes/tests.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const testController = require('../controllers/testController');

// Teachers and admins can create tests
router.post('/', auth, authorize('teacher', 'admin'), testController.createTest);

// Students can take tests
router.post('/:id/submit', auth, authorize('student'), testController.submitTest);

// Teachers and admins can view results
router.get('/:id/results', auth, authorize('teacher', 'admin'), testController.getTestResults);

module.exports = router;
```

## Frontend Authentication Integration

### Auth Header Helper

```javascript
// src/lib/api.ts

export const authHeader = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
```

### Token Storage

```javascript
// Store token
localStorage.setItem('nirmaan_token', token);

// Get token
const token = localStorage.getItem('nirmaan_token');

// Remove token (logout)
localStorage.removeItem('nirmaan_token');
```

### Axios Interceptor

```javascript
// src/lib/api.ts

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nirmaan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nirmaan_token');
      localStorage.removeItem('nirmaan_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Security Measures

### 1. OTP Security
- 6-digit numeric OTP
- 10-minute expiry
- Single-use OTP (cleared after verification)
- Rate limiting on OTP requests
- Maximum 5 OTP requests per 15 minutes

### 2. JWT Security
- Strong secret key (minimum 32 characters)
- Token expiry (7 days default)
- HTTPS required in production
- Token stored in localStorage (can be moved to httpOnly cookies)
- Token verification on every protected route

### 3. Password Security
- bcrypt hashing (10 rounds)
- Password not returned in queries
- Password field excluded from select
- Minimum password length: 8 characters

### 4. Rate Limiting
```javascript
// Auth endpoints: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
});

// API endpoints: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
```

### 5. Input Validation
- Email format validation
- Phone number format validation
- Role validation (enum check)
- Sanitization of user inputs

### 6. Session Management
- Stateless JWT authentication
- No session storage on server
- Token expiration handling
- Automatic logout on token expiry

## Error Handling

### Authentication Errors

```javascript
// Invalid token
{
  success: false,
  message: 'Invalid token'
}

// Token expired
{
  success: false,
  message: 'Token expired. Please login again.'
}

// No token provided
{
  success: false,
  message: 'No authentication token provided'
}

// Account inactive
{
  success: false,
  message: 'Account is inactive. Please contact administrator.'
}
```

### Authorization Errors

```javascript
// Access denied
{
  success: false,
  message: 'Access denied. Insufficient permissions.'
}

// Authentication required
{
  success: false,
  message: 'Authentication required'
}
```

### OTP Errors

```javascript
// Invalid OTP
{
  success: false,
  message: 'Invalid or expired OTP'
}

// OTP send failed
{
  success: false,
  message: 'Failed to send OTP. Please try again.'
}
```

## Logout Flow

```
User clicks logout
    ↓
Remove token from localStorage
    ↓
Remove user data from localStorage
    ↓
Redirect to login page
    ↓
Clear any cached data
```

```javascript
// Logout function
const logout = () => {
  localStorage.removeItem('nirmaan_token');
  localStorage.removeItem('nirmaan_user');
  localStorage.removeItem('nirmaan_user_name');
  window.location.href = '/login';
};
```

## Testing Authentication

### Test Cases

**1. OTP Request**
- Valid email should receive OTP
- Invalid email format should return error
- Rate limiting should block excessive requests

**2. OTP Verification**
- Correct OTP should login user
- Incorrect OTP should return error
- Expired OTP should return error
- Used OTP should not work again

**3. JWT Token**
- Valid token should grant access
- Invalid token should be rejected
- Expired token should be rejected
- Tampered token should be rejected

**4. Authorization**
- Admin should access admin routes
- Teacher should access teacher routes
- Student should access student routes
- Cross-role access should be denied

## Summary

The authentication and authorization system for Nirmaan Educational Platform provides a secure, stateless authentication mechanism using OTP verification and JWT tokens. The system includes comprehensive security measures such as rate limiting, input validation, and role-based access control. The architecture is designed to be scalable and maintainable, with clear separation of concerns between authentication, authorization, and business logic.

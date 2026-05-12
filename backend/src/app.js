const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
const env = require("./config/env");
const { securityMiddleware, trustProxy } = require("./config/production");

const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");
const studentRoutes = require("./routes/student.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const testRoutes = require("./routes/test.routes");
const performanceRoutes = require("./routes/performance.routes");
const mediaRoutes = require("./routes/media.routes");
const adminRoutes = require("./routes/admin.routes");
const servicesRoutes = require("./routes/services.routes");
const filesRoutes = require("./routes/files.routes");
const facultyRoutes = require("./routes/faculty.routes");
const aiRoutes = require("./routes/ai.routes");
const notificationRoutes = require("./routes/notification.routes");
const leaveRoutes = require("./routes/leave.routes");
const googleAuthRoutes = require("./routes/googleAuth.routes");
const questionsRoutes = require("./routes/questions.routes");

const app = express();

// Trust proxy for rate limiting in production
trustProxy(app);

// Apply security middleware
app.use(...securityMiddleware);

// Logging
if (env.nodeEnv === 'production') {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Body parsing with limits
app.use(express.json({ 
  limit: env.maxFileSize ? `${env.maxFileSize}b` : "2mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: env.maxFileSize ? `${env.maxFileSize}b` : "2mb" 
}));
app.use(cookieParser());

// Additional rate limiting for sensitive endpoints
const sensitiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp') {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
    } else if (ext === '.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (ext === '.mp4') {
      res.setHeader('Content-Type', 'video/mp4');
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

app.get("/api/health", (_, res) => {
  res.json({ success: true, message: "Nirmaan API running" });
});

// Apply sensitive rate limiting to auth routes
app.use("/api/auth/request-otp", sensitiveRateLimit);
app.use("/api/auth/verify-otp", sensitiveRateLimit);
app.use("/api/auth/student-login", sensitiveRateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave-requests", leaveRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/questions", questionsRoutes);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Endpoint not found",
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  // Log error details
  console.error('Global error handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = env.nodeEnv === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: isDevelopment ? error.message : "Internal server error",
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

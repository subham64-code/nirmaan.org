const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
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
const teacherRoutes = require("./routes/teacher.routes");
const servicesRoutes = require("./routes/services.routes");
const filesRoutes = require("./routes/files.routes");
const facultyRoutes = require("./routes/faculty.routes");
const aiRoutes = require("./routes/ai.routes");
const notificationRoutes = require("./routes/notification.routes");
const leaveRoutes = require("./routes/leave.routes");
const googleAuthRoutes = require("./routes/googleAuth.routes");
const questionsRoutes = require("./routes/questions.routes");

const app = express();

// Ensure logs directory exists for error logging
try {
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
} catch (e) {
  console.error('Failed to create logs directory', e && e.message ? e.message : e);
}

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
  max: 1000, // Relaxed to support 100+ concurrent students on shared college Wi-Fi
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

const testCommRoutes = require("./routes/test-comm.routes");

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave-requests", leaveRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/test", testCommRoutes);

// Redirect /proctoring-launch to the Flask proctoring service (keeps a single integration point)
app.get('/proctoring-launch', (req, res) => {
  const flaskBase = process.env.PROCTORING_URL || 'http://127.0.0.1:5001/proctoring-launch';
  const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
  const target = qs ? `${flaskBase}?${qs}` : flaskBase;
  return res.redirect(302, target);
});

// Temporary integration test route
app.get('/__integration-test', (req, res) => {
  res.json({ success: true, message: 'Integration route active' });
});

// API-prefixed proctoring launch redirect (reachable via existing API routing)
app.get('/api/proctoring-launch', (req, res) => {
  const flaskBase = process.env.PROCTORING_URL || 'http://127.0.0.1:5001/proctoring-launch';
  const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
  const target = qs ? `${flaskBase}?${qs}` : flaskBase;
  return res.redirect(302, target);
});

// Generic proctoring path redirect (preserve path and query)
app.use('/proctoring', (req, res) => {
  const flaskHost = process.env.PROCTORING_HOST || 'http://127.0.0.1:5001';
  const forward = `${flaskHost}${req.originalUrl}`; // originalUrl includes /proctoring/... and query
  return res.redirect(302, forward);
});

// Legacy exam route alias: redirect old Flask-style student exam URLs to Next.js frontend
app.get('/student/take-exam/:testId', (req, res) => {
  const { testId } = req.params;
  // Prefer frontend host from env, fallback to localhost:3000
  const frontend = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  const target = `${frontend.replace(/\/$/, '')}/dashboard/student/tests/${encodeURIComponent(testId)}`;
  return res.redirect(302, target);
});

// Response logger to capture 5xx responses for troubleshooting
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    try {
      const duration = Date.now() - start;
      if (res.statusCode >= 500) {
        const rec = {
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          duration,
          body: req.body && Object.keys(req.body).length ? req.body : undefined,
          timestamp: new Date().toISOString(),
          ip: req.ip
        };
        const logFile = path.join(__dirname, '..', 'logs', 'requests.log');
        fs.appendFileSync(logFile, JSON.stringify(rec) + '\n', { encoding: 'utf8' });
        console.warn('Logged 5xx response:', rec.method, rec.url, rec.status);
      }
    } catch (e) {
      console.error('Failed to write request log:', e && e.message ? e.message : e);
    }
  });
  next();
});

// 404 handler
app.use((_, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Endpoint not found",
    timestamp: new Date().toISOString()
  });
});

// Legacy exam route alias: redirect old Flask-style student exam URLs to Next.js frontend
app.get('/student/take-exam/:testId', (req, res) => {
  const { testId } = req.params;
  // Prefer frontend host from env, fallback to localhost:3000
  const frontend = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  const target = `${frontend.replace(/\/$/, '')}/dashboard/student/tests/${encodeURIComponent(testId)}`;
  return res.redirect(302, target);
});

// Redirect /proctoring-launch to the Flask proctoring service (keeps a single integration point)
app.get('/proctoring-launch', (req, res) => {
  const flaskBase = process.env.PROCTORING_URL || 'http://127.0.0.1:5001/proctoring-launch';
  const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
  const target = qs ? `${flaskBase}?${qs}` : flaskBase;
  return res.redirect(302, target);
});

// Generic proctoring path redirect (preserve path and query)
app.use('/proctoring', (req, res) => {
  const flaskHost = process.env.PROCTORING_HOST || 'http://127.0.0.1:5001';
  const forward = `${flaskHost}${req.originalUrl}`; // originalUrl includes /proctoring/... and query
  return res.redirect(302, forward);
});

// Global error handler
app.use((error, req, res, next) => {
  // Log error details
  const errPayload = {
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  console.error('Global error handler:', errPayload);
  // Append to persistent log for post-mortem
  try {
    const logFile = path.join(__dirname, '..', 'logs', 'errors.log');
    fs.appendFileSync(logFile, JSON.stringify(errPayload) + '\n', { encoding: 'utf8' });
  } catch (e) {
    console.error('Failed to write error log:', e && e.message ? e.message : e);
  }

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

const dotenv = require("dotenv");

dotenv.config();

const resolvedMongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim() ? process.env.MONGO_URI.trim() : "";

// Fail fast so misconfiguration (missing/empty MONGO_URI) is obvious.
if (!resolvedMongoUri) {
  throw new Error(
    "Missing/empty environment variable MONGO_URI. Set it (recommended):\n" +
      "MONGO_URI=mongodb+srv://subham:subham@subham.uo6qhe6.mongodb.net/nirmaan_org"
  );
}

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: resolvedMongoUri,
  jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
  jwtExpiry: process.env.JWT_EXPIRY || "7d",
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
  smtpHost: process.env.SMTP_HOST || process.env.EMAIL_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
  smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  smtpPass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
  fromEmail: process.env.FROM_EMAIL || process.env.EMAIL_USER || "no-reply@nirmaan.org",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || process.env.sid || process.env.TWILIO_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || process.env.SMS_API_KEY || "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaApiKey: process.env.OLLAMA_API_KEY || process.env.NEXT_PUBLIC_OLLAMA_API_KEY || "",
  ollamaModel: process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud",
  googleSheetsAttendanceUrl: process.env.GOOGLE_SHEETS_ATTENDANCE_URL || "",
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  googleOauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "",
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  emailApiKey: process.env.EMAIL_API_KEY || "",
};

// Log startup info without leaking secrets
if (config.nodeEnv === 'development') {
  console.log(`[env] Server configured on port ${config.port} in ${config.nodeEnv} mode`);
}


module.exports = config;

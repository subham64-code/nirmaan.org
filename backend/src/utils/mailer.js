const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

// Initialize transporter with proper configuration
function initializeTransporter() {
  if (transporter) return transporter;
  
  try {
    if (env.smtpHost && env.smtpUser && env.smtpPass) {
      transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      console.log("✅ Email transporter initialized successfully");
      return transporter;
    } else {
      console.log("❌ Email configuration missing");
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to initialize email transporter:", error);
    return null;
  }
}

async function sendMail({ to, subject, html }) {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      transporter = initializeTransporter();
    }
    
    if (!transporter) {
      console.log("MAIL PREVIEW (No transporter)", { to, subject, html });
      return { success: false, error: "Email service not configured" };
    }
    
    console.log("📧 Sending email to:", to);
    
    const result = await transporter.sendMail({
      from: env.fromEmail,
      to,
      subject,
      html,
    });
    
    console.log("✅ Email sent successfully:", {
      to: result.to,
      messageId: result.messageId,
      response: result.response
    });
    
    return { success: true, messageId: result.messageId, result };
    
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error: error.message };
  }
}

// Test email connection
async function testEmailConnection() {
  try {
    const testTransporter = initializeTransporter();
    if (!testTransporter) {
      return { success: false, error: "Transporter not initialized" };
    }
    
    await testTransporter.verify();
    return { success: true, message: "Email connection verified" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { sendMail, testEmailConnection, initializeTransporter };

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from backend/.env
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('Could not find backend/.env');
  process.exit(1);
}

const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const fromEmail = process.env.FROM_EMAIL || smtpUser;
const toEmail = process.env.TEST_SMTP_TO || 'subhambehera2023@gift.edu.in';

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error('SMTP credentials not found in backend/.env');
  process.exit(1);
}

async function send() {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `${fromEmail}`,
      to: toEmail,
      subject: 'Nirmaan SMTP Test Mail',
      text: `This is a test email sent from the local Nirmaan environment to ${toEmail}.`,
      html: `<p>This is a test email sent from the local <strong>Nirmaan</strong> environment to <strong>${toEmail}</strong>.</p>`,
    });

    console.log('Message sent:', info.messageId || info.response);
    process.exit(0);
  } catch (err) {
    console.error('Failed to send email:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

send();

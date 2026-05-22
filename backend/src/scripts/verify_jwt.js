const jwt = require('jsonwebtoken');
const env = require('../config/env');

const token = process.argv[2];
if (!token) {
  console.error('Usage: node verify_jwt.js <token>');
  process.exit(1);
}

try {
  const payload = jwt.verify(token, env.jwtSecret);
  console.log('verified payload:', payload);
} catch (e) {
  console.error('verify failed:', e.message);
  try {
    const decoded = jwt.decode(token);
    console.log('decoded (unverified):', decoded);
  } catch {}
  process.exit(1);
}


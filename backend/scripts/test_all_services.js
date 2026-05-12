const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('========================================');
console.log('NIRMAAN SERVICES TEST');
console.log('========================================\n');

// Test Results
const results = {
  email: { status: 'PENDING', message: '' },
  sms: { status: 'PENDING', message: '' },
  oauth: { status: 'PENDING', message: '' },
  googleMaps: { status: 'PENDING', message: '' },
  deepseek: { status: 'PENDING', message: '' },
  gemini: { status: 'PENDING', message: '' },
};

// 1. Test Email (SMTP) Configuration
async function testEmail() {
  console.log('📧 Testing Email (SMTP)...');
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.FROM_EMAIL || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    results.email = { status: 'FAIL', message: '❌ Missing SMTP credentials in .env' };
    console.log(results.email.message);
    return;
  }

  console.log(`   From: ${fromEmail}`);
  console.log(`   SMTP User: ${smtpUser}`);
  console.log(`   Host: ${smtpHost}:${smtpPort}`);

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();
    results.email = { status: 'PASS', message: '✅ SMTP Connection Verified (Login requires App Password)' };
    console.log(results.email.message);
  } catch (err) {
    if (err.message.includes('Application-specific password required')) {
      results.email = { status: 'WARNING', message: '⚠️ Gmail requires App-Specific Password (not regular password)' };
    } else if (err.message.includes('Invalid login')) {
      results.email = { status: 'FAIL', message: '❌ Invalid credentials - check username/password' };
    } else {
      results.email = { status: 'FAIL', message: `❌ ${err.message}` };
    }
    console.log(results.email.message);
  }
}

// 2. Test SMS (Twilio) Configuration
async function testSMS() {
  console.log('\n📱 Testing SMS (Twilio)...');
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.sid;
  const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.SMS_API_KEY;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    results.sms = { status: 'FAIL', message: '❌ Missing Twilio credentials' };
    console.log(results.sms.message);
    return;
  }

  console.log(`   Account SID: ${accountSid.substring(0, 10)}...`);
  console.log(`   From Number: ${fromNumber}`);
  
  // Just verify format, don't actually send
  if (accountSid.startsWith('AC') && authToken.length > 10) {
    results.sms = { status: 'PASS', message: '✅ Twilio credentials configured' };
  } else {
    results.sms = { status: 'WARNING', message: '⚠️ Credentials format looks invalid' };
  }
  console.log(results.sms.message);
}

// 3. Test OAuth (Google) Configuration
async function testOAuth() {
  console.log('\n🔐 Testing OAuth (Google)...');
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID;
  
  if (!clientId) {
    results.oauth = { status: 'FAIL', message: '❌ Missing OAuth Client ID' };
    console.log(results.oauth.message);
    return;
  }

  console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
  
  if (clientId.includes('apps.googleusercontent.com')) {
    results.oauth = { status: 'PASS', message: '✅ Google OAuth Client ID configured' };
  } else {
    results.oauth = { status: 'WARNING', message: '⚠️ Client ID format looks invalid' };
  }
  console.log(results.oauth.message);
}

// 4. Test Google Maps API
async function testGoogleMaps() {
  console.log('\n🗺️  Testing Google Maps API...');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    results.googleMaps = { status: 'FAIL', message: '❌ Missing Google Maps API Key' };
    console.log(results.googleMaps.message);
    return;
  }

  console.log(`   API Key: ${apiKey.substring(0, 15)}...`);

  try {
    // Test geocoding API
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Bhubaneswar&key=${apiKey}`;
    const response = await axios.get(testUrl);
    
    if (response.data.status === 'OK') {
      results.googleMaps = { status: 'PASS', message: '✅ Google Maps API Key is valid' };
    } else if (response.data.status === 'REQUEST_DENIED') {
      results.googleMaps = { status: 'FAIL', message: '❌ API Key invalid or restricted' };
    } else {
      results.googleMaps = { status: 'WARNING', message: `⚠️ API returned: ${response.data.status}` };
    }
  } catch (err) {
    results.googleMaps = { status: 'FAIL', message: `❌ Error: ${err.message}` };
  }
  console.log(results.googleMaps.message);
}

// 5. Test DeepSeek API
async function testDeepSeek() {
  console.log('\n🤖 Testing DeepSeek AI API...');
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    results.deepseek = { status: 'FAIL', message: '❌ Missing DeepSeek API Key' };
    console.log(results.deepseek.message);
    return;
  }

  console.log(`   API Key: ${apiKey.substring(0, 15)}...`);
  results.deepseek = { status: 'PASS', message: '✅ DeepSeek API Key configured' };
  console.log(results.deepseek.message);
}

// 6. Test Gemini API
async function testGemini() {
  console.log('\n✨ Testing Gemini AI API...');
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    results.gemini = { status: 'FAIL', message: '❌ Missing Gemini API Key' };
    console.log(results.gemini.message);
    return;
  }

  console.log(`   API Key: ${apiKey.substring(0, 15)}...`);
  results.gemini = { status: 'PASS', message: '✅ Gemini API Key configured' };
  console.log(results.gemini.message);
}

// Run all tests
async function runAllTests() {
  await testEmail();
  await testSMS();
  await testOAuth();
  await testGoogleMaps();
  await testDeepSeek();
  await testGemini();

  // Summary
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  
  const passed = Object.values(results).filter(r => r.status === 'PASS').length;
  const failed = Object.values(results).filter(r => r.status === 'FAIL').length;
  const warnings = Object.values(results).filter(r => r.status === 'WARNING').length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nTotal: ${Object.keys(results).length} services tested`);

  console.log('\n----------------------------------------');
  console.log('DETAILED RESULTS:');
  console.log('----------------------------------------');
  
  Object.entries(results).forEach(([service, result]) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${service.toUpperCase()}: ${result.message}`);
  });

  console.log('\n========================================');
  console.log('END OF TEST');
  console.log('========================================');
}

runAllTests().catch(console.error);

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'subhambehera89418@gmail.com';
const TEST_PHONE = '+919876543210';

console.log('========================================');
console.log('NIRMAAN OTP DETAILED TEST');
console.log('========================================\n');

// Check environment variables first
console.log('📋 ENVIRONMENT CHECK:');
console.log('----------------------------------------');
console.log(`SMTP_USER: ${process.env.SMTP_USER || '❌ NOT SET'}`);
console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET'}`);
console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || '❌ NOT SET'}`);
console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ SET' : '❌ NOT SET'}`);
console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ SET' : '❌ NOT SET'}`);
console.log(`TWILIO_FROM_NUMBER: ${process.env.TWILIO_FROM_NUMBER || '❌ NOT SET'}`);
console.log('----------------------------------------\n');

async function testEmailOTP() {
  console.log('📧 TEST: Email OTP to ' + TEST_EMAIL);
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      role: 'student',
      deliveryMethod: 'email'
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📧 Please check your email:');
    console.log(`   ${TEST_EMAIL}`);
    console.log('   Look for email from: subhambehera2023@gift.edu.in');
    console.log('   Subject: "🔐 Nirmaan OTP Verification"');
    console.log('   Contains: 6-digit OTP code\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data?.message || error.response.data);
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if backend server is running: npm run dev');
    console.log('   2. Check if MongoDB is connected');
    console.log('   3. Check Gmail SMTP settings in .env');
    console.log('   4. Gmail requires App-Specific Password, not regular password');
    console.log('   5. Check server console for detailed error logs\n');
    return false;
  }
}

async function testSMSOTP() {
  console.log('\n📱 TEST: SMS OTP to ' + TEST_PHONE);
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'sms'
    }, {
      timeout: 30000
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📱 Please check your phone:');
    console.log(`   ${TEST_PHONE}`);
    console.log('   From: Twilio number (+13186071917)');
    console.log('   Contains: 6-digit OTP code\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data?.message || error.response.data);
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check Twilio credentials in .env');
    console.log('   2. Verify Twilio account has sufficient credit');
    console.log('   3. Check if phone number format is correct (+91...)');
    console.log('   4. Check Twilio console for error logs\n');
    return false;
  }
}

async function runTests() {
  await testEmailOTP();
  await testSMSOTP();
  
  console.log('========================================');
  console.log('TEST COMPLETE');
  console.log('========================================');
  console.log('\n💡 Next Steps:');
  console.log('   1. If email failed: Create Gmail App Password at');
  console.log('      https://myaccount.google.com/apppasswords');
  console.log('   2. If SMS failed: Check Twilio balance at');
  console.log('      https://console.twilio.com');
  console.log('   3. Update .env with correct credentials');
  console.log('   4. Restart server and test again\n');
}

runTests().catch(console.error);

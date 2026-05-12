const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'subhambehera89418@gmail.com';
const TEST_PHONE = '+919876543210'; // Test phone number

console.log('========================================');
console.log('NIRMAAN OTP TEST SUITE');
console.log('========================================\n');
console.log(`Testing against: ${BASE_URL}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log(`Test Phone: ${TEST_PHONE}\n`);

const results = [];

async function testEmailOTP() {
  console.log('📧 TEST 1: Request OTP via Email');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      role: 'student',
      deliveryMethod: 'email'
    });
    
    console.log('✅ Email OTP Request Successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    results.push({ test: 'Email OTP Request', status: 'PASS', details: response.data.message });
    return true;
  } catch (error) {
    console.log('❌ Email OTP Request Failed');
    console.log('Error:', error.response?.data?.message || error.message);
    results.push({ test: 'Email OTP Request', status: 'FAIL', details: error.response?.data?.message || error.message });
    return false;
  }
}

async function testSMSOTP() {
  console.log('\n📱 TEST 2: Request OTP via SMS');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'sms'
    });
    
    console.log('✅ SMS OTP Request Successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    results.push({ test: 'SMS OTP Request', status: 'PASS', details: response.data.message });
    return true;
  } catch (error) {
    console.log('❌ SMS OTP Request Failed');
    console.log('Error:', error.response?.data?.message || error.message);
    results.push({ test: 'SMS OTP Request', status: 'FAIL', details: error.response?.data?.message || error.message });
    return false;
  }
}

async function testBothOTP() {
  console.log('\n📧📱 TEST 3: Request OTP via Both Email & SMS');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'both'
    });
    
    console.log('✅ Both OTP Request Successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    results.push({ test: 'Both Email & SMS OTP', status: 'PASS', details: response.data.message });
    return true;
  } catch (error) {
    console.log('❌ Both OTP Request Failed');
    console.log('Error:', error.response?.data?.message || error.message);
    results.push({ test: 'Both Email & SMS OTP', status: 'FAIL', details: error.response?.data?.message || error.message });
    return false;
  }
}

async function testOTPStatus() {
  console.log('\n🔍 TEST 4: Check OTP Status (Admin Endpoint)');
  console.log('----------------------------------------');
  try {
    // This requires admin auth, so we'll skip or note it
    console.log('⚠️  Skipped - Requires admin authentication');
    results.push({ test: 'OTP Status Check', status: 'SKIP', details: 'Requires admin auth' });
    return true;
  } catch (error) {
    console.log('❌ OTP Status Check Failed');
    console.log('Error:', error.response?.data?.message || error.message);
    results.push({ test: 'OTP Status Check', status: 'FAIL', details: error.response?.data?.message || error.message });
    return false;
  }
}

async function runTests() {
  console.log('Starting OTP Tests...\n');
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/api/health`);
  } catch (error) {
    console.log('❌ Backend server is not running on port 5000');
    console.log('Please start the server first: npm run dev\n');
    return;
  }
  
  await testEmailOTP();
  await testSMSOTP();
  await testBothOTP();
  await testOTPStatus();

  // Summary
  console.log('\n========================================');
  console.log('OTP TEST SUMMARY');
  console.log('========================================\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`\nTotal: ${results.length} tests\n`);

  console.log('----------------------------------------');
  console.log('DETAILED RESULTS:');
  console.log('----------------------------------------');
  
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} Test ${index + 1}: ${result.test}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Details: ${result.details}\n`);
  });

  console.log('========================================');
  console.log('IMPORTANT NOTES:');
  console.log('========================================');
  console.log('1. Email OTP requires Gmail App-Specific Password');
  console.log('2. SMS OTP requires valid Twilio account with credit');
  console.log('3. Check your email (${TEST_EMAIL}) for OTP emails');
  console.log('4. Check your phone (${TEST_PHONE}) for SMS messages');
  console.log('5. OTPs expire in 10 minutes by default');
  console.log('========================================');
}

runTests().catch(console.error);

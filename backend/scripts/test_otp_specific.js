const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'subhambehera89418@gmail.com';
const TEST_PHONE = '+917992894181'; // Indian number with country code

console.log('========================================');
console.log('SPECIFIC OTP TEST');
console.log('========================================\n');
console.log(`Email: ${TEST_EMAIL}`);
console.log(`Phone: ${TEST_PHONE}\n`);

async function testEmailOTP() {
  console.log('📧 TEST 1: Email OTP');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      role: 'student',
      deliveryMethod: 'email'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log(`\n📧 Check your email: ${TEST_EMAIL}`);
    console.log('   From: subhambehera2023@gift.edu.in');
    console.log('   Subject: 🔐 Nirmaan OTP Verification\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSMSOTP() {
  console.log('\n📱 TEST 2: SMS OTP to +91 7992894181');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'sms'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log(`\n📱 Check your phone: +91 7992894181`);
    console.log('   From: +13186071917 (Twilio)');
    console.log('   Message contains: 6-digit OTP\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testBothOTP() {
  console.log('\n📧📱 TEST 3: Both Email & SMS OTP');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'both'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log(`\n📧 Check email: ${TEST_EMAIL}`);
    console.log(`📱 Check phone: +91 7992894181\n`);
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  await testEmailOTP();
  await testSMSOTP();
  await testBothOTP();
  
  console.log('========================================');
  console.log('OTP TEST COMPLETE');
  console.log('========================================');
  console.log('\n📧 Check your email inbox and spam folder');
  console.log('📱 Check your phone SMS messages\n');
}

runTests().catch(console.error);

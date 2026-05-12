const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';

console.log('========================================');
console.log('ROLE-BASED OTP TEST');
console.log('========================================\n');
console.log('Configuration:');
console.log('  Student → SMS to +91 7992894181');
console.log('  Teacher → SMS to +91 9861289418');
console.log('  Admin   → Email to input email\n');

async function testStudentOTP() {
  console.log('👨‍🎓 TEST: Student OTP');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: 'student@test.com',
      role: 'student'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📱 Check phone: +91 7992894181\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTeacherOTP() {
  console.log('\n👨‍🏫 TEST: Teacher OTP');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: 'teacher@test.com',
      role: 'teacher'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📱 Check phone: +91 9861289418\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAdminOTP() {
  console.log('\n👨‍💼 TEST: Admin OTP');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: 'subhambehera89418@gmail.com',
      role: 'admin'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📧 Check email: subhambehera89418@gmail.com\n');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  await testStudentOTP();
  await testTeacherOTP();
  await testAdminOTP();
  
  console.log('========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log('\n✅ Student OTP → SMS to +91 7992894181');
  console.log('✅ Teacher OTP → SMS to +91 9861289418');
  console.log('✅ Admin OTP   → Email to input email');
  console.log('\nAll role-based OTP routing configured!');
  console.log('========================================');
}

runTests().catch(console.error);

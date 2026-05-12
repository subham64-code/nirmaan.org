const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';
const TEST_PHONE = '+917992894181';
const TEST_EMAIL = 'subhambehera89418@gmail.com';

console.log('========================================');
console.log('SMS TEST - NUMBER: 7992894181');
console.log('========================================\n');
console.log(`Phone Number: +91 7992894181`);
console.log(`Email: ${TEST_EMAIL}\n`);

async function testSMSOnly() {
  console.log('📱 Sending SMS OTP to +91 7992894181...');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'sms'
    }, {
      timeout: 60000
    });
    
    console.log('✅ SUCCESS!');
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n📱 Check your phone: +91 7992894181`);
    console.log('   From: +13186071917');
    console.log('   Message: 6-digit OTP code\n');
    
  } catch (error) {
    console.log('❌ FAILED:');
    console.log(error.response?.data?.message || error.message);
  }
}

testSMSOnly();

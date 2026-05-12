const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';
const TEST_PHONE = '+917992894181';
const TEST_EMAIL = 'subhambehera89418@gmail.com';

console.log('========================================');
console.log('DETAILED SMS TEST');
console.log('========================================\n');
console.log(`Phone Number: ${TEST_PHONE}`);
console.log(`Twilio From: ${process.env.TWILIO_FROM_NUMBER}\n`);

async function testSMS() {
  console.log('📱 Sending SMS OTP...');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      role: 'student',
      deliveryMethod: 'sms'
    }, {
      timeout: 60000 // 60 second timeout for SMS
    });
    
    console.log('✅ Server Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n📱 SMS Status:');
      console.log('   - Server accepted the request');
      console.log('   - OTP generated and should be sent');
      console.log(`   - To: ${TEST_PHONE}`);
      console.log(`   - From: ${process.env.TWILIO_FROM_NUMBER}`);
      console.log('\n⚠️  If you did not receive the SMS:');
      console.log('   1. Check if Twilio account has sufficient balance');
      console.log('   2. Check if your phone has DND (Do Not Disturb) enabled');
      console.log('   3. Check spam/junk SMS folder on your phone');
      console.log('   4. The number might be on Twilio\'s blocklist');
      console.log('   5. Try a different phone number');
      console.log('\n   Check Twilio console for delivery status:');
      console.log('   https://console.twilio.com/us1/monitor/logs/messages');
    }
    
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testSMS();

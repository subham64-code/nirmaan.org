const twilio = require('twilio');
const env = require('../config/env');

const client = twilio(env.twilioAccountSid, env.twilioAuthToken);

/**
 * Send SMS using Twilio
 * @param {Object} options - SMS options
 * @param {string} options.to - Phone number (with country code)
 * @param {string} options.message - Message content
 * @returns {Promise} - Twilio response
 */
async function sendSMS({ to, message }) {
  try {
    // Validate phone number format
    if (!to || !to.startsWith('+')) {
      throw new Error('Invalid phone number format. Use +countrycode format.');
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Send SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: env.twilioFromNumber,
      to: to,
    });

    console.log('✅ SMS sent successfully:', {
      to: result.to,
      sid: result.sid,
      status: result.status,
      dateCreated: result.dateCreated
    });

    return {
      success: true,
      sid: result.sid,
      to: result.to,
      status: result.status
    };

  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    
    // Return detailed error information
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.status
    };
  }
}

/**
 * Get SMS delivery status
 * @param {string} messageSid - Twilio message SID
 * @returns {Promise} - Message status
 */
async function getSMSStatus(messageSid) {
  try {
    const message = await client.messages(messageSid).fetch();
    
    return {
      success: true,
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated
    };
  } catch (error) {
    console.error('❌ Failed to get SMS status:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid
 */
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number for Twilio
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

module.exports = {
  sendSMS,
  getSMSStatus,
  validatePhoneNumber,
  formatPhoneNumber
};

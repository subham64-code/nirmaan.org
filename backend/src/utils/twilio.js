const twilio = require("twilio");
const env = require("../config/env");

let client = null;
if (env.twilioAccountSid && env.twilioAuthToken) {
  client = twilio(env.twilioAccountSid, env.twilioAuthToken);
}

async function sendSms(toPhone, message) {
  if (!client) {
    // eslint-disable-next-line no-console
    console.log("SMS PREVIEW", { toPhone, message });
    return;
  }
  const result = await client.messages.create({
    body: message,
    from: env.twilioFromNumber,
    to: toPhone,
  });
  return result.sid;
}

module.exports = { sendSms };

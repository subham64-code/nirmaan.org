const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sendMail } = require("../utils/mailer");
const { sendSMS } = require("../utils/sms");
const { ok, fail } = require("../utils/apiResponse");

// Email Test Route
router.post("/email", auth(["admin"]), async (req, res) => {
    const { to, subject, message } = req.body;
    try {
        await sendMail({
            to,
            subject: subject || "Nirmaan Communication Test",
            html: `<p>${message || "This is a test email from the Nirmaan platform."}</p>`
        });
        return ok(res, null, "Test email sent successfully");
    } catch (error) {
        console.error("Test email error:", error);
        return fail(res, 500, `Failed to send email: ${error.message}`);
    }
});

// SMS Test Route
router.post("/sms", auth(["admin"]), async (req, res) => {
    const { to, message } = req.body;
    try {
        await sendSMS({
            to, 
            message: message || "This is a test SMS from the Nirmaan platform."
        });
        return ok(res, null, "Test SMS sent successfully");
    } catch (error) {
        console.error("Test SMS error:", error);
        return fail(res, 500, `Failed to send SMS: ${error.message}`);
    }
});

module.exports = router;

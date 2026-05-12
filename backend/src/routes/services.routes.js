const express = require("express");
const axios = require("axios");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");
const { ok, fail } = require("../utils/apiResponse");
const { sendSms } = require("../utils/twilio");
const { 
  getAttendanceSheetData, 
  parseAttendanceData, 
  validateSheetStructure, 
  syncAttendanceToDatabase 
} = require("../utils/googleSheets");
const { getAiRecommendation } = require("../utils/deepseek");

const router = express.Router();

router.get("/sheet-preview", auth(["admin"]), async (req, res) => {
  try {
    const csvData = await getAttendanceSheetData();
    const parsedData = await parseAttendanceData(csvData);
    const validatedData = await validateSheetStructure(parsedData);
    
    return ok(res, {
      headers: validatedData.headers,
      preview: validatedData.validRows.slice(0, 5),
      totalRows: validatedData.totalRows,
      validRows: validatedData.validRows.length,
      structureValid: validatedData.structureValid
    }, "Sheet data preview loaded");
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.post("/sheet-sync", auth(["admin"]), async (req, res) => {
  try {
    const csvData = await getAttendanceSheetData();
    const parsedData = await parseAttendanceData(csvData);
    const validatedData = await validateSheetStructure(parsedData);
    const syncResult = await syncAttendanceToDatabase(validatedData);
    
    return ok(res, {
      ...syncResult,
      totalRows: validatedData.totalRows,
      validRows: validatedData.validRows.length
    }, `Sync completed: ${syncResult.syncedCount} records updated`);
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get("/sheet-status", auth(["admin"]), async (req, res) => {
  try {
    const env = require("../config/env");
    
    if (!env.googleSheetsAttendanceUrl) {
      return ok(res, { 
        configured: false, 
        message: "Google Sheets URL not configured in environment variables" 
      }, "Status checked");
    }
    
    // Try to fetch just the headers to validate connection
    const csvData = await getAttendanceSheetData();
    const parsedData = await parseAttendanceData(csvData);
    
    return ok(res, {
      configured: true,
      sheetUrl: env.googleSheetsAttendanceUrl,
      headers: parsedData.headers,
      totalRows: parsedData.data.length,
      lastChecked: new Date()
    }, "Google Sheets connection successful");
    
  } catch (error) {
    return ok(res, {
      configured: true,
      connected: false,
      error: error.message,
      lastChecked: new Date()
    }, "Google Sheets connection failed");
  }
});

router.post("/send-sms", auth(["admin", "teacher"]), async (req, res) => {
  const { studentPhone, message } = req.body;
  if (!studentPhone || !message) return fail(res, 400, "Phone and message required");

  try {
    const messageSid = await sendSms(studentPhone, message);
    return ok(res, { messageSid }, "SMS sent");
  } catch (error) {
    return fail(res, 400, error.message);
  }
});

router.get("/recommend/:studentId", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId });
    const present = attendance.filter((a) => a.status === "Present").length;
    const attendancePercent = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

    const recommendation = await getAiRecommendation({
      attendance: attendancePercent,
      avgScore: 75,
      course: "AI/ML",
    });

    return ok(res, { recommendation, attendancePercent }, "Recommendation generated");
  } catch (error) {
    return fail(res, 500, error.message);
  }
});
// AI Chatbot endpoint for admins/teachers to ask questions
router.post("/ai-chat", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return fail(res, 400, "Question is required");

    const response = await getAiRecommendation({
      attendance: 0,
      avgScore: 0,
      course: context?.course || "General",
      customPrompt: question,
    });

    return ok(res, { answer: response, question }, "AI response generated");
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

module.exports = router;

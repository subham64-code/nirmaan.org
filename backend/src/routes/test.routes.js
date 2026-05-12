const express = require("express");
const Test = require("../models/Test");
const TestResult = require("../models/TestResult");
const TestAssessment = require("../models/TestAssessment");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");
const { sendMail } = require("../utils/mailer");
const { sendSms } = require("../utils/twilio");

const router = express.Router();

router.post("/", auth(["teacher", "admin"]), async (req, res) => {
  const payload = req.body;
  const test = await Test.create({ ...payload, createdBy: req.user.sub });
  await logAction(req.user.sub, "test.create", { testId: test._id, title: test.title });
  return created(res, test, "Test created");
});

router.get("/", auth(["student", "teacher", "admin"]), async (req, res) => {
  const tests = await Test.find({ isPublished: true }).select("title course durationMinutes totalMarks createdAt");
  return ok(res, tests);
});

router.get("/:id", auth(["student", "teacher", "admin"]), async (req, res) => {
  const test = await Test.findById(req.params.id).select("title course durationMinutes totalMarks questions.prompt questions.options");
  if (!test) return fail(res, 404, "Test not found");
  return ok(res, test);
});

// Clone/Duplicate test with new title
router.post("/:id/clone", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const originalTest = await Test.findById(req.params.id);
    if (!originalTest) return fail(res, 404, "Test not found");

    const { newTitle, includeResults } = req.body;
    const cloneTitle = newTitle || `${originalTest.title} (Copy)`;

    const clonedTest = await Test.create({
      title: cloneTitle,
      course: originalTest.course,
      durationMinutes: originalTest.durationMinutes,
      totalMarks: originalTest.totalMarks,
      questions: JSON.parse(JSON.stringify(originalTest.questions)),
      createdBy: req.user.sub,
      isPublished: false, // New tests start as unpublished
    });

    await logAction(req.user.sub, "test.clone", {
      originalId: originalTest._id,
      clonedId: clonedTest._id,
      title: cloneTitle,
    });

    return created(res, clonedTest, "Test cloned successfully");
  } catch (error) {
    console.error("Clone test error:", error);
    return fail(res, 500, "Failed to clone test: " + error.message);
  }
});

// Get all tests created by teacher (with pagination)
router.get("/teacher/all", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tests = await Test.find({ createdBy: req.user.sub })
      .select("title course durationMinutes totalMarks isPublished createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Test.countDocuments({ createdBy: req.user.sub });

    return ok(res, {
      tests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }, "Teacher tests retrieved");
  } catch (error) {
    console.error("Get teacher tests error:", error);
    return fail(res, 500, "Failed to retrieve tests: " + error.message);
  }
});

// Update test (edit)
router.put("/:id", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");

    // Check ownership (teachers can only edit their own)
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized to edit this test");
    }

    const { title, course, durationMinutes, totalMarks, questions, isPublished } = req.body;

    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      {
        title: title || test.title,
        course: course || test.course,
        durationMinutes: durationMinutes || test.durationMinutes,
        totalMarks: totalMarks || test.totalMarks,
        questions: questions || test.questions,
        isPublished: isPublished !== undefined ? isPublished : test.isPublished,
      },
      { new: true }
    );

    await logAction(req.user.sub, "test.update", {
      testId: req.params.id,
      title: updatedTest.title,
    });

    return ok(res, updatedTest, "Test updated successfully");
  } catch (error) {
    console.error("Update test error:", error);
    return fail(res, 500, "Failed to update test: " + error.message);
  }
});

// Publish/unpublish test
router.patch("/:id/publish", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");

    // Check ownership
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    const { isPublished } = req.body;
    test.isPublished = isPublished !== undefined ? isPublished : !test.isPublished;
    await test.save();

    await logAction(req.user.sub, "test.publish", {
      testId: req.params.id,
      isPublished: test.isPublished,
    });

    return ok(res, test, `Test ${test.isPublished ? "published" : "unpublished"}`);
  } catch (error) {
    console.error("Publish test error:", error);
    return fail(res, 500, "Failed to update publish status: " + error.message);
  }
});

// Delete test (soft delete or hard)
router.delete("/:id", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");

    // Check ownership
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    await Test.findByIdAndDelete(req.params.id);

    await logAction(req.user.sub, "test.delete", {
      testId: req.params.id,
      title: test.title,
    });

    return ok(res, null, "Test deleted successfully");
  } catch (error) {
    console.error("Delete test error:", error);
    return fail(res, 500, "Failed to delete test: " + error.message);
  }
});

router.post("/:id/submit", auth(["student"]), async (req, res) => {
  const { answers, startedAt } = req.body;
  const test = await Test.findById(req.params.id);
  if (!test) return fail(res, 404, "Test not found");

  const score = test.questions.reduce((sum, q, idx) => {
    const userAnswer = answers[idx];
    return userAnswer === q.answer ? sum + q.marks : sum;
  }, 0);

  const result = await TestResult.findOneAndUpdate(
    { test: test._id, student: req.user.sub },
    {
      test: test._id,
      student: req.user.sub,
      answers,
      score,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return ok(res, result, "Test submitted");
});

router.get("/result/mine", auth(["student"]), async (req, res) => {
  const results = await TestResult.find({ student: req.user.sub }).populate("test", "title totalMarks");
  return ok(res, results);
});

// Get all results for a test (teacher/admin view)
router.get("/:id/results", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const results = await TestResult.find({ test: req.params.id })
      .populate("student", "name email")
      .populate("test", "title totalMarks")
      .sort({ submittedAt: -1 });
    return ok(res, results, "Test results retrieved");
  } catch (error) {
    console.error("Get test results error:", error);
    return fail(res, 500, "Failed to retrieve results: " + error.message);
  }
});

// Get specific test result with full details (teacher/student view)
router.get("/:id/result/:resultId", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const { id: testId, resultId } = req.params;
    const test = await Test.findById(testId);
    const result = await TestResult.findById(resultId).populate("student", "name email");

    if (!test || !result || result.test.toString() !== testId) {
      return fail(res, 404, "Test result not found");
    }

    // Students can only view their own
    if (req.user.role === "student" && result.student._id.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    return ok(
      res,
      {
        _id: result._id,
        test: {
          _id: test._id,
          title: test.title,
          totalMarks: test.totalMarks,
          questions: test.questions.map((q) => ({
            prompt: q.prompt,
            options: q.options,
          })),
        },
        student: result.student,
        answers: result.answers,
        score: result.score,
        submittedAt: result.submittedAt,
      },
      "Test result retrieved"
    );
  } catch (error) {
    console.error("Get test result error:", error);
    return fail(res, 500, "Failed to retrieve result: " + error.message);
  }
});

// Communication testing routes
router.post("/email", auth(["admin"]), async (req, res) => {
  const { to, subject, message } = req.body;
  
  if (!to || !subject) {
    return fail(res, 400, "Email recipient and subject are required");
  }

  try {
    await sendMail({
      to,
      subject,
      html: `<p>${message}</p><p><small>This is a test email from Nirmaan platform.</small></p>`
    });
    
    await logAction(req.user.sub, "test.email", { to, subject });
    return ok(res, { sent: true, to, subject }, "Test email sent successfully");
  } catch (error) {
    console.error("Email test error:", error);
    return fail(res, 500, "Failed to send test email: " + error.message);
  }
});

router.post("/sms", auth(["admin"]), async (req, res) => {
  const { to, message } = req.body;
  
  if (!to || !message) {
    return fail(res, 400, "Phone number and message are required");
  }

  try {
    const result = await sendSms(to, message);
    
    await logAction(req.user.sub, "test.sms", { to, message: message.substring(0, 50) + "..." });
    return ok(res, { sent: true, to, sid: result }, "Test SMS sent successfully");
  } catch (error) {
    console.error("SMS test error:", error);
    return fail(res, 500, "Failed to send test SMS: " + error.message);
  }
});

// Teacher Assessment Routes
router.post("/:id/result/:resultId/assessment", auth(["teacher", "admin"]), async (req, res) => {
  const { notes, grade, marks, feedback, strengths, areasForImprovement, recommendations } = req.body;
  const { id: testId, resultId } = req.params;

  try {
    const testResult = await TestResult.findById(resultId).populate("student");
    if (!testResult || testResult.test.toString() !== testId) {
      return fail(res, 404, "Test result not found");
    }

    let assessment = await TestAssessment.findOneAndUpdate(
      { testResult: resultId, test: testId },
      {
        testResult,
        test: testId,
        student: testResult.student._id,
        teacher: req.user.sub,
        notes: notes || "",
        grade: grade || "Pass",
        marks: marks || testResult.score,
        feedback: feedback || "",
        strengths: strengths || [],
        areasForImprovement: areasForImprovement || [],
        recommendations: recommendations || "",
        isVisible: true,
      },
      { upsert: true, new: true }
    );

    await logAction(req.user.sub, "assessment.submit", {
      testId,
      studentId: testResult.student._id,
    });

    return created(res, assessment, "Assessment submitted successfully");
  } catch (error) {
    console.error("Assessment submission error:", error);
    return fail(res, 500, "Failed to submit assessment: " + error.message);
  }
});

// Get assessments for a test (teacher/admin view)
router.get("/:id/assessments", auth(["teacher", "admin"]), async (req, res) => {
  const { id: testId } = req.params;

  try {
    const assessments = await TestAssessment.find({ test: testId })
      .populate("student", "name email")
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    return ok(res, assessments, "Assessments retrieved");
  } catch (error) {
    console.error("Get assessments error:", error);
    return fail(res, 500, "Failed to retrieve assessments: " + error.message);
  }
});

// Get student's own assessment for a test
router.get("/:id/result/:resultId/assessment", auth(["student", "teacher", "admin"]), async (req, res) => {
  const { id: testId, resultId } = req.params;

  try {
    const testResult = await TestResult.findById(resultId);
    if (!testResult || testResult.test.toString() !== testId) {
      return fail(res, 404, "Test result not found");
    }

    // Students can only view their own assessment
    if (req.user.role === "student" && testResult.student.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    const assessment = await TestAssessment.findOne({
      testResult: resultId,
      test: testId,
    })
      .populate("teacher", "name email")
      .populate("student", "name email");

    if (!assessment) {
      return ok(res, null, "No assessment yet");
    }

    return ok(res, assessment, "Assessment retrieved");
  } catch (error) {
    console.error("Get assessment error:", error);
    return fail(res, 500, "Failed to retrieve assessment: " + error.message);
  }
});

// Download exam with results and assessment
router.get("/:id/result/:resultId/download", auth(["student", "teacher", "admin"]), async (req, res) => {
  const { id: testId, resultId } = req.params;

  try {
    const test = await Test.findById(testId);
    const testResult = await TestResult.findById(resultId).populate("student", "name email");
    const assessment = await TestAssessment.findOne({
      testResult: resultId,
      test: testId,
    }).populate("teacher", "name email");

    if (!test || !testResult || testResult.test.toString() !== testId) {
      return fail(res, 404, "Test or result not found");
    }

    // Students can only download their own
    if (req.user.role === "student" && testResult.student._id.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    // Prepare CSV data
    let csvContent = "EXAM REPORT\n\n";
    csvContent += `Test: ${test.title}\n`;
    csvContent += `Course: ${test.course}\n`;
    csvContent += `Student: ${testResult.student.name} (${testResult.student.email})\n`;
    csvContent += `Date: ${new Date(testResult.submittedAt).toLocaleString()}\n`;
    csvContent += `Score: ${testResult.score}/${test.totalMarks}\n`;
    csvContent += `Percentage: ${((testResult.score / test.totalMarks) * 100).toFixed(2)}%\n`;

    if (assessment) {
      csvContent += `\nTEACHER ASSESSMENT\n`;
      csvContent += `Grade: ${assessment.grade}\n`;
      csvContent += `Feedback: ${assessment.feedback}\n`;
      csvContent += `Notes: ${assessment.notes}\n`;
      if (assessment.strengths.length > 0) {
        csvContent += `Strengths: ${assessment.strengths.join(", ")}\n`;
      }
      if (assessment.areasForImprovement.length > 0) {
        csvContent += `Areas for Improvement: ${assessment.areasForImprovement.join(", ")}\n`;
      }
      if (assessment.recommendations) {
        csvContent += `Recommendations: ${assessment.recommendations}\n`;
      }
    }

    csvContent += `\nQUESTIONS & ANSWERS\n`;
    csvContent += "Question,Your Answer,Correct Answer,Status\n";

    test.questions.forEach((q, idx) => {
      const userAnswer = testResult.answers[idx];
      const isCorrect = userAnswer === q.answer;
      const status = isCorrect ? "Correct" : "Incorrect";
      csvContent += `"${q.prompt}","${q.options[userAnswer] || "Not answered"}","${q.options[q.answer]}","${status}"\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="exam_${test._id}_${testResult.student._id}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error("Download error:", error);
    return fail(res, 500, "Failed to generate download: " + error.message);
  }
});

router.post("/otp-status", auth(["admin"]), async (req, res) => {
  const OtpCode = require("../models/OtpCode");
  const { email, role } = req.body;
  
  if (!email || !role) {
    return fail(res, 400, "Email and role are required");
  }

  try {
    const otpRecords = await OtpCode.find({ email, role }).sort({ createdAt: -1 }).limit(5);
    return ok(res, { 
      email, 
      role, 
      otpCount: otpRecords.length,
      latestOtp: otpRecords[0] ? {
        createdAt: otpRecords[0].createdAt,
        expiresAt: otpRecords[0].expiresAt,
        isExpired: otpRecords[0].expiresAt < new Date()
      } : null
    }, "OTP status retrieved");
  } catch (error) {
    console.error("OTP status error:", error);
    return fail(res, 500, "Failed to get OTP status: " + error.message);
  }
});

module.exports = router;

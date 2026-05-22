const express = require("express");
const Test = require("../models/Test");
const TestResult = require("../models/TestResult");
const TestAssessment = require("../models/TestAssessment");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");
const { sendMail } = require("../utils/mailer");
const { sendSms } = require("../utils/twilio");
const Notification = require("../models/Notification");
const PDFDocument = require("pdfkit");
const {
  Document: DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} = require("docx");

const router = express.Router();

async function getReportPayload(testId, user) {
  const test = await Test.findById(testId);
  if (!test) {
    return { error: { status: 404, message: "Test not found" } };
  }

  if (user.role === "teacher" && test.createdBy.toString() !== user.sub) {
    return { error: { status: 403, message: "Unauthorized" } };
  }

  const results = await TestResult.find({ test: testId })
    .populate("student", "name email")
    .sort({ score: -1, submittedAt: -1 });

  return { test, results };
}

async function getTestRecipients(test) {
  const User = require("../models/User");

  if (test.assignedStudents && test.assignedStudents.length > 0) {
    return User.find({
      _id: { $in: test.assignedStudents },
      role: "student",
      isApproved: true,
      isBlocked: { $ne: true },
    }).select("_id email name course");
  }

  if (test.targetAudience) {
    const ta = String(test.targetAudience || "");
    // Support encoded audience values:
    // - "industry" => industry-oriented students
    // - "both:<batch>" => students in batch OR industry-oriented
    // - otherwise treat as batch name and match `course`
    if (ta === "industry") {
      return User.find({
        role: "student",
        isApproved: true,
        isBlocked: { $ne: true },
        $or: [
          { course: /industry/i },
          { qualification: /industry/i }
        ]
      }).select("_id email name course");
    }

    if (ta.startsWith("both:")) {
      const batchName = ta.split(":")[1] || "";
      return User.find({
        role: "student",
        isApproved: true,
        isBlocked: { $ne: true },
        $or: [
          { course: batchName },
          { course: /industry/i },
          { qualification: /industry/i }
        ]
      }).select("_id email name course");
    }

    // Default: match course name (batch)
    return User.find({
      role: "student",
      isApproved: true,
      isBlocked: { $ne: true },
      course: test.targetAudience,
    }).select("_id email name course");
  }

  return User.find({
    role: "student",
    isApproved: true,
    isBlocked: { $ne: true },
  }).select("_id email name course");
}

function isWithinTestWindow(test, now = new Date()) {
  if (test.availableFrom && new Date(test.availableFrom) > now) {
    return false;
  }

  if (test.availableUntil && new Date(test.availableUntil) < now) {
    return false;
  }

  return true;
}

// POST /api/tests/:id/gps - save GPS log for a student's exam
router.post("/:id/gps", auth(["student"]), async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return fail(res, 400, 'Invalid GPS data');
    }
    const GPSLog = require('../models/GPSLog');
    const log = await GPSLog.create({ test: req.params.id, student: req.user.sub, lat, lng, accuracy });
    return ok(res, log, 'GPS log saved');
  } catch (error) {
    console.error('GPS log error:', error);
    return fail(res, 500, 'Failed to save GPS log: ' + error.message);
  }
});

router.post("/", auth(["teacher", "admin"]), async (req, res) => {
  const payload = req.body;
  const test = await Test.create({
    ...payload,
    createdBy: req.user.sub,
    isPublished: payload.isPublished !== undefined ? payload.isPublished : true,
  });
  await logAction(req.user.sub, "test.create", { testId: test._id, title: test.title });

  if (test.isPublished !== false) {
    try {
      const recipients = await getTestRecipients(test);
      await Promise.all(
        recipients.map((student) =>
          Notification.create({
            userId: student._id,
            title: "New exam created",
            message: test.targetAudience
              ? `A new exam '${test.title}' is available for ${test.targetAudience}.`
              : `A new exam '${test.title}' is now available for you.`,
            type: "info",
            category: "exam",
            link: "/dashboard/student/tests",
          })
        )
      );
    } catch (notifyError) {
      console.error("Exam creation notification error:", notifyError);
    }
  }

  return created(res, test, "Test created");
});

router.get("/", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    let query;
    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "teacher") {
      query = { createdBy: req.user.sub };
    } else {
      // Student view: only published tests visible. Additionally, if a test has assignedStudents empty,
      // visibility should respect targetAudience semantics (batch / industry / both).
      const User = require("../models/User");
      const student = await User.findById(req.user.sub).select("course qualification");
      const studentCourse = (student?.course || "").toString();
      const studentQualification = (student?.qualification || "").toString();

      // Build OR conditions: tests assigned to the student OR tests with no explicit assignments but matching audience
      const audienceMatchConditions = [
        { targetAudience: "" },
        { targetAudience: studentCourse },
        { targetAudience: "industry" },
        { targetAudience: { $regex: `^both:${studentCourse}$`, $options: "i" } },
      ];

      // If student's qualification/fields indicate industry, include industry matches
      if (studentQualification && /industry/i.test(studentQualification)) {
        audienceMatchConditions.push({ targetAudience: "industry" });
        audienceMatchConditions.push({ targetAudience: { $regex: `^both:`, $options: "i" } });
      }

      query = {
        isPublished: true,
        $or: [
          { assignedStudents: req.user.sub },
          { $and: [ { assignedStudents: { $size: 0 } }, { $or: audienceMatchConditions } ] }
        ],
      };
    }

      const tests = await Test.find(query)
      .populate("createdBy", "name")
      .select("title course targetAudience durationMinutes availableFrom availableUntil totalMarks isPublished createdAt createdBy assignedStudents questions")
      .sort({ createdAt: -1 });
      
    return ok(res, tests);
  } catch (error) {
    console.error("Get tests error:", error);
    return fail(res, 500, "Failed to retrieve tests");
  }
});

router.post("/:id/assign", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const { studentIds = [] } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return fail(res, 400, "studentIds array is required");
    }

    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");

    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    test.assignedStudents = studentIds;
    await test.save();

    const students = await require("../models/User").find({
      _id: { $in: studentIds },
      role: "student",
      isApproved: true,
    }).select("_id email name");

    await Promise.all(
      students.map((student) =>
        Notification.create({
          userId: student._id,
          title: "New exam assigned",
          message: `A new exam '${test.title}' has been assigned to you.`,
          type: "info",
          category: "exam",
          link: "/dashboard/student/tests",
        })
      )
    );

    await Promise.all(
      students.map((student) =>
        sendMail({
          to: student.email,
          subject: `New Exam Assigned: ${test.title}`,
          html: `<p>Hi ${student.name},</p><p>A new exam <strong>${test.title}</strong> has been assigned to you in Nirmaan.</p><p>Please log in and complete it before the deadline.</p>`,
        }).catch(() => null)
      )
    );

    await logAction(req.user.sub, "test.assign", {
      testId: test._id,
      assignedCount: students.length,
    });

    return ok(res, { assignedCount: students.length, testId: test._id }, "Test assigned successfully");
  } catch (error) {
    console.error("Assign test error:", error);
    return fail(res, 500, "Failed to assign test: " + error.message);
  }
});

router.get("/:id", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const isStudent = req.user.role === "student";
    const selectFields = isStudent
      ? "title course targetAudience durationMinutes availableFrom availableUntil totalMarks questions.prompt questions.options questions.marks"
      : "title course targetAudience durationMinutes availableFrom availableUntil totalMarks questions.prompt questions.options questions.answer questions.marks";
      
    const test = await Test.findById(req.params.id).select(selectFields);
    if (!test) return fail(res, 404, "Test not found");
    
    // For students, don't show correct answers
    if (isStudent) {
      test.questions = test.questions.map(q => ({
        prompt: q.prompt,
        options: q.options,
        marks: q.marks
      }));
    }
    
    return ok(res, test, "Test retrieved");
  } catch (error) {
    console.error("Get test error:", error);
    return fail(res, 500, "Failed to retrieve test");
  }
});

// GET /api/tests/:id/recipients - list students who would receive notifications for this test
router.get('/:id/recipients', auth(['teacher','admin']), async (req, res) => {
  try {
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, 'Test not found');

    // Teachers can only view recipients for their own tests
    if (req.user.role === 'teacher' && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, 'Unauthorized');
    }

    const recipients = await getTestRecipients(test);
    return ok(res, recipients, 'Recipients retrieved');
  } catch (error) {
    console.error('Get recipients error:', error);
    return fail(res, 500, 'Failed to retrieve recipients: ' + error.message);
  }
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
      targetAudience: originalTest.targetAudience,
      durationMinutes: originalTest.durationMinutes,
      totalMarks: originalTest.totalMarks,
      availableFrom: originalTest.availableFrom,
      availableUntil: originalTest.availableUntil,
      questions: JSON.parse(JSON.stringify(originalTest.questions)),
      createdBy: req.user.sub,
      isPublished: false,
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

    const { title, course, targetAudience, durationMinutes, totalMarks, availableFrom, availableUntil, questions, isPublished } = req.body;

    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      {
        title: title || test.title,
        course: course || test.course,
        targetAudience: targetAudience !== undefined ? targetAudience : test.targetAudience,
        durationMinutes: durationMinutes || test.durationMinutes,
        totalMarks: totalMarks || test.totalMarks,
        availableFrom: availableFrom !== undefined ? availableFrom : test.availableFrom,
        availableUntil: availableUntil !== undefined ? availableUntil : test.availableUntil,
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

    if (test.isPublished) {
      const students = await getTestRecipients(test);

      await Promise.all(
        students.map((student) =>
          Notification.create({
            userId: student._id,
            title: "Exam published",
            message: test.targetAudience
              ? `Exam '${test.title}' is now live for ${test.targetAudience}.`
              : `Exam '${test.title}' is now live.`,
            type: "info",
            category: "exam",
            link: "/dashboard/student/tests",
          })
        )
      );

      await Promise.all(
        students.map((student) =>
          sendMail({
            to: student.email,
            subject: `Exam Published: ${test.title}`,
            html: `<p>Hi ${student.name},</p><p>Your exam <strong>${test.title}</strong> is now available in Nirmaan.</p><p>Please login to attempt it.</p>`,
          }).catch(() => null)
        )
      );
    }

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
  try {
    const { answers, startedAt } = req.body;
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");
    const { cheatingReason, cheatingEvents } = req.body || {};

    if (!isWithinTestWindow(test, new Date())) {
      return fail(res, 403, "This exam is no longer available.");
    }

    // Check if student already submitted this test (one attempt rule)
    const existingResult = await TestResult.findOne({
      test: test._id,
      student: req.user.sub,
      submittedAt: { $exists: true } // Only count submitted tests, not drafts
    });

    if (existingResult) {
      return fail(res, 400, "You have already submitted this exam. Only one attempt is allowed.");
    }

    // Validate answers array
    if (!Array.isArray(answers) || answers.length !== test.questions.length) {
      return fail(res, 400, "Invalid number of answers");
    }

    // Calculate score
    const score = test.questions.reduce((sum, q, idx) => {
      const userAnswer = answers[idx];
      return userAnswer === q.answer ? sum + q.marks : sum;
    }, 0);

    // Create or update result
    // Prepare result payload, include cheating metadata when provided
    const resultPayload = {
      test: test._id,
      student: req.user.sub,
      answers,
      score,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      submittedAt: new Date(),
      attempts: 1,
    };

    if (cheatingReason || (Array.isArray(cheatingEvents) && cheatingEvents.length > 0)) {
      resultPayload.status = "cheated";
      resultPayload.cheatingDetails = {
        reason: cheatingReason || "detected_suspicious_activity",
        events: cheatingEvents || [],
        detectedAt: new Date(),
      };
    } else {
      resultPayload.status = "submitted";
    }

    const result = await TestResult.findOneAndUpdate(
      { test: test._id, student: req.user.sub },
      resultPayload,
      { upsert: true, new: true }
    );

    // Log the submission
    await logAction(req.user.sub, "test.submit", {
      testId: test._id,
      score: score,
      totalMarks: test.totalMarks
    });

    // Notify student
    await Notification.create({
      userId: req.user.sub,
      title: "Exam submitted",
      message: `Your exam '${test.title}' has been submitted. Score: ${score}/${test.totalMarks}`,
      type: "success",
      category: "exam",
      link: `/dashboard/student/tests/results/${result._id}`
    });

    // If cheating detected, notify teacher and admins with details
    if (resultPayload.status === "cheated") {
      try {
        await Notification.create({
          userId: req.user.sub,
          title: "Cheating warning",
          message: `Your exam '${test.title}' was auto-submitted because suspicious activity was detected.`,
          type: "warning",
          category: "exam",
          link: `/dashboard/student/tests/results/${result._id}`,
          metadata: { cheatingDetails: resultPayload.cheatingDetails }
        });

        // Notify test creator (teacher)
        if (test.createdBy) {
          await Notification.create({
            userId: test.createdBy,
            title: "Student flagged for cheating",
            message: `Student with id ${req.user.sub} has been auto-submitted for test '${test.title}' due to suspicious activity: ${resultPayload.cheatingDetails.reason}`,
            type: "warning",
            category: "exam",
            link: `/dashboard/teacher/tests/${test._id}/results/${result._id}`,
            metadata: { cheatingDetails: resultPayload.cheatingDetails }
          });
        }

        // Notify all admins
        const admins = await require("../models/User").find({ role: "admin" }).select("_id");
        await Promise.all(admins.map((a) =>
          Notification.create({
            userId: a._id,
            title: "Cheating detected",
            message: `Auto-submitted test '${test.title}' for a student due to suspicious activity. Please review.`,
            type: "warning",
            category: "exam",
            link: `/dashboard/admin`,
            metadata: { testId: test._id.toString(), studentId: req.user.sub, cheatingDetails: resultPayload.cheatingDetails }
          })
        ));
        // Optionally block the student's account
        try {
          const User = require('../models/User');
          await User.findByIdAndUpdate(req.user.sub, { isBlocked: true });
          await logAction(req.user.sub, 'user.blocked', { studentId: req.user.sub, reason: resultPayload.cheatingDetails.reason });
        } catch (blockErr) {
          console.error('Failed to block user after cheating:', blockErr);
        }
      } catch (notifyErr) {
        console.error("Cheating notification error:", notifyErr);
      }
    }

    return ok(res, result, "Test submitted successfully");
  } catch (error) {
    console.error("Test submission error:", error);
    return fail(res, 500, "Failed to submit test: " + error.message);
  }
});

// Check if student can attempt test (not already submitted)
router.get("/:id/can-attempt", auth(["student"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return fail(res, 404, "Test not found");
    }

    // 1. Check if they already submitted this test
    const existingResult = await TestResult.findOne({
      test: req.params.id,
      student: req.user.sub,
      submittedAt: { $exists: true }
    });

    if (existingResult) {
      return ok(res, { 
        canAttempt: false, 
        message: "You have already submitted this exam. Only one attempt is allowed per exam." 
      }, "Attempt status retrieved");
    }

    // 2. Check if they have another active ongoing exam that hasn't expired yet
    const now = new Date();
    if (!isWithinTestWindow(test, now)) {
      return ok(res, {
        canAttempt: false,
        message: "This exam is outside its active schedule."
      }, "Attempt status retrieved");
    }

    const activeResults = await TestResult.find({
      student: req.user.sub,
      submittedAt: { $exists: false },
      startedAt: { $exists: true }
    }).populate("test");

    for (const active of activeResults) {
      if (active.test) {
        const durationMs = active.test.durationMinutes * 60 * 1000;
        const endTime = new Date(active.startedAt.getTime() + durationMs);
        if (endTime > now && active.test._id.toString() !== req.params.id) {
          return ok(res, { 
            canAttempt: false, 
            message: `You have an active ongoing exam: "${active.test.title}". Please complete it first.` 
          }, "Attempt status retrieved");
        }
      }
    }

    return ok(res, { canAttempt: true }, "Attempt status retrieved");
  } catch (error) {
    console.error("Attempt check error:", error);
    return fail(res, 500, "Failed to check attempt status");
  }
});

router.get("/result/mine", auth(["student"]), async (req, res) => {
  try {
    // Auto-fail check: find all published tests assigned to this student
    const User = require("../models/User");
    const now = new Date();
    
    const assignedTests = await Test.find({
      isPublished: true,
      $or: [
        { assignedStudents: { $size: 0 } },
        { assignedStudents: req.user.sub }
      ]
    });

    for (const test of assignedTests) {
      // Check if student has a result for this test
      const existingResult = await TestResult.findOne({
        test: test._id,
        student: req.user.sub
      });

      if (!existingResult) {
        const testAgeMs = now.getTime() - new Date(test.createdAt).getTime();
        const durationMs = (test.durationMinutes || 60) * 60 * 1000;
        // If test is older than duration + 4 hours buffer, automatically record a failed attempt
        if (testAgeMs > (durationMs + 4 * 60 * 60 * 1000)) {
          try {
            await TestResult.create({
              test: test._id,
              student: req.user.sub,
              answers: new Array(test.questions?.length || 0).fill(-1),
              score: 0,
              startedAt: test.createdAt,
              submittedAt: now
            });
            console.log(`✓ Auto-marked student ${req.user.sub} as Failed on expired test: ${test.title}`);
          } catch (err) {
            console.error("Auto-fail creation error:", err);
          }
        }
      }
    }

    const results = await TestResult.find({ student: req.user.sub })
      .populate("test", "title totalMarks course")
      .sort({ submittedAt: -1 });
    return ok(res, results, "Student results retrieved");
  } catch (error) {
    console.error("Get student results error:", error);
    return fail(res, 500, "Failed to retrieve results");
  }
});

// Get all results for a test (teacher/admin view)
router.get("/:id/results", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");

    // Check ownership for teachers
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    // Auto-fail check for all assigned students of this specific test
    const now = new Date();
    const testAgeMs = now.getTime() - new Date(test.createdAt).getTime();
    const durationMs = (test.durationMinutes || 60) * 60 * 1000;
    
    if (testAgeMs > (durationMs + 4 * 60 * 60 * 1000)) {
      // Find all students assigned
      const User = require("../models/User");
      const assignedStudentIds = test.assignedStudents && test.assignedStudents.length > 0 
        ? test.assignedStudents 
        : (await User.find({ role: "student", isApproved: true }).select("_id")).map(s => s._id);

      for (const studentId of assignedStudentIds) {
        const existingResult = await TestResult.findOne({
          test: test._id,
          student: studentId
        });

        if (!existingResult) {
          try {
            await TestResult.create({
              test: test._id,
              student: studentId,
              answers: new Array(test.questions?.length || 0).fill(-1),
              score: 0,
              startedAt: test.createdAt,
              submittedAt: now
            });
            console.log(`✓ Auto-marked student ${studentId} as Failed on test: ${test.title}`);
          } catch (err) {
            console.error("Auto-fail for teacher view error:", err);
          }
        }
      }
    }

    const results = await TestResult.find({ test: req.params.id })
      .populate("student", "name email nirmaanId")
      .populate("test", "title totalMarks")
      .sort({ score: -1, submittedAt: -1 });
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
    const result = await TestResult.findById(resultId).populate("student", "name email nirmaanId");

    if (!test || !result || result.test.toString() !== testId) {
      return fail(res, 404, "Test result not found");
    }

    // Check authorization
    if (req.user.role === "student" && result.student._id.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
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
            correctAnswer: q.answer, // Only for teachers/admins
            marks: q.marks
          })),
        },
        student: result.student,
        answers: result.answers,
        score: result.score,
        submittedAt: result.submittedAt,
        status: result.status
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

// Teacher mark correct answers for a test question
router.patch("/:id/mark-answer", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const { questionIndex, correctAnswerIndex } = req.body;
    const test = await Test.findById(req.params.id);

    if (!test) {
      return fail(res, 404, "Test not found");
    }

    // Check if teacher owns the test
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    // Validate inputs
    if (questionIndex < 0 || questionIndex >= test.questions.length) {
      return fail(res, 400, "Invalid question index");
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= test.questions[questionIndex].options.length) {
      return fail(res, 400, "Invalid answer index");
    }

    // Update the question's correct answer
    test.questions[questionIndex].answer = correctAnswerIndex;
    test.questions[questionIndex].markedAt = new Date();
    test.questions[questionIndex].markedBy = req.user.sub;
    await test.save();

    await logAction(req.user.sub, "test.mark-answer", {
      testId: test._id,
      questionIndex: questionIndex,
      correctAnswer: correctAnswerIndex
    });

    return ok(res, { question: test.questions[questionIndex] }, "Answer marked successfully");
  } catch (error) {
    console.error("Mark answer error:", error);
    return fail(res, 500, "Failed to mark answer: " + error.message);
  }
});

// Get questions for teacher to review and mark answers
router.get("/:id/questions-for-marking", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).select("title course questions createdBy");

    if (!test) {
      return fail(res, 404, "Test not found");
    }

    // Check if teacher owns the test
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    return ok(res, test, "Questions retrieved for marking");
  } catch (error) {
    console.error("Get questions error:", error);
    return fail(res, 500, "Failed to retrieve questions: " + error.message);
  }
});

// Teacher Assessment Routes
router.post("/:id/result/:resultId/assessment", auth(["teacher", "admin"]), async (req, res) => {
  const { notes, grade, marks, feedback, strengths, areasForImprovement, recommendations } = req.body;
  const { id: testId, resultId } = req.params;

  try {
    const test = await Test.findById(testId);
    const testResult = await TestResult.findById(resultId).populate("student");
    if (!test || !testResult || testResult.test.toString() !== testId) {
      return fail(res, 404, "Test result not found");
    }

    // Check ownership for teachers
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    let assessment = await TestAssessment.findOneAndUpdate(
      { testResult: resultId, test: testId },
      {
        testResult: resultId,
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
        submittedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Notify student about assessment
    await Notification.create({
      userId: testResult.student._id,
      title: "Assessment received",
      message: `Your assessment for test has been submitted. Grade: ${grade}`,
      type: "info",
      category: "exam",
      link: `/dashboard/student/tests/results/${resultId}`
    }).catch((err) => console.error("Notification error:", err));

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
    const test = await Test.findById(testId);
    if (!test) return fail(res, 404, "Test not found");

    // Check ownership for teachers
    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    const assessments = await TestAssessment.find({ test: testId })
      .populate("student", "name email nirmaanId")
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

    // Check teacher authorization
    if (req.user.role === "teacher") {
      const test = await Test.findById(testId);
      if (test && test.createdBy.toString() !== req.user.sub) {
        return fail(res, 403, "Unauthorized");
      }
    }

    const assessment = await TestAssessment.findOne({
      testResult: resultId,
      test: testId,
    })
      .populate("teacher", "name email")
      .populate("student", "name email nirmaanId");

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

// GET /api/tests/:id/report - CSV report (teacher/admin)
router.get("/:id/report", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const payload = await getReportPayload(req.params.id, req.user);
    if (payload.error) return fail(res, payload.error.status, payload.error.message);
    const { test } = payload;

    // Build CSV of questions and correct answers
    let csv = `Exam Report: ${test.title}\nCourse: ${test.course}\nTotal Marks: ${test.totalMarks}\n\n`;
    csv += 'Q.No,Question,Option A,Option B,Option C,Option D,Correct Option,Marks\n';
    test.questions.forEach((q, idx) => {
      const correct = typeof q.answer === 'number' && q.options[q.answer] ? q.options[q.answer] : '';
      const row = `"${idx + 1}","${q.prompt.replace(/"/g, '""')}","${(q.options[0]||'').replace(/"/g,'""')}","${(q.options[1]||'').replace(/"/g,'""')}","${(q.options[2]||'').replace(/"/g,'""')}","${(q.options[3]||'').replace(/"/g,'""')}","${correct.replace(/"/g,'""')}","${q.marks || 0}"\n`;
      csv += row;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="exam_${test._id}_questions.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('Report generation error:', error);
    return fail(res, 500, 'Failed to generate report: ' + error.message);
  }
});

// GET /api/tests/:id/report/pdf - PDF report with exam and student details
router.get("/:id/report/pdf", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const payload = await getReportPayload(req.params.id, req.user);
    if (payload.error) return fail(res, payload.error.status, payload.error.message);

    const { test, results } = payload;
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="exam_${test._id}_report.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).text("NIRMAAN - EXAM REPORT", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Exam: ${test.title}`);
    doc.text(`Course: ${test.course}`);
    doc.text(`Total Marks: ${test.totalMarks}`);
    doc.text(`Questions: ${test.questions.length}`);
    doc.text(`Submissions: ${results.length}`);
    doc.moveDown();

    doc.fontSize(14).text("Question Bank", { underline: true });
    doc.moveDown(0.5);
    test.questions.forEach((q, idx) => {
      if (doc.y > 730) doc.addPage();
      const correct = typeof q.answer === "number" && q.options[q.answer] ? q.options[q.answer] : "";
      doc.fontSize(11).text(`${idx + 1}. ${q.prompt}`);
      doc.fontSize(10).text(`   A) ${q.options[0] || ""}`);
      doc.text(`   B) ${q.options[1] || ""}`);
      doc.text(`   C) ${q.options[2] || ""}`);
      doc.text(`   D) ${q.options[3] || ""}`);
      doc.text(`   Correct: ${correct} | Marks: ${q.marks || 0}`);
      doc.moveDown(0.6);
    });

    if (results.length > 0) {
      doc.addPage();
      doc.fontSize(14).text("Student Submissions", { underline: true });
      doc.moveDown(0.5);
      results.forEach((result, index) => {
        if (doc.y > 730) doc.addPage();
        const percent = test.totalMarks > 0 ? ((result.score / test.totalMarks) * 100).toFixed(2) : "0.00";
        doc.fontSize(11).text(`${index + 1}. ${result.student?.name || "Unknown"} (${result.student?.email || "-"})`);
        doc.fontSize(10).text(`   Score: ${result.score}/${test.totalMarks} (${percent}%) | Status: ${result.status || "submitted"}`);
        if (result.cheatingDetails) {
          doc.fillColor("red").text(`   Cheating: ${result.cheatingDetails.reason || "Suspicious activity"}`);
          doc.fillColor("black");
        }
        doc.moveDown(0.4);
      });
    }

    doc.end();
  } catch (error) {
    console.error("PDF report generation error:", error);
    return fail(res, 500, "Failed to generate PDF report: " + error.message);
  }
});

// GET /api/tests/:id/report/doc - DOCX report with exam and student details
router.get("/:id/report/doc", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const payload = await getReportPayload(req.params.id, req.user);
    if (payload.error) return fail(res, payload.error.status, payload.error.message);

    const { test, results } = payload;
    const children = [
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: "NIRMAAN - EXAM REPORT", bold: true })],
      }),
      new Paragraph({ children: [new TextRun(`Exam: ${test.title}`)] }),
      new Paragraph({ children: [new TextRun(`Course: ${test.course}`)] }),
      new Paragraph({ children: [new TextRun(`Total Marks: ${test.totalMarks}`)] }),
      new Paragraph({ children: [new TextRun(`Questions: ${test.questions.length}`)] }),
      new Paragraph({ children: [new TextRun(`Submissions: ${results.length}`)] }),
      new Paragraph({ text: "" }),
      new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Question Bank" }),
    ];

    test.questions.forEach((q, idx) => {
      const correct = typeof q.answer === "number" && q.options[q.answer] ? q.options[q.answer] : "";
      children.push(new Paragraph({ children: [new TextRun({ text: `${idx + 1}. ${q.prompt}`, bold: true })] }));
      children.push(new Paragraph({ text: `A) ${q.options[0] || ""}` }));
      children.push(new Paragraph({ text: `B) ${q.options[1] || ""}` }));
      children.push(new Paragraph({ text: `C) ${q.options[2] || ""}` }));
      children.push(new Paragraph({ text: `D) ${q.options[3] || ""}` }));
      children.push(new Paragraph({ text: `Correct: ${correct} | Marks: ${q.marks || 0}` }));
      children.push(new Paragraph({ text: "" }));
    });

    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Student Submissions" }));
    results.forEach((result, index) => {
      const percent = test.totalMarks > 0 ? ((result.score / test.totalMarks) * 100).toFixed(2) : "0.00";
      children.push(new Paragraph({ children: [new TextRun({ text: `${index + 1}. ${result.student?.name || "Unknown"}`, bold: true })] }));
      children.push(new Paragraph({ text: `Email: ${result.student?.email || "-"}` }));
      children.push(new Paragraph({ text: `Score: ${result.score}/${test.totalMarks} (${percent}%)` }));
      children.push(new Paragraph({ text: `Status: ${result.status || "submitted"}` }));
      if (result.cheatingDetails) {
        children.push(new Paragraph({ text: `Cheating: ${result.cheatingDetails.reason || "Suspicious activity"}` }));
      }
      children.push(new Paragraph({ text: "" }));
    });

    const doc = new DocxDocument({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="exam_${test._id}_report.docx"`);
    return res.send(buffer);
  } catch (error) {
    console.error("DOC report generation error:", error);
    return fail(res, 500, "Failed to generate DOC report: " + error.message);
  }
});

// Get test statistics for teacher
router.get("/:id/stats", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return fail(res, 404, "Test not found");

    if (req.user.role === "teacher" && test.createdBy.toString() !== req.user.sub) {
      return fail(res, 403, "Unauthorized");
    }

    const totalResults = await TestResult.countDocuments({ test: req.params.id, submittedAt: { $exists: true } });
    const avgScore = await TestResult.aggregate([
      { $match: { test: test._id, submittedAt: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);

    const topScorers = await TestResult.find({ test: req.params.id, submittedAt: { $exists: true } })
      .populate("student", "name nirmaanId email")
      .sort({ score: -1 })
      .limit(5);

    return ok(res, {
      totalSubmissions: totalResults,
      averageScore: avgScore[0]?.avgScore || 0,
      topScorers,
      totalMarks: test.totalMarks
    }, "Test statistics retrieved");
  } catch (error) {
    console.error("Stats error:", error);
    return fail(res, 500, "Failed to get stats: " + error.message);
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

// Proctoring endpoints

// Log proctoring event
router.post("/proctoring/log-event", auth(["student"]), async (req, res) => {
  try {
    const { testId, eventType, metadata } = req.body;
    const ProctoringService = require("../utils/proctoring");
    
    await ProctoringService.logEvent(req.user.sub, testId, eventType, {
      ...metadata,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    return ok(res, {}, "Event logged");
  } catch (error) {
    console.error("Log event error:", error);
    return fail(res, 500, "Failed to log event");
  }
});

// Get proctoring report for a test
router.get("/proctoring/report/:testId", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.query.userId || req.user.sub;
    const userRole = req.user.role;

    // Students can only view their own reports
    if (userRole === "student" && userId !== req.user.sub) {
      return fail(res, 403, "Forbidden: Cannot view other students' proctoring reports");
    }

    const ProctoringService = require("../utils/proctoring");
    const report = await ProctoringService.getProctoringReport(userId, testId);

    if (!report) {
      return fail(res, 404, "Proctoring report not found");
    }

    return ok(res, report, "Proctoring report retrieved");
  } catch (error) {
    console.error("Get proctoring report error:", error);
    return fail(res, 500, "Failed to retrieve report");
  }
});

// Get flagged tests for review (teacher/admin only)
router.get("/proctoring/flagged", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const ProctoringService = require("../utils/proctoring");
    const teacherId = req.user.role === "teacher" ? req.user.sub : null;
    const flags = await ProctoringService.getFlaggedTests(teacherId);
    return ok(res, flags, "Flagged tests retrieved");
  } catch (error) {
    console.error("Get flagged tests error:", error);
    return fail(res, 500, "Failed to retrieve flagged tests");
  }
});

// Create a short-lived proctoring session URL (returns URL with signed token)
router.post("/proctoring/session", async (req, res) => {
  try {
    const env = require("../config/env");
    const jwt = require("jsonwebtoken");
    const { testId } = req.body || {};

    const header = req.headers.authorization || "";
    const authToken = header.startsWith("Bearer ") ? header.slice(7) : null;

    let sessionUser = null;
    if (authToken) {
      try {
        sessionUser = jwt.verify(authToken, env.jwtSecret);
      } catch (error) {
        if (env.nodeEnv === "production") {
          return fail(res, 401, "Invalid token");
        }
      }
    } else if (env.nodeEnv === "production") {
      return fail(res, 401, "Unauthorized");
    }

    if (!sessionUser) {
      sessionUser = {
        sub: req.body?.sub || "guest-proctoring",
        role: req.body?.role || "student",
        name: req.body?.name || "Guest Learner",
        email: req.body?.email || "guest@nirmaan.local",
      };
    }

    // Build proctoring token payload. Include name/email so the Flask proctoring UI can display the real user.
    const User = require('../models/User');
    let userInfo = { name: null, email: null };
    try {
      const u = sessionUser?.sub && sessionUser.sub !== 'guest-proctoring'
        ? await User.findById(sessionUser.sub).select('name email').lean()
        : null;
      if (u) userInfo = { name: u.name, email: u.email };
    } catch (e) {
      console.warn('Could not load user info for proctoring token:', e.message || e);
    }

    const payload = {
      sub: sessionUser.sub,
      role: sessionUser.role,
      name: userInfo.name || sessionUser.name,
      email: userInfo.email || sessionUser.email,
      testId: testId || null,
      proctoring: true,
    };

    // Short expiry for proctoring sessions
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '10m' });

    // Proctoring service base URL (configured in env or default)
    const proctorBase = process.env.PROCTORING_URL || process.env.NEXT_PUBLIC_PROCTORING_URL || (process.env.PROCTORING_HOST || 'http://127.0.0.1:5001');
    const launchPath = '/proctoring-launch';
    const url = `${proctorBase.replace(/\/$/, '')}${launchPath}?token=${encodeURIComponent(token)}` + (testId ? `&testId=${encodeURIComponent(testId)}` : '');

    return ok(res, { url, expiresIn: 600 }, "Proctoring session created");
  } catch (error) {
    console.error("Create proctoring session error:", error);
    return fail(res, 500, "Failed to create proctoring session");
  }
});

// Review flagged test
router.post("/proctoring/flag/:flagId/review", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const { flagId } = req.params;
    const { status, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return fail(res, 400, "Status must be 'approved' or 'rejected'");
    }

    const ProctoringFlag = require("../models/ProctoringFlag");
    const flag = await ProctoringFlag.findByIdAndUpdate(
      flagId,
      {
        status,
        reviewNotes: notes,
        reviewedBy: req.user.sub,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!flag) {
      return fail(res, 404, "Flag not found");
    }

    await logAction(req.user.sub, "test.proctoring.review", {
      flagId,
      status,
      studentId: flag.userId,
      testId: flag.testId,
    });

    return ok(res, flag, `Test flagged as ${status}`);
  } catch (error) {
    console.error("Review flag error:", error);
    return fail(res, 500, "Failed to review flag");
  }
});

module.exports = router;

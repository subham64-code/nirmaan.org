/**
 * Proctoring Service - Tracks and validates anti-cheating measures
 * Monitors: Tab switches, fullscreen exits, copy/paste, right-click attempts
 */

const ProctoringLog = require("../models/ProctoringLog");

class ProctoringService {
  /**
   * Log a proctoring event
   * @param {string} userId - User attempting the exam
   * @param {string} testId - Test/Exam ID
   * @param {string} eventType - Type of event (tab_switch, fullscreen_exit, copy_paste, right_click, etc)
   * @param {object} metadata - Additional event metadata
   */
  static async logEvent(userId, testId, eventType, metadata = {}) {
    try {
      const severity = this.getSeverity(eventType);
      const event = new ProctoringLog({
        userId,
        testId,
        eventType,
        timestamp: new Date(),
        metadata,
        severity,
      });
      
      await event.save();

      if (["medium", "high", "critical"].includes(severity)) {
        try {
          const Test = require("../models/Test");
          const Notification = require("../models/Notification");
          const User = require("../models/User");

          const test = await Test.findById(testId).select("title createdBy");
          if (test) {
            const recipients = [];

            if (test.createdBy) {
              recipients.push(Notification.create({
                userId: test.createdBy,
                title: "Proctoring alert",
                message: `Suspicious activity was detected for exam '${test.title}' during a student attempt.`,
                type: "warning",
                category: "exam",
                link: `/dashboard/teacher/tests/${test._id}/results`,
                metadata: { testId, userId, eventType, severity, metadata },
              }));
            }

            const admins = await User.find({ role: "admin" }).select("_id");
            admins.forEach((admin) => {
              recipients.push(Notification.create({
                userId: admin._id,
                title: "Cheating detected",
                message: `Suspicious activity '${eventType}' was detected during exam '${test.title}'. Review the result and proctoring log.`,
                type: "warning",
                category: "system",
                link: `/dashboard/admin/exam-reviews`,
                metadata: { testId, userId, eventType, severity, metadata },
              }));
            });

            await Promise.all(recipients);
          }
        } catch (notifyError) {
          console.error("Failed to create proctoring notifications:", notifyError);
        }
      }

      return event;
    } catch (error) {
      console.error("Failed to log proctoring event:", error);
      return null;
    }
  }

  /**
   * Get severity level for an event type
   */
  static getSeverity(eventType) {
    const severityMap = {
      tab_switch: "high",
      fullscreen_exit: "high",
      copy_paste: "critical",
      right_click: "medium",
      window_blur: "medium",
      network_change: "medium",
      keyboard_shortcut: "low",
      text_selection: "medium",
      screenshot_attempt: "high",
      copy_attempt: "medium",
      paste_attempt: "medium",
      cut_attempt: "medium",
      camera_denied: "medium",
      face_not_visible: "high",
      eyes_closed: "medium",
      gaze_away: "high",
      multiple_people: "critical",
      facial_expression_alert: "low",
    };
    return severityMap[eventType] || "low";
  }

  /**
   * Get proctoring report for a test
   * @param {string} userId - User ID
   * @param {string} testId - Test ID
   */
  static async getProctoringReport(userId, testId) {
    try {
      const events = await ProctoringLog.find({ userId, testId }).sort({ timestamp: 1 });
      
      // Categorize events by type
      const eventsByType = {};
      events.forEach((event) => {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      });

      // Count severity levels
      const severityCount = {};
      events.forEach((event) => {
        severityCount[event.severity] = (severityCount[event.severity] || 0) + 1;
      });

      const criticalViolations = severityCount.critical || 0;
      const highViolations = severityCount.high || 0;
      const mediumViolations = severityCount.medium || 0;

      // Calculate integrity score (0-100)
      const totalViolations = events.length;
      const integrityScore = Math.max(0, 100 - (criticalViolations * 30 + highViolations * 15 + mediumViolations * 5));

      return {
        events,
        eventsByType,
        severityCount,
        statistics: {
          totalEvents: events.length,
          criticalViolations,
          highViolations,
          mediumViolations,
          integrityScore: Math.round(integrityScore),
          flagged: criticalViolations > 0 || highViolations > 2,
        },
      };
    } catch (error) {
      console.error("Failed to get proctoring report:", error);
      return null;
    }
  }

  /**
   * Flag a test for manual review based on proctoring violations
   * @param {string} userId - User ID
   * @param {string} testId - Test ID
   */
  static async flagTestForReview(userId, testId, reason) {
    try {
      const ProctoringFlag = require("../models/ProctoringFlag");
      const flag = new ProctoringFlag({
        userId,
        testId,
        reason,
        flaggedAt: new Date(),
        status: "pending_review",
      });
      await flag.save();
      return flag;
    } catch (error) {
      console.error("Failed to flag test:", error);
      return null;
    }
  }

  /**
   * Get all flagged tests for review
   * @param {string} teacherId - Teacher ID (optional filter)
   */
  static async getFlaggedTests(teacherId = null) {
    try {
      const ProctoringFlag = require("../models/ProctoringFlag");
      let query = { status: "pending_review" };
      if (teacherId) {
        query.teacherId = teacherId;
      }
      const flags = await ProctoringFlag.find(query)
        .populate("userId", "name email")
        .populate("testId", "title course")
        .sort({ flaggedAt: -1 });
      return flags;
    } catch (error) {
      console.error("Failed to get flagged tests:", error);
      return [];
    }
  }
}

module.exports = ProctoringService;

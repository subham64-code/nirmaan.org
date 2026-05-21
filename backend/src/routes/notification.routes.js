const express = require("express");
const Notification = require("../models/Notification");
const { ok, fail } = require("../utils/apiResponse");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all notifications for current user
router.get("/", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { userId: req.user.sub };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user.sub, isRead: false });

    return ok(res, {
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    }, "Notifications retrieved");
  } catch (error) {
    console.error("Get notifications error:", error);
    return fail(res, 500, "Failed to retrieve notifications");
  }
});

// Get unread count only
router.get("/unread-count", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.sub, isRead: false });
    return ok(res, { count }, "Unread count retrieved");
  } catch (error) {
    return fail(res, 500, "Failed to get unread count");
  }
});

// Mark notification as read
router.patch("/:id/read", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return fail(res, 404, "Notification not found");
    }

    return ok(res, notification, "Notification marked as read");
  } catch (error) {
    return fail(res, 500, "Failed to mark notification as read");
  }
});

// Mark all as read
router.patch("/mark-all-read", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.sub, isRead: false },
      { isRead: true }
    );

    return ok(res, {}, "All notifications marked as read");
  } catch (error) {
    return fail(res, 500, "Failed to mark all as read");
  }
});

// Clear all notifications
router.delete("/clear-all", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user.sub });
    return ok(res, { deletedCount: result.deletedCount || 0 }, "All notifications cleared");
  } catch (error) {
    return fail(res, 500, "Failed to clear notifications");
  }
});

// Delete notification
router.delete("/:id", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!notification) {
      return fail(res, 404, "Notification not found");
    }

    return ok(res, {}, "Notification deleted");
  } catch (error) {
    return fail(res, 500, "Failed to delete notification");
  }
});

// Create notification (admin/teacher only)
router.post("/", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const { userId, title, message, type, category, link, metadata } = req.body;

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || "info",
      category: category || "general",
      link,
      metadata,
    });

    return ok(res, notification, "Notification created");
  } catch (error) {
    console.error("Create notification error:", error);
    return fail(res, 500, "Failed to create notification");
  }
});

// Broadcast notification to all users in a role (admin only)
router.post("/broadcast", auth(["admin"]), async (req, res) => {
  try {
    const { role, title, message, type, category, link } = req.body;

    const User = require("../models/User");
    const users = await User.find({ role }).select("_id");

    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          userId: user._id,
          title,
          message,
          type: type || "info",
          category: category || "general",
          link,
        })
      )
    );

    return ok(res, { count: notifications.length }, `Notification sent to ${notifications.length} ${role}s`);
  } catch (error) {
    console.error("Broadcast notification error:", error);
    return fail(res, 500, "Failed to broadcast notification");
  }
});

module.exports = router;

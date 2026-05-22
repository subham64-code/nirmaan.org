const express = require("express");
const Attendance = require("../models/Attendance");
const AttendanceCheckIn = require("../models/AttendanceCheckIn");
const auth = require("../middleware/auth");
const { ok, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");

const router = express.Router();

router.post("/mark", auth(["teacher", "admin"]), async (req, res) => {
  const { studentId, date, status } = req.body;
  if (!studentId || !date || !["Present", "Absent", "Late"].includes(status)) {
    return fail(res, 400, "studentId, date, and valid status are required");
  }

  const attendance = await Attendance.findOneAndUpdate(
    { student: studentId, date },
    { student: studentId, date, status, markedBy: req.user.sub },
    { upsert: true, new: true }
  );

  await logAction(req.user.sub, "attendance.mark", { studentId, date, status });
  return ok(res, attendance, "Attendance updated");
});

router.get("/student/:studentId", auth(["student", "teacher", "admin"]), async (req, res) => {
  const { studentId } = req.params;
  const records = await Attendance.find({ student: studentId }).sort({ date: 1 });
  return ok(res, records);
});

// Authenticated check-in route (for logged-in students)
router.post("/check-in", auth(["student", "teacher", "admin"]), async (req, res) => {
  const {
    name,
    nirmaanId,
    status = "Present",
    centerId = "general",
    centerName = "General Center",
    city = "India",
    state = "India",
    locationName = "",
    mediaId = "",
    mediaTitle = "",
    mediaType = "none",
    deviceLat,
    deviceLng,
    deviceAccuracy,
    distanceKm,
    note = "",
    source = "web",
  } = req.body || {};

  // Validate user role - students can only check in themselves
  const userId = req.user.sub;
  const userRole = req.user.role;

  if (userRole === "student" && !name) {
    return fail(res, 400, "name is required for student check-in");
  }

  if (!["Present", "Absent", "Late", "Excused"].includes(status)) {
    return fail(res, 400, "status must be Present, Absent, Late, or Excused");
  }

  const dateKey = new Date().toISOString().slice(0, 10);
  const cleanName = String(name).trim() || req.user.name || "Unknown";
  const cleanNirmaanId = nirmaanId ? String(nirmaanId).trim() : (req.user.nirmaanId || "");

  // Use userId as the primary identifier
  const checkInKey = `${userId}-${dateKey}-${centerId || "general"}`.toLowerCase();

  const record = await AttendanceCheckIn.findOneAndUpdate(
    { checkInKey },
    {
      checkInKey,
      name: cleanName,
      nirmaanId: cleanNirmaanId,
      userId, // Always include userId for authenticated users
      status,
      centerId,
      centerName,
      city,
      state,
      locationName,
      mediaId,
      mediaTitle,
      mediaType,
      deviceLat,
      deviceLng,
      deviceAccuracy,
      distanceKm,
      note,
      source,
      dateKey,
      checkInAt: new Date(),
      userRole, // Log the user role
      verified: true, // AUTO-CHECKED / AUTO-VERIFIED BY DEFAULT
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ok(res, record, "Attendance check-in saved");
});

router.get("/summary", async (_req, res) => {
  const records = await AttendanceCheckIn.find().sort({ checkInAt: -1 }).limit(200);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter((record) => record.dateKey === todayKey);

  const centerMap = new Map();
  for (const record of records) {
    const key = record.centerId || "general";
    if (!centerMap.has(key)) {
      centerMap.set(key, {
        centerId: key,
        centerName: record.centerName,
        city: record.city,
        state: record.state,
        total: 0,
        present: 0,
        latestCheckIn: record.checkInAt,
      });
    }

    const item = centerMap.get(key);
    item.total += 1;
    if (record.status === "Present") item.present += 1;
    if (record.checkInAt && new Date(record.checkInAt) > new Date(item.latestCheckIn)) {
      item.latestCheckIn = record.checkInAt;
    }
  }

  const centerStats = Array.from(centerMap.values()).map((item) => ({
    ...item,
    attendanceRate: item.total ? Math.round((item.present / item.total) * 100) : 0,
  }));

  const todayPresent = todayRecords.filter((record) => record.status === "Present").length;
  const averageDistanceKm = records.length
    ? Number((records.filter((record) => typeof record.distanceKm === "number").reduce((sum, record) => sum + Number(record.distanceKm || 0), 0) /
        Math.max(records.filter((record) => typeof record.distanceKm === "number").length, 1)).toFixed(2))
    : 0;

  return ok(res, {
    totals: {
      allTime: records.length,
      today: todayRecords.length,
      todayPresent,
      averageDistanceKm,
      centerCount: centerStats.length,
    },
    centerStats,
    recentRecords: records.slice(0, 12),
  }, "Attendance summary loaded");
});

// Student self check-in
router.post("/self-checkin", auth(["student"]), async (req, res) => {
  try {
    const { status = "Present", note = "" } = req.body;
    const userId = req.user.sub;
    const dateKey = new Date().toISOString().slice(0, 10);

    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user) {
      return fail(res, 404, "User not found");
    }

    const checkInKey = `${userId}-${dateKey}`.toLowerCase();

    const record = await AttendanceCheckIn.findOneAndUpdate(
      { checkInKey },
      {
        checkInKey,
        name: user.name,
        nirmaanId: user.nirmaanId || "",
        userId,
        status,
        centerId: "self-checkin",
        centerName: "Student Self Check-in",
        dateKey,
        checkInAt: new Date(),
        note,
        source: "student-portal",
        verified: true, // AUTO-CHECKED / AUTO-VERIFIED BY DEFAULT
      },
      { upsert: true, new: true }
    );

    return ok(res, record, "Attendance check-in recorded");
  } catch (error) {
    console.error("Self check-in error:", error);
    return fail(res, 500, "Failed to record attendance");
  }
});

// Get my attendance (for students)
router.get("/my-attendance", auth(["student"]), async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.sub;

    let query = { userId };
    
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      query.dateKey = { $gte: startDate, $lte: endDate };
    }

    const records = await AttendanceCheckIn.find(query).sort({ dateKey: -1 });
    
    // Calculate stats
    const total = records.length;
    const present = records.filter(r => r.status === "Present").length;
    const absent = records.filter(r => r.status === "Absent").length;
    const late = records.filter(r => r.status === "Late").length;

    return ok(res, {
      records,
      stats: {
        total,
        present,
        absent,
        late,
        attendanceRate: total ? Math.round((present / total) * 100) : 0,
      },
    }, "Attendance records retrieved");
  } catch (error) {
    console.error("Get my attendance error:", error);
    return fail(res, 500, "Failed to retrieve attendance");
  }
});

// Get attendance report (for teacher/admin)
router.get("/report", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const { date, centerId, status } = req.query;
    const userRole = req.user.role;
    
    let query = {};
    if (date) query.dateKey = date;
    if (centerId) query.centerId = centerId;
    if (status) query.status = status;

    const records = await AttendanceCheckIn.find(query)
      .populate("userId", "name email nirmaanId")
      .sort({ checkInAt: -1 });


    return ok(res, records, "Attendance report retrieved");
  } catch (error) {
    console.error("Get attendance report error:", error);
    return fail(res, 500, "Failed to retrieve report");
  }
});

// Get monthly attendance stats
router.get("/stats/monthly", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const userId = req.user.sub;
    const userRole = req.user.role;

    let query = {};
    if (userRole === "student") {
      query.userId = userId;
    }
    query.dateKey = { $regex: `^${year}` };

    const records = await AttendanceCheckIn.find(query);
    
    // Group by month
    const monthlyStats = {};
    for (let i = 1; i <= 12; i++) {
      monthlyStats[i] = { month: i, present: 0, absent: 0, late: 0, total: 0 };
    }

    records.forEach(record => {
      const month = parseInt(record.dateKey.split('-')[1]);
      monthlyStats[month].total++;
      if (record.status === "Present") monthlyStats[month].present++;
      else if (record.status === "Absent") monthlyStats[month].absent++;
      else if (record.status === "Late") monthlyStats[month].late++;
    });

    return ok(res, { monthlyStats: Object.values(monthlyStats), year }, "Monthly stats retrieved");
  } catch (error) {
    console.error("Get monthly stats error:", error);
    return fail(res, 500, "Failed to retrieve stats");
  }
});

// Get day-wise attendance analytics
router.get("/analytics/daywise", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const queryYear = year || currentDate.getFullYear();
    const queryMonth = month || (currentDate.getMonth() + 1);

    const startDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-01`;
    const endDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-31`;

    const records = await AttendanceCheckIn.find({
      dateKey: { $gte: startDate, $lte: endDate }
    }).sort({ dateKey: 1 });

    // Group by day
    const dayWiseStats = {};
    records.forEach(record => {
      const day = record.dateKey.split('-')[2];
      if (!dayWiseStats[day]) {
        dayWiseStats[day] = { day, present: 0, absent: 0, late: 0, total: 0 };
      }
      dayWiseStats[day].total++;
      if (record.status === "Present") dayWiseStats[day].present++;
      else if (record.status === "Absent") dayWiseStats[day].absent++;
      else if (record.status === "Late") dayWiseStats[day].late++;
    });

    return ok(res, { dayWiseStats: Object.values(dayWiseStats), month: queryMonth, year: queryYear }, "Day-wise analytics retrieved");
  } catch (error) {
    console.error("Get day-wise analytics error:", error);
    return fail(res, 500, "Failed to retrieve analytics");
  }
});

// Get attendance percentage by student
router.get("/analytics/student-percentage", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const queryYear = year || currentDate.getFullYear();
    const queryMonth = month || (currentDate.getMonth() + 1);

    const startDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-01`;
    const endDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-31`;

    const records = await AttendanceCheckIn.find({
      dateKey: { $gte: startDate, $lte: endDate }
    });

    // Group by student (name or nirmaanId)
    const studentStats = {};
    records.forEach(record => {
      const studentKey = record.nirmaanId || record.name;
      if (!studentStats[studentKey]) {
        studentStats[studentKey] = {
          student: record.name,
          nirmaanId: record.nirmaanId,
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      }
      studentStats[studentKey].total++;
      if (record.status === "Present") studentStats[studentKey].present++;
      else if (record.status === "Absent") studentStats[studentKey].absent++;
      else if (record.status === "Late") studentStats[studentKey].late++;
    });

    // Calculate percentages
    const studentList = Object.values(studentStats).map(stat => ({
      ...stat,
      attendancePercentage: stat.total ? Math.round((stat.present / stat.total) * 100) : 0
    })).sort((a, b) => b.attendancePercentage - a.attendancePercentage);

    return ok(res, { studentList, month: queryMonth, year: queryYear }, "Student attendance percentages retrieved");
  } catch (error) {
    console.error("Get student percentage error:", error);
    return fail(res, 500, "Failed to retrieve percentages");
  }
});

// Get GPS-based attendance locations
router.get("/analytics/gps-locations", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const queryYear = year || currentDate.getFullYear();
    const queryMonth = month || (currentDate.getMonth() + 1);

    const startDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-01`;
    const endDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-31`;

    const records = await AttendanceCheckIn.find({
      dateKey: { $gte: startDate, $lte: endDate },
      deviceLat: { $exists: true, $ne: null },
      deviceLng: { $exists: true, $ne: null }
    }).sort({ checkInAt: -1 });

    // Group by location with GPS data
    const locationStats = {};
    records.forEach(record => {
      const locKey = `${record.centerId || record.centerName}`;
      if (!locationStats[locKey]) {
        locationStats[locKey] = {
          centerId: record.centerId,
          centerName: record.centerName,
          city: record.city,
          state: record.state,
          checkins: 0,
          avgLat: 0,
          avgLng: 0,
          latValues: [],
          lngValues: []
        };
      }
      locationStats[locKey].checkins++;
      locationStats[locKey].latValues.push(record.deviceLat);
      locationStats[locKey].lngValues.push(record.deviceLng);
    });

    // Calculate averages
    const gpsLocations = Object.values(locationStats).map(loc => ({
      ...loc,
      avgLat: (loc.latValues.reduce((a, b) => a + b, 0) / loc.latValues.length).toFixed(6),
      avgLng: (loc.lngValues.reduce((a, b) => a + b, 0) / loc.lngValues.length).toFixed(6),
      latValues: undefined,
      lngValues: undefined
    }));

    return ok(res, { gpsLocations, month: queryMonth, year: queryYear, totalRecords: records.length }, "GPS locations retrieved");
  } catch (error) {
    console.error("Get GPS locations error:", error);
    return fail(res, 500, "Failed to retrieve GPS data");
  }
});

// GPS Verification Endpoint - verify attendance with GPS coordinates
router.post("/verify-gps", async (req, res) => {
  try {
    const { 
      deviceLat, 
      deviceLng, 
      deviceAccuracy,
      centerName,
      centerLat,
      centerLng,
      geofenceRadiusKm = 0.5 
    } = req.body;

    if (!deviceLat || !deviceLng) {
      return fail(res, 400, "Device location coordinates are required");
    }

    // Haversine formula to calculate distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in km
    };

    let isWithinGeofence = true;
    let distanceKm = 0;

    if (centerLat && centerLng) {
      distanceKm = calculateDistance(deviceLat, deviceLng, centerLat, centerLng);
      isWithinGeofence = distanceKm <= geofenceRadiusKm;
    }

    const accuracy = Math.round(deviceAccuracy || 0);
    const verificationStatus = {
      isValid: isWithinGeofence && accuracy < 50, // Valid if within geofence and accuracy < 50m
      isWithinGeofence,
      distanceKm: parseFloat(distanceKm.toFixed(3)),
      accuracy,
      location: { lat: deviceLat, lng: deviceLng },
      message: isWithinGeofence 
        ? `GPS verified: ${distanceKm.toFixed(2)}km from center`
        : `GPS warning: ${distanceKm.toFixed(2)}km from center (outside geofence)`
    };

    return ok(res, verificationStatus, "GPS verification completed");
  } catch (error) {
    console.error("GPS verification error:", error);
    return fail(res, 500, "Failed to verify GPS coordinates");
  }
});

// Get student attendance verification status
router.get("/student/:studentId/verification", auth(["student", "teacher", "admin"]), async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    const todayRecord = await AttendanceCheckIn.findOne({
      $or: [
        { userId: studentId },
        { nirmaanId: studentId },
        { name: studentId }
      ],
      dateKey: today
    });

    if (!todayRecord) {
      return ok(res, { 
        verified: false, 
        message: "No attendance record for today",
        status: null,
        verificationMethod: null
      });
    }

    const verificationStatus = {
      verified: true,
      message: "Attendance verified",
      status: todayRecord.status,
      verificationMethod: todayRecord.source || "unknown",
      checkInTime: todayRecord.checkInAt,
      centerName: todayRecord.centerName,
      accuracy: todayRecord.deviceAccuracy,
      distance: todayRecord.distanceKm,
      timestamp: todayRecord.checkInAt
    };

    return ok(res, verificationStatus, "Student verification status retrieved");
  } catch (error) {
    console.error("Get verification status error:", error);
    return fail(res, 500, "Failed to retrieve verification status");
  }
});

// Approve/Reject attendance record
router.post("/:recordId/verify", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const { recordId } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return fail(res, 400, "verified status must be a boolean");
    }

    const record = await AttendanceCheckIn.findByIdAndUpdate(
      recordId,
      {
        verified,
        verificationApprovedBy: req.user.sub,
        verificationApprovedAt: new Date()
      },
      { new: true }
    );

    if (!record) {
      return fail(res, 404, "Attendance record not found");
    }

    await logAction(req.user.sub, "attendance.verify", { 
      recordId, 
      verified,
      studentName: record.name 
    });

    return ok(res, record, `Attendance ${verified ? 'approved' : 'rejected'} successfully`);
  } catch (error) {
    console.error("Attendance verification error:", error);
    return fail(res, 500, "Failed to verify attendance");
  }
});

// Auto-verify pending attendance in bulk (useful after imports/uploads)
router.post("/verify/pending", auth(["teacher", "admin"]), async (req, res) => {
  try {
    const dateKey = req.body?.dateKey || new Date().toISOString().slice(0, 10);
    const result = await AttendanceCheckIn.updateMany(
      { dateKey, verified: { $ne: true } },
      {
        $set: {
          verified: true,
          verificationApprovedBy: req.user.sub,
          verificationApprovedAt: new Date(),
        },
      }
    );

    await logAction(req.user.sub, "attendance.verify.bulk", {
      dateKey,
      modifiedCount: result.modifiedCount || 0,
    });

    return ok(res, { dateKey, modifiedCount: result.modifiedCount || 0 }, "Pending attendance auto-verified");
  } catch (error) {
    console.error("Bulk verify error:", error);
    return fail(res, 500, "Failed to auto-verify attendance");
  }
});

// Trigger automated alerts for low attendance (< 75%)
router.post("/alert/low-attendance", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { threshold = 75 } = req.body;
    
    const User = require("../models/User");
    const Notification = require("../models/Notification");
    
    const students = await User.find({ role: "student" });
    const currentDate = new Date();
    const queryMonth = currentDate.getMonth() + 1;
    const queryYear = currentDate.getFullYear();
    const startDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-01`;
    const endDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-31`;

    let alertsSent = 0;

    for (const student of students) {
      const records = await AttendanceCheckIn.find({
        $or: [{ userId: student._id }, { nirmaanId: student.nirmaanId }, { name: student.name }],
        dateKey: { $gte: startDate, $lte: endDate }
      });

      if (records.length > 0) {
        const total = records.length;
        const present = records.filter(r => r.status === "Present").length;
        const percentage = Math.round((present / total) * 100);

        if (percentage < threshold) {
          // Check if an alert was already sent recently
          const recentAlert = await Notification.findOne({
            userId: student._id,
            category: "attendance_alert",
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          });

          if (!recentAlert) {
            await Notification.create({
              userId: student._id,
              title: "Low Attendance Warning",
              message: `Your attendance is currently at ${percentage}%, which is below the required threshold of ${threshold}%. Please ensure regular attendance.`,
              type: "warning",
              category: "attendance_alert"
            });
            alertsSent++;
          }
        }
      }
    }

    return ok(res, { alertsSent }, `Sent ${alertsSent} low attendance alerts`);
  } catch (error) {
    console.error("Low attendance alert error:", error);
    return fail(res, 500, "Failed to process attendance alerts");
  }
});

// Bulk import attendance (e.g. from Google Sheets)
router.post("/bulk-import", auth(["admin", "teacher"]), async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return fail(res, 400, "Valid records array is required");
    }

    const operations = records.map(record => {
      const { name, nirmaanId, status, dateKey, centerId = "google-sheets" } = record;
      const cleanName = String(name || "").trim();
      const cleanId = String(nirmaanId || "").trim();
      const checkInKey = `${cleanId || cleanName}-${dateKey}-${centerId}`.toLowerCase();

      return {
        updateOne: {
          filter: { checkInKey },
          update: {
            $set: {
              checkInKey,
              name: cleanName,
              nirmaanId: cleanId,
              status: status || "Present",
              dateKey,
              centerId,
              centerName: "Google Sheets Import",
              source: "bulk-import",
              verified: true,
              verificationApprovedBy: req.user.sub,
              verificationApprovedAt: new Date(),
              checkInAt: new Date(),
            }
          },
          upsert: true
        }
      };
    });

    const result = await AttendanceCheckIn.bulkWrite(operations);
    
    await logAction(req.user.sub, "attendance.bulk_import", { 
      count: records.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    });

    return ok(res, {
      received: records.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount
    }, "Bulk attendance import successful");
  } catch (error) {
    console.error("Bulk import error:", error);
    return fail(res, 500, "Failed to process bulk import: " + error.message);
  }
});

module.exports = router;

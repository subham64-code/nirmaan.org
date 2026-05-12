"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, MapPin } from "lucide-react";
import { api } from "@/lib/api";

interface AttendanceRecord {
  _id: string;
  dateKey: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  checkInAt: string;
  centerName: string;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export default function AttendanceWidget() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/my-attendance?month=${selectedMonth}&year=${selectedYear}`);
      setRecords(response.data.data.records);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await api.post("/attendance/self-checkin", {
        status: "Present",
        note: "Checked in via dashboard",
      });
      await fetchAttendance();
      alert("Attendance recorded successfully!");
    } catch (error) {
      console.error("Check-in failed:", error);
      alert("Failed to record attendance. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.dateKey === today);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Late":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Attendance</h2>
            <p className="text-sm text-gray-500">Track your daily attendance</p>
          </div>
        </div>

        {/* Check-in Button */}
        {!todayRecord ? (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Clock className="h-4 w-4" />
            {checkingIn ? "Recording..." : "Check In Today"}
          </button>
        ) : (
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${getStatusColor(todayRecord.status)}`}>
            {getStatusIcon(todayRecord.status)}
            <span className="font-medium">{todayRecord.status}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Total Days</p>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-600 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-800">{stats.present}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-sm text-red-600 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-800">{stats.absent}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600 mb-1">Attendance Rate</p>
            <p className="text-2xl font-bold text-purple-800">{stats.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="flex gap-4 mb-4">
        <label htmlFor="attendance-widget-month" className="sr-only">
          Select month
        </label>
        <select
          id="attendance-widget-month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Select month"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i, 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <label htmlFor="attendance-widget-year" className="sr-only">
          Select year
        </label>
        <select
          id="attendance-widget-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Select year"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Recent Records */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-semibold">Recent Attendance</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No attendance records for this month</p>
            </div>
          ) : (
            records.slice(0, 10).map((record) => (
              <div key={record._id} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium">{new Date(record.dateKey).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.centerName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

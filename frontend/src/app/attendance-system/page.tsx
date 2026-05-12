"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, CheckCircle, AlertCircle, Clock, Search } from "lucide-react";

interface AttendanceSummary {
  totals: {
    allTime: number;
    today: number;
    todayPresent: number;
    averageDistanceKm: number;
    centerCount: number;
  };
  centerStats: Array<{
    centerId: string;
    centerName: string;
    city: string;
    state: string;
    total: number;
    present: number;
    attendanceRate: number;
    latestCheckIn: string;
  }>;
  recentRecords: Array<any>;
}

export default function AttendanceSystem() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string>("all");

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/attendance/summary");
      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      const data = await response.json();
      setSummary(data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load attendance data. Make sure the backend server is running.");
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = selectedCenter === "all" 
    ? summary?.centerStats 
    : summary?.centerStats.filter(c => c.centerId === selectedCenter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">Attendance System</h1>
            <p className="text-xl opacity-90">
              Real-time attendance tracking with geolocation and center management
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Data</h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Stats Cards */}
        {summary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">All Time</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {summary.totals.allTime}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Check-ins</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Today</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {summary.totals.today}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Today's Check-ins</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Present</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {summary.totals.todayPresent}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Present Today</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Centers</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {summary.totals.centerCount}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Centers</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Distance</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {summary.totals.averageDistanceKm}km
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Avg Distance</p>
            </div>
          </motion.div>
        )}

        {/* Filter Section */}
        {summary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Filter by Center
              </h3>
              <label htmlFor="attendance-center-filter" className="sr-only">
                Filter by Center
              </label>
              <select
                id="attendance-center-filter"
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                aria-label="Filter attendance by center"
              >
                <option value="all">All Centers</option>
                {summary.centerStats.map((center) => (
                  <option key={center.centerId} value={center.centerId}>
                    {center.centerName}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Center Stats */}
        {summary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
              Center Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCenters?.map((center, index) => (
                <motion.div
                  key={center.centerId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        {center.centerName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {center.city}, {center.state}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      center.attendanceRate >= 80
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : center.attendanceRate >= 60
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {center.attendanceRate}%
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total Check-ins</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{center.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Present</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{center.present}</span>
                    </div>
                    <progress
                      value={center.attendanceRate}
                      max={100}
                      className={`w-full h-2 rounded-full overflow-hidden ${
                        center.attendanceRate >= 80
                          ? "[&::-webkit-progress-value]:bg-green-600 [&::-moz-progress-bar]:bg-green-600"
                          : center.attendanceRate >= 60
                          ? "[&::-webkit-progress-value]:bg-yellow-600 [&::-moz-progress-bar]:bg-yellow-600"
                          : "[&::-webkit-progress-value]:bg-red-600 [&::-moz-progress-bar]:bg-red-600"
                      } bg-slate-200 dark:bg-slate-700 [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full`}
                      aria-label={`Attendance rate for ${center.centerName}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Records */}
        {summary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
              Recent Check-ins
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Center
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {summary.recentRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-white">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {record.centerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {new Date(record.checkInAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, MapPin, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";

// Prevent static generation for this page
export const dynamic = 'force-dynamic';

interface DayWiseStat {
  day: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface StudentAttendance {
  student: string;
  nirmaanId: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendancePercentage: number;
}

interface GPSLocation {
  centerId: string;
  centerName: string;
  city: string;
  state: string;
  checkins: number;
  avgLat: string;
  avgLng: string;
}

export default function AttendanceAnalyticsPage() {
  const [dayWiseStats, setDayWiseStats] = useState<DayWiseStat[]>([]);
  const [studentList, setStudentList] = useState<StudentAttendance[]>([]);
  const [gpsLocations, setGpsLocations] = useState<GPSLocation[]>([]);
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize month/year on client side only
  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    setMonth(String(today.getMonth() + 1).padStart(2, '0'));
    setYear(String(today.getFullYear()));
  }, []);

  const fetchAnalytics = async () => {
    if (!month || !year) return;
    
    setLoading(true);
    try {
      const [dayWiseRes, studentRes, gpsRes] = await Promise.all([
        api.get(`/attendance/analytics/daywise?month=${month}&year=${year}`),
        api.get(`/attendance/analytics/student-percentage?month=${month}&year=${year}`),
        api.get(`/attendance/analytics/gps-locations?month=${month}&year=${year}`)
      ]);

      setDayWiseStats(dayWiseRes.data.data.dayWiseStats || []);
      setStudentList(studentRes.data.data.studentList || []);
      setGpsLocations(gpsRes.data.data.gpsLocations || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && month && year) {
      fetchAnalytics();
    }
  }, [month, year, isClient]);

  // Safe calculations that handle empty arrays
  let maxPresent = 1;
  if (dayWiseStats && Array.isArray(dayWiseStats) && dayWiseStats.length > 0) {
    const values = dayWiseStats.map(s => s.present || 0);
    maxPresent = Math.max(...values, 1);
  }
  
  const topStudents = (studentList && Array.isArray(studentList)) ? studentList.slice(0, 5) : [];
  const avgAttendance = topStudents.length > 0
    ? Math.round(topStudents.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0) / topStudents.length)
    : 0;

  return (
    <>
      {!isClient ? (
        <div>Loading...</div>
      ) : (
        <DashboardShell
          title="Attendance Analytics"
          subtitle="Day-wise, student-wise, and GPS-based attendance tracking"
          nav={[{ href: "/dashboard/admin", label: "Overview" }]}
        >
          <div className="space-y-8">

        {/* Month/Year Selection */}
        <div className="glass p-6 rounded-2xl flex gap-4 items-end">
          <div>
            <label htmlFor="attendance-analytics-month" className="block text-sm font-medium mb-2">Month</label>
            <select
              id="attendance-analytics-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--outline)] bg-[var(--surface)]"
              aria-label="Select month"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={String(m).padStart(2, '0')}>
                  {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="attendance-analytics-year" className="block text-sm font-medium mb-2">Year</label>
            <input
              id="attendance-analytics-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--outline)] bg-[var(--surface)] w-24"
              aria-label="Select year"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-6 py-2 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Total Students</h3>
            </div>
            <p className="text-3xl font-bold">{studentList.length}</p>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Avg Attendance</h3>
            </div>
            <p className="text-3xl font-bold">{avgAttendance}%</p>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Centers Tracked</h3>
            </div>
            <p className="text-3xl font-bold">{gpsLocations.length}</p>
          </div>
        </div>

        {/* Day-wise Chart */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Day-Wise Attendance
          </h2>
          <div className="overflow-x-auto">
            <div className="flex gap-1 h-64">
              {dayWiseStats.length > 0 ? (
                dayWiseStats.map((stat) => (
                  <div key={stat.day} className="flex-1 flex flex-col items-center justify-end gap-2 pb-4">
                    <progress
                      value={stat.present}
                      max={maxPresent}
                      className="w-full h-64 [writing-mode:vertical-rl] [&::-webkit-progress-bar]:bg-[var(--surface-2)] [&::-webkit-progress-bar]:rounded-t [&::-webkit-progress-value]:bg-[var(--brand)] [&::-webkit-progress-value]:rounded-t"
                      aria-label={`${stat.day} present count`}
                      title={`${stat.present} present`}
                    />
                    <span className="text-xs text-[var(--muted)]">{stat.day}</span>
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center text-[var(--muted)]">
                  No data available for this month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Top Performing Students</h2>
          <div className="space-y-4">
            {topStudents.length > 0 ? (
              topStudents.map((student, idx) => (
                <div key={student.nirmaanId || idx} className="flex items-center justify-between p-4 bg-[var(--surface-2)] rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{student.student}</p>
                    <p className="text-sm text-[var(--muted)]">{student.nirmaanId}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-[var(--muted)]">Present: {student.present}/{student.total}</p>
                      <p className="text-2xl font-bold text-green-500">{student.attendancePercentage}%</p>
                    </div>
                    <div className="w-32 h-6 bg-[var(--surface-3)] rounded-full overflow-hidden">
                      <progress
                        value={student.attendancePercentage}
                        max={100}
                        className="w-full h-6 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-[var(--surface-3)] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-green-500 [&::-webkit-progress-value]:rounded-full"
                        aria-label={`Attendance percentage for ${student.student}`}
                        title={`${student.attendancePercentage}%`}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--muted)]">No student data available</p>
            )}
          </div>
        </div>

        {/* GPS Locations */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            GPS-Based Check-in Locations
          </h2>
          <div className="space-y-3">
            {gpsLocations.length > 0 ? (
              gpsLocations.map((loc) => (
                <div key={loc.centerId} className="p-4 bg-[var(--surface-2)] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{loc.centerName}</p>
                      <p className="text-sm text-[var(--muted)]">{loc.city}, {loc.state}</p>
                    </div>
                    <p className="font-bold text-blue-500">{loc.checkins} check-ins</p>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Avg Location: {loc.avgLat}, {loc.avgLng}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[var(--muted)]">No GPS data available</p>
            )}
          </div>
        </div>

        {/* Full Student List */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Complete Student Attendance Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--outline)]">
                  <th className="text-left py-2 px-4">Student Name</th>
                  <th className="text-left py-2 px-4">Nirmaan ID</th>
                  <th className="text-center py-2 px-4">Present</th>
                  <th className="text-center py-2 px-4">Absent</th>
                  <th className="text-center py-2 px-4">Late</th>
                  <th className="text-center py-2 px-4">Total</th>
                  <th className="text-center py-2 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {studentList.length > 0 ? (
                  studentList.map((student, idx) => (
                    <tr key={student.nirmaanId || idx} className="border-b border-[var(--outline-2)] hover:bg-[var(--surface-2)]">
                      <td className="py-2 px-4">{student.student}</td>
                      <td className="py-2 px-4 text-xs">{student.nirmaanId}</td>
                      <td className="py-2 px-4 text-center text-green-500">{student.present}</td>
                      <td className="py-2 px-4 text-center text-red-500">{student.absent}</td>
                      <td className="py-2 px-4 text-center text-yellow-500">{student.late}</td>
                      <td className="py-2 px-4 text-center">{student.total}</td>
                      <td className="py-2 px-4 text-center font-bold">{student.attendancePercentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-[var(--muted)]">
                      No student data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        </DashboardShell>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, QrCode, Calendar, BarChart3, TrendingUp, CheckCircle, AlertCircle, Clock } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import GPSBasedAttendance from "@/components/GPSBasedAttendance";
import QRAttendanceSystem from "@/components/QRAttendanceSystem";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import NotificationSystem from "@/components/NotificationSystem";

type Tab = "gps" | "qr" | "calendar" | "analytics";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "gps", label: "GPS Check-In", icon: <MapPin className="w-4 h-4" /> },
  { id: "qr", label: "QR Scan", icon: <QrCode className="w-4 h-4" /> },
  { id: "calendar", label: "My Calendar", icon: <Calendar className="w-4 h-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

// Mock data for demo
const mockRecords: { date: string; status: "Present" | "Absent" }[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 4, i + 1);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const status: "Present" | "Absent" = isWeekend ? "Absent" : Math.random() > 0.15 ? "Present" : "Absent";
  return { date: d.toISOString().split("T")[0], status };
}).filter(r => new Date(r.date) <= new Date());

const subjectAttendance = [
  { subject: "Theory", present: 22, total: 24, color: "from-blue-500 to-cyan-500" },
  { subject: "Practical", present: 20, total: 23, color: "from-purple-500 to-violet-500" },
  { subject: "Soft Skills", present: 19, total: 20, color: "from-green-500 to-emerald-500" },
];

function SubjectBar({ subject, present, total, color }: { subject: string; present: number; total: number; color: string }) {
  const pct = Math.round((present / total) * 100);
  const isLow = pct < 75;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{subject}</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)] text-xs">{present}/{total} classes</span>
          <span className={`font-bold ${isLow ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{pct}%</span>
          {isLow && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}

export default function StudentAttendancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("gps");

  const presentCount = mockRecords.filter((r) => r.status === "Present").length;
  const totalCount = mockRecords.length;
  const overallPct = Math.round((presentCount / totalCount) * 100);

  return (
    <DashboardShell
      title="My Attendance"
      subtitle="GPS check-in, QR scan, calendar view, and subject-wise analytics"
      nav={[
        { href: "/dashboard/student", label: "← Student Home" },
        { href: "/dashboard/student/attendance", label: "Attendance" },
        { href: "/dashboard/student/tests", label: "My Exams" },
        { href: "/dashboard/student/leave-requests", label: "Leave Requests" },
      ]}
      actions={<NotificationSystem />}
    >
      {/* Overview KPI */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[
          { label: "Overall Attendance", value: `${overallPct}%`, icon: <TrendingUp className="w-5 h-5" />, color: "from-blue-500 to-cyan-500", ok: overallPct >= 75 },
          { label: "Days Present", value: String(presentCount), icon: <CheckCircle className="w-5 h-5" />, color: "from-green-500 to-emerald-500", ok: true },
          { label: "Days Absent", value: String(totalCount - presentCount), icon: <AlertCircle className="w-5 h-5" />, color: "from-red-500 to-rose-500", ok: false },
          { label: "Min Required", value: "75%", icon: <Clock className="w-5 h-5" />, color: "from-purple-500 to-violet-500", ok: true },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${kpi.color} text-white rounded-2xl p-5 flex items-center gap-3`}>
            <div className="p-2.5 bg-white/20 rounded-xl">{kpi.icon}</div>
            <div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs opacity-80 leading-tight">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Low attendance warning */}
      {overallPct < 75 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-600 dark:text-red-400">⚠️ Low Attendance Warning</p>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
              Your attendance is below 75%. You need to attend at least {Math.ceil(0.75 * totalCount) - presentCount} more classes to meet the requirement.
            </p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${activeTab === tab.id ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "border-[var(--outline)] hover:bg-[var(--surface-2)]"}`}
          >
            {tab.icon}{tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab === "gps" && (
          <div className="max-w-2xl">
            <GPSBasedAttendance />
          </div>
        )}

        {activeTab === "qr" && (
          <div className="max-w-2xl">
            <QRAttendanceSystem role="student" />
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">May 2025 — Daily Attendance</h2>
            <AttendanceCalendar records={mockRecords} />
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--outline)] text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Present</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Absent</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--outline)] inline-block" />Weekend / Holiday</span>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--brand)]" />
                Subject-wise Breakdown
              </h2>
              {subjectAttendance.map((s) => (
                <SubjectBar key={s.subject} {...s} />
              ))}
              <p className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--outline)]">
                Subjects below <span className="font-bold text-red-500">75%</span> are flagged. Contact admin to submit leave requests.
              </p>
            </div>

            {/* Monthly trend */}
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Weekly Trend</h2>
              <div className="flex items-end gap-2 h-32">
                {[82, 75, 90, 68, 95, 80, 88].map((v, i) => (
                  <motion.div key={i} className="flex-1 flex flex-col items-center gap-1"
                    initial={{ height: 0 }} animate={{ height: "auto" }}>
                    <span className="text-xs font-bold">{v}%</span>
                    <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.08, duration: 0.5 }}
                      style={{ height: `${v}%` }}
                      className={`w-full rounded-t-lg ${v >= 75 ? "bg-gradient-to-t from-green-500 to-emerald-400" : "bg-gradient-to-t from-red-500 to-rose-400"}`}
                    />
                    <span className="text-xs text-[var(--muted)]">{["W1","W2","W3","W4","W5","W6","W7"][i]}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardShell>
  );
}

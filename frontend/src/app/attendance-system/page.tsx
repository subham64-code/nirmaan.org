"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, MapPin, ClipboardCheck, BarChart3, UserCheck, Users, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import QRAttendanceSystem from "@/components/QRAttendanceSystem";
import GPSBasedAttendance from "@/components/GPSBasedAttendance";
import AttendanceWidget from "@/components/AttendanceWidget";
import GoogleSheetAttendance from "@/components/GoogleSheetAttendance";

type Tab = "qr" | "gps" | "manual" | "analytics";
type UserRole = "student" | "faculty" | "admin";

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "qr", label: "QR Attendance", icon: <QrCode className="w-5 h-5" />, desc: "Scan or generate QR codes" },
  { id: "gps", label: "GPS Check-In", icon: <MapPin className="w-5 h-5" />, desc: "Location-based attendance" },
  { id: "manual", label: "Manual Entry", icon: <ClipboardCheck className="w-5 h-5" />, desc: "Mark attendance manually" },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, desc: "Reports & heatmaps" },
];

const stats = [
  { label: "Present Today", value: "87%", icon: <UserCheck className="w-5 h-5" />, color: "from-green-500 to-emerald-600" },
  { label: "Total Students", value: "342", icon: <Users className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
  { label: "Defaulters", value: "12", icon: <AlertCircle className="w-5 h-5" />, color: "from-red-500 to-rose-600" },
  { label: "Avg This Month", value: "91%", icon: <TrendingUp className="w-5 h-5" />, color: "from-purple-500 to-purple-600" },
];

// Simple bar chart for analytics
function AttendanceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={`font-bold ${pct >= 75 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{pct}%</span>
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

export default function AttendanceSystemPage() {
  const [activeTab, setActiveTab] = useState<Tab>("qr");
  const [userRole, setUserRole] = useState<UserRole>("student");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = (localStorage.getItem("nirmaan_role") || "student") as UserRole;
      setUserRole(role);
      // Faculty/admin start on QR generator tab
      if (role !== "student") setActiveTab("qr");
    }
  }, []);

  const subjectData = [
    { label: "Machine Learning", pct: 92, color: "from-blue-500 to-cyan-500" },
    { label: "Deep Learning", pct: 88, color: "from-purple-500 to-violet-500" },
    { label: "NLP & GenAI", pct: 76, color: "from-orange-500 to-amber-500" },
    { label: "Soft Skills", pct: 95, color: "from-green-500 to-emerald-500" },
    { label: "Data Structures", pct: 69, color: "from-red-500 to-rose-500" },
  ];

  const defaulters = [
    { name: "Ravi Kumar", id: "NIR2024001", pct: 68, subject: "NLP" },
    { name: "Priya Sharma", id: "NIR2024015", pct: 71, subject: "Deep Learning" },
    { name: "Amit Das", id: "NIR2024032", pct: 64, subject: "Data Structures" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[var(--brand)] via-purple-600 to-blue-600 text-white py-14 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs uppercase tracking-widest opacity-75 font-semibold">Smart Attendance Platform</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-3">Attendance System</h1>
            <p className="text-lg opacity-85 max-w-2xl">
              QR code, GPS location, and manual attendance — all in one unified platform with real-time analytics.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {stats.map((stat, i) => (
              <motion.div key={stat.label} whileHover={{ scale: 1.03 }} className="bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-80`}>{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs opacity-75">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* Role badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-[var(--muted)]">Viewing as:</span>
          <div className="flex gap-2">
            {(["student", "faculty", "admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setUserRole(r)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${userRole === r ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "border-[var(--outline)] hover:bg-[var(--surface-2)]"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all ${activeTab === tab.id ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]" : "border-[var(--outline)] hover:bg-[var(--surface-2)]"}`}
            >
              {tab.icon}
              <span className="font-semibold text-sm">{tab.label}</span>
              <span className="text-xs text-[var(--muted)]">{tab.desc}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "qr" && (
            <div className="max-w-2xl mx-auto">
              <QRAttendanceSystem role={userRole === "student" ? "student" : userRole === "admin" ? "admin" : "faculty"} />
            </div>
          )}

          {activeTab === "gps" && (
            <div className="max-w-2xl mx-auto">
              <GPSBasedAttendance />
            </div>
          )}

          {activeTab === "manual" && (
            <div className="grid md:grid-cols-2 gap-6">
              <AttendanceWidget />
              <GoogleSheetAttendance />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Subject-wise Attendance */}
              <div className="glass p-6 rounded-2xl space-y-5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--brand)]" />
                  Subject-wise Attendance
                </h2>
                {subjectData.map((s) => (
                  <AttendanceBar key={s.label} label={s.label} pct={s.pct} color={s.color} />
                ))}
                <p className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--outline)]">
                  Minimum required attendance: <span className="font-bold text-red-500">75%</span>
                </p>
              </div>

              {/* Defaulter List */}
              <div className="glass p-6 rounded-2xl">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Low Attendance Defaulters
                </h2>
                <div className="space-y-3">
                  {defaulters.map((d) => (
                    <motion.div key={d.id} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition">
                      <div>
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-xs text-[var(--muted)]">{d.id} • {d.subject}</p>
                      </div>
                      <span className="text-lg font-bold text-red-500">{d.pct}%</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Students below 75% attendance may be barred from exams. Automated alerts sent to parents.
                  </p>
                </div>
              </div>

              {/* Monthly Heatmap Placeholder */}
              <div className="glass p-6 rounded-2xl md:col-span-2">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[var(--brand)]" />
                  Monthly Attendance Heatmap — May 2025
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                    <div key={d} className="text-center text-xs text-[var(--muted)] font-semibold pb-1">{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2; // offset for May 1 = Thursday
                    const isValid = day >= 1 && day <= 31;
                    const isWeekend = [0, 6].includes(i % 7);
                    const pct = isValid && !isWeekend ? Math.floor(Math.random() * 40 + 60) : 0;
                    return (
                      <div key={i} title={isValid ? `Day ${day}: ${pct}%` : ""}
                        className={`h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition ${!isValid ? "opacity-0" : isWeekend ? "bg-[var(--surface-2)] text-[var(--muted)]" : pct >= 80 ? "bg-green-500/20 text-green-700 dark:text-green-400" : pct >= 65 ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : "bg-red-500/20 text-red-700 dark:text-red-400"}`}>
                        {isValid ? (isWeekend ? "" : `${pct}%`) : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-6 mt-4 text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/30 inline-block" />≥80%</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/30 inline-block" />65–79%</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30 inline-block" />&lt;65%</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

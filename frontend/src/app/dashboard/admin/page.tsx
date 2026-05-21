"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import { AnimatedCard } from "@/components/AnimatedCard";
import { motion } from "framer-motion";
import { Users, Clock, Award, TestTube, CheckCircle, AlertCircle, BarChart3, FileText, Shield } from "lucide-react";
import NotificationSystem from "@/components/NotificationSystem";
import GPSBasedAttendance from "@/components/GPSBasedAttendance";
import AttendanceAnalyticsChart from "@/components/AttendanceAnalyticsChart";
import { dailyAttendanceReportUrl } from "@/lib/constants";
import { proctoringLaunchUrl } from "@/lib/constants";

type DashboardData = {
  totalStudents: number;
  pendingApplications: number;
  totalTeachers: number;
  totalTests: number;
  totalResults: number;
  recentLogs: Array<{ _id: string; action: string; createdAt: string }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("nirmaan_token") || "";
      const response = await api.get("/admin/dashboard", { headers: authHeader(token) });
      setData(response.data.data);
    };
    load().catch(() => null);
  }, []);

  return (
    <DashboardShell
      title="Super Admin Control Center"
      subtitle="Global analytics, approvals, platform governance and system configuration"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/applications", label: "Applications" },
        { href: "/dashboard/admin/teachers", label: "Teachers" },
        { href: "/dashboard/admin/departments", label: "Departments" },
        { href: "/dashboard/admin/semester-control", label: "Semester Control" },
        { href: "/dashboard/admin/attendance", label: "Attendance Sync" },
        { href: "/dashboard/admin/attendance-verification", label: "Verify Attendance" },
        { href: "/dashboard/admin/attendance-analytics", label: "Analytics" },
        { href: "/dashboard/admin/exam-reviews", label: "Exam Reviews" },
        { href: "/dashboard/admin/leave-requests", label: "Leave Requests" },
        { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
        { href: "/dashboard/admin/media", label: "Media" },
        { href: "/dashboard/admin/ai-assistant", label: "AI Assistant" },
        { href: "/dashboard/admin/communication-test", label: "Test Comms" },
      ]}
      actions={<NotificationSystem />}
    >
      {/* GPS Attendance Tracking - Admin Monitoring */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
      >
        <GPSBasedAttendance compact={true} />
      </motion.section>

      {/* KPI Cards Grid */}
      <motion.div className="grid gap-6 md:grid-cols-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatedCard
          title="Total Students"
          value={data?.totalStudents ?? 0}
          icon={<Users className="text-[var(--brand)]" />}
          gradient="from-blue-500 to-blue-600"
          delay={0}
        />
        <AnimatedCard
          title="Pending Apps"
          value={data?.pendingApplications ?? 0}
          icon={<Clock className="text-orange-500" />}
          gradient="from-orange-500 to-orange-600"
          delay={0.1}
        />
        <AnimatedCard
          title="Teachers"
          value={data?.totalTeachers ?? 0}
          icon={<Award className="text-purple-500" />}
          gradient="from-purple-500 to-purple-600"
          delay={0.2}
        />
        <AnimatedCard
          title="Tests Created"
          value={data?.totalTests ?? 0}
          icon={<TestTube className="text-green-500" />}
          gradient="from-green-500 to-green-600"
          delay={0.3}
        />
        <AnimatedCard
          title="Test Results"
          value={data?.totalResults ?? 0}
          icon={<CheckCircle className="text-pink-500" />}
          gradient="from-pink-500 to-pink-600"
          delay={0.4}
        />
      </motion.div>

      {/* Analytics Charts */}
      <motion.section
        className="glass mt-8 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-[var(--brand)]" />
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
        </div>
        <AttendanceAnalyticsChart />
      </motion.section>

      {/* Super Admin Quick Actions */}
      <motion.section
        className="glass mt-8 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-[var(--brand)]" />
          <h2 className="text-2xl font-bold">Quick Management Actions</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { href: "/dashboard/admin/applications", label: "Review Applications", color: "from-blue-500 to-blue-600" },
            { href: "/dashboard/admin/teachers", label: "Manage Teachers", color: "from-purple-500 to-purple-600" },
            { href: "/dashboard/admin/departments", label: "Departments", color: "from-cyan-500 to-teal-600" },
            { href: "/dashboard/admin/semester-control", label: "Semester Control", color: "from-orange-500 to-amber-600" },
            { href: "/dashboard/admin/media", label: "Upload Media", color: "from-pink-500 to-pink-600" },
            { href: "/dashboard/admin/audit-logs", label: "Audit Logs", color: "from-red-500 to-rose-600" },
            { href: "/attendance-system", label: "Attendance System", color: "from-green-500 to-emerald-600" },
            { href: "/dashboard/admin/exam-reviews", label: "Exam Management", color: "from-cyan-500 to-blue-600" },
            { href: "/exam", label: "Open Exam Portal", color: "from-indigo-500 to-indigo-700" },
          ].map((action, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={action.href}
                className={`block p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold text-center transition-all hover:shadow-lg`}
              >
                {action.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Admin: Quick access to AI proctoring service */}
      <motion.section
        className="glass mt-6 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-orange-500" />
          <h2 className="text-2xl font-bold">AI Proctoring</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <button onClick={() => window.open('/exam', '_self')} className="p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold">Open Exam Portal</button>
          <button onClick={() => window.open(proctoringLaunchUrl, '_blank', 'noopener')} className="p-4 rounded-xl border border-[var(--outline)] font-semibold">Launch AI Proctoring</button>
        </div>
      </motion.section>

      {/* Service Integrations */}
      <motion.section
        className="glass mt-8 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-4">Service Integrations</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { href: "/dashboard/admin/google-sheets", label: "Google Sheets Sync", icon: "📊" },
            { href: "#", label: "Trigger Attendance Alerts", icon: "⚠️", onClick: async () => {
              try {
                const token = localStorage.getItem("nirmaan_token") || "";
                const res = await api.post("/attendance/alert/low-attendance", { threshold: 75 }, { headers: authHeader(token) });
                alert(res.data.message || "Alerts triggered successfully");
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Unknown error";
                alert("Failed to trigger alerts: " + message);
              }
            }},
            { href: "/dashboard/admin/sms", label: "Send SMS Alerts", icon: "💬" },
            { href: "/dashboard/admin/communication-test", label: "Test Communications", icon: "🧪" },
            { href: "/dashboard/admin/ai-assistant", label: "AI Assistant & Content", icon: "🤖" },
          ].map((service, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}>
              {service.onClick ? (
                <button
                  onClick={service.onClick}
                  className="flex w-full items-center gap-3 p-4 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-all text-left"
                >
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-semibold">{service.label}</span>
                </button>
              ) : (
                <Link
                  href={service.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-all"
                >
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-semibold">{service.label}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="glass mt-8 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="text-[var(--brand)]" />
              Manual Attendance View
            </h2>
            <p className="text-sm text-[var(--muted)]">
              View the published attendance sheet directly from the dashboard.
            </p>
          </div>
          <a
            href={dailyAttendanceReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <span>Open in Full Screen</span>
          </a>
        </div>
        
        <div className="w-full h-[600px] rounded-xl overflow-hidden border border-[var(--outline)] bg-white">
          <iframe 
            src={dailyAttendanceReportUrl.replace('/edit?', '/htmlembed?').replace('/pubhtml', '/pubhtml?widget=true&headers=false')}
            className="w-full h-full border-0"
            title="Attendance Report Google Sheet"
          />
        </div>
      </motion.section>

      {/* Admin Logs */}
      <motion.section
        className="glass mt-8 p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold mb-4">Recent Admin Logs</h2>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {(data?.recentLogs || []).length === 0 ? (
            <p className="text-[var(--muted)] text-center py-8">No recent activity</p>
          ) : (
            (data?.recentLogs || []).map((log) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <span className="font-semibold">{log.action}</span>
                <span className="text-xs text-[var(--muted)]">{new Date(log.createdAt).toLocaleString()}</span>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
    </DashboardShell>
  );
}

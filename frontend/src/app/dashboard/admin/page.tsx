"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import { AnimatedCard } from "@/components/AnimatedCard";
import { motion } from "framer-motion";
import { Users, Clock, Award, TestTube, CheckCircle, AlertCircle, Bell, Send, BarChart3, MapPin, BookOpen } from "lucide-react";
import NotificationSystem from "@/components/NotificationSystem";
import AIQuestionGenerator from "@/components/AIQuestionGenerator";
import GPSTracker from "@/components/GPSTracker";
import { dailyAttendanceReportUrl } from "@/lib/constants";

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
      title="Admin Control Center"
      subtitle="Real-time analytics, approvals, and platform governance"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/applications", label: "Applications" },
        { href: "/dashboard/admin/teachers", label: "Teachers" },
        { href: "/dashboard/admin/attendance", label: "Attendance Sync" },
        { href: "/dashboard/admin/attendance-verification", label: "Verify Attendance" },
        { href: "/dashboard/admin/attendance-analytics", label: "Analytics" },
        { href: "/dashboard/admin/leave-requests", label: "Leave Requests" },
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
        <GPSTracker />
      </motion.section>

      {/* AI Question Generator for Admin - Content Creation */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <AIQuestionGenerator />
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

      {/* Quick Actions */}
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
            { href: "/dashboard/admin/media", label: "Upload Media", color: "from-pink-500 to-pink-600" },
            { href: "/courses", label: "Update Courses", color: "from-green-500 to-green-600" },
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
            { href: "/dashboard/admin/sms", label: "Send SMS Alerts", icon: "💬" },
            { href: "/dashboard/admin/communication-test", label: "Test Communications", icon: "🧪" },
            { href: "/dashboard/admin/ai-assistant", label: "AI Assistant & Content", icon: "🤖" },
          ].map((service, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}>
              <Link
                href={service.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-all"
              >
                <span className="text-2xl">{service.icon}</span>
                <span className="font-semibold">{service.label}</span>
              </Link>
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
        <h2 className="text-2xl font-bold mb-4">Daily Attendance Report</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          View the published attendance sheet directly from the dashboard.
        </p>
        <a
          href={dailyAttendanceReportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-[var(--brand)] px-5 py-2 font-semibold text-white"
        >
          Open Google Sheet Report
        </a>
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

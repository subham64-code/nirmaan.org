"use client";

import { useEffect, useMemo, useState } from "react";
import { api, authHeader } from "@/lib/api";
import Link from "next/link";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import { AnimatedCard } from "@/components/AnimatedCard";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Award, BarChart3, Bell, Calendar, Sparkles, ClipboardList, MapPin, QrCode, Shield, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import NotificationSystem from "@/components/NotificationSystem";
import AttendanceWidget from "@/components/AttendanceWidget";
import EnhancedExamSystem from "@/components/EnhancedExamSystem";
import StudentPerformanceChart from "@/components/StudentPerformanceChart";
import { proctoringLaunchUrl } from "@/lib/constants";

type StudentData = {
  profile: {
    name: string;
    nirmaanId: string;
    course: string;
    qualification: string;
    tenthMarks: number;
    twelfthMarks: number;
    degreeMarks: number;
    idCardQr?: string;
  };
  attendance: {
    percentage: number;
    records: Array<{ date: string; status: "Present" | "Absent" }>;
  };
  testResults: Array<{ _id: string; score: number; test: { title: string; totalMarks: number } }>;
  performance?: { selfAssessmentMarks: number; practicalMarks: number; feedback: string };
};

export default function StudentDashboard() {
  const showToast = useToast();
  const [data, setData] = useState<StudentData | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("nirmaan_token") || "";
      const response = await api.get("/students/me", { headers: authHeader(token) });
      setData(response.data.data);
    };
    load().catch(() => null);

    const refreshTimer = setInterval(() => {
      load().catch(() => null);
    }, 30000);

    return () => clearInterval(refreshTimer);
  }, []);

  const avgScore = useMemo(() => {
    const rows = data?.testResults || [];
    if (!rows.length) return 0;
    const sum = rows.reduce((acc, row) => acc + row.score, 0);
    return Math.round((sum / rows.length) * 100) / 100;
  }, [data]);

  return (
    <DashboardShell
      title={data?.profile?.name ? `${data.profile.name} Dashboard` : "Student Dashboard"}
      subtitle="Your attendance, tests, progress, and digital identity"
      nav={[
        { href: "/dashboard/student", label: "Overview" },
        { href: "/dashboard/student/attendance", label: "My Attendance" },
        { href: "/dashboard/student/tests", label: "Coding Questions" },
        { href: "/dashboard/student/recommendations", label: "AI Recommendations" },
        { href: "/dashboard/student/leave-requests", label: "Leave Requests" },
        { href: "/syllabus", label: "Syllabus" },
        { href: "/notes", label: "Notes" },
        { href: "/media", label: "Media Gallery" },
        { href: "/dashboard/student/settings", label: "Settings" },
        { href: "/attendance-system", label: "QR Check-In" },
        { href: "/courses", label: "Course Roadmap" },
      ]}
      actions={<NotificationSystem />}
    >
      {/* Quick Check-In Strip */}
      <motion.section
        className="grid gap-4 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.01 }}
      >
        <Link href="/dashboard/student/attendance"
          className="glass p-5 rounded-2xl flex items-center gap-4 hover:bg-[var(--surface-2)] transition group">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">GPS Check-In</p>
            <p className="text-sm text-[var(--muted)]">Mark attendance with location</p>
          </div>
          <span className="ml-auto text-[var(--brand)] font-semibold text-sm">Open →</span>
        </Link>
        <Link href="/attendance-system"
          className="glass p-5 rounded-2xl flex items-center gap-4 hover:bg-[var(--surface-2)] transition group">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 text-white group-hover:scale-110 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">QR Scan</p>
            <p className="text-sm text-[var(--muted)]">Scan QR code from teacher</p>
          </div>
          <span className="ml-auto text-[var(--brand)] font-semibold text-sm">Scan →</span>
        </Link>
      </motion.section>

      {/* Student Attendance & Exam Section */}
      <motion.section
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
      >
        <AttendanceWidget />
        <EnhancedExamSystem userRole="student" />
      </motion.section>

      {/* KPI Cards */}
      <motion.section className="grid gap-6 md:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatedCard
          title="Attendance"
          value={`${data?.attendance?.percentage ?? 0}%`}
          icon={<BookOpen className="text-blue-500" />}
          description="Class presence"
          gradient="from-blue-500 to-blue-600"
          delay={0}
        />
        <AnimatedCard
          title="Avg Test Score"
          value={avgScore}
          icon={<BarChart3 className="text-green-500" />}
          description="Overall performance"
          gradient="from-green-500 to-green-600"
          delay={0.1}
        />
        <AnimatedCard
          title="Tests Taken"
          value={data?.testResults?.length ?? 0}
          icon={<TrendingUp className="text-purple-500" />}
          description="Assessments completed"
          gradient="from-purple-500 to-purple-600"
          delay={0.2}
        />
        <AnimatedCard
          title="Course"
          value={data?.profile?.course?.split(/\s+/)[0] || "-"}
          icon={<Award className="text-pink-500" />}
          description="Current program"
          gradient="from-pink-500 to-pink-600"
          delay={0.3}
        />
      </motion.section>

      {/* Profile + Digital ID Card */}
      <motion.section
        className="glass p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6">Profile + Digital ID Card</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Left side: Profile Info */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Name", data?.profile?.name || "-"],
                ["Nirmaan ID", data?.profile?.nirmaanId || "-"],
                ["Qualification", data?.profile?.qualification || "-"],
                ["10th Marks", data?.profile?.tenthMarks ?? 0],
                ["12th Marks", data?.profile?.twelfthMarks ?? 0],
                ["Degree Marks", data?.profile?.degreeMarks ?? 0],
              ].map(([label, value]) => (
                <div key={String(label)} className="p-3 rounded-lg border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors">
                  <p className="text-xs text-[var(--muted)] uppercase">{label}</p>
                  <p className="font-semibold mt-1">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side: Digital ID Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-gradient-to-br from-[var(--brand)] to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-xs uppercase tracking-widest opacity-75 mb-4">Nirmaan Digital ID Card</div>
              <div className="mb-6">
                <p className="text-2xl font-bold">{data?.profile?.name || "Student"}</p>
                <p className="text-sm opacity-90 mt-1">ID: {data?.profile?.nirmaanId || "N/A"}</p>
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center">
                {data?.profile?.idCardQr && (
                  <Image
                    src={data.profile.idCardQr}
                    alt="QR Code"
                    width={100}
                    height={100}
                    unoptimized
                    className="rounded"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Performance Section */}
      <motion.section
        className="glass p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold mb-6">Performance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            className="p-4 rounded-lg border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            <p className="text-xs uppercase text-[var(--muted)]">Self-Assessment Marks</p>
            <p className="text-2xl font-bold mt-2">{data?.performance?.selfAssessmentMarks ?? 0}</p>
          </motion.div>
          <motion.div
            className="p-4 rounded-lg border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs uppercase text-[var(--muted)]">Practical Marks</p>
            <p className="text-2xl font-bold mt-2">{data?.performance?.practicalMarks ?? 0}</p>
          </motion.div>
        </div>
        {data?.performance?.feedback && (
          <motion.div
            className="mt-4 p-4 rounded-lg border border-[var(--outline)] bg-blue-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            <p className="text-xs uppercase text-[var(--muted)]">Feedback</p>
            <p className="text-sm mt-2">{data.performance.feedback}</p>
          </motion.div>
        )}
        
        {/* Performance Chart Component */}
        <div className="mt-8">
          <p className="text-sm uppercase text-[var(--muted)] mb-2 font-semibold">Score Progression</p>
          <StudentPerformanceChart testResults={data?.testResults || []} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/student/tests" className="inline-block rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            <BookOpen className="w-4 h-4 inline-block mr-2 -mt-1" /> Take Online Test
          </Link>
          <button
            onClick={async () => {
              try {
                const launchWindow = window.open("about:blank", "_blank", "noopener");
                if (launchWindow) {
                  launchWindow.location.href = proctoringLaunchUrl;
                } else {
                  window.open(proctoringLaunchUrl, '_blank', 'noopener');
                }
              } catch (e) {
                console.error('Proctoring launch error', e);
                showToast('error', 'Failed to launch proctoring.');
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--outline)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]"
          >
            <Shield className="w-4 h-4 text-orange-500" /> Open AI Proctoring <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
          <Link href="/exam" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50">
            <ExternalLink className="w-4 h-4" /> Exam Portal
          </Link>
        </div>
      </motion.section>

      {/* Attendance Calendar */}
      <motion.section
        className="glass p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-2xl font-bold mb-6">Daily Attendance Calendar</h2>
        <div className="rounded-xl border border-[var(--outline)] p-4">
          <AttendanceCalendar records={data?.attendance?.records || []} />
        </div>
      </motion.section>

      {/* Test Results */}
      <motion.section
        className="glass p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h2 className="text-2xl font-bold mb-6">Test Results</h2>
        <div className="grid gap-3">
          {(data?.testResults || []).length > 0 ? (
            data?.testResults?.map((row) => (
              <motion.div
                key={row._id}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <p className="font-semibold">{row.test?.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Score: {row.score}/{row.test?.totalMarks}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--brand)]">{Math.round((row.score / row.test?.totalMarks) * 100)}%</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-[var(--muted)]">
              <p>No test results yet. Take your first test to see your scores!</p>
            </div>
          )}
        </div>
      </motion.section>
    </DashboardShell>
  );
}

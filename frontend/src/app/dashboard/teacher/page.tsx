"use client";

import { useState, useEffect } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, CheckCircle, AlertCircle, TrendingUp, Award, Calendar, QrCode, MapPin, Shield, ExternalLink } from "lucide-react";
import NotificationSystem from "@/components/NotificationSystem";
import AttendanceWidget from "@/components/AttendanceWidget";
import AIQuestionGenerator from "@/components/AIQuestionGenerator";
import { AnimatedCard } from "@/components/AnimatedCard";
import TeacherProfileCard from "@/components/TeacherProfileCard";
import GPSBasedAttendance from "@/components/GPSBasedAttendance";
import QRAttendanceSystem from "@/components/QRAttendanceSystem";
import EnhancedExamSystem from "@/components/EnhancedExamSystem";
import { proctoringLaunchUrl } from "@/lib/constants";
import { useToast } from "@/components/ToastProvider";

interface TeacherStats {
  totalStudents: number;
  totalTests: number;
  todayAttendance: number;
  avgPerformance: number;
  recentActivity: Array<{
    action: string;
    student: string;
    timestamp: string;
  }>;
}

export default function TeacherDashboard() {
  const showToast = useToast();
  const [testTitle, setTestTitle] = useState("");
  const [studentId, setStudentId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teacherName, setTeacherName] = useState<string | null>(null);

  // AI Question Generation State
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiQuestionType, setAiQuestionType] = useState<"mcq" | "short" | "essay">("mcq");
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/me", { headers: authHeader(token) });
        const name = response.data?.data?.name || response.data?.data?.email || "";
        setTeacherName(name);
        if (typeof window !== "undefined" && name) {
          localStorage.setItem("nirmaan_user_name", name);
        }
      } catch (error) {
        console.error("Failed to load teacher profile:", error);
        const fallbackName = typeof window !== "undefined" ? localStorage.getItem("nirmaan_user_name") || "" : "";
        setTeacherName(fallbackName);
      }
    };

    loadProfile();
  }, [token]);

  const fetchTeacherStats = async () => {
    try {
      const response = await api.get("/teachers/dashboard", { headers: authHeader(token) });
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      showToast("error", "Failed to load class overview.");
    }
  };

  const createQuickTest = async () => {
    if (!testTitle.trim()) {
      showMessage("Please enter a test title", "error");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(
        "/tests",
        {
          title: testTitle,
          course: "AI/ML",
          durationMinutes: 60,
          totalMarks: 60,
          questions: Array.from({ length: 5 }).map((_, i) => ({
            prompt: `Sample question ${i + 1}`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: 0,
            marks: 12,
          })),
        },
        { headers: authHeader(token) }
      );
      showMessage("Test created successfully!", "success");
      setTestTitle("");
      fetchTeacherStats();
    } catch (error) {
      showMessage("Failed to create test. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (status: "Present" | "Absent" | "Late") => {
    if (!studentId.trim()) {
      showMessage("Please enter a student ID", "error");
      return;
    }

    if (!attendanceDate) {
      showMessage("Please select a date", "error");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(
        "/attendance/mark",
        { studentId, date: attendanceDate, status, course: "AI/ML" },
        { headers: authHeader(token) }
      );
      showMessage(`Attendance marked: ${status}`, "success");
      setStudentId("");
      fetchTeacherStats();
    } catch (error) {
      showMessage("Attendance update failed. Please check student ID.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const autoVerifyTodayAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(
        "/attendance/verify/pending",
        { dateKey: new Date().toISOString().slice(0, 10) },
        { headers: authHeader(token) }
      );
      const count = response.data?.data?.modifiedCount || 0;
      showMessage(`Auto verification complete. ${count} records approved.`, "success");
    } catch {
      showMessage("Failed to auto verify attendance.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiGenerateQuestions = async () => {
    if (!aiTopic.trim()) {
      showMessage("Please enter a topic for question generation", "error");
      return;
    }

    setIsAiGenerating(true);
    setAiGeneratedQuestions("");
    showMessage("Generating questions with AI...", "info");

    try {
      const response = await api.post(
        "/ai/generate-questions",
        {
          topic: aiTopic,
          difficulty: aiDifficulty,
          count: aiQuestionCount,
          questionType: aiQuestionType,
          provider: "ollama",
        },
        { headers: authHeader(token) }
      );

      const payload = response.data?.data || {};
      const generatedText = payload.text || response.data?.text || JSON.stringify(payload.questions || response.data?.questions || [], null, 2);
      setAiGeneratedQuestions(generatedText);
      showMessage("Questions generated successfully!", "success");
    } catch (error) {
      console.error("AI generation error:", error);
      showMessage("Failed to generate questions. Please check the AI server configuration.", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <DashboardShell
      title={`Welcome, ${teacherName || "Teacher"}`}
      subtitle="Manage your classes, students, tests, and attendance"
      nav={[
        { href: "/dashboard/teacher", label: "Overview" },
        { href: "/dashboard/teacher/questions", label: "Questions" },
        { href: "/dashboard/teacher/attendance-verification", label: "Verify Attendance" },
        { href: "/dashboard/teacher/tests", label: "Assessments & Results" },
        { href: "/attendance-system", label: "QR Attendance" },
      ]}
      actions={<NotificationSystem />}
    >
      <motion.section
        className="glass p-5 rounded-2xl flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
            {(teacherName || "T").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Authorized Teacher</p>
            <p className="font-semibold">{teacherName || "Teacher"}</p>
          </div>
        </div>
        <button
          onClick={autoVerifyTodayAttendance}
          disabled={isLoading}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Auto Check Attendance
        </button>
      </motion.section>

      {/* Attendance & AI Section */}
      <motion.section
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <AttendanceWidget />
        <AIQuestionGenerator userRole="teacher" />
      </motion.section>

      {/* QR Attendance + GPS Check-In */}
      <motion.section
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <QrCode className="w-5 h-5 text-[var(--brand)]" />
            <h2 className="text-xl font-bold">QR Attendance Generator</h2>
          </div>
          <QRAttendanceSystem role="faculty" />
        </div>
        <GPSBasedAttendance compact />
      </motion.section>

      {/* Exam Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[var(--brand)]" />
          <h2 className="text-xl font-bold">Exam Management</h2>
        </div>
        <EnhancedExamSystem userRole="teacher" />
        <div className="mt-4 flex gap-3">
          <a href="/exam" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700">
            <BookOpen className="w-4 h-4" /> Open Exam Portal
          </a>
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
                      showMessage('Failed to launch proctoring.', 'error');
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--outline)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]"
          >
            <Shield className="w-4 h-4 text-orange-500" /> AI Proctoring <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <motion.section className="grid gap-6 md:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatedCard
          title="Active Tests"
          value={stats?.totalTests || 0}
          icon={<BookOpen className="text-blue-500" />}
          description="Published"
          gradient="from-blue-500 to-blue-600"
          delay={0}
        />
        <AnimatedCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={<Users className="text-green-500" />}
          description="Enrolled"
          gradient="from-green-500 to-green-600"
          delay={0.1}
        />
        <AnimatedCard
          title="Today Attendance"
          value={stats?.todayAttendance || 0}
          icon={<Calendar className="text-purple-500" />}
          description="Marked"
          gradient="from-purple-500 to-purple-600"
          delay={0.2}
        />
        <AnimatedCard
          title="Avg Performance"
          value={`${stats?.avgPerformance || 0}%`}
          icon={<TrendingUp className="text-pink-500" />}
          description="Class average"
          gradient="from-pink-500 to-pink-600"
          delay={0.3}
        />
      </motion.section>

      {/* Teacher Profile Section */}
      {teacherName && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <TeacherProfileCard teacherName={teacherName} />
        </motion.section>
      )}



      {/* Message Display */}
      {message && (
        <motion.div
          className={`p-4 rounded-lg border ${
            messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
            messageType === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-2">
            {messageType === 'success' && <CheckCircle className="w-5 h-5" />}
            {messageType === 'error' && <AlertCircle className="w-5 h-5" />}
            {messageType === 'info' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
      {/* Quick Actions */}
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <section className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Create Quick Test</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
              <input
                title="Enter the test title"
                className="w-full rounded-xl border border-[var(--outline)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                placeholder="Enter test title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>
            <button
              className="w-full rounded-full bg-gradient-to-r from-[var(--brand)] to-purple-600 px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={createQuickTest}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create 60 Marks Test"}
            </button>
          </div>
        </section>

        <section className="glass p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold">Class Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Total Students</span>
              <span className="text-lg font-bold text-blue-600">{stats?.totalStudents || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Active Tests</span>
              <span className="text-lg font-bold text-green-600">{stats?.totalTests || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Today's Attendance</span>
              <span className="text-lg font-bold text-purple-600">{stats?.todayAttendance || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">Avg Performance</span>
              <span className="text-lg font-bold text-orange-600">{stats?.avgPerformance || 0}%</span>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Attendance Management */}
      <motion.section
        className="glass p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">Mark Attendance</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-5 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
            <input
              title="Enter student ID"
              className="w-full rounded-xl border border-[var(--outline)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              placeholder="e.g., NIR2024001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              title="Select attendance date"
              className="w-full rounded-xl border border-[var(--outline)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
          <button
            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={() => markAttendance("Present")}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Present"}
          </button>
          <button
            className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={() => markAttendance("Late")}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Late"}
          </button>
          <button
            className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={() => markAttendance("Absent")}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Absent"}
          </button>
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-blue-900">Quick Tips</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use Nirmaan ID format: NIR2024001</li>
            <li>• Attendance automatically saves to student records</li>
            <li>• You can mark attendance for any date</li>
            <li>• All attendance actions are logged for audit</li>
          </ul>
        </div>
      </motion.section>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <motion.section
          className="glass p-6 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Recent Activity</h2>
          </div>
          
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.student}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </DashboardShell>
  );
}

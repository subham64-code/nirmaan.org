"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { motion } from "framer-motion";
import { Shield, Clock, Users, AlertCircle, CheckCircle, XCircle, ExternalLink, BookOpen, BarChart3, QrCode, MapPin, Brain } from "lucide-react";
import EnhancedExamSystem from "@/components/EnhancedExamSystem";
import Link from "next/link";
import { proctoringLaunchUrl } from "@/lib/constants";

type UserRole = "student" | "teacher" | "admin" | null;

function toBase64Url(value: string) {
  return btoa(value).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function buildDevToken(role: Exclude<UserRole, null>) {
  const now = Math.floor(Date.now() / 1000);
  const subjectMap = {
    teacher: "60f000000000000000000001",
    student: "60f000000000000000000002",
    admin: "60f000000000000000000003",
  } as const;
  const payload = {
    sub: subjectMap[role],
    role,
    name: role === "teacher" ? "Demo Teacher" : role === "admin" ? "Nirmaan Admin" : "Demo Student",
    email: role === "teacher" ? "teacher@nirmaan.local" : role === "admin" ? "admin@nirmaan.local" : "student@nirmaan.local",
    iat: now,
    exp: now + 60 * 60,
  };

  return `${toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }))}.${toBase64Url(JSON.stringify(payload))}.`;
}

function ensureDevToken(role: Exclude<UserRole, null>) {
  if (typeof window === "undefined") return;
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!isLocalDev || localStorage.getItem("nirmaan_token")) return;
  localStorage.setItem("nirmaan_token", buildDevToken(role));
  localStorage.setItem("nirmaan_role", role);
  localStorage.setItem("nirmaan_user_name", role === "teacher" ? "Demo Teacher" : role === "admin" ? "Nirmaan Admin" : "Demo Student");
}

const features = [
  { icon: <Shield className="w-6 h-6" />, title: "AI Proctoring", description: "Face detection, eye tracking & gaze analysis with real-time violation alerts", color: "from-blue-500 to-cyan-500" },
  { icon: <Clock className="w-6 h-6" />, title: "Timed Exams", description: "Auto-submit on time expiry with live countdown and progress tracker", color: "from-purple-500 to-violet-500" },
  { icon: <Users className="w-6 h-6" />, title: "Multi-Role Access", description: "Students take exams; teachers create & publish; admins manage everything", color: "from-orange-500 to-amber-500" },
  { icon: <Brain className="w-6 h-6" />, title: "AI Question Gen", description: "Auto-generate MCQ, short answer, and essay questions using AI", color: "from-green-500 to-emerald-500" },
];

const violations = [
  { type: "Tab Switching", severity: "high", description: "Detects when student switches browser tabs" },
  { type: "Face Detection", severity: "medium", description: "Monitors face presence in camera frame" },
  { type: "Eye Tracking", severity: "medium", description: "Detects if eyes are closed or looking away" },
  { type: "Multiple People", severity: "high", description: "Detects if more than one person is present" },
  { type: "Copy/Paste", severity: "high", description: "Prevents clipboard operations during exam" },
  { type: "Fullscreen Exit", severity: "high", description: "Detects exam window minimization" },
];

export default function ExamPage() {
  const showToast = useToast();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [showExam, setShowExam] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = (localStorage.getItem("nirmaan_role") || null) as UserRole;
      setUserRole(role);
      if (role && !localStorage.getItem("nirmaan_token")) {
        ensureDevToken(role);
      }
    }
  }, []);

  if (showExam && userRole) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {userRole === "student" ? "My Exams" : "Exam Management"}
              </h1>
              <p className="text-[var(--muted)] text-sm mt-1">
                {userRole === "student" ? "View and attempt your assigned exams" : "Create, publish, and manage exams"}
              </p>
            </div>
            <button onClick={() => setShowExam(false)} className="rounded-full border border-[var(--outline)] px-4 py-2 text-sm hover:bg-[var(--surface-2)] transition">
              ← Back
            </button>
          </div>
          <EnhancedExamSystem userRole={userRole === "admin" ? "admin" : userRole} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs uppercase tracking-widest opacity-75 font-semibold">AI-Powered Platform</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-4">Nirmaan Coding Questions</h1>
            <p className="text-xl opacity-90 max-w-3xl">
              Assessment & quiz exams with advanced AI proctoring, real-time monitoring, and instant results.
            </p>
          </motion.div>

          {/* Role-based launch buttons */}
          <motion.div className="flex flex-wrap gap-4 mt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {!userRole ? (
              <>
                <button onClick={() => { ensureDevToken("student"); setUserRole("student"); setShowExam(true); }} className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full hover:bg-indigo-50 transition shadow-lg">
                  <BookOpen className="w-5 h-5" /> Coding Questions (Student)
                </button>
                <button onClick={() => { ensureDevToken("teacher"); setUserRole("teacher"); setShowExam(true); }} className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition">
                  <BarChart3 className="w-5 h-5" /> Assessment & Quiz Exam (Teacher)
                </button>
              </>
            ) : (
              <button onClick={() => { if (userRole) ensureDevToken(userRole); setShowExam(true); }} className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-full hover:bg-indigo-50 transition shadow-lg text-lg">
                <BookOpen className="w-5 h-5" />
                {userRole === "student" ? "Go to Coding Questions" : "Open Assessment Dashboard"}
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  const launchWindow = window.open("about:blank", "_blank", "noopener");
                  if (userRole) {
                    ensureDevToken(userRole);
                  }
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
              className="flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition"
            >
              <Shield className="w-5 h-5" /> Advanced AI Proctoring
              <ExternalLink className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Warning for Flask */}
          <motion.div className="mt-6 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="bg-yellow-400/20 border border-yellow-300/40 rounded-xl px-4 py-3 text-sm text-yellow-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Advanced AI Proctoring opens from the launcher below without a separate auth step.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        {/* Features */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-6 rounded-2xl">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}>{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)]">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Violations */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Integrity Detection System</h2>
          <div className="glass rounded-2xl p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {violations.map((v, i) => (
                <motion.div key={v.type} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 p-4 rounded-xl hover:bg-[var(--surface-2)] transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${v.severity === "high" ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                    {v.severity === "high" ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{v.type}</h4>
                    <p className="text-sm text-[var(--muted)] mt-0.5">{v.description}</p>
                    <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${v.severity === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                      {v.severity.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Quick Launch Grid */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-3xl font-bold mb-8">Quick Access</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Coding Questions", desc: "Take assigned coding questions with real-time timer and anti-cheating", icon: <BookOpen className="w-6 h-6" />, color: "from-blue-500 to-cyan-500", action: () => { setUserRole("student"); setShowExam(true); } },
              { title: "Assessment & Quiz Exam", desc: "Create, publish, assign and evaluate quiz assessments", icon: <BarChart3 className="w-6 h-6" />, color: "from-purple-500 to-violet-500", action: () => { setUserRole("teacher"); setShowExam(true); } },
              { title: "AI-Proctored Mode", desc: "Advanced Flask-based proctoring with webcam monitoring", icon: <Shield className="w-6 h-6" />, color: "from-orange-500 to-red-500", href: proctoringLaunchUrl },
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="block glass p-6 rounded-2xl hover:shadow-lg transition cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4`}>{item.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.desc}</p>
                  </a>
                ) : (
                  <button onClick={item.action} className="block w-full text-left glass p-6 rounded-2xl hover:shadow-lg transition cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4`}>{item.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.desc}</p>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

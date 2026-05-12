"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Shield, Clock, Users, AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export default function ExamSystem() {
  const [examUrl] = useState("http://127.0.0.1:5000/student_dashboard_enhanced");
  const [examStatus, setExamStatus] = useState<"not-started" | "running" | "error">("not-started");

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "AI Proctoring",
      description: "Advanced AI-powered exam monitoring with face detection, eye tracking, and gaze analysis"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description: "Live proctoring with instant violation detection and automatic submission"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Government Exam Style",
      description: "Professional interface similar to government competitive exams like UPSC, SSC"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Cheating Prevention",
      description: "Tab switching detection, copy/paste prevention, and multi-person detection"
    }
  ];

  const violations = [
    { type: "Tab Switching", severity: "high", description: "Detects when student switches browser tabs" },
    { type: "Face Detection", severity: "medium", description: "Monitors face presence in camera frame" },
    { type: "Eye Tracking", severity: "medium", description: "Detects if eyes are closed or looking away" },
    { type: "Multiple People", severity: "high", description: "Detects if more than one person is present" },
    { type: "Copy/Paste", severity: "high", description: "Prevents copying and pasting during exam" },
    { type: "Screenshot", severity: "high", description: "Detects screenshot attempts" }
  ];

  const handleLaunchExam = () => {
    window.open(examUrl, "_blank");
  };

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
            <h1 className="text-5xl font-bold mb-4">AI-Powered Exam System</h1>
            <p className="text-xl opacity-90">
              Government-style online examination with advanced AI proctoring and real-time monitoring
            </p>
          </motion.div>
        </div>
      </div>

      {/* Launch Section */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                Launch Exam System
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Access the comprehensive AI-proctored examination platform
              </p>
            </div>
            <button
              onClick={handleLaunchExam}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Play className="w-6 h-6" />
              Launch Exam System
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
                  Note: The exam system runs on a separate Flask server
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Make sure the Flask server is running at http://127.0.0.1:5000 before launching
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Violation Detection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
            Violation Detection System
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {violations.map((violation, index) => (
                <motion.div
                  key={violation.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    violation.severity === "high"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-yellow-100 dark:bg-yellow-900/30"
                  }`}>
                    {violation.severity === "high" ? (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                      {violation.type}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {violation.description}
                    </p>
                    <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${
                      violation.severity === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {violation.severity.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
            System Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Minimum Requirements
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• Python 3.8+</li>
                <li>• 2GB RAM</li>
                <li>• 500MB disk space</li>
                <li>• Modern browser with camera</li>
                <li>• Stable internet connection</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recommended
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• Python 3.10+</li>
                <li>• 4GB RAM</li>
                <li>• 2GB disk space</li>
                <li>• Chrome/Edge browser</li>
                <li>• Webcam with good quality</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Setup Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
            Setup Instructions
          </h2>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Navigate to exam directory
                  </h4>
                  <code className="block bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded text-sm">
                    cd d:\nirmaan.org\nirmaan_exam.org
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Install dependencies
                  </h4>
                  <code className="block bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded text-sm">
                    pip install -r requirements_enhanced.txt
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Set API keys (optional)
                  </h4>
                  <code className="block bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded text-sm">
                    $env:GEMINI_API_KEY = "your-key"<br/>
                    $env:DEEPSEEK_API_KEY = "your-key"
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Start Flask server
                  </h4>
                  <code className="block bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded text-sm">
                    python app_modern.py
                  </code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

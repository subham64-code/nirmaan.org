"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, BookOpen, Target } from "lucide-react";

export default function RecommendationsPage() {
  const [recommendation, setRecommendation] = useState("");
  const [attendance, setAttendance] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userResponse = await api.get("/students/me", { headers: authHeader(token) });
        const userId = userResponse.data.data.profile._id;

        const recResponse = await api.get(`/services/recommend/${userId}`, { headers: authHeader(token) });
        setRecommendation(recResponse.data.data.recommendation);
        setAttendance(recResponse.data.data.attendancePercent);
      } catch {
        setRecommendation("Unable to load recommendation at this time.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <DashboardShell
      title="AI-Powered Recommendations"
      subtitle="Personalized learning guidance powered by DeepSeek AI"
      nav={[
        { href: "/dashboard/student", label: "Overview" },
        { href: "/dashboard/student/tests", label: "Tests" },
        { href: "/dashboard/student/recommendations", label: "Recommendations" },
      ]}
    >
      {/* Attendance Overview Card */}
      <motion.section
        className="glass p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-[var(--muted)] tracking-wide">Current Attendance</p>
            <p className="text-4xl font-bold mt-2">{attendance}%</p>
          </div>
          <TrendingUp className="w-16 h-16 text-blue-500 opacity-20" />
        </div>
        <div className="w-full bg-[var(--surface-2)] rounded-full h-2 mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${attendance}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </motion.section>

      {/* AI Recommendation Card */}
      <motion.section
        className="glass p-8 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg bg-[var(--brand)]/20">
            <Lightbulb className="w-6 h-6 text-[var(--brand)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your Personalized Learning Path</h2>
            <p className="text-sm text-[var(--muted)] mt-1">AI-generated insight based on your performance</p>
          </div>
        </div>
        
        <motion.div
          className="rounded-xl border border-[var(--brand)] bg-gradient-to-br from-[var(--brand)]/5 to-purple-500/5 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                className="w-3 h-3 rounded-full bg-[var(--brand)]"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <p className="ml-3 text-sm text-[var(--muted)]">Analyzing your learning patterns...</p>
            </div>
          ) : (
            <p className="text-lg leading-relaxed">{recommendation}</p>
          )}
        </motion.div>
      </motion.section>

      {/* Learning Guidance Cards */}
      <motion.section
        className="grid gap-6 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          {
            icon: BookOpen,
            title: "Study Focus Areas",
            description: "Concentrate on topics with lower test scores to improve overall performance.",
            color: "from-blue-500 to-blue-600"
          },
          {
            icon: Target,
            title: "Attendance Impact",
            description: "Maintain 85%+ attendance for better academic outcomes and recommendations.",
            color: "from-purple-500 to-purple-600"
          },
          {
            icon: TrendingUp,
            title: "Progress Tracking",
            description: "Track your growth over time with detailed analytics and performance insights.",
            color: "from-pink-500 to-pink-600"
          }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              className={`glass p-6 rounded-2xl bg-gradient-to-br ${item.color}/10 border border-${item.color.split('-')[1]}-500/20`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Icon className={`w-8 h-8 text-${item.color.split('-')[1]}-500 mb-4`} />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="glass p-8 rounded-2xl border-l-4 border-[var(--brand)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-2xl font-bold mb-4">How DeepSeek AI Generates Your Recommendations</h3>
        <div className="space-y-4 text-sm">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-semibold">Analyzes Your Attendance</p>
              <p className="text-[var(--muted)] mt-1">Your class presence rate is tracked and analyzed as a key indicator of engagement.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-semibold">Evaluates Test Performance</p>
              <p className="text-[var(--muted)] mt-1">All your test scores are evaluated to identify strengths and areas for improvement.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-semibold">Tracks Course Progress</p>
              <p className="text-[var(--muted)] mt-1">Your completion rate and engagement with course materials inform the analysis.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <p className="font-semibold">Generates Personalized Guidance</p>
              <p className="text-[var(--muted)] mt-1">Based on the analysis, AI creates actionable recommendations for your learning path.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </DashboardShell>
  );
}

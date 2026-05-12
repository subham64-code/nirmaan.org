"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import { motion } from "framer-motion";
import { Clock, Award, BookOpen, AlertCircle } from "lucide-react";

type TestRow = { _id: string; title: string; course: string; durationMinutes: number; totalMarks: number };

export default function StudentTestsPage() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("nirmaan_token") || "";
        const response = await api.get("/tests", { headers: authHeader(token) });
        setTests(response.data.data || []);
      } catch {
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">Online Tests</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Take practice tests to assess your knowledge and preparation level.</p>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        className="mt-6 p-4 rounded-lg border border-orange-500/20 bg-orange-500/10 flex gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-orange-600">Important</p>
          <p className="text-orange-600 mt-1">Each test is time-bound and auto-submits when the timer runs out. Results are saved immediately.</p>
        </div>
      </motion.div>

      {/* Tests Grid */}
      <motion.div
        className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12">
            <motion.div
              className="inline-block w-8 h-8 border-4 border-[var(--brand)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-3 text-[var(--muted)]">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12">
            <BookOpen className="w-12 h-12 text-[var(--muted)] mx-auto opacity-50" />
            <p className="mt-3 text-[var(--muted)]">No tests available at the moment. Check back later!</p>
          </div>
        ) : (
          tests.map((test, i) => (
            <motion.div
              key={test._id}
              className="glass p-6 rounded-2xl hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold">{test.title}</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">{test.course}</p>
                </div>
              </div>

              {/* Test Details */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-lg bg-[var(--surface-2)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Clock className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <p className="font-bold mt-1">{test.durationMinutes} min</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Award className="w-4 h-4" />
                    <span>Marks</span>
                  </div>
                  <p className="font-bold mt-1">{test.totalMarks}</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <BookOpen className="w-4 h-4" />
                    <span>Type</span>
                  </div>
                  <p className="font-bold mt-1">Test</p>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/dashboard/student/tests/${test._id}`}
                className="w-full block text-center rounded-full bg-gradient-to-r from-[var(--brand)] to-purple-600 px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity mt-4"
              >
                Start Test
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

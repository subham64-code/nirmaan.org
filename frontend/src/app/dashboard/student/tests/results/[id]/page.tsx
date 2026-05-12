"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, authHeader } from "@/lib/api";
import { StudentAssessmentView } from "@/components/StudentAssessmentView";
import { Loader, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TestResult {
  _id: string;
  test: {
    _id: string;
    title: string;
    totalMarks: number;
  };
  student: {
    _id: string;
    name: string;
  };
  score: number;
  submittedAt: string;
}

interface Test {
  _id: string;
  title: string;
  course: string;
  totalMarks: number;
  questions: Array<{ prompt: string; options: string[]; answer: number; marks: number }>;
}

export default function TestResultsPage() {
  const params = useParams<{ id: string }>();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch test details
        const testRes = await api.get(`/tests/${params.id}`, { headers: authHeader(token) });
        setTest(testRes.data.data);

        // Fetch student's test result
        const resultsRes = await api.get(`/tests/result/mine`, { headers: authHeader(token) });
        const result = resultsRes.data.data?.find((r: any) => r.test?._id === params.id);
        
        if (result) {
          setTestResult(result);
        } else {
          setError("Test result not found. Please take the test first.");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load test results");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, token]);

  if (loading) {
    return (
      <div className="section">
        <motion.div
          className="glass p-6 rounded-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader className="w-8 h-8 animate-spin mx-auto text-[var(--brand)]" />
          <p className="mt-4 text-[var(--muted)]">Loading test results...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !testResult || !test) {
    return (
      <div className="section">
        <motion.div
          className="glass p-6 rounded-2xl border border-red-500/20 bg-red-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error || "Failed to load test results"}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">{test.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Test Results & Feedback</p>
      </motion.div>

      {/* Test Result Summary */}
      <motion.div
        className="glass p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-[var(--surface-2)]">
            <p className="text-xs text-[var(--muted)] mb-2">Your Score</p>
            <p className="text-3xl font-bold">{testResult.score}</p>
            <p className="text-sm text-[var(--muted)] mt-2">out of {test.totalMarks}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-2)]">
            <p className="text-xs text-[var(--muted)] mb-2">Percentage</p>
            <p className="text-3xl font-bold text-[var(--brand)]">
              {((testResult.score / test.totalMarks) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-[var(--muted)] mt-2">Performance</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-2)]">
            <p className="text-xs text-[var(--muted)] mb-2">Submitted On</p>
            <p className="text-sm font-semibold">
              {new Date(testResult.submittedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-[var(--muted)] mt-2">
              {new Date(testResult.submittedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Student Assessment View */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <StudentAssessmentView
          testId={params.id}
          resultId={testResult._id}
          studentScore={testResult.score}
          totalMarks={test.totalMarks}
        />
      </motion.div>
    </div>
  );
}

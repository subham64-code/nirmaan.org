"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, authHeader } from "@/lib/api";
import { TeacherAssessmentForm } from "@/components/TeacherAssessmentForm";
import { Loader, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TestResult {
  _id: string;
  test: {
    _id: string;
    title: string;
    totalMarks: number;
    questions: Array<{ prompt: string; options: string[] }>;
  };
  student: {
    _id: string;
    name: string;
    email: string;
  };
  answers: number[];
  score: number;
  submittedAt: string;
}

export default function TeacherAssessmentPage() {
  const params = useParams<{ testId: string; resultId: string }>();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch the full test result with answers
        const response = await api.get(`/tests/${params.testId}/result/${params.resultId}`, {
          headers: authHeader(token),
        });
        setTestResult(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load test result");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.testId, params.resultId, token]);

  if (loading) {
    return (
      <div className="section">
        <motion.div
          className="glass p-6 rounded-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader className="w-8 h-8 animate-spin mx-auto text-[var(--brand)]" />
          <p className="mt-4 text-[var(--muted)]">Loading test result...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !testResult) {
    return (
      <div className="section">
        <motion.div
          className="glass p-6 rounded-2xl border border-red-500/20 bg-red-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error || "Failed to load test result"}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold">{testResult.test.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Assess student submission</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Student Info & Answers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <motion.div
            className="glass p-6 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold mb-4">{testResult.student.name}</h3>
            <p className="text-sm text-[var(--muted)] mb-2">Email: {testResult.student.email}</p>
            <p className="text-sm text-[var(--muted)]">
              Submitted: {new Date(testResult.submittedAt).toLocaleString()}
            </p>
          </motion.div>

          {/* Score Summary */}
          <motion.div
            className="glass p-6 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--surface-2)]">
                <p className="text-xs text-[var(--muted)] mb-1">Score</p>
                <p className="text-3xl font-bold">{testResult.score}</p>
                <p className="text-xs text-[var(--muted)] mt-1">out of {testResult.test.totalMarks}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface-2)]">
                <p className="text-xs text-[var(--muted)] mb-1">Percentage</p>
                <p className="text-3xl font-bold text-[var(--brand)]">
                  {((testResult.score / testResult.test.totalMarks) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface-2)]">
                <p className="text-xs text-[var(--muted)] mb-1">Questions</p>
                <p className="text-3xl font-bold">{testResult.test.questions.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Student's Answers */}
          <motion.div
            className="glass p-6 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xl font-bold mb-6">Student's Answers</h4>
            <div className="space-y-4">
              {testResult.test.questions.map((q, i) => {
                const studentAnswerIdx = testResult.answers[i];
                const studentAnswer = studentAnswerIdx >= 0 ? q.options[studentAnswerIdx] : "Not answered";

                return (
                  <div key={i} className="p-4 rounded-lg bg-[var(--surface-2)]">
                    <p className="font-semibold mb-2">Q{i + 1}. {q.prompt}</p>
                    <p className="text-sm">
                      <span className="text-[var(--muted)]">Student's Answer:</span>
                      <span className="ml-2 font-medium">{studentAnswer}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right: Assessment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:sticky lg:top-6 h-fit"
        >
          <TeacherAssessmentForm
            testId={params.testId}
            resultId={params.resultId}
            studentName={testResult.student.name}
            studentScore={testResult.score}
            totalMarks={testResult.test.totalMarks}
            onSubmitSuccess={() => {
              // Show success message or refresh
              alert("Assessment submitted successfully!");
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

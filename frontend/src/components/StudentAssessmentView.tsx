"use client";

import { useState, useEffect } from "react";
import { api, authHeader } from "@/lib/api";
import { Download, AlertCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";

interface Assessment {
  _id: string;
  grade: string;
  marks: number;
  feedback: string;
  notes: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string;
  teacher: { name: string; email: string };
  createdAt: string;
}

interface StudentAssessmentViewProps {
  testId: string;
  resultId: string;
  studentScore: number;
  totalMarks: number;
}

export function StudentAssessmentView({
  testId,
  resultId,
  studentScore,
  totalMarks,
}: StudentAssessmentViewProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    fetchAssessment();
  }, [testId, resultId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/tests/${testId}/result/${resultId}/assessment`,
        { headers: authHeader(token) }
      );
      setAssessment(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(
        `/tests/${testId}/result/${resultId}/download`,
        { headers: authHeader(token), responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `exam_${testId}_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download exam report");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="glass p-6 rounded-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader className="w-8 h-8 animate-spin mx-auto text-[var(--brand)]" />
        <p className="mt-4 text-[var(--muted)]">Loading assessment...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="glass p-6 rounded-2xl border border-red-500/20 bg-red-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (!assessment) {
    return (
      <motion.div
        className="glass p-6 rounded-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle className="w-12 h-12 text-[var(--muted)] mx-auto opacity-50" />
        <p className="mt-4 text-[var(--muted)]">No assessment available yet. Check back soon!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Teacher Assessment</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Feedback from {assessment.teacher.name}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] disabled:opacity-50 text-white rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          {downloading ? "Downloading..." : "Download Report"}
        </button>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-[var(--surface-2)]">
          <p className="text-xs text-[var(--muted)] mb-1">Your Score</p>
          <p className="text-2xl font-bold">
            {studentScore}/{totalMarks}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            {((studentScore / totalMarks) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--surface-2)]">
          <p className="text-xs text-[var(--muted)] mb-1">Grade</p>
          <p className="text-2xl font-bold text-[var(--brand)]">{assessment.grade}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Assessment Grade</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--surface-2)]">
          <p className="text-xs text-[var(--muted)] mb-1">Adjusted Marks</p>
          <p className="text-2xl font-bold">{assessment.marks}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Out of {totalMarks}</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Feedback</h4>
        <p className="text-sm leading-relaxed p-4 rounded-lg bg-[var(--surface-2)]">
          {assessment.feedback}
        </p>
      </div>

      {/* Strengths */}
      {assessment.strengths && assessment.strengths.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-green-600">✓ Strengths</h4>
          <ul className="space-y-2">
            {assessment.strengths.map((strength, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm p-3 rounded-lg bg-green-500/10"
              >
                <span className="text-green-600 font-bold">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {assessment.areasForImprovement && assessment.areasForImprovement.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-amber-600">⚠ Areas for Improvement</h4>
          <ul className="space-y-2">
            {assessment.areasForImprovement.map((area, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm p-3 rounded-lg bg-amber-500/10"
              >
                <span className="text-amber-600 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {assessment.recommendations && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Recommendations</h4>
          <p className="text-sm leading-relaxed p-4 rounded-lg bg-[var(--surface-2)]">
            {assessment.recommendations}
          </p>
        </div>
      )}

      {/* Additional Notes */}
      {assessment.notes && (
        <div>
          <h4 className="font-semibold mb-3">Additional Notes</h4>
          <p className="text-sm leading-relaxed p-4 rounded-lg bg-[var(--surface-2)]">
            {assessment.notes}
          </p>
        </div>
      )}

      {/* Date */}
      <div className="mt-6 pt-6 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        <p>Assessment submitted on {new Date(assessment.createdAt).toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
}

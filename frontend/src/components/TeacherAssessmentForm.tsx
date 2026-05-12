"use client";

import { useState } from "react";
import { api, authHeader } from "@/lib/api";
import { AlertCircle, Send, CheckCircle } from "lucide-react";

interface TeacherAssessmentFormProps {
  testId: string;
  resultId: string;
  studentName: string;
  studentScore: number;
  totalMarks: number;
  onSubmitSuccess?: () => void;
}

export function TeacherAssessmentForm({
  testId,
  resultId,
  studentName,
  studentScore,
  totalMarks,
  onSubmitSuccess,
}: TeacherAssessmentFormProps) {
  const [notes, setNotes] = useState("");
  const [grade, setGrade] = useState("Pass");
  const [marks, setMarks] = useState(studentScore);
  const [feedback, setFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setMessage("Please provide feedback");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const strengthsList = strengths
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const improvementList = areasForImprovement
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      const response = await api.post(
        `/tests/${testId}/result/${resultId}/assessment`,
        {
          notes,
          grade,
          marks: parseInt(marks as any),
          feedback,
          strengths: strengthsList,
          areasForImprovement: improvementList,
          recommendations,
        },
        { headers: authHeader(token) }
      );

      setMessage("Assessment submitted successfully!");
      setMessageType("success");

      // Reset form
      setTimeout(() => {
        setNotes("");
        setGrade("Pass");
        setMarks(studentScore);
        setFeedback("");
        setStrengths("");
        setAreasForImprovement("");
        setRecommendations("");
        if (onSubmitSuccess) onSubmitSuccess();
      }, 1500);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to submit assessment");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-2xl font-bold mb-1">Assessment for {studentName}</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Score: {studentScore}/{totalMarks}
      </p>

      {message && (
        <motion.div
          className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
            messageType === "success"
              ? "bg-green-500/10 border border-green-500/20"
              : messageType === "error"
              ? "bg-red-500/10 border border-red-500/20"
              : "bg-blue-500/10 border border-blue-500/20"
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {messageType === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              messageType === "success"
                ? "text-green-600"
                : messageType === "error"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {message}
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grade & Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              aria-label="Grade"
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)]"
            >
              <option value="A">A - Excellent</option>
              <option value="B">B - Good</option>
              <option value="C">C - Average</option>
              <option value="D">D - Below Average</option>
              <option value="F">F - Failed</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(parseInt(e.target.value) || studentScore)}
              max={totalMarks}
              aria-label="Marks"
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold mb-2">Feedback *</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide detailed feedback on the student's performance..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] resize-none"
            required
          />
        </div>

        {/* Strengths */}
        <div>
          <label className="block text-sm font-semibold mb-2">Strengths</label>
          <input
            type="text"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="List strengths separated by commas (e.g., Good problem solving, Strong fundamentals)"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        {/* Areas for Improvement */}
        <div>
          <label className="block text-sm font-semibold mb-2">Areas for Improvement</label>
          <input
            type="text"
            value={areasForImprovement}
            onChange={(e) => setAreasForImprovement(e.target.value)}
            placeholder="List areas separated by commas (e.g., Time management, Accuracy)"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-sm font-semibold mb-2">Recommendations</label>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Provide recommendations for improvement..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold mb-2">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or comments..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Send className="w-4 h-4" />
          {isLoading ? "Submitting..." : "Submit Assessment"}
        </button>
      </form>
    </div>
  );
}

// Import motion if not already available
import { motion } from "framer-motion";

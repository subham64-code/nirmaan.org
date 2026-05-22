"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import NotificationSystem from "@/components/NotificationSystem";
import { useToast } from "@/components/ToastProvider";
import { api, authHeader } from "@/lib/api";
import { AlertTriangle, Download, ShieldAlert, Users } from "lucide-react";

type TestSummary = {
  _id: string;
  title: string;
  course: string;
  totalMarks: number;
};

type ResultItem = {
  _id: string;
  student: { _id: string; name: string; email: string };
  score: number;
  status?: string;
  cheatingDetails?: {
    reason?: string;
    tabSwitchCount?: number;
    screenshotCount?: number;
    events?: Array<{ type: string; at: string }>;
  } | null;
  submittedAt: string;
};

export default function AdminExamReviewsPage() {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const loadTests = async () => {
      const response = await api.get("/tests", { headers: authHeader(token) });
      const all = (response.data.data || []) as TestSummary[];
      setTests(all);
      if (!selectedTestId && all.length > 0) {
        setSelectedTestId(all[0]._id);
      }
    };

    loadTests().catch(() => null);
  }, [token, selectedTestId]);

  useEffect(() => {
    if (!selectedTestId) return;

    const loadResults = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/tests/${selectedTestId}/results`, { headers: authHeader(token) });
        setResults(response.data.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadResults().catch(() => null);
  }, [selectedTestId, token]);

  const selectedTest = useMemo(() => tests.find((test) => test._id === selectedTestId), [tests, selectedTestId]);
  const flaggedResults = results.filter((result) => result.status === "cheated" || Boolean(result.cheatingDetails));

  const downloadReport = async (format: "pdf" | "doc") => {
    const response = await api.get(`/tests/${selectedTestId}/report/${format}`, {
      headers: authHeader(token),
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam_${selectedTestId}_report.${format === "doc" ? "docx" : "pdf"}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title="Exam Reviews"
      subtitle="Inspect cheating events, student answers, and download exam reports"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/exam-reviews", label: "Exam Reviews" },
      ]}
      actions={<NotificationSystem />}
    >
      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-[var(--brand)]" /> Cheating Review Center
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Monitor flagged submissions and download the latest exam report.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              aria-label="Select exam to review"
              className="min-w-72 rounded-lg border border-[var(--outline)] bg-white px-3 py-2"
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
            >
              {tests.map((test) => (
                <option key={test._id} value={test._id}>
                  {test.title} • {test.course}
                </option>
              ))}
            </select>
            <button
              onClick={() => downloadReport("pdf").catch((error: unknown) => showToast("error", error instanceof Error ? error.message : "Failed to download PDF report"))}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 font-semibold text-white"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={() => downloadReport("doc").catch((error: unknown) => showToast("error", error instanceof Error ? error.message : "Failed to download DOC report"))}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white"
            >
              <Download className="h-4 w-4" /> DOC
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--outline)] p-4">
            <p className="text-sm text-[var(--muted)]">Selected exam</p>
            <p className="font-semibold">{selectedTest?.title || "No exam selected"}</p>
          </div>
          <div className="rounded-xl border border-[var(--outline)] p-4">
            <p className="text-sm text-[var(--muted)]">Submissions</p>
            <p className="font-semibold">{results.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--outline)] p-4">
            <p className="text-sm text-[var(--muted)]">Flagged</p>
            <p className="font-semibold text-red-600">{flaggedResults.length}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--outline)]">
          <div className="bg-[var(--surface-2)] px-4 py-3 font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Student submissions
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/80 text-left text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Cheating Details</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={5}>
                      Loading results...
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={5}>
                      No results yet.
                    </td>
                  </tr>
                ) : (
                  results.map((result) => (
                    <tr key={result._id} className={result.status === "cheated" ? "bg-red-50" : "bg-white"}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{result.student.name}</div>
                        <div className="text-xs text-[var(--muted)]">{result.student.email}</div>
                      </td>
                      <td className="px-4 py-3">{result.score}</td>
                      <td className="px-4 py-3">
                        {result.status === "cheated" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5" /> Cheated
                          </span>
                        ) : result.status === "auto_failed" ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Auto-failed</span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">Submitted</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {result.cheatingDetails ? (
                          <div className="space-y-1">
                            <div className="font-medium">{result.cheatingDetails.reason || "Suspicious activity"}</div>
                            <div className="text-xs text-[var(--muted)]">
                              {typeof result.cheatingDetails.tabSwitchCount === "number" ? `Tabs: ${result.cheatingDetails.tabSwitchCount} ` : ""}
                              {typeof result.cheatingDetails.screenshotCount === "number" ? `Screenshots: ${result.cheatingDetails.screenshotCount}` : ""}
                            </div>
                            {(result.cheatingDetails.events || []).length > 0 && (
                              <div className="text-xs text-[var(--muted)]">
                                Events: {(result.cheatingDetails.events || []).slice(0, 3).map((event) => event.type).join(", ")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{new Date(result.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

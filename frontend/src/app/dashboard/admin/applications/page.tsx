"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";

type ApplicationRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  course: string;
  tenthMarks: number;
  twelfthMarks: number;
  degreeMarks: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function ApplicationsReviewPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/applications?status=${filter}`, {
          headers: authHeader(token),
        });
        setApplications(response.data.data || []);
      } catch {
        setMessage("Failed to load applications.");
      }
    };
    load();
  }, [filter, token]);

  const handleReview = async (applicationId: string, action: "approved" | "rejected") => {
    try {
      await api.patch(
        `/applications/${applicationId}/review`,
        { action, remarks },
        { headers: authHeader(token) }
      );
      setMessage(`Application ${action}.`);
      setSelected(null);
      setRemarks("");
      setApplications((prev) => prev.filter((a) => a._id !== applicationId));
    } catch {
      setMessage("Failed to update application.");
    }
  };

  const selectedApp = applications.find((a) => a._id === selected);
  const avgMarks = selectedApp
    ? Math.round(((selectedApp.tenthMarks + selectedApp.twelfthMarks + selectedApp.degreeMarks) / 3) * 100) / 100
    : 0;

  return (
    <DashboardShell
      title="Application Review Queue"
      subtitle="Approve or reject student applications with detailed records"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/applications", label: "Applications" },
        { href: "/dashboard/admin/teachers", label: "Teachers" },
        { href: "/dashboard/admin/media", label: "Media" },
      ]}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {["pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === status
                    ? "bg-[var(--brand)] text-white"
                    : "border border-[var(--outline)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Rejected"} ({applications.length})
              </button>
            ))}
          </div>

          <div className="glass divide-y divide-[var(--outline)]">
            {applications.length === 0 ? (
              <p className="p-4 text-sm text-[var(--muted)]">No applications in this status.</p>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  onClick={() => setSelected(app._id)}
                  className={`cursor-pointer p-4 transition ${
                    selected === app._id ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface)]"
                  }`}
                >
                  <p className="font-semibold">{app.name}</p>
                  <p className="text-sm text-[var(--muted)]">{app.email} • {app.phone}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-[var(--brand)]">{app.course}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-6 h-fit sticky top-6">
          {selectedApp ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl">{selectedApp.name}</h3>
                <p className="text-sm text-[var(--muted)]">{selectedApp.email}</p>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
                <p><strong>Course:</strong> {selectedApp.course}</p>
                <p><strong>Qualification:</strong> {selectedApp.qualification}</p>
              </div>

              <div className="rounded-lg border border-[var(--outline)] p-3 space-y-1 text-xs">
                <p><strong>10th:</strong> {selectedApp.tenthMarks}</p>
                <p><strong>12th:</strong> {selectedApp.twelfthMarks}</p>
                <p><strong>Degree:</strong> {selectedApp.degreeMarks}</p>
                <p className="mt-2 font-semibold text-[var(--brand)]">Avg: {avgMarks}</p>
              </div>

              {selectedApp.status === "pending" && (
                <>
                  <textarea
                    className="w-full rounded-lg border border-[var(--outline)] p-2 text-xs"
                    rows={3}
                    placeholder="Remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(selectedApp._id, "approved")}
                      className="flex-1 rounded-full bg-green-600 py-2 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(selectedApp._id, "rejected")}
                      className="flex-1 rounded-full bg-red-600 py-2 text-xs font-semibold text-white"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {message && <p className="text-xs text-[var(--brand)]">{message}</p>}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select an application to review.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

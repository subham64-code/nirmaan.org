"use client";

import { useCallback, useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";

type LeaveRequest = {
  _id: string;
  studentName: string;
  nirmaanId: string;
  leaveDate: string;
  returnDate?: string | null;
  reason: string;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  createdAt: string;
};

type Props = {
  userRole: "student" | "admin";
};

export default function LeaveRequestPanel({ userRole }: Props) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveDate, setLeaveDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [reason, setReason] = useState("");
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/leave-requests", { headers: authHeader(token) });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Failed to load leave requests:", error);
      setMessage("Unable to load leave requests right now.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRequests().catch(() => null);
  }, [loadRequests, userRole]);

  const submitRequest = async () => {
    if (!leaveDate || !reason.trim()) {
      setMessage("Select a leave date and add a reason.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(
        "/leave-requests",
        {
          leaveDate,
          returnDate: returnDate || null,
          reason,
        },
        { headers: authHeader(token) }
      );
      setMessage("Leave request submitted for admin review.");
      setLeaveDate("");
      setReturnDate("");
      setReason("");
      await loadRequests();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewRequest = async (requestId: string, action: "approved" | "rejected") => {
    try {
      setSubmitting(true);
      await api.patch(
        `/leave-requests/${requestId}/review`,
        { action, remarks: remarksById[requestId] || "" },
        { headers: authHeader(token) }
      );
      setMessage(`Leave request ${action}.`);
      setRemarksById((current) => {
        const next = { ...current };
        delete next[requestId];
        return next;
      });
      await loadRequests();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to review leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = requests.filter((request) => request.status === "pending").length;

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand)]">Leave workflow</p>
          <h2 className="mt-2 text-2xl font-bold">{userRole === "student" ? "Request leave" : "Review leave requests"}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {userRole === "student"
              ? "Choose the leave date, explain the reason, and the admin will receive a verified request."
              : "Approve or deny leave requests. Students receive an in-app notification with the final status."}
          </p>
        </div>
        <div className="rounded-full border border-[var(--outline)] px-4 py-2 text-sm font-semibold">
          Pending: {pendingCount}
        </div>
      </div>

      {userRole === "student" && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">
            Leave date
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3"
            />
          </label>
          <label className="text-sm font-medium">
            Return date
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3"
            />
          </label>
          <label className="text-sm font-medium md:col-span-3">
            Reason
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need leave"
              className="mt-2 min-h-28 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3"
            />
          </label>
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={submitRequest}
              disabled={submitting}
              className="rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Send to Admin"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading leave requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No leave requests found.</p>
        ) : (
          requests.map((request) => (
            <article key={request._id} className="rounded-2xl border border-[var(--outline)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{request.studentName}</h3>
                  <p className="text-sm text-[var(--muted)]">{request.nirmaanId}</p>
                  <p className="mt-1 text-sm">
                    Leave: {new Date(request.leaveDate).toLocaleDateString()}
                    {request.returnDate ? ` · Return: ${new Date(request.returnDate).toLocaleDateString()}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{request.reason}</p>
                  {request.remarks && <p className="mt-2 text-xs text-[var(--brand)]">Admin note: {request.remarks}</p>}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    request.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : request.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {request.status}
                </span>
              </div>

              {userRole === "admin" && request.status === "pending" && (
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <textarea
                    value={remarksById[request._id] || ""}
                    onChange={(e) => setRemarksById((current) => ({ ...current, [request._id]: e.target.value }))}
                    placeholder="Admin remarks for the student"
                    className="min-h-24 rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] p-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => reviewRequest(request._id, "approved")}
                    disabled={submitting}
                    className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewRequest(request._id, "rejected")}
                    disabled={submitting}
                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Deny
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {message && <p className="mt-4 text-sm text-[var(--brand)]">{message}</p>}
    </section>
  );
}
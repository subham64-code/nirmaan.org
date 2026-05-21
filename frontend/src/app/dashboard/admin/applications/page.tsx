"use client";

import { useEffect, useState } from "react";
import { api, authHeader, getMediaUrl } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";

type ApplicationRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  age: number;
  dateOfBirth: string;
  qualification: string;
  course: string;
  photo: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function ApplicationsReviewPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    loadApplications();
  }, [filter, token]);

  const loadApplications = async () => {
    try {
      const response = await api.get(`/applications?status=${filter}`, {
        headers: authHeader(token),
      });
      setApplications(response.data.data || []);
      setMessage("");
    } catch (error) {
      console.error("Failed to load applications:", error);
      setMessage("Failed to load applications.");
      setMessageType("error");
      setApplications([]);
    }
  };

  const handleReview = async (applicationId: string, action: "approved" | "rejected") => {
    if (!applicationId) {
      setMessage("Error: Invalid application ID");
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      // Make the review request
      const response = await api.patch(
        `/applications/${applicationId}/review`,
        { action, remarks },
        { headers: authHeader(token) }
      );

      if (!response.data) {
        throw new Error("No response data received");
      }

      // Show success message
      setMessage(
        action === "approved"
          ? "✓ Application approved and student account created!"
          : "✓ Application rejected successfully!"
      );
      setMessageType("success");
      
      // Clear selection and remarks
      setSelected(null);
      setRemarks("");

      // Wait a moment to show success message, then reload
      setTimeout(() => {
        loadApplications();
        setIsLoading(false);
      }, 500);
    } catch (error: any) {
      setIsLoading(false);
      console.error("Failed to update application:", error);
      
      // Provide detailed error message
      let errorMessage = "Failed to update application.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 400) {
        errorMessage = "Invalid action or application state error.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Application not found.";
      } else if (error?.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setMessageType("error");
      
      // Reload to sync with server state
      setTimeout(() => {
        loadApplications();
      }, 1000);
    }
  };

  const selectedApp = applications.find((a) => a._id === selected);

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
              {selectedApp.photo && (
                <div className="w-full h-40 rounded-lg overflow-hidden border mb-4">
                  <img src={getMediaUrl(selectedApp.photo)} alt="Student" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold">{selectedApp.name}</h3>
                <p className="text-sm text-[var(--muted)]">{selectedApp.email}</p>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
                <p><strong>Aadhaar:</strong> {selectedApp.aadhaar}</p>
                <p><strong>DOB:</strong> {selectedApp.dateOfBirth} (Age: {selectedApp.age})</p>
                <p><strong>Course:</strong> {selectedApp.course}</p>
                <p><strong>Qualification:</strong> {selectedApp.qualification}</p>
              </div>

              {message && (
                <div className={`text-xs p-3 rounded-lg ${messageType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {message}
                </div>
              )}

              {(selectedApp.status === "pending" || selectedApp.status === "rejected") && (
                <>
                  <textarea
                    className="w-full rounded-lg border border-[var(--outline)] p-2 text-xs"
                    rows={3}
                    placeholder="Remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(selectedApp._id, "approved")}
                      disabled={isLoading}
                      className="flex-1 rounded-full bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReview(selectedApp._id, "rejected")}
                      disabled={isLoading}
                      className="flex-1 rounded-full bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select an application to review.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

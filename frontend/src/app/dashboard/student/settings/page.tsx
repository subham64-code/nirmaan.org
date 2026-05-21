"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import NotificationSystem from "@/components/NotificationSystem";
import { api, authHeader } from "@/lib/api";

export default function StudentSettingsPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("role", "student");

      const response = await api.post("/media/upload-profile", formData, {
        headers: authHeader(token),
      });

      if (response.data.success) {
        const photoUrl = response.data.data.photoUrl;
        localStorage.setItem("nirmaan_user_picture", photoUrl);
        window.dispatchEvent(new Event("user-profile-updated"));
        setMessage("Profile photo updated successfully.");
      } else {
        setMessage("Failed to update profile photo.");
      }
    } catch {
      setMessage("Failed to update profile photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nirmaan_token");
      localStorage.removeItem("nirmaan_user");
      localStorage.removeItem("nirmaan_user_name");
      localStorage.removeItem("nirmaan_user_picture");
      localStorage.removeItem("nirmaan_role");
      localStorage.removeItem("nirmaan_user_id");
      window.location.href = "/login/student";
    }
  };

  return (
    <DashboardShell
      title="Student Settings"
      subtitle="Manage your profile, session, and account preferences"
      nav={[
        { href: "/dashboard/student", label: "Overview" },
        { href: "/dashboard/student/settings", label: "Settings" },
      ]}
      actions={<NotificationSystem />}
    >
      <section className="glass p-6 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold">Profile Controls</h2>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
          {uploading ? "Uploading..." : "Upload Profile Photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileUpload}
            disabled={uploading}
          />
        </label>

        <button
          onClick={handleLogout}
          className="inline-flex rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          Logout
        </button>

        {message && (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        )}
      </section>
    </DashboardShell>
  );
}

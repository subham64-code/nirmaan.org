"use client";

import { useState } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import { dailyAttendanceReportUrl } from "@/lib/constants";

export default function AttendanceSyncPage() {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  const syncFromSheet = async () => {
    try {
      const response = await api.get("/services/sheet-sync", { headers: authHeader(token) });
      setPreview(response.data.data.preview);
      setMessage("Google Sheet synced! Preview shown below.");
    } catch {
      setMessage("Sync failed. Check Google Sheet URL in .env");
    }
  };

  return (
    <DashboardShell
      title="Attendance Sync"
      subtitle="Sync attendance from Google Sheets"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/attendance", label: "Sync" },
        { href: "/dashboard/admin/sms", label: "Send SMS" },
      ]}
    >
      <div className="glass p-6">
        <h2 className="text-2xl">Google Sheets Integration</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Link your attendance Google Sheet to sync data automatically. Add the sheet URL to the GOOGLE_SHEETS_ATTENDANCE_URL in backend .env.
        </p>
        <button onClick={syncFromSheet} className="mt-4 rounded-full bg-[var(--brand)] px-5 py-2 text-white">Sync From Sheet</button>
        {message && <p className="mt-3 text-sm text-[var(--brand)]">{message}</p>}
        {preview && (
          <pre className="mt-4 overflow-auto rounded-lg border border-[var(--outline)] bg-[var(--surface-2)] p-4 text-xs">
            {preview}
          </pre>
        )}
      </div>

      <section className="glass mt-6 p-6">
        <h3 className="text-xl">How to Set Up</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-[var(--muted)]">
          <li>Create a Google Sheet with attendance data (Name, Date, Status).</li>
          <li>Right-click sheet → Share → Make "Anyone with link can view".</li>
          <li>Copy the sheet URL and add to backend .env: GOOGLE_SHEETS_ATTENDANCE_URL=your-url</li>
          <li>Restart backend server.</li>
          <li>Click "Sync From Sheet" to import data.</li>
        </ol>
      </section>

      <section className="glass mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl">Daily Attendance Report</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Open the published report inside the app or use the full spreadsheet view in a new tab.
            </p>
          </div>
          <a
            href={dailyAttendanceReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--outline)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]"
          >
            Open Report
          </a>
        </div>
        <iframe
          title="Daily Attendance Google Sheet Report"
          src={dailyAttendanceReportUrl}
          className="mt-4 h-[480px] w-full rounded-2xl border border-[var(--outline)] bg-white"
        />
      </section>
    </DashboardShell>
  );
}

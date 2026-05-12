"use client";

import { useState } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";

export default function SmsPage() {
  const [studentPhone, setStudentPhone] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  const sendSms = async () => {
    if (!studentPhone || !message) {
      setResult("Phone and message required.");
      return;
    }

    try {
      const response = await api.post(
        "/services/send-sms",
        { studentPhone, message },
        { headers: authHeader(token) }
      );
      setResult(`SMS sent! SID: ${response.data.data.messageSid}`);
    } catch {
      setResult("SMS send failed. Check Twilio credentials in .env");
    }
  };

  return (
    <DashboardShell
      title="SMS Notifications"
      subtitle="Send SMS alerts to students"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/attendance", label: "Sync" },
        { href: "/dashboard/admin/sms", label: "Send SMS" },
      ]}
    >
      <div className="glass p-6">
        <h2 className="text-2xl">Send SMS Alert</h2>
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-xl border border-[var(--outline)] p-3"
            placeholder="+1234567890"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
          />
          <textarea
            className="rounded-xl border border-[var(--outline)] p-3"
            placeholder="Message (max 160 chars)"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={160}
          />
          <button onClick={sendSms} className="rounded-full bg-[var(--brand)] px-5 py-2 text-white">Send SMS</button>
          {result && <p className="text-sm text-[var(--brand)]">{result}</p>}
        </div>
      </div>

      <section className="glass mt-6 p-6">
        <h3 className="text-xl">Setup Twilio SMS</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-[var(--muted)]">
          <li>Go to twilio.com and create account.</li>
          <li>Get Account SID, Auth Token, and Twilio phone number.</li>
          <li>Add to backend .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER</li>
          <li>Student phone must be in international format: +country-code-number</li>
        </ol>
      </section>
    </DashboardShell>
  );
}

"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function OtpLoginForm({ role }: { role: "admin" | "teacher" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const requestOtp = async () => {
    try {
      await api.post("/auth/request-otp", { email, role });
      setRequested(true);
      setMessage("OTP sent to your email.");
    } catch {
      setMessage("Failed to request OTP.");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await api.post("/auth/verify-otp", { email, role, otp, name });
      localStorage.setItem("nirmaan_token", response.data.data.token);
      router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/teacher");
    } catch {
      setMessage("Invalid OTP.");
    }
  };

  return (
    <div className="glass mx-auto max-w-lg p-8" data-reveal>
      <h1 className="text-3xl capitalize">{role} Login</h1>
      <div className="mt-5 grid gap-3">
        <input className="rounded-xl border border-[var(--outline)] p-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input className="rounded-xl border border-[var(--outline)] p-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        {!requested ? (
          <button className="rounded-full bg-[var(--brand)] py-3 font-semibold text-white" onClick={requestOtp}>Request OTP</button>
        ) : (
          <>
            <input className="rounded-xl border border-[var(--outline)] p-3" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
            <button className="rounded-full bg-[var(--brand)] py-3 font-semibold text-white" onClick={verifyOtp}>Verify & Login</button>
          </>
        )}
        {message && <p className="text-sm text-[var(--brand)]">{message}</p>}
      </div>
    </div>
  );
}

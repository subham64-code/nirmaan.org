"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const id = searchParams.get("id");
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email address...");
  const [studentDetails, setStudentDetails] = useState<any>(null);

  useEffect(() => {
    if (!email || !id) {
      setStatus("error");
      setMessage("Invalid verification link. Missing email or application ID.");
      return;
    }

    const verify = async () => {
      try {
        const response = await api.post("/applications/verify-email", { email, id });
        if (response.data.success) {
          setStatus("success");
          setMessage("Your email has been verified and your Nirmaan student account is now fully active!");
          setStudentDetails(response.data.data?.student);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Email verification failed.");
        }
      } catch (error: any) {
        const errMsg = error.response?.data?.message || "A network or server error occurred during verification.";
        setStatus("error");
        setMessage(errMsg);
      }
    };

    verify();
  }, [email, id]);

  return (
    <div className="w-full max-w-lg glass p-8 rounded-3xl shadow-2xl border border-white/10 text-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {status === "verifying" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verifying Account</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Email Verified!</h2>
            <p className="text-emerald-300 font-medium text-sm">Account Activated Successfully</p>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">{message}</p>

            {studentDetails && (
              <div className="my-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Student Credentials</p>
                <p className="text-sm text-white"><strong>Name:</strong> {studentDetails.name}</p>
                <p className="text-sm text-white"><strong>Email:</strong> {studentDetails.email}</p>
                <p className="text-sm text-white">
                  <strong>Nirmaan ID:</strong>{" "}
                  <span className="font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs border border-indigo-500/30">
                    {studentDetails.nirmaanId}
                  </span>
                </p>
              </div>
            )}

            <div className="pt-4">
              <a
                href="/login/student"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Student Login
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-rose-300 font-medium text-sm">Action Denied</p>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">{message}</p>
            
            <div className="pt-4 flex gap-3">
              <a
                href="/apply"
                className="flex-1 bg-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/20 transition text-sm"
              >
                Apply Again
              </a>
              <a
                href="/login/student"
                className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                Student Portal
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <Suspense fallback={
        <div className="text-center text-slate-300 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-semibold">Loading verification module...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Mail, MessageSquare, Bot, CheckCircle, AlertCircle } from "lucide-react";
import { gsap } from "gsap";
import GoogleOAuthButton from "./GoogleOAuthButton";

interface OTPLoginProps {
  role: "admin" | "teacher" | "student";
}

export default function RealTimeOTPLogin({ role }: OTPLoginProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "phone" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate container entrance
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out"
      });
      
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    }

    // Animate header entrance
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        opacity: 0,
        scale: 0.8,
        y: -30,
        duration: 0.6,
        ease: "power3.out"
      });
      
      gsap.to(headerRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      });
    }

    // Animate form entrance
    if (formRef.current) {
      gsap.from(formRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out"
      });
      
      gsap.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    }
  }, []);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      if (responseMessage) return responseMessage;

      const errorMessage = (error as { message?: string }).message;
      if (errorMessage) return errorMessage;
    }

    return fallback;
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const requestOTP = async (method: "email" | "sms" | "both") => {
    setLoading(true);
    setMessage("");
    
    try {
      const cleanPhone = phone?.trim();
      const payloadBase: any = { email, role };
      if (cleanPhone) payloadBase.phone = cleanPhone;

      const payload = method === "email"
        ? { ...payloadBase, deliveryMethod: "email" }
        : method === "sms"
        ? { ...payloadBase, deliveryMethod: "sms" }
        : { ...payloadBase, deliveryMethod: "both" };

      const response = await api.post("/auth/request-otp", payload);
      
      if (response.data.success) {
        setOtpSent(true);
        setStep("otp");
        setCountdown(60);
        setDeliveryMethods(method === "both" ? ["email", "sms"] : [method]);
        setMessage(`✅ OTP sent via ${method === "both" ? "Email & SMS" : method}! Check your ${method === "both" ? "email and phone" : method}.`);
        
        // Simulate real-time delivery tracking
        simulateDeliveryTracking(method);
      } else {
        setMessage("❌ Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setMessage(`❌ ${getErrorMessage(error, "Network error. Please check your connection.")}`);
    } finally {
      setLoading(false);
    }
  };

  const simulateDeliveryTracking = (method: string) => {
    const methods = method === "both" ? ["email", "sms"] : [method];
    methods.forEach((m, index) => {
      setTimeout(() => {
        setDeliveryMethods(prev => [...prev, `${m} delivered`]);
      }, (index + 1) * 2000);
    });
  };

  const verifyOTP = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        phone: phone || undefined,
        otp,
        role
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("nirmaan_token", token);
        localStorage.setItem("nirmaan_user", JSON.stringify(user));
        localStorage.setItem("nirmaan_user_name", user.name || user.email);
        localStorage.setItem("nirmaan_role", role);
        setIsVerified(true);
        
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = `/dashboard/${role}`;
        }, 1500);
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      setMessage(`❌ ${getErrorMessage(error, "Verification failed. Please check your OTP.")}`);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    await requestOTP("email");
  };

  const openInbox = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.endsWith("@gmail.com")) {
      window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
      return;
    }
    if (normalizedEmail.endsWith("@outlook.com") || normalizedEmail.endsWith("@hotmail.com") || normalizedEmail.endsWith("@live.com")) {
      window.open("https://outlook.live.com/mail/", "_blank", "noopener,noreferrer");
      return;
    }
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

  const handleOAuthSuccess = (token: string, user: any) => {
    localStorage.setItem("nirmaan_token", token);
    localStorage.setItem("nirmaan_user", JSON.stringify(user));
    localStorage.setItem("nirmaan_user_name", user.name || user.email);
    localStorage.setItem("nirmaan_user_picture", user.picture || "");
    localStorage.setItem("nirmaan_role", role);

    setMessage("✅ OAuth login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = `/dashboard/${role}`;
    }, 1500);
  };

  const handleOAuthError = (error: string) => {
    setMessage(`❌ OAuth login failed: ${error}`);
  };

  const roleBackgroundClass =
    role === "admin"
      ? "bg-slate-900"
      : role === "teacher"
      ? "bg-blue-950"
      : "bg-emerald-950";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${roleBackgroundClass}`}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="w-full max-w-md">
        <div 
          ref={containerRef} 
          className="glass p-8 rounded-2xl min-h-[550px] flex flex-col transition-all duration-500 ease-in-out shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-8">
            {role === "admin" && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src="/admin-manager.jpg" alt="Admin Logo" className="w-16 h-16 rounded-full border-2 border-white" />
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand)] to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">ADMIN</span>
                </div>
              </div>
            )}
            {role !== "admin" && (
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand)] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">{role.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              {role === "admin" ? "Administrator" : role.charAt(0).toUpperCase() + role.slice(1)} Login
            </h1>
            <p className="text-[var(--muted)]">Secure OTP authentication</p>
          </div>

          {/* Email Step */}
          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
                    placeholder="admin@nirmaan.edu"
                  />
                </div>
              </div>

              {/* Google OAuth Option */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--outline)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[var(--background)] text-[var(--muted)]">Quick Login</span>
                </div>
              </div>

              <GoogleOAuthButton 
                onSuccess={handleOAuthSuccess}
                onError={handleOAuthError}
                role={role}
              />

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--outline)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[var(--background)] text-[var(--muted)]">OTP Authentication</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Phone Number (Optional for SMS)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => requestOTP("email")}
                  disabled={loading || !email}
                  className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? "Sending..." : "Send OTP via Email"}
                </button>

                {email && phone && (
                  <button
                    onClick={() => requestOTP("sms")}
                    disabled={loading || !email || !phone}
                    className="w-full border border-[var(--outline)] py-3 rounded-xl font-semibold hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {loading ? "Sending..." : "Send OTP via SMS"}
                  </button>
                )}

                {email && phone && (
                  <button
                    onClick={() => requestOTP("both")}
                    disabled={loading || !email || !phone}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    {loading ? "Sending..." : "Send via Email + SMS"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)] text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center">
                <button
                  onClick={resendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-[var(--brand)] hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>

              {role === "admin" && otpSent && (
                <button
                  onClick={openInbox}
                  className="w-full border border-[var(--outline)] py-3 rounded-xl font-semibold hover:bg-[var(--surface-2)] transition-colors"
                >
                  Open Email Inbox
                </button>
              )}

              {isVerified && (
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/${role}`;
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Open Dashboard
                </button>
              )}
            </div>
          )}

          {/* Real-time Status */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message.includes("✅") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          {/* Delivery Tracking */}
          {deliveryMethods.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">Delivery Status:</p>
              {deliveryMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {method}
                </div>
              ))}
            </div>
          )}

          {/* Powered By */}
          <div className="mt-auto pt-6 border-t border-[var(--outline)] text-center">
            <p className="text-xs text-[var(--muted)]">
              Powered by  Nirmaan.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

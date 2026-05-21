"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Users, Mail, CheckCircle, AlertCircle, GraduationCap, ShieldCheck, ShieldX } from "lucide-react";
import { gsap } from "gsap";
import GoogleOAuthButton from "./GoogleOAuthButton";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  expertise: string;
  status: "active" | "inactive";
  avatar: string;
}

const teachers: Teacher[] = [
  {
    id: "TCH001",
    name: "Mr. Krishan Kumar",
    email: "krishan.kumar@nirmaan.edu",
    phone: "+91-9876543210",
    qualification: "M.A. Psychology",
    experience: "10+ years",
    expertise: "Soft Skills & Communication",
    status: "active",
    avatar: "/trainer-krishan.jpg"
  },
  {
    id: "TCH002",
    name: "Mr. Stithikantha Mohanty",
    email: "stithikantha.mohanty@nirmaan.edu",
    phone: "+91-9876543211",
    qualification: "M.A. Education",
    experience: "8+ years",
    expertise: "Behavioral Training & Leadership",
    status: "active",
    avatar: "/trainer-stithikantha.jpg"
  },
  {
    id: "TCH003",
    name: "Mr. Mihir Pattanaik",
    email: "mihir.pattanaik@nirmaan.edu",
    phone: "+91-9876543212",
    qualification: "M.Tech AI/ML",
    experience: "12+ years",
    expertise: "Machine Learning & Deep Learning",
    status: "active",
    avatar: "/trainer-mihir.png"
  },
  {
    id: "TCH004",
    name: "Mr. Kalpa Pandit",
    email: "kalpa.pandit@nirmaan.edu",
    phone: "+91-9876543213",
    qualification: "M.Tech NLP & Computer Vision",
    experience: "15+ years",
    expertise: "NLP & Computer Vision",
    status: "active",
    avatar: "/trainer-kalpa.jpg"
  }
];

export default function TeacherLoginWithID() {
  const [step, setStep] = useState<"select" | "otp">("select");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEmail(teacher.email);
    setTeacherId(teacher.id);
    setStep("otp");
    // Trigger OTP request automatically
    requestOTP(teacher);
  };

  const handleOTPLogin = async () => {
    if (!selectedTeacher || !otp) {
      setMessage("Please select a teacher and enter OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email: selectedTeacher.email,
        otp,
        name: selectedTeacher.name,
        role: "teacher"
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("nirmaan_token", token);
        localStorage.setItem("nirmaan_user", JSON.stringify(user));
        localStorage.setItem("nirmaan_user_name", user.name || user.email);
        localStorage.setItem("nirmaan_role", "teacher");

        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard/teacher";
        }, 1500);
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      setMessage("❌ Login failed. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (teacherObj?: Teacher) => {
    const targetTeacher = teacherObj || selectedTeacher;
    if (!targetTeacher) {
      setMessage("Please select a teacher first");
      return;
    }

    setLoading(true);
    setMessage("📧 Sending OTP to your email...");

    try {
      const response = await api.post("/auth/request-otp", {
        email: targetTeacher.email,
        role: "teacher",
        name: targetTeacher.name,
        deliveryMethod: "email"
      });

      if (response.data.success) {
        const target = response.data?.data?.target || "registered contact";
        setMessage(`✅ OTP sent successfully! Delivery target: ${target}. Please check your registered email or SMS inbox.`);
      } else {
        setMessage("❌ Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setMessage("❌ Failed to send OTP. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleOAuthSuccess = (token: string, user: any) => {
    localStorage.setItem("nirmaan_token", token);
    localStorage.setItem("nirmaan_user", JSON.stringify(user));
    localStorage.setItem("nirmaan_user_name", user.name || user.email);
    localStorage.setItem("nirmaan_user_picture", user.picture || "");
    localStorage.setItem("nirmaan_role", "teacher");

    setMessage("✅ OAuth login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "/dashboard/teacher";
    }, 1500);
  };

  const handleOAuthError = (error: string) => {
    if (/pending|blocked|approval/i.test(error)) {
      setMessage(`❌ Access blocked: ${error}`);
      return;
    }
    setMessage(`❌ OAuth login failed: ${error}`);
  };

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

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="w-full max-w-6xl">
        <div ref={containerRef} className="glass p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-white/50">
              {selectedTeacher ? (
                <img
                  src={selectedTeacher.avatar}
                  alt={selectedTeacher.name}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <GraduationCap className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedTeacher ? selectedTeacher.name : "Teacher Portal"}
            </h1>
            <p className="text-white/90">
              {selectedTeacher ? "Verify OTP or use Google Auth to log in" : "Select your profile and login with OTP"}
            </p>
          </div>

          {/* Teacher Selection */}
          {step === "select" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">Select Your Profile</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => handleTeacherSelect(teacher)}
                    className="p-6 rounded-xl border-2 border-white/20 cursor-pointer transition-all hover:border-white/40 hover:bg-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-full border-2 border-white/50"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{teacher.name}</h3>
                        <p className="text-sm text-white/80 mb-2">{teacher.expertise}</p>
                        <div className="text-xs text-white/60 space-y-1">
                          <p>📧 {teacher.qualification}</p>
                          <p>📞 {teacher.phone}</p>
                          <p>📧 {teacher.email}</p>
                          <p>🎓 {teacher.experience}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            teacher.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {teacher.status}
                          </span>
                          <span className="text-xs text-white/60">ID: {teacher.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTP Verification */}
          {step === "otp" && selectedTeacher && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedTeacher.avatar}
                    alt={selectedTeacher.name}
                    className="w-20 h-20 rounded-full border-2 border-white/50"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{selectedTeacher.name}</h3>
                    <p className="text-sm text-white/80">{selectedTeacher.email}</p>
                    <p className="text-xs text-white/60">Teacher ID: {selectedTeacher.id}</p>
                  </div>
                </div>
              </div>

              {/* Google OAuth Option */}
              <div>
                <p className="text-center text-white/80 mb-3 text-sm">Or login with Google:</p>
                <GoogleOAuthButton 
                  onSuccess={handleOAuthSuccess}
                  onError={handleOAuthError}
                  role="teacher"
                />
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Approved teachers can sign in</span>
                  <span className="inline-flex items-center gap-1"><ShieldX className="w-3.5 h-3.5" /> Blocked/pending accounts are denied</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/5 text-white/60">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Enter OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleOTPLogin}
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Login with OTP"}
                </button>
                <button
                  onClick={requestOTP}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border-2 border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message.includes("✅") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          {/* Back to Login Options */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-white/60 mb-4">Are you an administrator or student?</p>
            <div className="flex gap-4 justify-center">
              <a
                href="/login/admin"
                className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
              >
                Admin Login
              </a>
              <a
                href="/login/student"
                className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
              >
                Student Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

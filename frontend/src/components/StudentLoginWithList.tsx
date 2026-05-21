"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Mail, Lock, CheckCircle, AlertCircle, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";

interface PredefinedStudent {
  id: string;
  name: string;
  email: string;
  nirmaanId: string;
  course: string;
  qualification: string;
  status: "active" | "pending" | "approved";
  avatar: string;
  branch?: string;
  mobile?: string;
}
import { redingtonStudents, industryOrientedStudents } from "@/lib/predefinedStudents";

export default function StudentLoginWithList() {
  const [dynamicStudents, setDynamicStudents] = useState<PredefinedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<PredefinedStudent | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [nirmaanId, setNirmaanId] = useState("");
  const [otp, setOtp] = useState("");
  const [loginMethod, setLoginMethod] = useState<"list" | "email" | "otp">("list");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCohort, setSelectedCohort] = useState<"redington" | "industry">("industry");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadApprovedStudents = async () => {
      try {
        const response = await api.get("/students/predefined");
        const rows = response.data?.data || [];
        if (Array.isArray(rows)) {
          setDynamicStudents(rows);
        }
      } catch {
        setDynamicStudents([]);
      }
    };
    loadApprovedStudents();
  }, []);

  const predefinedStudents = useMemo(() => {
    const fallbackList = selectedCohort === "redington" ? redingtonStudents : industryOrientedStudents;
    const filteredDynamic = dynamicStudents.filter(s => {
      const courseStr = String(s.course || "").toLowerCase();
      if (selectedCohort === "redington") {
        return courseStr.includes("ai/ml") || courseStr.includes("redington") || (!courseStr.includes("industry") && !courseStr.includes("cse-ai"));
      } else {
        return courseStr.includes("industry") || courseStr.includes("cse-ai");
      }
    });

    const merged = [...filteredDynamic, ...fallbackList];
    const seen = new Set<string>();
    const deDuplicated = merged.filter((row) => {
      const key = (row.email || row.nirmaanId || row.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return deDuplicated.filter(s => 
        String(s.name || "").toLowerCase().includes(q) ||
        String(s.nirmaanId || "").toLowerCase().includes(q) ||
        String(s.email || "").toLowerCase().includes(q) ||
        String(s.branch || s.course || "").toLowerCase().includes(q) ||
        String(s.mobile || "").toLowerCase().includes(q)
      );
    }

    return deDuplicated;
  }, [dynamicStudents, selectedCohort, searchQuery]);

  const handleStudentSelect = (student: PredefinedStudent) => {
    setSelectedStudent(student);
    setEmail(student.email);
    setNirmaanId(student.nirmaanId);
    setLoginMethod("otp");
    setShowOTP(true);
    // Automatically request OTP when student is selected
    requestOTP();
  };

  const handleEmailLogin = () => {
    setLoginMethod("email");
    setSelectedStudent(null);
    setEmail("");
    setNirmaanId("");
    setShowOTP(false);
  };

  const handleEmailOTPRequest = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    setMessage("Sending OTP...");
    setOtp("");

    // Try to find student in predefined or dynamic lists to extract course/mobile
    const matchedStudent = [
      ...industryOrientedStudents, 
      ...redingtonStudents, 
      ...(typeof dynamicStudents !== "undefined" ? dynamicStudents : [])
    ].find(
      (s) => s.email?.toLowerCase().trim() === email.toLowerCase().trim()
    );

    try {
      const response = await api.post("/auth/request-otp", {
        email,
        role: "student",
        name: matchedStudent?.name || "Student",
        course: matchedStudent?.course || "CSE-AI Industry Oriented",
        mobile: matchedStudent?.mobile || (matchedStudent as any)?.phone,
      });

      if (response.data.success) {
        const target = response.data?.data?.target || "registered contact";
        const who = matchedStudent?.name || "Student";
        setMessage(`OTP sent successfully for ${who}. Delivery target: ${target}. Please check your registered email or SMS inbox.`);
        setShowOTP(true);
        setLoginMethod("otp");
      } else {
        setMessage("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage ? `${responseMessage}` : "Failed to send OTP. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTPVerify = async () => {
    if (!email || !otp) {
      setMessage("Please enter your email and OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
        role: "student"
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("nirmaan_token", token);
        localStorage.setItem("nirmaan_user", JSON.stringify(user));
        localStorage.setItem("nirmaan_user_name", user.name || user.email);
        localStorage.setItem("nirmaan_role", "student");

        setMessage("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard/student";
        }, 1500);
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage ? `${responseMessage}` : "Login failed. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!selectedStudent || !otp) {
      setMessage("Please select a student and enter OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email: selectedStudent.email,
        otp,
        role: "student"
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("nirmaan_token", token);
        localStorage.setItem("nirmaan_user", JSON.stringify(user));
        localStorage.setItem("nirmaan_user_name", user.name || user.email);
        localStorage.setItem("nirmaan_role", "student");

        setMessage(`Login successful! Welcome ${selectedStudent.name}. Redirecting to dashboard...`);
        setTimeout(() => {
          window.location.href = "/dashboard/student";
        }, 1500);
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage ? `${responseMessage}` : "Login failed. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async () => {
    if (!selectedStudent) {
      setMessage("Please select a student first");
      return;
    }

    setLoading(true);
    setMessage("Sending OTP...");
    setOtp("");

    try {
      const response = await api.post("/auth/request-otp", {
        email: selectedStudent.email,
        role: "student",
        name: selectedStudent.name,
        course: selectedStudent.course,
        mobile: selectedStudent.mobile,
      });

      if (response.data.success) {
        const target = response.data?.data?.target || "registered contact";
        const code = response.data?.data?.debugOtp; // only accept explicit demo OTP
        if (code) {
          // show demo OTP only when backend intentionally provided it
          setMessage(`OTP sent for ${selectedStudent.name}. Delivery target: ${target}. [Demo Mode: Use OTP Code: ${code}]`);
          setOtp(code);
        } else {
          // Do NOT display any production OTPs in the UI
          setMessage(`OTP sent for ${selectedStudent.name}. Delivery target: ${target}. Check your registered email or SMS inbox.`);
        }
        setShowOTP(true);
      } else {
        setMessage("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setMessage("Failed to send OTP. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] p-4">
      <div className="w-full max-w-4xl">
        <div className="glass p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand)] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Student Portal</h1>
            <p className="text-[var(--muted)]">Choose your login method</p>
          </div>

          {dynamicStudents.length > 0 && (
            <p className="text-center text-xs text-[var(--muted)] mb-4">
              Live approved students loaded: {dynamicStudents.length}
            </p>
          )}

          {/* Login Method Selection */}
          <div className="mb-6">
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => setLoginMethod("list")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  loginMethod === "list"
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Predefined Students
              </button>
              <button
                onClick={handleEmailLogin}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  loginMethod === "email"
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Login
              </button>
            </div>
          </div>

          {/* Predefined Student List */}
          {loginMethod === "list" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--outline)] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Select Your Profile</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Click your card to request your secure entry OTP code</p>
                </div>
                
                {/* Cohort Selector Tab Deck */}
                <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--outline)] self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCohort("industry");
                      setSearchQuery("");
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedCohort === "industry"
                        ? "bg-[var(--brand)] text-white shadow-xs"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                    }`}
                  >
                    CSE-AI (Industry Oriented)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCohort("redington");
                      setSearchQuery("");
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedCohort === "redington"
                        ? "bg-[var(--brand)] text-white shadow-xs"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                    }`}
                  >
                    AI/ML (Redington Branch)
                  </button>
                </div>
              </div>

              {/* Search Bar & Result Summary */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search by name, email, register no, mobile..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)] text-sm"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
                    {/* Lucide icon placeholder/magnifying glass handled by character */}
                  </div>
                </div>
                <div className="text-xs font-semibold text-[var(--muted)] self-end sm:self-center bg-[var(--surface-2)] px-3 py-2 rounded-lg border border-[var(--outline)]">
                  Showing {predefinedStudents.length} of {selectedCohort === "redington" ? redingtonStudents.length : industryOrientedStudents.length} Students
                </div>
              </div>

              {predefinedStudents.length === 0 ? (
                <div className="text-center py-12 bg-[var(--surface-2)] rounded-2xl border border-dashed border-[var(--outline)]">
                  <p className="text-sm text-[var(--muted)]">No students found matching "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs text-[var(--brand)] font-bold hover:underline"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-[500px] overflow-y-auto pr-1">
                  {predefinedStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        selectedStudent?.id === student.id
                          ? "border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-200"
                          : "border-[var(--outline)] hover:border-blue-400 hover:bg-[var(--surface-2)] hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-11 h-11 rounded-full border border-gray-200 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--foreground)] text-sm truncate group-hover:text-blue-600 transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-[var(--brand)] font-semibold truncate">
                            {student.nirmaanId}
                          </p>
                          <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                            {student.email}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold self-start ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}>
                          {student.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Secondary meta info inside card */}
                      <div className="mt-4 pt-3 border-t border-dashed border-[var(--outline)] flex items-center justify-between text-[10px] text-[var(--muted)]">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-700">
                            {student.branch || student.course}
                          </p>
                          {student.mobile && (
                            <p className="mt-0.5 text-gray-500">
                              📞 {student.mobile}
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                          Send OTP →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email Login Form */}
          {loginMethod === "email" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Email Login</h3>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
                  placeholder="student@nirmaan.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nirmaan ID (Optional)</label>
                <input
                  type="text"
                  value={nirmaanId}
                  onChange={(e) => setNirmaanId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
                  placeholder="NR2024001"
                />
              </div>
              <button
                onClick={handleEmailOTPRequest}
                disabled={loading || !email}
                className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Request OTP"}
              </button>
            </div>
          )}

          {/* OTP Verification */}
          {loginMethod === "otp" && (selectedStudent || email) && (
            <div className="space-y-4">
              {selectedStudent && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{selectedStudent.name}</p>
                      <p className="text-sm text-[var(--muted)]">{selectedStudent.email}</p>
                      <p className="text-sm text-[var(--brand)]">{selectedStudent.nirmaanId}</p>
                    </div>
                  </div>
                </div>
              )}

              {email && !selectedStudent && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Email Login</p>
                      <p className="text-sm text-[var(--muted)]">{email}</p>
                      {nirmaanId && <p className="text-sm text-[var(--brand)]">{nirmaanId}</p>}
                    </div>
                  </div>
                </div>
              )}

              {!showOTP ? (
                <button
                  onClick={selectedStudent ? requestOTP : handleEmailOTPRequest}
                  disabled={loading}
                  className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Request OTP"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Enter OTP</label>
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
                    onClick={selectedStudent ? handleOTPLogin : handleEmailOTPVerify}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-[var(--brand)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Login with OTP"}
                  </button>
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setShowOTP(false);
                        if (selectedStudent) {
                          setLoginMethod("list");
                        } else {
                          setLoginMethod("email");
                        }
                      }}
                      className="text-[var(--brand)] hover:underline text-sm"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.toLowerCase().includes("successful") || message.toLowerCase().includes("sent") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message.toLowerCase().includes("successful") || message.toLowerCase().includes("sent") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          {/* Admin/Teacher Login Links */}
          <div className="mt-8 pt-8 border-t border-[var(--outline)]">
            <div className="text-center">
              <p className="text-sm text-[var(--muted)] mb-4">Are you an administrator or teacher?</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/login/admin"
                  className="px-4 py-2 border border-[var(--outline)] rounded-lg hover:bg-[var(--surface-2)] transition-colors text-sm"
                >
                  Admin Login
                </a>
                <a
                  href="/login/teacher"
                  className="px-4 py-2 border border-[var(--outline)] rounded-lg hover:bg-[var(--surface-2)] transition-colors text-sm"
                >
                  Teacher Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

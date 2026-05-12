"use client";

import { useState } from "react";
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
}

const predefinedStudents: PredefinedStudent[] = [
  {
    id: "STU001",
    name: "Abhijit Patra",
    email: "abhijit.patra@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/001",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AP"
  },
  {
    id: "STU002",
    name: "Ananya Bishoyi",
    email: "ananya.bishoyi@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/002",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AB"
  },
  {
    id: "STU003",
    name: "Animesh Samantaray",
    email: "animesh.samantaray@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/003",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AS"
  },
  {
    id: "STU004",
    name: "Ankit Kumar Manjhi",
    email: "ankit.manjhi@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/004",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AK"
  },
  {
    id: "STU005",
    name: "Ashis Kumar Bhuyan",
    email: "ashis.bhuyan@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/005",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AKB"
  },
  {
    id: "STU006",
    name: "Asmit Singh",
    email: "asmit.singh@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/006",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=ASI"
  },
  {
    id: "STU007",
    name: "Debasmita Swain",
    email: "debasmita.swain@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/007",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=DS"
  },
  {
    id: "STU008",
    name: "Eleena Jena",
    email: "eleena.jena@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/008",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=EJ"
  },
  {
    id: "STU009",
    name: "Jaychandra Das",
    email: "jaychandra.das@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/009",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=JD"
  },
  {
    id: "STU010",
    name: "Kishor Kumar Sahoo",
    email: "kishor.sahoo@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/010",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=KS"
  },
  {
    id: "STU011",
    name: "Md Salik Ubair",
    email: "salik.ubair@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/011",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MSU"
  },
  {
    id: "STU012",
    name: "Md Wasiq Anwer",
    email: "wasiq.anwer@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/012",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MWA"
  },
  {
    id: "STU013",
    name: "Mohammad Hassan",
    email: "mohammad.hassan@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/013",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MH"
  },
  {
    id: "STU014",
    name: "Mohammad Kashif Iqbal",
    email: "kashif.iqbal@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/014",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=MKI"
  },
  {
    id: "STU015",
    name: "Om Prakash Behura",
    email: "om.behura@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/015",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=OPB"
  },
  {
    id: "STU016",
    name: "Pradeep Kumar Singha",
    email: "pradeep.singha@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/016",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=PKS"
  },
  {
    id: "STU017",
    name: "Prajyakta Patra",
    email: "prajyakta.patra@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/017",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=PP"
  },
  {
    id: "STU018",
    name: "Sai Premananda Das",
    email: "sai.das@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/018",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SPD"
  },
  {
    id: "STU019",
    name: "Shibani Bardhan",
    email: "shibani.bardhan@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/019",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SB"
  },
  {
    id: "STU020",
    name: "Sisir Pradhan",
    email: "sisir.pradhan@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/020",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SP"
  },
  {
    id: "STU021",
    name: "Spandan Kumar Behera",
    email: "spandan.behera@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/021",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SKB"
  },
  {
    id: "STU022",
    name: "Subham Behera",
    email: "subham.behera@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/022",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SBH"
  },
  {
    id: "STU023",
    name: "Subrat Narayan Nanda",
    email: "subrat.nanda@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/023",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SNN"
  },
  {
    id: "STU024",
    name: "Suman Sourav Dash",
    email: "suman.dash@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/024",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SSD"
  },
  {
    id: "STU025",
    name: "Sumit Raj",
    email: "sumit.raj@nirmaan.edu",
    nirmaanId: "REDINGTON/ODISHA/GIFT/025",
    course: "AI/ML",
    qualification: "B.Tech",
    status: "active",
    avatar: "https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=SR"
  }
];

export default function StudentLoginWithList() {
  const [selectedStudent, setSelectedStudent] = useState<PredefinedStudent | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [nirmaanId, setNirmaanId] = useState("");
  const [otp, setOtp] = useState("");
  const [loginMethod, setLoginMethod] = useState<"list" | "email" | "otp">("list");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    setMessage("� Sending OTP via SMS...");

    try {
      const response = await api.post("/auth/request-otp", {
        email,
        role: "student",
        deliveryMethod: "sms"
      });

      if (response.data.success) {
        setMessage("✅ OTP sent via SMS! Check your phone.");
        setShowOTP(true);
        setLoginMethod("otp");
      } else {
        setMessage("❌ Failed to send OTP. Please try again.");
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage ? `❌ ${responseMessage}` : "❌ Failed to send OTP. Please check your connection and try again.");
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

        setMessage("✅ Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard/student";
        }, 1500);
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage ? `❌ ${responseMessage}` : "❌ Login failed. Please check your OTP and try again.");
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

        setMessage("✅ Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard/student";
        }, 1500);
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage ? `❌ ${responseMessage}` : "❌ Login failed. Please check your OTP and try again.");
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
    setMessage("� Sending OTP via SMS...");

    try {
      const response = await api.post("/auth/request-otp", {
        email: selectedStudent.email,
        role: "student",
        deliveryMethod: "sms"
      });

      if (response.data.success) {
        setMessage("✅ OTP sent via SMS! Check your phone.");
        setShowOTP(true);
      } else {
        setMessage("❌ Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setMessage("❌ Failed to send OTP. Please check your connection and try again.");
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Select Your Profile</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {predefinedStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-[var(--outline)] hover:border-blue-500 hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">{student.name}</p>
                            <p className="text-sm text-[var(--muted)]">{student.nirmaanId}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            student.status === "active"
                              ? "bg-green-100 text-green-700"
                              : student.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {student.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        <p>{student.course}</p>
                        <p>{student.qualification}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message.includes("✅") ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
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

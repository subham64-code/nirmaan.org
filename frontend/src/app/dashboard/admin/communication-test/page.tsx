"use client";

import { useState } from "react";
import { Mail, MessageSquare, Key, CheckCircle, XCircle, AlertCircle, Send, RefreshCw } from "lucide-react";

interface TestResult {
  type: "otp" | "email" | "sms";
  status: "success" | "error" | "pending";
  message: string;
  timestamp: Date;
  details?: any;
}

export default function CommunicationTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    email: "",
    phone: "",
    role: "admin",
    customMessage: ""
  });

  const addTestResult = (result: Omit<TestResult, "timestamp">) => {
    const newResult: TestResult = {
      ...result,
      timestamp: new Date()
    };
    setTestResults(prev => [newResult, ...prev].slice(0, 10)); // Keep last 10 results
  };

  const testOTPRequest = async () => {
    if (!testData.email) {
      addTestResult({
        type: "otp",
        status: "error",
        message: "Email is required for OTP test"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testData.email,
          role: testData.role
        })
      });

      const result = await response.json();

      if (response.ok) {
        addTestResult({
          type: "otp",
          status: "success",
          message: `OTP sent successfully to ${testData.email}`,
          details: { email: testData.email, role: testData.role }
        });
      } else {
        addTestResult({
          type: "otp",
          status: "error",
          message: result.message || "Failed to send OTP",
          details: result
        });
      }
    } catch (error) {
      addTestResult({
        type: "otp",
        status: "error",
        message: "Network error occurred",
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailSending = async () => {
    if (!testData.email) {
      addTestResult({
        type: "email",
        status: "error",
        message: "Email is required for email test"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/test/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testData.email,
          subject: "Nirmaan Test Email",
          message: testData.customMessage || "This is a test email from Nirmaan platform."
        })
      });

      const result = await response.json();

      if (response.ok) {
        addTestResult({
          type: "email",
          status: "success",
          message: `Test email sent successfully to ${testData.email}`,
          details: { email: testData.email }
        });
      } else {
        addTestResult({
          type: "email",
          status: "error",
          message: result.message || "Failed to send email",
          details: result
        });
      }
    } catch (error) {
      addTestResult({
        type: "email",
        status: "error",
        message: "Network error occurred",
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSMSSending = async () => {
    if (!testData.phone) {
      addTestResult({
        type: "sms",
        status: "error",
        message: "Phone number is required for SMS test"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/test/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testData.phone,
          message: testData.customMessage || "This is a test SMS from Nirmaan platform."
        })
      });

      const result = await response.json();

      if (response.ok) {
        addTestResult({
          type: "sms",
          status: "success",
          message: `Test SMS sent successfully to ${testData.phone}`,
          details: { phone: testData.phone }
        });
      } else {
        addTestResult({
          type: "sms",
          status: "error",
          message: result.message || "Failed to send SMS",
          details: result
        });
      }
    } catch (error) {
      addTestResult({
        type: "sms",
        status: "error",
        message: "Network error occurred",
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "otp":
        return <Key className="w-4 h-4 text-blue-500" />;
      case "email":
        return <Mail className="w-4 h-4 text-green-500" />;
      case "sms":
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Testing</h1>
          <p className="text-gray-600">Test OTP, email, and SMS functionality</p>
        </div>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="test@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (with country code)
              </label>
              <input
                type="tel"
                value={testData.phone}
                onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role (for OTP)
              </label>
              <select
                value={testData.role}
                onChange={(e) => setTestData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message (optional)
              </label>
              <textarea
                value={testData.customMessage}
                onChange={(e) => setTestData(prev => ({ ...prev, customMessage: e.target.value }))}
                placeholder="Enter custom message for email/SMS test..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={testOTPRequest}
              disabled={isLoading || !testData.email}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" />
              {isLoading ? "Testing..." : "Test OTP Request"}
            </button>

            <button
              onClick={testEmailSending}
              disabled={isLoading || !testData.email}
              className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {isLoading ? "Testing..." : "Test Email Sending"}
            </button>

            <button
              onClick={testSMSSending}
              disabled={isLoading || !testData.phone}
              className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              {isLoading ? "Testing..." : "Test SMS Sending"}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tests run yet</p>
              <p className="text-sm">Run tests to see results here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === "success"
                      ? "bg-green-50 border-green-200"
                      : result.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(result.type)}
                        <span className="font-medium capitalize">{result.type}</span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View Details
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Configuration Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">📧 Email Configuration</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Configure Gmail SMTP in backend/.env</li>
              <li>• Set SMTP_HOST=smtp.gmail.com</li>
              <li>• Set SMTP_PORT=587</li>
              <li>• Use Gmail App Password (not regular password)</li>
              <li>• Enable 2FA on Gmail account</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">📱 SMS Configuration</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Get Twilio account (free trial available)</li>
              <li>• Set TWILIO_ACCOUNT_SID in .env</li>
              <li>• Set TWILIO_AUTH_TOKEN in .env</li>
              <li>• Set TWILIO_FROM_NUMBER in .env</li>
              <li>• Verify phone number in Twilio dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🔐 OTP Configuration</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• OTP expiry: 10 minutes (configurable)</li>
              <li>• 6-digit numeric codes</li>
              <li>• Works for admin and teacher roles</li>
              <li>• Auto-cleanup expired codes</li>
              <li>• Email-based delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

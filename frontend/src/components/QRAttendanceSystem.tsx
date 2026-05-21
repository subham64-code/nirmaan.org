'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Scan, CheckCircle, AlertCircle, Clock, RefreshCw, Copy, Loader2, Shield } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '@/lib/api';

interface QRSession {
  sessionId: string;
  code: string;
  expiresAt: number;
  className: string;
  subject: string;
  generatedBy: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
}

interface QRAttendanceSystemProps {
  role: 'faculty' | 'student' | 'admin';
}

// ─── Faculty: QR Generator ───────────────────────────────────────────────────
function QRGenerator({ role }: { role: 'faculty' | 'admin' }) {
  const [session, setSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState('AI/ML – Batch 2024');
  const [subject, setSubject] = useState('Machine Learning');
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [scanLog, setScanLog] = useState<{ name: string; time: string; status: string }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateQR = async () => {
    setLoading(true);
    const teacherName = typeof window !== 'undefined' ? localStorage.getItem('nirmaan_user_name') || 'Faculty' : 'Faculty';
    const code = `NIRMAAN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const newSession: QRSession = { sessionId: code, code, expiresAt, className, subject, generatedBy: teacherName };
    setSession(newSession);
    setTimeLeft(300);
    localStorage.setItem('qr_session', JSON.stringify(newSession));
    try {
      await api.post('/attendance/qr-session', newSession);
    } catch {/* offline mode */}
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const remaining = Math.floor((session.expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(intervalRef.current!);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [session]);

  const copyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isExpired = timeLeft <= 0 && !!session;

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><QrCode className="w-5 h-5 text-[var(--brand)]" />Generate Attendance QR</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Class / Batch</label>
            <input value={className} onChange={(e) => setClassName(e.target.value)} className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" placeholder="e.g. AI/ML – Batch 2024" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" placeholder="e.g. Machine Learning" />
          </div>
        </div>
        <button onClick={generateQR} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-purple-600 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : session && !isExpired ? <><RefreshCw className="w-5 h-5" />Regenerate QR (Refresh)</> : <><QrCode className="w-5 h-5" />Generate QR Code</>}
        </button>
      </div>

      {/* QR Display */}
      {session && (
        <div className="glass p-6 rounded-2xl text-center space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-[var(--muted)]">{session.className}</p>
              <p className="font-bold">{session.subject}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${isExpired ? 'bg-red-100 text-red-700' : timeLeft < 60 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              <Clock className="w-4 h-4" />
              {isExpired ? 'EXPIRED' : `${mins}:${secs}`}
            </div>
          </div>
          {isExpired ? (
            <div className="py-12 flex flex-col items-center gap-3 text-[var(--muted)]">
              <AlertCircle className="w-16 h-16 text-red-400" />
              <p className="text-lg font-semibold">QR Code Expired</p>
              <p className="text-sm">Click Regenerate to create a new session</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block">
                <QRCodeSVG value={session.code} size={220} level="H" includeMargin />
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Shield className="w-4 h-4" />
                <span>Session expires in {mins}:{secs} • Scan to mark attendance</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--surface-2)] rounded-xl px-4 py-2 w-full max-w-sm">
                <code className="flex-1 text-xs font-mono truncate">{session.code}</code>
                <button onClick={copyCode} className="ml-2 flex items-center gap-1 text-xs font-semibold text-[var(--brand)]">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Scan Log */}
      {session && scanLog.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-bold mb-3">Live Scan Log</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {scanLog.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-[var(--surface-2)]">
                <span className="font-medium">{entry.name}</span>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{entry.status}</span>
                  <span className="text-[var(--muted)]">{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student: QR Scanner ─────────────────────────────────────────────────────
function QRScanner() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (cameraActive) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          setCode(decodedText);
          scanner.clear();
          setCameraActive(false);
          submitCode(decodedText);
        },
        (error) => {
          // Ignore frequent scan errors
        }
      );

      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }
  }, [cameraActive]);

  const submitCode = async (codeToSubmit = code) => {
    if (!codeToSubmit.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const studentName = typeof window !== 'undefined' ? localStorage.getItem('nirmaan_user_name') || 'Student' : 'Student';
      const nirmaanId = typeof window !== 'undefined' ? localStorage.getItem('nirmaan_student_id') || '' : '';
      const stored = typeof window !== 'undefined' ? localStorage.getItem('qr_session') : null;
      let valid = false;
      if (stored) {
        const sess = JSON.parse(stored);
        valid = sess.code === codeToSubmit.trim() && sess.expiresAt > Date.now();
      }
      if (valid) {
        try {
          await api.post('/attendance/qr-scan', { code: codeToSubmit.trim(), studentName, nirmaanId });
        } catch {}
        setResult({ success: true, message: '✅ Attendance marked successfully!', studentName });
        localStorage.setItem('last_checkin', JSON.stringify({ status: 'Present', timestamp: new Date().toISOString(), center: 'QR Session', distance: 0 }));
      } else {
        setResult({ success: false, message: '❌ Invalid or expired QR code. Please ask your teacher to refresh.' });
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message || 'Failed to verify QR code.' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><Scan className="w-5 h-5 text-[var(--brand)]" />Scan QR Code</h3>
        <p className="text-sm text-[var(--muted)]">Enter the QR session code displayed by your teacher or scan using camera</p>

        {result && (
          <div className={`p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400'}`}>
            {result.success ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="font-medium">{result.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium">QR Session Code</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitCode(code)}
              className="flex-1 rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              placeholder="NIRMAAN-XXXXXXXX-XXXXXX"
            />
            <button onClick={() => submitCode(code)} disabled={scanning || !code.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-purple-600 px-6 py-3 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition">
              {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {scanning ? 'Verifying...' : 'Submit'}
            </button>
          </div>

          <div className="flex justify-center mt-4">
             <button onClick={() => setCameraActive(!cameraActive)} className="text-sm font-semibold text-[var(--brand)] underline">
               {cameraActive ? 'Close Camera' : 'Scan with Camera'}
             </button>
          </div>
          
          {cameraActive && (
            <div id="qr-reader" className="w-full max-w-sm mx-auto mt-4 overflow-hidden rounded-xl border-2 border-[var(--brand)]" />
          )}
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-700 dark:text-blue-400">How it works</p>
              <ol className="mt-1 space-y-1 text-[var(--muted)] list-decimal list-inside">
                <li>Your teacher generates a QR code for the class</li>
                <li>Scan or enter the session code shown on screen</li>
                <li>Your GPS location is verified for geo-fencing</li>
                <li>Attendance is automatically marked as Present</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function QRAttendanceSystem({ role }: QRAttendanceSystemProps) {
  return (
    <div className="w-full">
      {role === 'student' ? (
        <QRScanner />
      ) : (
        <QRGenerator role={role as 'faculty' | 'admin'} />
      )}
    </div>
  );
}

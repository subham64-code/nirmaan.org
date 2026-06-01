"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, authHeader } from "@/lib/api";
import { proctoringApiBaseUrl } from "@/lib/constants";

type Question = { prompt: string; options: string[] };
type TestPayload = { title: string; durationMinutes: number; totalMarks: number; questions: Question[] };

type ProctoringCheckResult = {
  success?: boolean;
  error?: string;
  is_visible?: boolean;
  eyes_open?: boolean;
  direction?: string;
  people_detected?: number;
  face_detected?: boolean;
  emotion?: string;
  emotions?: Record<string, number>;
};

const PROCTORING_BASE_URL = proctoringApiBaseUrl;
const MAX_TAB_SWITCHES = 3;
const MAX_TOTAL_INFRACTIONS = 3;

export default function StudentTestAttemptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestPayload | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [startedAt] = useState(() => new Date().toISOString());
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [rightClickCount, setRightClickCount] = useState(0);
  const [selectionCount, setSelectionCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [copyPasteCount, setCopyPasteCount] = useState(0);
  const [infractions, setInfractions] = useState<Array<{ type: string; at: string }>>([]);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "ready" | "blocked">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [proctoringStatus, setProctoringStatus] = useState("Camera monitoring inactive.");
  const [cameraReady, setCameraReady] = useState(false);
  const [tabSwitchOverlay, setTabSwitchOverlay] = useState(false);
  const [checkingAttempt, setCheckingAttempt] = useState(true);
  const [attemptError, setAttemptError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctoringBusyRef = useRef(false);
  const endTimeRef = useRef<number>(0);

  const logProctoringEvent = useCallback(async (eventType: string, metadata: Record<string, unknown> = {}) => {
    try {
      const token = localStorage.getItem("nirmaan_token") || "";
      await api.post("/tests/proctoring/log-event", { testId: params.id, eventType, metadata }, { headers: authHeader(token) });
    } catch (error) {
      console.error("Proctoring event log error:", error);
    }
  }, [params.id]);

  const logInfraction = useCallback(
    async (type: string, metadata: Record<string, unknown> = {}) => {
      const at = new Date().toISOString();
      setInfractions((arr) => [...arr, { type, at }]);
      await logProctoringEvent(type, metadata);
    },
    [logProctoringEvent]
  );

  const postGpsSample = useCallback(async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const token = localStorage.getItem("nirmaan_token") || "";
        await api.post(`/tests/${params.id}/gps`, { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }, { headers: authHeader(token) });
      } catch (err) { console.error("GPS post error:", err); }
    }, (err) => { console.warn("GPS error:", err); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 });
  }, [params.id]);

  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        const token = localStorage.getItem("nirmaan_token") || "";
        const canResp = await api.get(`/tests/${params.id}/can-attempt`, { headers: authHeader(token) });
        if (!canResp.data.success || !canResp.data.data?.canAttempt) {
          setAttemptError(canResp.data.data?.reason || "You have already attempted this test or it is no longer available.");
          setCheckingAttempt(false);
          return;
        }
        const response = await api.get(`/tests/${params.id}`, { headers: authHeader(token) });
        const payload = response.data.data;
        setTest(payload);
        setAnswers(new Array(payload.questions.length).fill(-1));
        const totalSecs = payload.durationMinutes * 60;
        setSecondsLeft(totalSecs);
        endTimeRef.current = Date.now() + totalSecs * 1000;
        setCheckingAttempt(false);
        void postGpsSample();
      } catch (err: any) {
        setAttemptError(err?.response?.data?.message || "Failed to load test. Please try again.");
        setCheckingAttempt(false);
      }
    };
    checkAndLoad();
  }, [params.id, postGpsSample]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  }, []);

  const postProctoringCheck = useCallback(async (path: string, image: string) => {
    const response = await fetch(`${PROCTORING_BASE_URL}${path}`, {
      method: "POST", mode: 'cors', credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    if (!response.ok) throw new Error(`Proctoring check failed: ${response.status}`);
    return (await response.json()) as ProctoringCheckResult;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startCamera = async () => {
      if (!test) return;
      setCameraStatus("starting");
      setCameraError(null);
      setProctoringStatus("Requesting camera access...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => null); }
        setCameraStatus("ready");
        setCameraReady(true);
        setProctoringStatus("Camera ready. Face, eye, gaze, and room checks are active.");
        await logProctoringEvent("camera_started", { status: "ready" });
      } catch (error: any) {
        if (cancelled) return;
        const message = error?.message || "Camera access was denied or is unavailable.";
        setCameraStatus("blocked");
        setCameraReady(false);
        setCameraError(message);
        setProctoringStatus("Camera access is blocked. Proctoring is limited.");
        await logInfraction("camera_denied", { message });
      }
    };
    void startCamera();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  }, [logInfraction, logProctoringEvent, test]);

  useEffect(() => {
    if (!test || !cameraReady || autoSubmitted) return;
    const interval = window.setInterval(async () => {
      if (proctoringBusyRef.current) return;
      const frame = captureFrame();
      if (!frame) { setProctoringStatus("Waiting for a camera frame..."); return; }
      proctoringBusyRef.current = true;
      try {
        const [face, eyes, gaze, people, landmarks] = await Promise.allSettled([
          postProctoringCheck("/proctoring/check-face", frame),
          postProctoringCheck("/proctoring/check-eyes", frame),
          postProctoringCheck("/proctoring/check-gaze", frame),
          postProctoringCheck("/proctoring/check-multiple-people", frame),
          postProctoringCheck("/proctoring/check-landmarks", frame),
        ]);
        const alerts: string[] = [];
        if (face.status === "fulfilled" && face.value.success && face.value.is_visible === false) { alerts.push("face-not-visible"); await logInfraction("face_not_visible", { face: face.value }); }
        if (eyes.status === "fulfilled" && eyes.value.success && eyes.value.eyes_open === false) { alerts.push("eyes-closed"); await logInfraction("eyes_closed", { eyes: eyes.value }); }
        if (gaze.status === "fulfilled" && gaze.value.success && ["looking_away", "no_face"].includes(gaze.value.direction || "")) { alerts.push(gaze.value.direction || "gaze-alert"); await logInfraction("gaze_away", { gaze: gaze.value }); }
        if (people.status === "fulfilled" && people.value.success && (people.value.people_detected || 0) > 1) { alerts.push("multiple-people"); await logInfraction("multiple_people", { people: people.value }); }
        if (landmarks.status === "fulfilled" && landmarks.value.success && (landmarks.value.emotion || "").toLowerCase() === "angry") { alerts.push("facial-expression-alert"); await logInfraction("facial_expression_alert", { landmarks: landmarks.value }); }
        setProctoringStatus(alerts.length > 0 ? `Proctoring alert: ${alerts.join(", ")}` : "Camera active. All checks clear.");
      } catch (error) {
        console.error("Proctoring capture error:", error);
      } finally { proctoringBusyRef.current = false; }
    }, 8000);
    return () => window.clearInterval(interval);
  }, [autoSubmitted, captureFrame, cameraReady, logInfraction, postProctoringCheck, test]);

  useEffect(() => {
    if (!test) return;
    const interval = window.setInterval(() => { void postGpsSample(); }, 60_000);
    return () => window.clearInterval(interval);
  }, [postGpsSample, test]);

  useEffect(() => {
    if (!test || autoSubmitted) return;
    const requestFullscreen = async () => { try { await document.documentElement.requestFullscreen?.(); } catch {} };

    void requestFullscreen();

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchOverlay(true);
        const at = new Date().toISOString();
        setTabSwitchCount((c) => c + 1);
        setInfractions((arr) => [...arr, { type: "tab_switch", at }]);
        void logInfraction("tab_switch", { message: "Tab switch detected" });
      } else {
        setTabSwitchOverlay(false);
      }
    };

    const handleBlur = () => {
      setTabSwitchOverlay(true);
      const at = new Date().toISOString();
      setTabSwitchCount((c) => c + 1);
      setInfractions((arr) => [...arr, { type: "window_blur", at }]);
      void logInfraction("window_blur", { message: "Window focus lost" });
    };

    const handleFocus = () => {
      setTabSwitchOverlay(false);
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const at = new Date().toISOString();
      setRightClickCount((c) => c + 1);
      setInfractions((arr) => [...arr, { type: "right_click", at }]);
      void logInfraction("right_click", { message: "Right-click blocked" });
      return false;
    };

    const handleSelectStart = (event: Event) => {
      event.preventDefault();
      const at = new Date().toISOString();
      setSelectionCount((c) => c + 1);
      setInfractions((arr) => [...arr, { type: "text_selection", at }]);
      void logInfraction("text_selection", { message: "Text selection attempt blocked" });
      return false;
    };

    const handleCopy = (event: ClipboardEvent) => {
      event.preventDefault();
      event.clipboardData?.setData('text/plain', '');
      const at = new Date().toISOString();
      setCopyPasteCount((c) => c + 1);
      setInfractions((arr) => [...arr, { type: "copy_attempt", at }]);
      void logInfraction("copy_attempt", { message: "Copy blocked" });
    };

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const at = new Date().toISOString();
      setCopyPasteCount((c) => c + 1);
      setInfractions((arr) => [...arr, { type: "paste_attempt", at }]);
      void logInfraction("paste_attempt", { message: "Paste blocked" });
    };

    const handleCut = (event: ClipboardEvent) => {
      event.preventDefault();
      const at = new Date().toISOString();
      setCopyPasteCount((c) => c + 1);
      setInfractions((arr) => [...arr, { type: "cut_attempt", at }]);
      void logInfraction("cut_attempt", { message: "Cut blocked" });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlShift = event.ctrlKey && event.shiftKey;
      const key = event.key.toLowerCase();
      const blockedKeys = ["f12", "printscreen"];
      const blockedCombos = [
        isCtrlShift && ["i", "j", "c", "s"].includes(key),
        event.ctrlKey && key === "u",
        event.ctrlKey && key === "s",
        (event.metaKey && event.altKey && key === "i"),
      ];
      if (blockedKeys.includes(key) || blockedCombos.some(Boolean)) {
        event.preventDefault();
        event.stopPropagation();
        const at = new Date().toISOString();
        setScreenshotCount((c) => c + 1);
        setInfractions((arr) => [...arr, { type: `screenshot_attempt:${key}`, at }]);
        void logInfraction("screenshot_attempt", { key });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const at = new Date().toISOString();
        setFullscreenExitCount((c) => c + 1);
        setInfractions((arr) => [...arr, { type: "fullscreen_exit", at }]);
        void logInfraction("fullscreen_exit", { message: "Fullscreen exited" });
        void requestFullscreen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [autoSubmitted, logInfraction, test]);

  useEffect(() => {
    if (!autoSubmitted) {
      const totalInfractions = tabSwitchCount + rightClickCount + selectionCount + fullscreenExitCount + screenshotCount + copyPasteCount;
      if (tabSwitchCount >= MAX_TAB_SWITCHES || totalInfractions >= MAX_TOTAL_INFRACTIONS) {
        (async () => {
          try {
            setAutoSubmitted(true);
            const token = localStorage.getItem("nirmaan_token") || "";
            await api.post(`/tests/${params.id}/submit`, {
              answers, startedAt,
              cheatingReason: tabSwitchCount >= MAX_TAB_SWITCHES ? "multiple_tab_switches" : "multiple_rule_violations",
              cheatingEvents: infractions,
            }, { headers: authHeader(token) });
          } catch (err) { console.error("Auto-submit error:", err); }
          finally { window.location.href = "/dashboard/student"; }
        })();
      }
    }
  }, [answers, autoSubmitted, copyPasteCount, fullscreenExitCount, infractions, params.id, rightClickCount, screenshotCount, selectionCount, startedAt, tabSwitchCount]);

  const submit = useCallback(async () => {
    const token = localStorage.getItem("nirmaan_token") || "";
    await api.post(`/tests/${params.id}/submit`, { answers, startedAt }, { headers: authHeader(token) });
    router.push("/dashboard/student");
  }, [answers, params.id, router, startedAt]);

  useEffect(() => {
    if (!test || autoSubmitted) return;
    if (secondsLeft <= 0) { submit().catch(() => null); return; }
    const t = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(t);
  }, [test, autoSubmitted, secondsLeft, submit]);

  const timerLabel = useMemo(() => {
    const min = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const sec = String(secondsLeft % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }, [secondsLeft]);

  if (checkingAttempt) return <div className="section"><p className="p-8 text-center text-lg">Checking test availability...</p></div>;
  if (attemptError) return <div className="section"><div className="glass mx-auto mt-20 max-w-lg p-8 text-center"><h2 className="mb-4 text-2xl font-bold text-red-600">Test Not Available</h2><p className="mb-6 text-gray-600">{attemptError}</p><button onClick={() => router.push("/dashboard/student")} className="rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white">Back to Dashboard</button></div></div>;
  if (!test) return <div className="section">Loading test...</div>;

  return (
    <div className="section space-y-6">
      {tabSwitchOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-600/95 backdrop-blur-xl">
          <div className="max-w-md text-center text-white">
            <div className="mb-6 text-7xl">⚠️</div>
            <h2 className="mb-4 text-3xl font-bold">Tab Switch Detected!</h2>
            <p className="mb-2 text-lg">You have switched away from the exam tab.</p>
            <p className="mb-6 text-red-200">This is a serious violation. Repeated offenses will auto-submit your exam.</p>
            <p className="text-sm text-red-300">Click anywhere to return to the exam.</p>
          </div>
        </div>
      )}

      <div className="glass flex items-center justify-between p-4">
        <h1 className="text-3xl">{test.title}</h1>
        <p className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${secondsLeft < 60 ? "bg-red-600 animate-pulse" : secondsLeft < 300 ? "bg-yellow-600" : "bg-red-600"}`}>Time Left: {timerLabel}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="glass space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live Proctoring</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cameraStatus === "ready" ? "bg-emerald-100 text-emerald-800" : cameraStatus === "blocked" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{cameraStatus}</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--outline)] bg-black/90">
            <video ref={videoRef} autoPlay muted playsInline className="h-56 w-full bg-black object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <p className="text-sm text-[var(--muted-foreground)]">{proctoringStatus}</p>
          {cameraError ? <p className="text-sm text-red-600">{cameraError}</p> : null}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Tab switches</div>
              <div className="text-xl font-semibold">{tabSwitchCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Right-clicks</div>
              <div className="text-xl font-semibold">{rightClickCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Selections</div>
              <div className="text-xl font-semibold">{selectionCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Fullscreen exits</div>
              <div className="text-xl font-semibold">{fullscreenExitCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Screenshots</div>
              <div className="text-xl font-semibold">{screenshotCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Copy/Paste</div>
              <div className="text-xl font-semibold">{copyPasteCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Camera</div>
              <div className="text-xl font-semibold">{cameraReady ? "On" : "Off"}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Infractions</div>
              <div className="text-xl font-semibold">{infractions.length}</div>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          {test.questions.map((q, i) => (
            <section key={i} className="glass p-5" onContextMenu={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>
              <p className="font-semibold">Q{i + 1}. {q.prompt}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={answers[i] === idx}
                      onChange={() => { const next = [...answers]; next[i] = idx; setAnswers(next); }}
                    />
                    <span onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>{option}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <button onClick={() => submit().catch(() => null)} disabled={autoSubmitted} className="rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white disabled:opacity-50">Submit Test</button>
    </div>
  );
}

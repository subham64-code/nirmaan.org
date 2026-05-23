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
  const [infractions, setInfractions] = useState<Array<{ type: string; at: string }>>([]);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "ready" | "blocked">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [proctoringStatus, setProctoringStatus] = useState("Camera monitoring inactive.");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctoringBusyRef = useRef(false);

  const postGpsSample = useCallback(async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const token = localStorage.getItem("nirmaan_token") || "";
        await api.post(
          `/tests/${params.id}/gps`,
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          { headers: authHeader(token) }
        );
      } catch (err) {
        console.error("GPS post error:", err);
      }
    }, (err) => {
      console.warn("GPS error:", err);
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 });
  }, [params.id]);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("nirmaan_token") || "";
      const response = await api.get(`/tests/${params.id}`, { headers: authHeader(token) });
      const payload = response.data.data;
      setTest(payload);
      setAnswers(new Array(payload.questions.length).fill(-1));
      setSecondsLeft(payload.durationMinutes * 60);
      void postGpsSample();
    };
    load().catch(() => null);
  }, [params.id, postGpsSample]);

  const logProctoringEvent = useCallback(async (eventType: string, metadata: Record<string, unknown> = {}) => {
    try {
      const token = localStorage.getItem("nirmaan_token") || "";
      await api.post(
        "/tests/proctoring/log-event",
        {
          testId: params.id,
          eventType,
          metadata,
        },
        { headers: authHeader(token) }
      );
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

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  }, []);

  const postProctoringCheck = useCallback(async (path: string, image: string) => {
    const response = await fetch(`${PROCTORING_BASE_URL}${path}`, {
      method: "POST",
      mode: 'cors',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      throw new Error(`Proctoring check failed: ${response.status}`);
    }

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

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => null);
        }

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
        setProctoringStatus("Camera access is blocked. Proctoring is limited until camera access is granted.");
        await logInfraction("camera-denied", { message });
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [logInfraction, logProctoringEvent, test]);

  useEffect(() => {
    if (!test || !cameraReady || autoSubmitted) return;

    const interval = window.setInterval(async () => {
      if (proctoringBusyRef.current) return;

      const frame = captureFrame();
      if (!frame) {
        setProctoringStatus("Waiting for a camera frame...");
        return;
      }

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

        if (face.status === "fulfilled" && face.value.success && face.value.is_visible === false) {
          alerts.push("face-not-visible");
          await logInfraction("face-not-visible", { face: face.value });
        }

        if (eyes.status === "fulfilled" && eyes.value.success && eyes.value.eyes_open === false) {
          alerts.push("eyes-closed");
          await logInfraction("eyes-closed", { eyes: eyes.value });
        }

        if (gaze.status === "fulfilled" && gaze.value.success && ["looking_away", "no_face"].includes(gaze.value.direction || "")) {
          alerts.push(gaze.value.direction || "gaze-alert");
          await logInfraction("gaze-away", { gaze: gaze.value });
        }

        if (people.status === "fulfilled" && people.value.success && (people.value.people_detected || 0) > 1) {
          alerts.push("multiple-people");
          await logInfraction("multiple-people", { people: people.value });
        }

        if (landmarks.status === "fulfilled" && landmarks.value.success && (landmarks.value.emotion || "").toLowerCase() === "angry") {
          alerts.push("facial-expression-alert");
          await logInfraction("facial-expression-alert", { landmarks: landmarks.value });
        }

        if (alerts.length > 0) {
          setProctoringStatus(`Proctoring alert: ${alerts.join(", ")}`);
        } else {
          setProctoringStatus("Camera active. Face, eye, gaze, expression, and room checks are clear.");
        }
      } catch (error) {
        console.error("Proctoring capture error:", error);
        setProctoringStatus("Proctoring check failed. Camera is still active, but verification could not complete.");
      } finally {
        proctoringBusyRef.current = false;
      }
    }, 8000);

    return () => window.clearInterval(interval);
  }, [autoSubmitted, captureFrame, cameraReady, logInfraction, postProctoringCheck, test]);

  useEffect(() => {
    if (!test) return;
    const interval = window.setInterval(() => {
      void postGpsSample();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [postGpsSample, test]);

  useEffect(() => {
    if (!test || autoSubmitted) return;

    const requestFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen?.();
      } catch {
        // Ignore unsupported browsers.
      }
    };

    void requestFullscreen();

    const handleVisibility = () => {
      if (document.hidden) {
        const at = new Date().toISOString();
        setTabSwitchCount((count) => count + 1);
        setInfractions((arr) => [...arr, { type: "tab-switch", at }]);
        void logInfraction("tab-switch", { message: "Tab switch detected" });
      }
    };

    const handleBlur = () => {
      const at = new Date().toISOString();
      setTabSwitchCount((count) => count + 1);
      setInfractions((arr) => [...arr, { type: "window-blur", at }]);
      void logInfraction("window-blur", { message: "Window focus lost" });
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      const at = new Date().toISOString();
      setRightClickCount((count) => count + 1);
      setInfractions((arr) => [...arr, { type: "right-click", at }]);
      void logInfraction("right-click", { message: "Right-click blocked" });
      return false;
    };

    const handleSelectStart = (event: Event) => {
      event.preventDefault();
      const at = new Date().toISOString();
      setSelectionCount((count) => count + 1);
      setInfractions((arr) => [...arr, { type: "text-selection", at }]);
      void logInfraction("text-selection", { message: "Text selection attempt blocked" });
      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const keySig = [event.ctrlKey ? "Ctrl" : "", event.shiftKey ? "Shift" : "", event.altKey ? "Alt" : "", event.metaKey ? "Meta" : "", event.key].filter(Boolean).join("+");
      if (event.key === "PrintScreen" || keySig.includes("Shift+S") || event.key === "F12" || keySig.includes("Ctrl+Shift+I") || keySig.includes("Ctrl+Shift+J") || keySig.includes("Ctrl+Shift+C")) {
        event.preventDefault();
        const at = new Date().toISOString();
        setScreenshotCount((count) => count + 1);
        setInfractions((arr) => [...arr, { type: `screenshot:${keySig || event.key}`, at }]);
        void logInfraction("screenshot-attempt", { key: keySig || event.key });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const at = new Date().toISOString();
        setFullscreenExitCount((count) => count + 1);
        setInfractions((arr) => [...arr, { type: "fullscreen-exit", at }]);
        void logInfraction("fullscreen-exit", { message: "Fullscreen exited" });
        void requestFullscreen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [autoSubmitted, logInfraction, test]);

  useEffect(() => {
    const totalRuleBreaks = tabSwitchCount + rightClickCount + selectionCount + fullscreenExitCount + screenshotCount;
    if (!autoSubmitted && (tabSwitchCount >= 3 || totalRuleBreaks >= 5)) {
      (async () => {
        try {
          setAutoSubmitted(true);
          const token = localStorage.getItem("nirmaan_token") || "";
          await api.post(
            `/tests/${params.id}/submit`,
            {
              answers,
              startedAt,
              cheatingReason: tabSwitchCount >= 3 ? "multiple_tab_switches" : "multiple_rule_violations",
              cheatingEvents: infractions,
            },
            { headers: authHeader(token) }
          );
        } catch (err) {
          console.error("Auto-submit error:", err);
        } finally {
          window.location.href = "/dashboard/student";
        }
      })();
    }
  }, [answers, autoSubmitted, fullscreenExitCount, infractions, params.id, rightClickCount, screenshotCount, selectionCount, startedAt, tabSwitchCount]);

  const submit = useCallback(async () => {
    const token = localStorage.getItem("nirmaan_token") || "";
    await api.post(`/tests/${params.id}/submit`, { answers, startedAt }, { headers: authHeader(token) });
    router.push("/dashboard/student");
  }, [answers, params.id, router, startedAt]);

  useEffect(() => {
    if (!test) return;
    if (secondsLeft <= 0) {
      submit().catch(() => null);
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, submit, test]);

  const timerLabel = useMemo(() => {
    const min = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const sec = String(secondsLeft % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }, [secondsLeft]);

  if (!test) return <div className="section">Loading test...</div>;

  return (
    <div className="section space-y-6">
      <div className="glass flex items-center justify-between p-4">
        <h1 className="text-3xl">{test.title}</h1>
        <p className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">Time Left: {timerLabel}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="glass space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live Proctoring</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cameraStatus === "ready"
                  ? "bg-emerald-100 text-emerald-800"
                  : cameraStatus === "blocked"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {cameraStatus}
            </span>
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
              <div className="text-[var(--muted-foreground)]">Screenshot attempts</div>
              <div className="text-xl font-semibold">{screenshotCount}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Infractions</div>
              <div className="text-xl font-semibold">{infractions.length}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[var(--muted-foreground)]">Camera</div>
              <div className="text-xl font-semibold">{cameraReady ? "On" : "Off"}</div>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          {test.questions.map((q, i) => (
            <section key={i} className="glass p-5">
              <p className="font-semibold">Q{i + 1}. {q.prompt}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={answers[i] === idx}
                      onChange={() => {
                        const next = [...answers];
                        next[i] = idx;
                        setAnswers(next);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <button onClick={() => submit().catch(() => null)} className="rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white">Submit Test</button>
    </div>
  );
}

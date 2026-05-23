"use client";

import "@/lib/screenfullShim";
import { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, Users, Clock, Award, Play, BarChart3, Plus, Trash2, CheckCircle, AlertCircle, Sparkles, FileText } from "lucide-react";
import { api, authHeader } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { fallbackPredefinedQuestions } from "@/lib/predefinedQuestions";
import { proctoringApiBaseUrl } from "@/lib/constants";

interface Question {
  _id: string;
  prompt: string;
  options: string[];
  answer: number;
  marks: number;
}

interface Test {
  _id: string;
  title: string;
  course: string;
  targetAudience?: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  availableFrom?: string;
  availableUntil?: string;
  questions: Question[];
  createdBy: {
    _id: string;
    name: string;
  };
  isPublished: boolean;
  createdAt: string;
  assignedStudents?: string[];
}

interface TestResult {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  score: number;
  answers: number[];
  submittedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface QuestionBankItem {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  marks?: number;
}

interface GeneratedQuestion {
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  type?: string;
}

interface ProctoringCheckResult {
  success?: boolean;
  error?: string;
  is_visible?: boolean;
  eyes_open?: boolean;
  direction?: string;
  people_detected?: number;
  face_detected?: boolean;
  emotion?: string;
  emotions?: Record<string, number>;
}

const aiQuestionTopics = [
  "JavaScript",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "MERN Stack",
  "Python Data Analytics",
  "Soft Skills",
];

export default function EnhancedExamSystem({ userRole }: { userRole: "student" | "teacher" | "admin" }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [examLoadError, setExamLoadError] = useState<string | null>(null);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>("All");
  const [aiBankTopic, setAiBankTopic] = useState("C Programming");
  const [aiBankDifficulty, setAiBankDifficulty] = useState("hard");
  const [aiBankCount, setAiBankCount] = useState(20);
  const [aiBankLoading, setAiBankLoading] = useState(false);
  const [aiBankError, setAiBankError] = useState("");
  
  // Exam taking states
  const [takingExam, setTakingExam] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [rightClickCount, setRightClickCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [cheatingWarning, setCheatingWarning] = useState(false);
  const [examTerminated, setExamTerminated] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "ready" | "blocked">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [proctoringStatus, setProctoringStatus] = useState("Camera monitoring inactive.");
  const [cameraReady, setCameraReady] = useState(false);
  
  // Form states
  const [newTest, setNewTest] = useState({
    title: "",
    course: "AI/ML",
    targetAudience: "",
    audienceType: "all",
    audienceBatch: "",
    description: "",
    durationMinutes: 60,
    availableFrom: "",
    availableUntil: "",
    questions: [] as Question[],
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctoringBusyRef = useRef(false);

  useEffect(() => {
    fetchTests();
    if (userRole !== "student") {
      fetchStudents();
      fetchQuestionBank();
    }
  }, [userRole]);

  const showToast = useToast();

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tests");
      setTests(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students/list/all?limit=200&page=1");
      const payload = response.data?.data;
      const list = payload?.students || payload || [];
      setStudents(list);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchTestResults = async (testId: string) => {
    try {
      const response = await api.get(`/tests/${testId}/results`);
      const results = response.data.data || [];
      setTestResults([...results].sort((left, right) => (right.score || 0) - (left.score || 0)));
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  const downloadExamReport = async (testId: string, format: "pdf" | "doc") => {
    try {
      const response = await api.get(`/tests/${testId}/report/${format}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam_${testId}_report.${format === "doc" ? "docx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to download report");
    }
  };

  const fetchQuestionBank = async () => {
    try {
      const response = await api.get("/questions/predefined");
      const list = response.data?.data || [];
      // Cast the imported fallback bank to QuestionBankItem[] if needed, or use directly
      const fallbackList = fallbackPredefinedQuestions as QuestionBankItem[];
      setQuestionBank(list.length > 0 ? list : fallbackList);
    } catch (error) {
      console.error("Failed to fetch question bank:", error);
      setQuestionBank(fallbackPredefinedQuestions as QuestionBankItem[]);
    }
  };

  const parseGeneratedQuestions = (rawText: string): GeneratedQuestion[] => {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as GeneratedQuestion[] | GeneratedQuestion;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };

  const loadAiQuestionBank = async () => {
    try {
      setAiBankLoading(true);
      setAiBankError("");
      const response = await api.post(
        "/ai/generate-questions",
        {
          topic: aiBankTopic,
          difficulty: aiBankDifficulty,
          count: aiBankCount,
          questionType: "mcq",
          provider: "ollama",
        },
        { headers: authHeader(localStorage.getItem("nirmaan_token") || "") }
      );

      const payload = response.data?.data || {};
      const rawText = payload.text || JSON.stringify(payload.questions || []);
      const generated = Array.isArray(payload.questions) && payload.questions.length > 0
        ? payload.questions
        : parseGeneratedQuestions(String(rawText));
      const mapped: QuestionBankItem[] = generated
        .filter((item) => item && item.question)
        .map((item, index) => {
          const options = Array.isArray(item.options) && item.options.length >= 4
            ? item.options.slice(0, 4)
            : ["Option A", "Option B", "Option C", "Option D"];

          const correctIndex = typeof item.correctAnswer === "number"
            ? Math.max(0, Math.min(3, item.correctAnswer))
            : ["A", "B", "C", "D"].indexOf(String(item.correctAnswer || "A").toUpperCase());

          return {
            _id: `ai-${Date.now()}-${index}`,
            question: item.question,
            options,
            correctAnswer: ["A", "B", "C", "D"][correctIndex >= 0 ? correctIndex : 0] as "A" | "B" | "C" | "D",
            marks: 10,
          };
        });

      if (!mapped.length) {
        setAiBankError("No AI questions were returned. Try a different topic.");
        return;
      }

      setQuestionBank((prev) => {
        const existingIds = new Set(prev.map((item) => item._id));
        const merged = [...mapped.filter((item) => !existingIds.has(item._id)), ...prev];
        return merged;
      });
      setSelectedSetFilter("All");
    } catch (error) {
      console.error("Failed to load AI question bank:", error);
      setAiBankError("Failed to generate AI questions. Please try again.");
    } finally {
      setAiBankLoading(false);
    }
  };

  const createTest = async () => {
    try {
      setLoading(true);
      // Remove temporary _id from questions before sending to backend
      const questionsToSend = newTest.questions.map(({ _id, ...q }) => q);

      // Compute totalMarks safely (guard against undefined/NaN)
      const totalMarks = newTest.questions.reduce((sum, q) => {
        const m = Number(q.marks);
        return sum + (Number.isFinite(m) ? m : 0);
      }, 0);

      // Compute canonical targetAudience string for backend
      let computedTarget = "";
      if (newTest.audienceType === "batch") {
        computedTarget = newTest.audienceBatch || "";
      } else if (newTest.audienceType === "industry") {
        computedTarget = "industry";
      } else if (newTest.audienceType === "both") {
        // encode both with prefix so backend can interpret
        computedTarget = `both:${newTest.audienceBatch || ""}`;
      }

      await api.post("/tests", {
        ...newTest,
        targetAudience: computedTarget,
        questions: questionsToSend,
        totalMarks,
      });
      
      showToast("success", "Exam created successfully!");
      setShowCreateModal(false);
      setNewTest({ title: "", course: "AI/ML", targetAudience: "", audienceType: "all", audienceBatch: "", description: "", durationMinutes: 60, availableFrom: "", availableUntil: "", questions: [] });
      fetchTests();
    } catch (error: any) {
      console.error("Failed to create test:", error);
      showToast("error", "Failed to create test: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await api.delete(`/tests/${testId}`);
      fetchTests();
      showToast("success", "Exam deleted successfully.");
    } catch (error) {
      console.error("Failed to delete test:", error);
      showToast("error", "Failed to delete exam. Please try again.");
    }
  };

  const assignTest = async (testId: string, studentIds: string[]) => {
    try {
      await api.post(`/tests/${testId}/assign`, { studentIds });
      setShowAssignModal(false);
      setSelectedStudentIds([]);
      fetchTests();
      showToast("success", "Exam assigned successfully.");
    } catch (error) {
      console.error("Failed to assign test:", error);
      showToast("error", "Failed to assign exam. Please try again.");
    }
  };

  const applyQuestionBankSelection = () => {
    const selectedRows = questionBank.filter((row) => selectedQuestionIds.includes(row._id));
    if (!selectedRows.length) return;

    const mapped: Question[] = selectedRows.map((row) => ({
      _id: row._id,
      prompt: row.question,
      options: row.options,
      answer: ["A", "B", "C", "D"].indexOf(row.correctAnswer),
      marks: row.marks || 1,
    }));

    setNewTest((prev) => ({
      ...prev,
      questions: [...prev.questions, ...mapped],
    }));
    setSelectedQuestionIds([]);
  };

  const publishTest = async (testId: string) => {
    try {
      await api.patch(`/tests/${testId}/publish`, { isPublished: true });
      fetchTests();
      showToast("success", "Exam published successfully.");
    } catch (error) {
      console.error("Failed to publish test:", error);
      showToast("error", "Failed to publish exam. Please try again.");
    }
  };

  const addQuestion = () => {
    setNewTest({
      ...newTest,
      questions: [
        ...newTest.questions,
        {
          _id: Date.now().toString(),
          prompt: "",
          options: ["", "", "", ""],
          answer: 0,
          marks: 10,
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...newTest.questions];
    updated[index] = { ...updated[index], [field]: value };
    setNewTest({ ...newTest, questions: updated });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...newTest.questions];
    updated[qIndex].options[oIndex] = value;
    setNewTest({ ...newTest, questions: updated });
  };

  const recordProctoringEvent = useCallback(async (eventType: string, metadata: Record<string, unknown> = {}) => {
    if (!selectedTest?._id) return;

    try {
      await api.post("/tests/proctoring/log-event", {
        testId: selectedTest._id,
        eventType,
        metadata,
      });
    } catch (error) {
      console.error("Failed to log proctoring event:", error);
    }
  }, [selectedTest?._id]);

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
    const response = await fetch(`${proctoringApiBaseUrl}${path}`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
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

  const startCamera = useCallback(async () => {
    if (!takingExam || !selectedTest) return;

    setCameraStatus("starting");
    setCameraError(null);
    setProctoringStatus("Requesting camera access...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => null);
      }

      setCameraStatus("ready");
      setCameraReady(true);
      setProctoringStatus("Camera ready. Face, eye, gaze, and room checks are active.");
      void recordProctoringEvent("camera_started", { status: "ready" });
    } catch (error: any) {
      const message = error?.message || "Camera access was denied or is unavailable.";
      setCameraStatus("blocked");
      setCameraReady(false);
      setCameraError(message);
      setProctoringStatus("Camera access is blocked. Proctoring will stay limited until access is granted.");
      void recordProctoringEvent("camera-denied", { message });
    }
  }, [recordProctoringEvent, selectedTest, takingExam]);

  const startExam = async (test: Test) => {
    try {
      setLoading(true);
      setExamLoadError(null);

      // Check if student can attempt this test (one attempt rule)
      try {
        const canAttempt = await api.get(`/tests/${test._id}/can-attempt`);
        if (canAttempt.data?.data?.canAttempt === false) {
          setExamLoadError(canAttempt.data.data.message || "You cannot attempt this exam right now.");
          setLoading(false);
          return;
        }
      } catch (attemptError) {
        console.warn("Attempt precheck failed, continuing with exam load:", attemptError);
        showToast("warning", "Exam precheck failed, loading the exam directly.");
      }

      // Validate test has questions
      if (!test.questions || !Array.isArray(test.questions) || test.questions.length === 0) {
        // Fetch full test details if questions are missing
        const response = await api.get(`/tests/${test._id}`);
        const fullTest = response.data.data;

        if (!fullTest.questions || !Array.isArray(fullTest.questions) || fullTest.questions.length === 0) {
          setExamLoadError("This exam has no questions. Please contact your instructor.");
          setLoading(false);
          return;
        }

        test = fullTest;
      }

      setSelectedTest(test);
      setTakingExam(true);
      setCurrentQuestionIndex(0);
      setAnswers(new Array(test.questions.length).fill(-1));
      setTimeRemaining(test.durationMinutes * 60);
      setExamSubmitted(false);
      setTabSwitchCount(0);
      setRightClickCount(0);
      setFullscreenExitCount(0);
      setScreenshotCount(0);
      setCheatingWarning(false);
      setExamTerminated(false);
      setCameraStatus("idle");
      setCameraError(null);
      setProctoringStatus("Camera monitoring inactive.");
      setCameraReady(false);
    } catch (error: any) {
      console.error("Failed to load exam:", error);
      const message = error?.response?.data?.message || "Failed to load exam. Please try again.";
      setExamLoadError(message);
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async () => {
    if (!selectedTest) {
      setExamLoadError("Error: No exam selected.");
      return;
    }

    if (!selectedTest._id) {
      setExamLoadError("Error: Invalid exam ID.");
      return;
    }

    // Validate answers array
    if (!Array.isArray(answers) || answers.length === 0) {
      setExamLoadError("Error: Could not submit exam. Please refresh the page and try again.");
      return;
    }
    
    try {
      setLoading(true);
      await api.post(`/tests/${selectedTest._id}/submit`, { answers });
      setExamSubmitted(true);
      setTakingExam(false);
      fetchTests();
    } catch (error: any) {
      console.error("Failed to submit exam:", error);
      setExamLoadError(error?.response?.data?.message || "Failed to submit exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (takingExam && timeRemaining > 0 && !examSubmitted) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [takingExam, timeRemaining, examSubmitted]);

  useEffect(() => {
    if (!takingExam || !selectedTest) return;

    let cancelled = false;

    void startCamera().catch((error) => {
      if (!cancelled) {
        console.error("Camera start error:", error);
      }
    });

    return () => {
      cancelled = true;
      proctoringBusyRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [selectedTest, startCamera, takingExam]);

  useEffect(() => {
    if (!takingExam || !selectedTest || !cameraReady) return;

    let cancelled = false;
    const interval = window.setInterval(async () => {
      if (cancelled || proctoringBusyRef.current) return;

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

      useEffect(() => {
        if (!takingExam || !selectedTest || examSubmitted) return;

        const requestFullscreen = async () => {
          try {
            if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen?.();
            }
          } catch {
            // Ignore unsupported browsers.
          }
        };

        void requestFullscreen();

        const handleVisibility = () => {
          if (document.hidden) {
            setTabSwitchCount((count) => count + 1);
            void recordProctoringEvent("tab-switch", { message: "Tab switch detected" });
          }
        };

        const handleBlur = () => {
          setTabSwitchCount((count) => count + 1);
          void recordProctoringEvent("window-blur", { message: "Window focus lost" });
        };

        const handleContextMenu = (event: MouseEvent) => {
          event.preventDefault();
          setRightClickCount((count) => count + 1);
          void recordProctoringEvent("right-click", { message: "Right-click detected" });
          return false;
        };

        const handleSelectStart = (event: Event) => {
          event.preventDefault();
          void recordProctoringEvent("text-selection", { message: "Text selection attempt blocked" });
          return false;
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          const keySig = [event.ctrlKey ? "Ctrl" : "", event.shiftKey ? "Shift" : "", event.altKey ? "Alt" : "", event.metaKey ? "Meta" : "", event.key].filter(Boolean).join("+");
          if (event.key === "PrintScreen" || keySig.includes("Shift+S") || event.key === "F12" || keySig.includes("Ctrl+Shift+I") || keySig.includes("Ctrl+Shift+J") || keySig.includes("Ctrl+Shift+C")) {
            event.preventDefault();
            setScreenshotCount((count) => count + 1);
            void recordProctoringEvent("screenshot-attempt", { key: keySig || event.key });
          }
        };

        const handleFullscreenChange = () => {
          if (!document.fullscreenElement) {
            setFullscreenExitCount((count) => count + 1);
            void recordProctoringEvent("fullscreen-exit", { message: "Fullscreen exited" });
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
      }, [examSubmitted, recordProctoringEvent, selectedTest, takingExam]);

        if (eyes.status === "fulfilled" && eyes.value.success && eyes.value.eyes_open === false) {
          alerts.push("eyes-closed");
          void recordProctoringEvent("eyes-closed", { eyes: eyes.value });
        }

        if (gaze.status === "fulfilled" && gaze.value.success && ["looking_away", "no_face"].includes(gaze.value.direction || "")) {
          alerts.push(gaze.value.direction || "gaze-alert");
          void recordProctoringEvent("gaze-away", { gaze: gaze.value });
        }

        if (people.status === "fulfilled" && people.value.success && (people.value.people_detected || 0) > 1) {
          alerts.push("multiple-people");
          void recordProctoringEvent("multiple-people", { people: people.value });
        }

        if (landmarks.status === "fulfilled" && landmarks.value.success && (landmarks.value.emotion || "").toLowerCase() === "angry") {
          alerts.push("facial-expression-alert");
          void recordProctoringEvent("facial-expression-alert", { landmarks: landmarks.value });
        }

        setProctoringStatus(
          alerts.length > 0
            ? `Proctoring alert: ${alerts.join(", ")}`
            : "Camera active. Face, eye, gaze, expression, and room checks are clear."
        );
      } catch (error) {
        console.error("Proctoring capture error:", error);
        setProctoringStatus("Proctoring check failed. Camera is still active, but verification could not complete.");
      } finally {
        proctoringBusyRef.current = false;
      }
    }, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [cameraReady, captureFrame, postProctoringCheck, recordProctoringEvent, selectedTest, takingExam]);

  useEffect(() => {
    if (!takingExam || !selectedTest || cameraStatus !== "blocked") return;

    const retryTimer = window.setInterval(() => {
      void startCamera().catch((error) => {
        console.error("Camera retry error:", error);
      });
    }, 5000);

    return () => window.clearInterval(retryTimer);
  }, [cameraStatus, selectedTest, startCamera, takingExam]);

  // Student View
  if (userRole === "student") {
    // Exam Load Error View
    if (examLoadError) {
      return (
        <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Exam</h2>
          <p className="text-gray-500 mb-6">{examLoadError}</p>
          <button
            onClick={() => {
              setExamLoadError(null);
              setSelectedTest(null);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Exams
          </button>
        </div>
      );
    }

    // Exam Terminated View
    if (examTerminated) {
      return (
        <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Exam Terminated</h2>
          <p className="text-gray-500 mb-6">Your exam was terminated due to violation of exam rules (multiple tab switches or exiting fullscreen mode).</p>
          <button
            onClick={() => {
              setExamTerminated(false);
              setSelectedTest(null);
              setTabSwitchCount(0);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Exams
          </button>
        </div>
      );
    }

    // Exam Taking Interface
    if (takingExam && selectedTest) {
      // Validate questions exist and have data
      if (!selectedTest.questions || !Array.isArray(selectedTest.questions) || selectedTest.questions.length === 0) {
        return (
          <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Exam Questions</h2>
            <p className="text-gray-500 mb-6">This exam has no questions or they could not be loaded. Please try again.</p>
            <button
              onClick={() => {
                setTakingExam(false);
                setSelectedTest(null);
                setExamLoadError(null);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Exams
            </button>
          </div>
        );
      }

      const currentQuestion = selectedTest.questions[currentQuestionIndex];

      // Final safety check for current question
      if (!currentQuestion) {
        return (
          <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Question Not Found</h2>
            <p className="text-gray-500 mb-6">Could not load question {currentQuestionIndex + 1}. Please refresh the page.</p>
            <button
              onClick={() => {
                setTakingExam(false);
                setSelectedTest(null);
                window.location.reload();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        );
      }
      
      return (
        <div className="bg-white rounded-lg shadow-lg border p-6 select-none">
          <div className="mb-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black/90">
              <video ref={videoRef} autoPlay muted playsInline className="h-56 w-full bg-black object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Live Proctoring</h3>
                  <p className="text-sm text-gray-500">Webcam capture and AI checks run while the exam is active.</p>
                </div>
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
              <p className="mt-3 text-sm text-gray-700">{proctoringStatus}</p>
              {cameraError ? <p className="mt-2 text-sm text-red-600">{cameraError}</p> : null}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-white p-3 border border-gray-200">
                  <div className="text-gray-500">Tab switches</div>
                  <div className="text-lg font-semibold">{tabSwitchCount}</div>
                </div>
                <div className="rounded-lg bg-white p-3 border border-gray-200">
                  <div className="text-gray-500">Right-clicks</div>
                  <div className="text-lg font-semibold">{rightClickCount}</div>
                </div>
                <div className="rounded-lg bg-white p-3 border border-gray-200">
                  <div className="text-gray-500">Fullscreen exits</div>
                  <div className="text-lg font-semibold">{fullscreenExitCount}</div>
                </div>
                <div className="rounded-lg bg-white p-3 border border-gray-200">
                  <div className="text-gray-500">Screenshot attempts</div>
                  <div className="text-lg font-semibold">{screenshotCount}</div>
                </div>
              </div>
              {cameraStatus === "blocked" ? (
                <button
                  type="button"
                  onClick={() => {
                    void startCamera();
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Enable Camera
                </button>
              ) : null}
            </div>
          </div>

          {/* Cheating Warning Banner */}
          {cheatingWarning && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">
                  Warning: Tab switch detected! ({tabSwitchCount}/3 allowed)
                </span>
              </div>
              <button
                onClick={() => setCheatingWarning(false)}
                className="text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{selectedTest?.title || "Exam"}</h2>
              <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {selectedTest?.questions?.length || 0}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={submitExam}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Exam"}
              </button>
            </div>
          </div>

          {/* Question Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {selectedTest?.questions && Array.isArray(selectedTest.questions) && selectedTest.questions.length > 0 ? (
              selectedTest.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === index
                      ? "bg-blue-600 text-white"
                      : answers[index] !== -1
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))
            ) : (
              <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg text-center">
                No questions available
              </div>
            )}
          </div>

          {/* Current Question */}
          <div className="border rounded-lg p-6 mb-6">
            {currentQuestion?.prompt ? (
              <>
                <h3 className="text-lg font-semibold mb-4">{currentQuestion.prompt}</h3>
                <div className="space-y-3">
                  {currentQuestion?.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          answers[currentQuestionIndex] === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          checked={answers[currentQuestionIndex] === index}
                          onChange={() => {
                            const newAnswers = [...answers];
                            newAnswers[currentQuestionIndex] = index;
                            setAnswers(newAnswers);
                          }}
                          className="w-5 h-5"
                        />
                        <span className="flex-1">{option || `Option ${index + 1}`}</span>
                      </label>
                    ))
                  ) : (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                      Error: This question has no valid options.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error: Question content could not be loaded. Please refresh the page.
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(Math.min((selectedTest?.questions?.length || 1) - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === (selectedTest?.questions?.length || 1) - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      );
    }

    // Exam Submitted View
    if (examSubmitted) {
      return (
        <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
          <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Exam Submitted Successfully!</h2>
          <p className="text-gray-500 mb-6">Your responses have been recorded. You can view your results once they are graded.</p>
          <button
            onClick={() => {
              setExamSubmitted(false);
              setSelectedTest(null);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Exams
          </button>
        </div>
      );
    }

    // Exam List View
    return (
      <div className="bg-white rounded-lg shadow-lg border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">My Exams</h2>
            <p className="text-sm text-gray-500">View and take your assigned exams</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : tests.filter(t => t.isPublished).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No exams assigned yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.filter(t => t.isPublished).map((test) => (
              <div key={test._id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{test.title}</h3>
                    <p className="text-sm text-gray-500">{test.course}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {test.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {test.totalMarks} marks
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {test.questions?.length || 0} questions
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startExam(test)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Teacher/Admin View
  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Coding Questions & Assessment</h2>
            <p className="text-sm text-gray-500">Create, assign, and manage quiz assessments</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </button>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : tests.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No exams created yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <div key={test._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{test.title}</h3>
                    {test.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{test.course} • Created by {test.createdBy?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const t = test.targetAudience || "";
                      if (!t) return "Audience: all students";
                      if (t === "industry") return "Audience: industry-oriented students";
                      if (t.startsWith("both:")) return `Audience: batch ${t.split(":")[1]} and industry-oriented students`;
                      return `Audience: batch ${t}`;
                    })()}
                    {test.availableFrom || test.availableUntil
                      ? ` • Window: ${test.availableFrom ? new Date(test.availableFrom).toLocaleString() : "start"} - ${test.availableUntil ? new Date(test.availableUntil).toLocaleString() : "end"}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!test.isPublished && (
                    <button
                      onClick={() => publishTest(test._id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      fetchTestResults(test._id);
                      setShowResultsModal(true);
                    }}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Results
                  </button>
                  <button
                    title="Download exam report PDF"
                    onClick={() => downloadExamReport(test._id, "pdf")}
                    className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" /> PDF
                  </button>
                  <button
                    title="Download exam report DOC"
                    onClick={() => downloadExamReport(test._id, "doc")}
                    className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" /> DOC
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      setShowAssignModal(true);
                    }}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" />
                    Assign
                  </button>
                  <button
                    title="Delete exam"
                    aria-label="Delete exam"
                    onClick={() => deleteTest(test._id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {test.durationMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {test.totalMarks} marks
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {test.questions?.length || 0} questions
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {test.assignedStudents?.length || 0} assigned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Create New Coding Questions / Quiz Assessment</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Coding Quiz 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <select
                  title="Select course"
                  value={newTest.course}
                  onChange={(e) => setNewTest({ ...newTest, course: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="AI/ML">AI/ML</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="NLP">NLP</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Exam description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  title="Exam duration in minutes"
                  value={newTest.durationMinutes}
                  onChange={(e) => setNewTest({ ...newTest, durationMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={10}
                  max={180}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <select
                  title="Select target audience"
                  value={newTest.audienceType}
                  onChange={(e) => setNewTest({ ...newTest, audienceType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All students</option>
                  <option value="batch">Batch (select a batch below)</option>
                  <option value="industry">Industry-oriented</option>
                  <option value="both">Both (batch + industry)</option>
                </select>

                {(newTest.audienceType === "batch" || newTest.audienceType === "both") && (
                  <input
                    type="text"
                    value={newTest.audienceBatch}
                    onChange={(e) => setNewTest({ ...newTest, audienceBatch: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                    placeholder="Enter batch name (e.g., redington batch)"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Available From</label>
                  <input
                    type="datetime-local"
                    title="Exam availability start date and time"
                    value={newTest.availableFrom}
                    onChange={(e) => setNewTest({ ...newTest, availableFrom: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Until</label>
                  <input
                    type="datetime-local"
                    title="Exam availability end date and time"
                    value={newTest.availableUntil}
                    onChange={(e) => setNewTest({ ...newTest, availableUntil: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Generate AI Question Bank
                    </p>
                    <p className="text-xs text-gray-500">Generate topic-specific MCQs, then pick them into this exam.</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadAiQuestionBank}
                    disabled={aiBankLoading}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {aiBankLoading ? "Generating..." : "Load AI Questions"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Topic</label>
                    <select title="Select AI question topic" value={aiBankTopic} onChange={(e) => setAiBankTopic(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                      {aiQuestionTopics.map((topic) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Difficulty</label>
                    <select title="Select AI question difficulty" value={aiBankDifficulty} onChange={(e) => setAiBankDifficulty(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Count</label>
                    <input type="number" title="Number of AI questions to generate" min={1} max={200} value={aiBankCount} onChange={(e) => setAiBankCount(Math.min(200, Math.max(1, Number(e.target.value) || 1)))} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                {aiBankError && <p className="text-sm text-red-600">{aiBankError}</p>}
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Questions ({newTest.questions.length})</label>
                  <button
                    onClick={addQuestion}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>

                {questionBank.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-blue-100 p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-blue-100/50 pb-3">
                      <div>
                        <p className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                          Predefined Question Bank
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">GenAI, C, Java, Python, MERN, DL, NLP & ML mastery</p>
                      </div>
                      <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full self-start sm:self-center">
                        {questionBank.length} Total Questions
                      </span>
                    </div>

                    {/* Set Filter Tabs */}
                    <div className="flex flex-wrap gap-1 mb-4 bg-blue-100/40 p-1 rounded-xl">
                      {["All", "SET A", "SET B", "SET C", "SET D", "SET E", "SET F", "SET G", "SET H", "SET I"].map((set) => {
                        const count = questionBank.filter(q => set === "All" || q.question.includes(`[${set}`)).length;
                        return (
                          <button
                            key={set}
                            type="button"
                            onClick={() => setSelectedSetFilter(set)}
                            className={`flex-1 text-center py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              selectedSetFilter === set
                                ? "bg-white text-blue-600 shadow-xs border border-blue-100"
                                : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                            }`}
                          >
                            {set === "All" ? "All" : set} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {questionBank
                        .filter((q) => selectedSetFilter === "All" || q.question.includes(`[${selectedSetFilter}`))
                        .map((q) => (
                          <div key={q._id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-blue-100 bg-white/70 hover:bg-white transition-all shadow-xs group">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                id={`q-chk-${q._id}`}
                                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-blue-200 cursor-pointer"
                                checked={selectedQuestionIds.includes(q._id)}
                                onChange={(e) => {
                                  setSelectedQuestionIds((prev) =>
                                    e.target.checked ? [...prev, q._id] : prev.filter((id) => id !== q._id)
                                  );
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <label htmlFor={`q-chk-${q._id}`} className="text-sm font-semibold text-gray-800 block leading-snug cursor-pointer group-hover:text-blue-900 transition-colors">
                                  {q.question}
                                </label>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    {q.marks || 10} Marks
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                    Predefined
                                  </span>
                                  {q.difficulty && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      q.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border-green-100' :
                                      q.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' :
                                      'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                      {q.difficulty}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const mapped = {
                                  _id: q._id + Date.now().toString(),
                                  prompt: q.question,
                                  options: q.options,
                                  answer: ["A", "B", "C", "D"].indexOf(q.correctAnswer),
                                  marks: q.marks || 10,
                                };
                                setNewTest((prev) => ({
                                  ...prev,
                                  questions: [...prev.questions, mapped],
                                }));
                              }}
                              className="flex-shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg border border-blue-200 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-xs"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-blue-100/50 pt-3">
                      <p className="text-xs text-gray-500">
                        Select multiple with checkboxes and add all:
                      </p>
                      <button
                        type="button"
                        onClick={applyQuestionBankSelection}
                        disabled={!selectedQuestionIds.length}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-40 transition-opacity"
                      >
                        Add Selected ({selectedQuestionIds.length})
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {newTest.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Question {qIndex + 1}</span>
                        <button
                          title="Remove question"
                          onClick={() => {
                            const updated = newTest.questions.filter((_, i) => i !== qIndex);
                            setNewTest({ ...newTest, questions: updated });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => updateQuestion(qIndex, "prompt", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mb-3"
                        placeholder="Question text..."
                      />
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              title={`Set option ${oIndex + 1} as correct answer`}
                              name={`correct-${qIndex}`}
                              checked={q.answer === oIndex}
                              onChange={() => updateQuestion(qIndex, "answer", oIndex)}
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-3 py-1.5 border rounded text-sm"
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Marks:</label>
                        <input
                          type="number"
                          title="Question marks"
                          value={q.marks}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            updateQuestion(qIndex, "marks", Number.isFinite(val) ? val : 0);
                          }}
                          className="w-20 px-3 py-1.5 border rounded text-sm"
                          min={0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={createTest}
                disabled={loading || !newTest.title || newTest.questions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full">
            <div className="p-5 border-b">
              <h3 className="text-lg font-bold">Assign Assessment: {selectedTest.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const t = selectedTest.targetAudience || "";
                  if (!t) return "Audience: all students";
                  if (t === "industry") return "Audience: industry-oriented students";
                  if (t.startsWith("both:")) return `Audience: batch ${t.split(":")[1]} and industry-oriented students`;
                  return `Audience: batch ${t}`;
                })()}
              </p>
            </div>
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-2">
              {students.length === 0 ? (
                <p className="text-sm text-gray-500">No students found.</p>
              ) : (
                students.map((student) => (
                  <label key={student._id} className="flex items-center gap-2 border rounded-md p-2">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student._id)}
                      onChange={(e) => {
                        setSelectedStudentIds((prev) =>
                          e.target.checked ? [...prev, student._id] : prev.filter((id) => id !== student._id)
                        );
                      }}
                    />
                    <span className="text-sm">{student.name} ({student.email})</span>
                  </label>
                ))
              )}
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStudentIds([]);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => assignTest(selectedTest._id, selectedStudentIds)}
                disabled={!selectedStudentIds.length}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultsModal && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Results: {selectedTest.title}</h3>
              <button onClick={() => setShowResultsModal(false)} className="text-sm text-gray-500 hover:text-black">Close</button>
            </div>
            <div className="p-5 space-y-3">
              {testResults.length === 0 ? (
                <p className="text-sm text-gray-500">No submissions yet.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={result._id} className="border rounded-md p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">#{index + 1} {result.student?.name || "Student"}</p>
                      <p className="text-xs text-gray-500">{result.student?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{result.score}</p>
                      <p className="text-xs text-gray-500">{new Date(result.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

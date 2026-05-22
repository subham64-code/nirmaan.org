"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import { Clock, BookOpen, CheckCircle, AlertCircle, Play, ChevronRight, ChevronLeft, Flag, RotateCcw, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

interface Question {
  _id: string;
  prompt: string;
  options: string[];
  marks: number;
}

interface Test {
  _id: string;
  title: string;
  course: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
}

interface TestResult {
  score: number;
  totalMarks: number;
  percentage: number;
}

export default function ExamSystem() {
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [violations, setViolations] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const testContainerRef = useRef<HTMLDivElement>(null);
  const windowFocusedRef = useRef(true);
  const showToast = useToast();

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeLeft]);

  // Browser-level blocking is removed; proctoring logs and timed submission remain.
  useEffect(() => {
    if (!testStarted) return;
  }, [testStarted]);

  const logViolation = async (eventType: string, metadata: any = {}) => {
    setViolations((prev) => prev + 1);

    try {
      if (!activeTest) return;
      // Log to backend
      await api.post("/tests/proctoring/log-event", {
        testId: activeTest._id,
        eventType,
        metadata,
      });
    } catch (error) {
      console.error("Failed to log violation:", error);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tests");
      setAvailableTests(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test: Test) => {
    setActiveTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(test.durationMinutes * 60);
    setTestStarted(true);
    setTestCompleted(false);
    setResult(null);
    setViolations(0);
    setWarningMessage(null);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;

    try {
      setLoading(true);

      // Check proctoring violations and flag if necessary
      const response = await api.post(`/tests/${activeTest._id}/submit`, {
        answers,
        startedAt: new Date(Date.now() - (activeTest.durationMinutes * 60 - timeLeft) * 1000).toISOString(),
        violations,
        proctoringVerified: violations < 5, // Flag if too many violations
      });

      if (response.data.success) {
        setResult({
          score: response.data.data.score,
          totalMarks: activeTest.totalMarks,
          percentage: Math.round((response.data.data.score / activeTest.totalMarks) * 100),
        });
        setTestCompleted(true);
        setTestStarted(false);

        // Exit fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch (error) {
      console.error("Failed to submit test:", error);
      showToast("error", "Failed to submit test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return "text-red-600 bg-red-50";
    if (timeLeft < 300) return "text-yellow-600 bg-yellow-50";
    return "text-blue-600 bg-blue-50";
  };

  // Results View
  if (testCompleted && result) {
    return (
      <div className="bg-white rounded-lg shadow-lg border p-8 text-center">
        <div className="mb-6">
          {result.percentage >= 60 ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
          <p className="text-gray-600">Here are your results</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Score</p>
            <p className="text-3xl font-bold text-blue-800">
              {result.score}/{result.totalMarks}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Percentage</p>
            <p className="text-3xl font-bold text-purple-800">{result.percentage}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Status</p>
            <p className="text-xl font-bold text-green-800">
              {result.percentage >= 60 ? "Passed" : "Needs Improvement"}
            </p>
          </div>
        </div>

        {violations > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Proctoring Note</p>
                <p className="text-sm">{violations} suspicious activity/activities were detected during your exam. This may affect your score.</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setTestCompleted(false);
            setActiveTest(null);
            setResult(null);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="h-5 w-5" />
          Back to Tests
        </button>
      </div>
    );
  }

  // Active Test View
  if (testStarted && activeTest) {
    const question = activeTest.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / activeTest.questions.length) * 100;

    return (
      <div ref={testContainerRef} className="bg-white rounded-lg shadow-lg border">
        {/* Warning Messages */}
        {warningMessage && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 font-medium text-sm">{warningMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="font-bold text-lg">{activeTest.title}</h2>
            <p className="text-sm text-gray-500">{activeTest.course}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${getTimeColor()}`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            {violations > 0 && (
              <div className="px-3 py-2 bg-red-50 rounded-lg flex items-center gap-1 text-red-600 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                {violations} flags
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <div className="bg-blue-600 h-2 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Question {currentQuestion + 1} of {activeTest.questions.length}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {question.marks} marks
              </span>
            </div>
            <h3 className="text-lg font-medium">{question.prompt}</h3>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(question._id, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition ${
                  answers[question._id] === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      answers[question._id] === index
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {currentQuestion < activeTest.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit Test"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Available Tests List
  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Exam Center</h2>
          <p className="text-sm text-gray-500">Take tests and exams</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading tests...</div>
      ) : availableTests.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No tests available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {availableTests.map((test) => (
            <div key={test._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{test.title}</h3>
                  <p className="text-sm text-gray-500">{test.course}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.durationMinutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {test.questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Flag className="h-4 w-4" />
                      {test.totalMarks} marks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => startTest(test)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
          </button>

          <div className="flex gap-2">
            {currentQuestion < activeTest.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit Test"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Available Tests List
  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Exam Center</h2>
          <p className="text-sm text-gray-500">Take tests and exams</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading tests...</div>
      ) : availableTests.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No tests available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {availableTests.map((test) => (
            <div key={test._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{test.title}</h3>
                  <p className="text-sm text-gray-500">{test.course}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.durationMinutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {test.questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Flag className="h-4 w-4" />
                      {test.totalMarks} marks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => startTest(test)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

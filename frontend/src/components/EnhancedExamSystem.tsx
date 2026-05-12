"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, Clock, Award, Play, BarChart3, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

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
  description?: string;
  durationMinutes: number;
  totalMarks: number;
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

export default function EnhancedExamSystem({ userRole }: { userRole: "student" | "teacher" | "admin" }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  // Exam taking states
  const [takingExam, setTakingExam] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cheatingWarning, setCheatingWarning] = useState(false);
  const [examTerminated, setExamTerminated] = useState(false);
  
  // Form states
  const [newTest, setNewTest] = useState({
    title: "",
    course: "AI/ML",
    description: "",
    durationMinutes: 60,
    questions: [] as Question[],
  });

  useEffect(() => {
    fetchTests();
    if (userRole !== "student") {
      fetchStudents();
    }
  }, [userRole]);

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
      setTestResults(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  const createTest = async () => {
    try {
      setLoading(true);
      await api.post("/tests", {
        ...newTest,
        totalMarks: newTest.questions.reduce((sum, q) => sum + q.marks, 0),
      });
      setShowCreateModal(false);
      setNewTest({ title: "", course: "AI/ML", description: "", durationMinutes: 60, questions: [] });
      fetchTests();
    } catch (error) {
      console.error("Failed to create test:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await api.delete(`/tests/${testId}`);
      fetchTests();
    } catch (error) {
      console.error("Failed to delete test:", error);
    }
  };

  const assignTest = async (testId: string, studentIds: string[]) => {
    try {
      await api.post(`/tests/${testId}/assign`, { studentIds });
      setShowAssignModal(false);
      fetchTests();
    } catch (error) {
      console.error("Failed to assign test:", error);
    }
  };

  const publishTest = async (testId: string) => {
    try {
      await api.patch(`/tests/${testId}/publish`, { isPublished: true });
      fetchTests();
    } catch (error) {
      console.error("Failed to publish test:", error);
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

  const startExam = (test: Test) => {
    setSelectedTest(test);
    setTakingExam(true);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(test.questions.length).fill(-1));
    setTimeRemaining(test.durationMinutes * 60);
    setExamSubmitted(false);
  };

  const submitExam = async () => {
    if (!selectedTest) return;
    
    try {
      setLoading(true);
      await api.post(`/tests/${selectedTest._id}/submit`, { answers });
      setExamSubmitted(true);
      setTakingExam(false);
      fetchTests();
    } catch (error) {
      console.error("Failed to submit exam:", error);
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

  // Anti-cheating: Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (takingExam && document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setCheatingWarning(true);
        
        // Terminate exam after 3 tab switches
        if (tabSwitchCount >= 2) {
          setExamTerminated(true);
          setTakingExam(false);
          alert("Exam terminated due to multiple tab switches. This is a violation of exam rules.");
        }
      }
    };

    if (takingExam) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, [takingExam, tabSwitchCount]);

  // Anti-cheating: Fullscreen enforcement
  useEffect(() => {
    if (takingExam) {
      const requestFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if ((document.documentElement as any).webkitRequestFullscreen) {
            await (document.documentElement as any).webkitRequestFullscreen();
          }
        } catch (e) {
          console.log("Fullscreen request failed:", e);
        }
      };
      
      requestFullscreen();
      
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && takingExam && !examSubmitted) {
          setCheatingWarning(true);
          setTabSwitchCount((prev) => prev + 1);
          
          if (tabSwitchCount >= 2) {
            setExamTerminated(true);
            setTakingExam(false);
            alert("Exam terminated due to exiting fullscreen mode. This is a violation of exam rules.");
          } else {
            requestFullscreen();
          }
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }
  }, [takingExam, tabSwitchCount, examSubmitted]);

  // Anti-cheating: Disable right-click and keyboard shortcuts
  useEffect(() => {
    if (takingExam) {
      const handleContextMenu = (e: Event) => e.preventDefault();
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable common shortcuts
        if (
          e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a") ||
          e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "v" || e.key === "i") ||
          e.key === "F12" ||
          (e.ctrlKey && e.key === "u") ||
          (e.ctrlKey && e.shiftKey && e.key === "j")
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);
      
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [takingExam]);

  // Student View
  if (userRole === "student") {
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
      const currentQuestion = selectedTest.questions[currentQuestionIndex];
      
      return (
        <div className="bg-white rounded-lg shadow-lg border p-6">
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
              <h2 className="text-xl font-bold">{selectedTest.title}</h2>
              <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {selectedTest.questions.length}</p>
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
            {selectedTest.questions.map((_, index) => (
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
            ))}
          </div>

          {/* Current Question */}
          <div className="border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.prompt}</h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
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
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </div>
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
              onClick={() => setCurrentQuestionIndex(Math.min(selectedTest.questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === selectedTest.questions.length - 1}
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
            <h2 className="text-xl font-bold">Exam Management</h2>
            <p className="text-sm text-gray-500">Create, assign, and manage exams</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Exam
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
              <h3 className="text-xl font-bold">Create New Exam</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Exam Title</label>
                <input
                  type="text"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Mid-Term Assessment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <select
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
                  value={newTest.durationMinutes}
                  onChange={(e) => setNewTest({ ...newTest, durationMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={10}
                  max={180}
                />
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
                <div className="space-y-4">
                  {newTest.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Question {qIndex + 1}</span>
                        <button
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
                          value={q.marks}
                          onChange={(e) => updateQuestion(qIndex, "marks", parseInt(e.target.value))}
                          className="w-20 px-3 py-1.5 border rounded text-sm"
                          min={1}
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
                {loading ? "Creating..." : "Create Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

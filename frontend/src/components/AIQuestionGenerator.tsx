"use client";

import { useState } from "react";
import { Sparkles, Loader2, BookOpen, Settings, CheckCircle, Download, Copy } from "lucide-react";
import { api } from "@/lib/api";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function AIQuestionGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [provider, setProvider] = useState("gemini");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.post("/ai/generate-questions", {
        topic,
        difficulty,
        count,
        questionType,
        provider,
      });

      if (response.data.success) {
        setQuestions(response.data.data.questions || []);
      }
    } catch (err) {
      console.error("Failed to generate questions:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = questions
      .map((q, i) => {
        return `${i + 1}. ${q.question}\n${q.options.map((opt, idx) => `   ${String.fromCharCode(65 + idx)}. ${opt}`).join("\n")}\n   Answer: ${String.fromCharCode(65 + q.correctAnswer)}\n   Explanation: ${q.explanation}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
    alert("Questions copied to clipboard!");
  };

  const downloadQuestions = () => {
    const text = questions
      .map((q, i) => {
        return `${i + 1}. ${q.question}\n${q.options.map((opt, idx) => `   ${String.fromCharCode(65 + idx)}. ${opt}`).join("\n")}\n   Answer: ${String.fromCharCode(65 + q.correctAnswer)}\n   Explanation: ${q.explanation}`;
      })
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questions-${topic.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Question Generator</h2>
          <p className="text-sm text-gray-500">Generate exam questions using AI</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="h-4 w-4 inline mr-1" />
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., JavaScript Basics, Machine Learning, Soft Skills"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Settings className="h-4 w-4 inline mr-1" />
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="truefalse">True/False</option>
            <option value="shortanswer">Short Answer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateQuestions}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate Questions
          </>
        )}
      </button>

      {/* Generated Questions */}
      {questions.length > 0 && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Generated Questions ({questions.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={downloadQuestions}
                className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                <p className="font-medium mb-3">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2 mb-3">
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded-lg border flex items-center gap-2 ${
                        optIndex === q.correctAnswer
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {optIndex === q.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

interface ExtractedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

export default function QuestionExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [manualQuestion, setManualQuestion] = useState<ExtractedQuestion>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 'A',
    marks: 1
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Please upload a PDF, DOCX, or TXT file.' });
      }
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('/api/questions/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setExtractedQuestions(response.data.questions);
      setMessage({ 
        type: 'success', 
        text: `Successfully extracted ${response.data.questionsExtracted} questions!` 
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to extract questions' 
      });
    } finally {
      setLoading(false);
    }
  };

  const addManualQuestion = () => {
    if (!manualQuestion.question || manualQuestion.options.some(opt => !opt)) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setExtractedQuestions([...extractedQuestions, { ...manualQuestion }]);
    setManualQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      marks: 1
    });
    setShowManualForm(false);
    setMessage({ type: 'success', text: 'Question added successfully!' });
  };

  const removeQuestion = (index: number) => {
    setExtractedQuestions(extractedQuestions.filter((_, i) => i !== index));
  };

  const updateManualQuestion = (field: string, value: any) => {
    setManualQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateOption = (index: number, value: string) => {
    setManualQuestion(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Question Extraction & Management</h2>

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 text-blue-500" />
              <span className="text-gray-700">
                {file ? file.name : 'Click to upload PDF, DOCX, or TXT'}
              </span>
              <span className="text-sm text-gray-500">or drag and drop</span>
            </label>
          </div>

          <button
            onClick={handleExtract}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Extract Questions
              </>
            )}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}
      </div>

      {/* Extracted Questions Display */}
      {extractedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-xl font-bold">Extracted Questions ({extractedQuestions.length})</h3>
          
          <div className="space-y-4">
            {extractedQuestions.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-2 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{q.question}</p>
                    <div className="mt-2 space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <p key={oIdx} className={`ml-4 ${
                          String.fromCharCode(65 + oIdx) === q.correctAnswer
                            ? 'text-green-700 font-semibold'
                            : 'text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}) {opt}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Correct Answer: <span className="font-semibold">{q.correctAnswer}</span> | 
                      Marks: <span className="font-semibold">{q.marks}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="text-red-500 hover:text-red-700 ml-4"
                    aria-label="Remove question"
                    title="Remove question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Manual Question Addition */}
          {!showManualForm && (
            <button
              onClick={() => setShowManualForm(true)}
              className="w-full mt-4 border-2 border-dashed border-green-300 text-green-700 py-2 rounded-lg hover:border-green-500 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Question Manually
            </button>
          )}

          {showManualForm && (
            <div className="border-2 border-green-300 rounded-lg p-4 space-y-4 bg-green-50">
              <h4 className="font-bold">Add New Question</h4>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Question</label>
                <textarea
                  value={manualQuestion.question}
                  onChange={(e) => updateManualQuestion('question', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Enter the question"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold">Options</label>
                {manualQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="w-8 text-center font-bold">{String.fromCharCode(65 + idx)})</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="flex-1 border rounded px-3 py-2"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Correct Answer</label>
                  <select
                    value={manualQuestion.correctAnswer}
                    onChange={(e) => updateManualQuestion('correctAnswer', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    aria-label="Correct answer"
                    title="Correct answer"
                  >
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Marks</label>
                  <input
                    type="number"
                    value={manualQuestion.marks}
                    onChange={(e) => updateManualQuestion('marks', parseFloat(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                    aria-label="Marks"
                    title="Marks"
                    min="0.5"
                    max="10"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addManualQuestion}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Add Question
                </button>
                <button
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

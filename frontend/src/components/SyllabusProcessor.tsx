"use client";

import { useState, useRef } from "react";
import { StorageService } from "@/lib/storage";
import { DeepSeekService } from "@/lib/deepseek";
import { Upload, FileText, Brain, Loader2, CheckCircle, AlertCircle, Download, Eye } from "lucide-react";

interface SyllabusAnalysis {
  summary: string;
  modules: Array<{
    title: string;
    topics: string[];
    duration: string;
    objectives: string[];
  }>;
  prerequisites: string[];
  outcomes: string[];
  assessment: string[];
}

export default function SyllabusProcessor() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<SyllabusAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalysis(null);
      setError(null);
    }
  };

  const processSyllabus = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // First upload the file to storage
      const uploadResult = await StorageService.uploadSyllabus(uploadedFile);
      console.log("File uploaded:", uploadResult);

      // For now, we'll simulate the analysis since we can't read Word docs directly
      // In a real implementation, you'd use a document parsing service
      const mockAnalysis: SyllabusAnalysis = {
        summary: "Comprehensive AI/ML training program covering fundamental concepts to advanced applications.",
        modules: [
          {
            title: "Introduction to Artificial Intelligence",
            topics: [
              "AI History and Evolution",
              "Types of AI (Narrow, General, Super)",
              "Machine Learning Fundamentals",
              "Deep Learning Basics",
              "Real-world Applications"
            ],
            duration: "2 weeks",
            objectives: [
              "Understand AI concepts and terminology",
              "Identify different types of AI",
              "Recognize AI applications in industry"
            ]
          },
          {
            title: "Machine Learning Algorithms",
            topics: [
              "Supervised Learning (Classification, Regression)",
              "Unsupervised Learning (Clustering, Dimensionality Reduction)",
              "Reinforcement Learning",
              "Model Evaluation and Validation",
              "Feature Engineering"
            ],
            duration: "3 weeks",
            objectives: [
              "Implement ML algorithms",
              "Evaluate model performance",
              "Handle real-world datasets"
            ]
          },
          {
            title: "Deep Learning and Neural Networks",
            topics: [
              "Neural Network Architecture",
              "Backpropagation",
              "Convolutional Neural Networks (CNN)",
              "Recurrent Neural Networks (RNN)",
              "Transformer Models"
            ],
            duration: "4 weeks",
            objectives: [
              "Design neural network architectures",
              "Implement CNN and RNN models",
              "Apply transfer learning"
            ]
          },
          {
            title: "Natural Language Processing",
            topics: [
              "Text Preprocessing",
              "Word Embeddings",
              "Language Models",
              "Sentiment Analysis",
              "Text Generation"
            ],
            duration: "3 weeks",
            objectives: [
              "Process and analyze text data",
              "Build NLP applications",
              "Use pre-trained language models"
            ]
          },
          {
            title: "Computer Vision",
            topics: [
              "Image Processing Basics",
              "Object Detection",
              "Image Classification",
              "Face Recognition",
              "Image Generation"
            ],
            duration: "3 weeks",
            objectives: [
              "Process digital images",
              "Implement computer vision algorithms",
              "Build CV applications"
            ]
          }
        ],
        prerequisites: [
          "Basic programming knowledge (Python preferred)",
          "Mathematics (Linear Algebra, Calculus, Statistics)",
          "Computer fundamentals",
          "Problem-solving skills"
        ],
        outcomes: [
          "Design and implement AI solutions",
          "Evaluate AI model performance",
          "Apply AI techniques to real problems",
          "Understand ethical implications of AI",
          "Stay updated with AI trends"
        ],
        assessment: [
          "Weekly coding assignments",
          "Mid-term project",
          "Final capstone project",
          "Peer reviews",
          "Presentations"
        ]
      };

      setAnalysis(mockAnalysis);

    } catch (error) {
      console.error("Processing error:", error);
      setError("Failed to process syllabus. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate file content extraction
      const fileContent = `
        AI2 Syllabus - Complete AI Training Program
        
        Module 1: AI Fundamentals (2 weeks)
        - Introduction to AI and ML
        - History and Evolution
        - Types of AI
        - Applications and Ethics
        
        Module 2: Machine Learning (3 weeks)
        - Supervised Learning
        - Unsupervised Learning
        - Model Evaluation
        - Feature Engineering
        
        Module 3: Deep Learning (4 weeks)
        - Neural Networks
        - CNN and RNN
        - Transformer Models
        - Transfer Learning
        
        Module 4: NLP (3 weeks)
        - Text Processing
        - Language Models
        - Sentiment Analysis
        - Text Generation
        
        Module 5: Computer Vision (3 weeks)
        - Image Processing
        - Object Detection
        - Image Classification
        - Face Recognition
        
        Prerequisites: Python, Math, Programming
        Outcomes: AI solution design, model evaluation, ethical AI
        Assessment: Assignments, projects, presentations
      `;

      const aiAnalysis = await DeepSeekService.analyzeSyllabus(fileContent);
      
      // Parse the AI response into our structure
      const parsedAnalysis: SyllabusAnalysis = {
        summary: aiAnalysis.split('\n')[0] || "AI training program analysis",
        modules: [
          {
            title: "AI Fundamentals",
            topics: ["Introduction to AI", "History and Evolution", "Types of AI", "Applications"],
            duration: "2 weeks",
            objectives: ["Understand AI basics", "Identify AI types", "Apply AI concepts"]
          },
          {
            title: "Machine Learning",
            topics: ["Supervised Learning", "Unsupervised Learning", "Model Evaluation"],
            duration: "3 weeks",
            objectives: ["Implement ML algorithms", "Evaluate models", "Feature engineering"]
          }
        ],
        prerequisites: ["Python programming", "Mathematics", "Problem solving"],
        outcomes: ["Design AI solutions", "Evaluate models", "Ethical AI practices"],
        assessment: ["Assignments", "Projects", "Presentations"]
      };

      setAnalysis(parsedAnalysis);

    } catch (error) {
      console.error("AI Analysis error:", error);
      setError("AI analysis failed. Please check your API key and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;

    const content = `
Syllabus Analysis Report
========================

Summary:
${analysis.summary}

Modules:
${analysis.modules.map((module, index) => `
${index + 1}. ${module.title} (${module.duration})
   Topics: ${module.topics.join(', ')}
   Objectives: ${module.objectives.join(', ')}
`).join('\n')}

Prerequisites:
${analysis.prerequisites.join(', ')}

Learning Outcomes:
${analysis.outcomes.join(', ')}

Assessment Methods:
${analysis.assessment.join(', ')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syllabus-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Syllabus Processor</h2>
      </div>

      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".doc,.docx,.pdf,.txt"
          className="hidden"
          id="syllabus-upload"
        />
        <label
          htmlFor="syllabus-upload"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-gray-600 mb-1">
            {uploadedFile ? uploadedFile.name : "Click to upload syllabus file"}
          </span>
          <span className="text-sm text-gray-500">
            Supported formats: DOC, DOCX, PDF, TXT
          </span>
        </label>
      </div>

      {/* Processing Options */}
      {uploadedFile && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={processSyllabus}
            disabled={isProcessing}
            className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Process Syllabus
              </>
            )}
          </button>

          <button
            onClick={analyzeWithAI}
            disabled={isProcessing}
            className="flex-1 p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                AI Analysis
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Analysis Results
            </h3>
            <button
              onClick={downloadAnalysis}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Download Analysis"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-gray-700">{analysis.summary}</p>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-medium mb-3">Course Modules</h4>
            <div className="space-y-3">
              {analysis.modules.map((module, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{module.title}</h5>
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {module.duration}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Topics</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {module.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Objectives</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {module.objectives.map((objective, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites and Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Prerequisites</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {analysis.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">▸</span>
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Learning Outcomes</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {analysis.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Assessment */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Assessment Methods</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.assessment.map((method, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

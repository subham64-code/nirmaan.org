"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Download, Clock, Users, Award, Target, CheckCircle, Play, FileText } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { courses } from "@/lib/constants";

export default function SyllabusPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "modules" | "outcomes" | "documents">("overview");
  const [downloadStatus, setDownloadStatus] = useState<Record<string, boolean>>({});
  const showToast = useToast();

  const selectedCourseData = courses.find(course => course.title === selectedCourse);

  return (
    <div className="section space-y-10">
      {/* Hero Section */}
      <section data-reveal className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-12 h-12 text-blue-500" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Syllabus
          </h1>
        </div>
        <p className="max-w-3xl mx-auto text-lg text-[var(--muted)] leading-relaxed">
          Explore our comprehensive curriculum designed to transform you into industry-ready professionals. 
          Each course is carefully crafted with real-world projects and expert mentorship.
        </p>
      </section>

      {/* Course Selection */}
      <section>
        <h2 data-reveal className="text-3xl font-bold mb-6 text-center">Choose Your Path</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <div
              key={course.title}
              data-reveal
              className={`glass p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedCourse === course.title ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCourse(course.title)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--foreground)]">{course.title}</h3>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {course.duration}
                </div>
              </div>
              
              <p className="text-[var(--muted)] mb-4 leading-relaxed">{course.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Target className="w-4 h-4" />
                  <span>Skills: {course.skills.slice(0, 3).join(", ")}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Award className="w-4 h-4" />
                  <span>{course.placement}</span>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                  View Syllabus
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Course Details */}
      {selectedCourseData && (
        <section data-reveal className="glass p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">{selectedCourseData.title} Syllabus</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-[var(--outline)] overflow-x-auto">
            <button
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "overview" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "modules" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => setActiveTab("modules")}
            >
              Modules
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "outcomes" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => setActiveTab("outcomes")}
            >
              Learning Outcomes
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "documents" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => setActiveTab("documents")}
            >
              📄 Documents
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Course Description</h3>
                    <p className="text-blue-800 leading-relaxed">{selectedCourseData.description}</p>
                  </div>
                  
                  <div className="p-6 bg-purple-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Duration</h3>
                    <div className="flex items-center gap-2 text-purple-800">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold">{selectedCourseData.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-green-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Skills You'll Learn</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCourseData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-orange-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Placement Support</h3>
                  <p className="text-orange-800 leading-relaxed">{selectedCourseData.placement}</p>
                </div>
              </div>
            )}

            {activeTab === "modules" && (
              <div className="space-y-6">
                {getCourseModules(selectedCourseData.title).map((module, index) => (
                  <div key={index} className="border border-[var(--outline)] rounded-xl p-6 hover:border-blue-500 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Module {index + 1}: {module.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {module.duration}
                      </span>
                    </div>
                    
                    <p className="text-[var(--muted)] mb-4">{module.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Topics Covered:</h4>
                      <ul className="grid gap-2 md:grid-cols-2">
                        {module.topics.map((topic: string, topicIndex: number) => (
                          <li key={topicIndex} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {module.project && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">🚀 Project</h4>
                        <p className="text-blue-800 text-sm">{module.project}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "outcomes" && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Technical Skills</h3>
                    <ul className="space-y-2">
                      {getTechnicalOutcomes(selectedCourseData.title).map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-800">
                          <CheckCircle className="w-4 h-4 mt-0.5" />
                          <span className="text-sm">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Career Outcomes</h3>
                    <ul className="space-y-2">
                      {getCareerOutcomes(selectedCourseData.title).map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-purple-800">
                          <Award className="w-4 h-4 mt-0.5" />
                          <span className="text-sm">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-green-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Certification & Assessment</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-8 h-8 text-green-700" />
                      </div>
                      <h4 className="font-medium text-green-900">Projects</h4>
                      <p className="text-sm text-green-800">Hands-on projects with real-world applications</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-8 h-8 text-green-700" />
                      </div>
                      <h4 className="font-medium text-green-900">Peer Reviews</h4>
                      <p className="text-sm text-green-800">Collaborative learning and feedback</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="w-8 h-8 text-green-700" />
                      </div>
                      <h4 className="font-medium text-green-900">Certificate</h4>
                      <p className="text-sm text-green-800">Industry-recognized certification</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Syllabus Roadmap */}
                  <div className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">Syllabus Roadmap</h3>
                          <p className="text-sm text-blue-700">3-Month Day-wise Plan</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--muted)] mb-4">
                      Comprehensive day-wise breakdown of the entire AI/ML curriculum with topics and deliverables planned for all centers.
                    </p>
                    
                    <button
                      onClick={() => downloadDocument("AI SYLLABUS 3 MONTH DAY WISE_All centers.pdf")}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        downloadStatus["roadmap"]
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      {downloadStatus["roadmap"] ? "Downloaded ✓" : "Download PDF"}
                    </button>
                  </div>

                  {/* Day Plan - Soft Skills */}
                  <div className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-900">Soft Skills Day Plan</h3>
                          <p className="text-sm text-purple-700">Daily Curriculum</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--muted)] mb-4">
                      Daily structured plan for soft skills development across all training centers covering communication, teamwork, and professional growth.
                    </p>
                    
                    <button
                      onClick={() => downloadDocument("Day Plan Softskills_All Centers.pdf")}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        downloadStatus["softskills"]
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      {downloadStatus["softskills"] ? "Downloaded ✓" : "Download PDF"}
                    </button>
                  </div>
                </div>

                {/* Documents Info */}
                <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">📋 Document Details</h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Syllabus Roadmap:</strong> Complete 3-month AI/ML curriculum with daily milestones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Soft Skills Plan:</strong> Professional development and interpersonal skills training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>All Centers:</strong> Standardized curriculum across all training locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Format:</strong> PDF - Easy to print, share, and reference offline</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Download Syllabus */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => downloadDocument("AI SYLLABUS 3 MONTH DAY WISE_All centers.pdf")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-5 h-5" />
              Download Full Syllabus
            </button>
          </div>
        </section>
      )}

      {/* Enrollment CTA */}
      {!selectedCourse && (
        <section data-reveal className="text-center glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-[var(--muted)] mb-6 max-w-2xl mx-auto">
            Choose a course that matches your career goals and join thousands of successful professionals 
            who have transformed their careers with Nirmaan.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
              Apply Now
            </Link>
            <button onClick={() => downloadDocument("Nirmaan-Brochure.pdf")} className="px-6 py-3 border border-[var(--outline)] rounded-lg hover:bg-[var(--surface)] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Brochure
            </button>
          </div>
        </section>
      )}
    </div>
  );

  function downloadDocument(filename: string) {
    let documentKey = "document";
    if (filename.includes("Day Plan")) documentKey = "softskills";
    else if (filename.includes("SYLLABUS")) documentKey = "roadmap";
    else if (filename.includes("Brochure")) documentKey = "brochure";
    
    // Validate filename - whitelisted files only
    const validFiles = [
      "AI SYLLABUS 3 MONTH DAY WISE_All centers.pdf",
      "Day Plan Softskills_All Centers.pdf",
      "Nirmaan-Brochure.pdf"
    ];
    
    if (!validFiles.includes(filename)) {
      showToast("error", "❌ Invalid document selected");
      return;
    }

    try {
      // Get the API base URL
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = `${apiBase}/files/download?filename=${encodeURIComponent(filename)}`;
      link.download = filename;
      link.setAttribute("target", "_blank");
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mark as downloaded with visual feedback
      setDownloadStatus(prev => ({ ...prev, [documentKey]: true }));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [documentKey]: false }));
      }, 3000);
    } catch (error) {
      console.error("Download error:", error);
      showToast("error", "❌ Failed to download document. Please try again.");
    }
  }

}

// Helper functions for course-specific content
function getCourseModules(courseTitle: string) {
  const modules: Record<string, any[]> = {
    "AI/ML": [
      {
        title: "Foundations of AI & ML",
        duration: "4 weeks",
        description: "Introduction to artificial intelligence, machine learning concepts, and Python programming.",
        topics: ["Python Basics", "Data Structures", "ML Fundamentals", "Statistics", "Linear Algebra"],
        project: "Build a simple predictive model"
      },
      {
        title: "Supervised Learning",
        duration: "6 weeks",
        description: "Deep dive into regression, classification, and evaluation metrics.",
        topics: ["Linear Regression", "Logistic Regression", "Decision Trees", "Random Forest", "SVM"],
        project: "Customer churn prediction system"
      },
      {
        title: "Unsupervised Learning",
        duration: "4 weeks",
        description: "Clustering algorithms and dimensionality reduction techniques.",
        topics: ["K-Means", "Hierarchical Clustering", "PCA", "t-SNE", "Anomaly Detection"],
        project: "Customer segmentation analysis"
      },
      {
        title: "Deep Learning Fundamentals",
        duration: "6 weeks",
        description: "Neural networks, backpropagation, and deep learning frameworks.",
        topics: ["Neural Networks", "Backpropagation", "TensorFlow", "Keras", "Optimization"],
        project: "Image classification with CNN"
      },
      {
        title: "Advanced ML & Deployment",
        duration: "4 weeks",
        description: "Model deployment, MLOps, and production considerations.",
        topics: ["Model Deployment", "MLOps", "Docker", "Cloud ML", "Monitoring"],
        project: "End-to-end ML pipeline"
      }
    ],
    "Deep Learning": [
      {
        title: "Neural Network Foundations",
        duration: "4 weeks",
        description: "Mathematical foundations and implementation of neural networks.",
        topics: ["Perceptrons", "Activation Functions", "Backpropagation", "Gradient Descent"],
        project: "Implement neural network from scratch"
      },
      {
        title: "Convolutional Neural Networks",
        duration: "6 weeks",
        description: "CNNs for computer vision tasks and image processing.",
        topics: ["CNN Architecture", "Convolution", "Pooling", "Transfer Learning"],
        project: "Object detection system"
      },
      {
        title: "Recurrent Neural Networks",
        duration: "4 weeks",
        description: "RNNs, LSTMs, and sequence modeling.",
        topics: ["RNN Basics", "LSTM", "GRU", "Sequence Prediction"],
        project: "Time series forecasting"
      },
      {
        title: "Transformers & Attention",
        duration: "4 weeks",
        description: "Attention mechanisms and transformer architectures.",
        topics: ["Attention Mechanism", "Transformers", "BERT", "GPT"],
        project: "Text classification with transformers"
      },
      {
        title: "Advanced Deep Learning",
        duration: "2 weeks",
        description: "GANs, VAEs, and cutting-edge architectures.",
        topics: ["GANs", "VAEs", "Autoencoders", "Reinforcement Learning"],
        project: "Generate synthetic images with GAN"
      }
    ]
  };

  return modules[courseTitle] || [
    {
      title: "Course Introduction",
      duration: "2 weeks",
      description: "Getting started with course fundamentals.",
      topics: ["Introduction", "Setup", "Basic Concepts", "Tools"],
      project: "Setup and configuration"
    }
  ];
}

function getTechnicalOutcomes(courseTitle: string) {
  const outcomes: Record<string, string[]> = {
    "AI/ML": [
      "Master Python programming for data science",
      "Implement and tune various ML algorithms",
      "Build and evaluate predictive models",
      "Handle real-world data preprocessing",
      "Deploy ML models to production"
    ],
    "Deep Learning": [
      "Design and implement neural networks",
      "Work with CNNs for computer vision tasks",
      "Build RNNs for sequence modeling",
      "Use transformers for NLP tasks",
      "Implement advanced architectures like GANs"
    ]
  };

  return outcomes[courseTitle] || [
    "Gain comprehensive understanding of the subject",
    "Develop practical implementation skills",
    "Build portfolio of real projects",
    "Prepare for industry interviews"
  ];
}

function getCareerOutcomes(courseTitle: string) {
  const outcomes: Record<string, string[]> = {
    "AI/ML": [
      "Machine Learning Engineer",
      "Data Scientist",
      "AI Researcher",
      "Data Analyst",
      "ML Consultant"
    ],
    "Deep Learning": [
      "Deep Learning Engineer",
      "Computer Vision Engineer",
      "NLP Engineer",
      "AI Research Scientist",
      "ML Infrastructure Engineer"
    ]
  };

  return outcomes[courseTitle] || [
    "Industry-ready professional",
    "Technical lead positions",
    "Research opportunities",
    "Consulting roles"
  ];
}

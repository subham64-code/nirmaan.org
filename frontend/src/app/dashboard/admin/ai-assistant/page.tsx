"use client";

import AdminChatbot from "@/components/AdminChatbot";
import FileUploadManager from "@/components/FileUploadManager";
import TrainingContentViewer from "@/components/TrainingContentViewer";
import SyllabusProcessor from "@/components/SyllabusProcessor";
import { Brain, FileText, Bot, BookOpen, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ProviderStatus = {
  gemini: boolean;
  deepseek: boolean;
  ollama: boolean;
};

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<"content" | "chatbot" | "curriculum" | "syllabus">("content");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await api.get("/ai/providers");
        setProviderStatus(response.data.data.status);
      } catch {
        setProviderStatus(null);
      }
    };

    loadStatus();
  }, []);

  const tabs = [
    { id: "content", label: "Content Management", icon: FileText },
    { id: "chatbot", label: "AI Assistant", icon: Bot },
    { id: "curriculum", label: "Training Curriculum", icon: BookOpen },
    { id: "syllabus", label: "Syllabus Processor", icon: GraduationCap },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">AI Assistant & Content Management</h1>
          <p className="text-gray-600">Manage syllabus, questions, training curriculum, and interact with AI assistant</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Gemini", value: providerStatus?.gemini ? "Ready" : "Missing" },
          { label: "DeepSeek", value: providerStatus?.deepseek ? "Ready" : "Missing" },
          { label: "Ollama", value: providerStatus?.ollama ? "Ready" : "Missing" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-2 text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "content" && <FileUploadManager />}
        
        {activeTab === "chatbot" && (
          <div className="h-[600px]">
            <AdminChatbot />
          </div>
        )}
        
        {activeTab === "curriculum" && <TrainingContentViewer />}
        
        {activeTab === "syllabus" && <SyllabusProcessor />}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Getting Started Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">📚 Content Upload</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Upload syllabus documents</li>
              <li>• Upload question banks</li>
              <li>• Firebase Storage</li>
              <li>• File management</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🤖 AI Assistant</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Server-backed provider routing</li>
              <li>• Gemini, DeepSeek, Ollama support</li>
              <li>• No browser-side API keys</li>
              <li>• Ask questions</li>
              <li>• Get AI assistance</li>
              <li>• Training content help</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎓 Training Curriculum</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Browse programs</li>
              <li>• Filter by category</li>
              <li>• Module details</li>
              <li>• Learning outcomes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">📝 Syllabus Processor</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Upload syllabus files</li>
              <li>• AI-powered analysis</li>
              <li>• Extract modules</li>
              <li>• Generate reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

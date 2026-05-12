"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Bot, Send, User, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
}

type ProviderStatus = {
  gemini: boolean;
  deepseek: boolean;
  ollama: boolean;
};

export default function AdminChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I’m the Nirmaan AI assistant. Ask me anything about courses, attendance, tests, applications, or teaching workflows.",
      timestamp: new Date(),
      provider: "server",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<"auto" | "gemini" | "deepseek" | "ollama">("auto");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const providerLabel = useMemo(() => {
    if (provider === "auto") return "Auto";
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    const message = input.trim();
    if (!message) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStatusMessage("");

    try {
      const response = await api.post("/ai/chat", {
        message,
        provider,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.data.text,
        timestamp: new Date(),
        provider: response.data.data.provider,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const fallback = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setStatusMessage(fallback ? `AI error: ${fallback}` : "AI request failed. Check backend configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-white/80">Provider: {providerLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as typeof provider)}
            className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none backdrop-blur"
          >
            <option value="auto" className="text-black">Auto</option>
            <option value="gemini" className="text-black">Gemini</option>
            <option value="deepseek" className="text-black">DeepSeek</option>
            <option value="ollama" className="text-black">Ollama</option>
          </select>
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await api.get("/ai/providers");
                setProviderStatus(response.data.data.status);
                setStatusMessage("Provider status refreshed.");
              } catch {
                setStatusMessage("Could not refresh provider status.");
              }
            }}
            className="rounded-md border border-white/20 p-2 text-white transition-colors hover:bg-white/10"
            aria-label="Refresh provider status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {providerStatus && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <strong>Server status:</strong> Gemini {providerStatus.gemini ? "ready" : "off"}, DeepSeek {providerStatus.deepseek ? "ready" : "off"}, Ollama {providerStatus.ollama ? "ready" : "off"}
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-lg p-3 ${message.role === "user" ? "ml-auto bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs opacity-70">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                {message.provider && <span>{message.provider}</span>}
              </div>
            </div>
            {message.role === "user" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        {statusMessage && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {statusMessage}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about courses, students, attendance, or tests..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send chat message"
            title="Send message"
            className="rounded-lg bg-blue-500 p-3 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
const env = require("../config/env");

let googleModelPromise;
let deepseekModelPromise;
let ollamaModelPromise;
const providerTimeoutMs = Number(process.env.AI_PROVIDER_TIMEOUT_MS) || 4500;

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out`)), providerTimeoutMs);
    }),
  ]);
}

function getOllamaGenerateUrl() {
  const baseUrl = String(env.ollamaBaseUrl || "http://localhost:11434").replace(/\/$/, "");
  return baseUrl.endsWith("/api") ? `${baseUrl}/generate` : `${baseUrl}/api/generate`;
}

function buildPlatformFallbackReply(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("course") || text.includes("learn") || text.includes("program")) {
    return "Nirmaan currently offers AI/ML, Deep Learning, NLP, Generative AI, and Soft Skills programs. If you want, I can also break down the best course for your background and goal.";
  }

  if (text.includes("apply") || text.includes("admission") || text.includes("form")) {
    return "You can apply from the application page, submit your details, and then wait for admin review. After approval, the student account can be activated from the login flow.";
  }

  if (text.includes("attendance") || text.includes("present") || text.includes("late")) {
    return "Attendance is handled through the attendance dashboard and teacher workflows, with check-in and summary endpoints on the server.";
  }

  if (text.includes("exam") || text.includes("test") || text.includes("quiz")) {
    return "The platform supports teacher-created tests, student submissions, and result tracking. I can help you draft questions or explain the test flow.";
  }

  if (text.includes("otp") || text.includes("login") || text.includes("password")) {
    return "Login is server-backed through OTP verification for admin and teacher roles, and password-based login for students after activation.";
  }

  if (text.includes("teacher") || text.includes("admin") || text.includes("dashboard")) {
    return "Teacher and admin dashboards are connected to the backend, including attendance, assessments, applications, and AI-assisted content tools.";
  }

  return null;
}

function extractKnowledgeTopic(message) {
  const text = String(message || "").trim();
  const patterns = [
    /^what is\s+(.+)\??$/i,
    /^what's\s+(.+)\??$/i,
    /^who is\s+(.+)\??$/i,
    /^tell me about\s+(.+)$/i,
    /^explain\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return text;
}

function buildLocalKnowledgeReply(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("python")) {
    return "Python is a high-level, interpreted programming language known for readable syntax and wide use in web development, automation, data analysis, and AI.";
  }

  if (text.includes("javascript")) {
    return "JavaScript is the programming language of the web, used to build interactive websites, browser apps, and many backend services.";
  }

  if (text.includes("html")) {
    return "HTML is the standard markup language used to structure content on the web.";
  }

  if (text.includes("css")) {
    return "CSS is the style language used to control the appearance and layout of web pages.";
  }

  if (text.includes("api")) {
    return "An API is a software interface that lets different applications communicate and exchange data.";
  }

  if (text.includes("machine learning") || text.includes("ai")) {
    return "AI and machine learning are fields focused on building systems that can recognize patterns, make predictions, and automate tasks from data.";
  }

  if (text.includes("git")) {
    return "Git is a version control system used to track code changes and collaborate on software projects.";
  }

  return null;
}

async function fetchWikipediaSummary(topic) {
  if (!topic) {
    return null;
  }

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&namespace=0&format=json&origin=*`;

  try {
    const searchResponse = await fetch(searchUrl, {
      headers: { Accept: "application/json" },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const title = Array.isArray(searchData) && Array.isArray(searchData[1]) ? searchData[1][0] : "";
      if (title) {
        const summaryResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
          headers: { Accept: "application/json" },
        });

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          const extract = String(summaryData.extract || "").trim();
          if (extract && !/^python may refer to:/i.test(extract)) {
            return extract;
          }
        }
      }
    }
  } catch (error) {
    // Fall through to the direct summary attempts below.
  }

  const safeTopic = encodeURIComponent(topic.replace(/\s+/g, "_"));
  const summaryUrls = [
    `https://en.wikipedia.org/api/rest_v1/page/summary/${safeTopic}`,
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
  ];

  for (const url of summaryUrls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const extract = String(data.extract || "").trim();
      if (extract && !/^python may refer to:/i.test(extract)) {
        return extract;
      }
    } catch (error) {
      // Continue to the next lookup strategy.
    }
  }

  return null;
}

async function buildKnowledgeFallbackReply(message) {
  const platformReply = buildPlatformFallbackReply(message);
  if (platformReply) {
    return platformReply;
  }

  const localReply = buildLocalKnowledgeReply(message);
  if (localReply) {
    return localReply;
  }

  const topic = extractKnowledgeTopic(message);
  const summary = await fetchWikipediaSummary(topic);
  if (summary) {
    return summary;
  }

  return "I couldn't reach an external AI provider or a live knowledge source for that question right now. Try rephrasing it or ask about courses, applications, attendance, tests, or dashboards.";
}

function buildFallbackQuestions({ topic, difficulty, count, questionType }) {
  const total = Math.max(1, Math.min(Number(count) || 5, 10));
  const safeTopic = String(topic || "the topic");
  const items = [];

  for (let index = 0; index < total; index += 1) {
    const number = index + 1;
    if (questionType === "essay") {
      items.push({
        question: `${number}. Explain the key concepts of ${safeTopic} at a ${difficulty} level with examples.`,
        type: "essay",
      });
      continue;
    }

    if (questionType === "short") {
      items.push({
        question: `${number}. Write a short answer question about ${safeTopic} for a ${difficulty} learner.`,
        type: "short",
      });
      continue;
    }

    items.push({
      question: `${number}. Which statement best describes ${safeTopic} in a ${difficulty} context?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "A",
      type: "mcq",
    });
  }

  return JSON.stringify(items, null, 2);
}

async function loadGoogleModel() {
  if (!env.geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  if (!googleModelPromise) {
    googleModelPromise = import("@langchain/google-genai").then(({ ChatGoogleGenerativeAI }) => (
      new ChatGoogleGenerativeAI({
        apiKey: env.geminiApiKey,
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        temperature: 0.4,
      })
    ));
  }

  return googleModelPromise;
}

async function loadDeepSeekModel() {
  if (!env.deepseekApiKey) {
    throw new Error("DeepSeek API key not configured");
  }

  if (!deepseekModelPromise) {
    deepseekModelPromise = import("@langchain/openai").then(({ ChatOpenAI }) => (
      new ChatOpenAI({
        apiKey: env.deepseekApiKey,
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature: 0.4,
        configuration: {
          baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
        },
      })
    ));
  }

  return deepseekModelPromise;
}

async function loadOllamaModel(modelName = env.ollamaModel) {
  if (!ollamaModelPromise) {
    ollamaModelPromise = import("@langchain/ollama").then(({ ChatOllama }) => (
      new ChatOllama({
        model: modelName,
        baseUrl: env.ollamaBaseUrl,
        headers: env.ollamaApiKey ? { Authorization: `Bearer ${env.ollamaApiKey}` } : undefined,
        temperature: 0.4,
      })
    ));
  }

  return ollamaModelPromise;
}

async function invokeOllamaGenerate(prompt, systemMessage, modelName = env.ollamaModel) {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), providerTimeoutMs);

  let response;
  try {
    response = await fetch(getOllamaGenerateUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.ollamaApiKey ? { Authorization: `Bearer ${env.ollamaApiKey}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        prompt,
        system: systemMessage,
        stream: false,
      }),
      signal: abortController.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = String(data.response || data.message?.content || "").trim();

  if (!text) {
    throw new Error("No response from Ollama API");
  }

  return text;
}

async function invokeModel(model, prompt, systemMessage) {
  const messages = [];

  if (systemMessage) {
    messages.push({ role: "system", content: systemMessage });
  }

  messages.push({ role: "user", content: prompt });

  const response = await model.invoke(messages);
  if (typeof response.content === "string") {
    return response.content;
  }

  if (Array.isArray(response.content)) {
    return response.content
      .map((part) => (typeof part === "string" ? part : part.text || ""))
      .join("")
      .trim();
  }

  return String(response.content || "").trim();
}

async function chat({ provider = "auto", message, context = "" }) {
  const systemMessage = [
    "You are the Nirmaan AI assistant.",
    "Help with courses, exams, student support, teacher workflows, attendance, and administration.",
    "Be accurate, concise, and practical.",
    context ? `Context: ${context}` : "",
  ].filter(Boolean).join(" ");

  const providers = provider === "auto" ? ["ollama", "gemini", "deepseek"] : [provider];
  let lastError = null;

  for (const candidate of providers) {
    try {
      if (candidate === "gemini") {
        const model = await withTimeout(loadGoogleModel(), "Gemini model load");
        const text = await withTimeout(invokeModel(model, message, systemMessage), "Gemini response");
        return { provider: "gemini", text };
      }

      if (candidate === "deepseek") {
        const model = await withTimeout(loadDeepSeekModel(), "DeepSeek model load");
        const text = await withTimeout(invokeModel(model, message, systemMessage), "DeepSeek response");
        return { provider: "deepseek", text };
      }

      if (candidate === "ollama") {
        const text = await withTimeout(invokeOllamaGenerate(message, systemMessage), "Ollama response");
        return { provider: "ollama", text };
      }
    } catch (error) {
      lastError = error;
    }
  }

  return {
    provider: "server-fallback",
    text: await buildKnowledgeFallbackReply(message),
    error: lastError ? lastError.message : undefined,
  };
}

async function generateQuestions({ provider = "ollama", topic, difficulty = "medium", count = 5, questionType = "mcq" }) {
  const prompt = [
    `Generate ${count} ${difficulty} level ${questionType.toUpperCase()} questions on the topic: "${topic}".`,
    "Return JSON only with this structure:",
    `[{\"question\": \"\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": \"A\", \"type\": \"${questionType}\"}]`,
    "Keep the output strict and machine-readable.",
  ].join("\n");

  const response = await chat({ provider, message: prompt });

  if (response.provider === "server-fallback") {
    return {
      provider: response.provider,
      text: buildFallbackQuestions({ topic, difficulty, count, questionType }),
    };
  }

  return { provider: response.provider, text: response.text };
}

async function getProviderStatus() {
  const status = {
    gemini: Boolean(env.geminiApiKey),
    deepseek: Boolean(env.deepseekApiKey),
    ollama: Boolean(env.ollamaBaseUrl),
  };

  return {
    status,
    ollamaApiKey: Boolean(env.ollamaApiKey),
    defaultProvider: status.ollama ? "ollama" : env.geminiApiKey ? "gemini" : env.deepseekApiKey ? "deepseek" : "ollama",
    ollamaBaseUrl: env.ollamaBaseUrl,
    ollamaModel: env.ollamaModel,
  };
}

module.exports = {
  chat,
  generateQuestions,
  getProviderStatus,
};
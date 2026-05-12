# AI Services Integration Pipeline Documentation

## Overview

The Nirmaan Educational Platform integrates multiple AI services to provide intelligent features including chatbot assistance, question generation, and smart recommendations. This document outlines the complete AI services architecture, integration patterns, and implementation details.

## AI Services Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Application                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Service Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Gemini Service (lib/gemini.ts)  │  DeepSeek Service (lib/deepseek.ts)│
│  Ollama Service (lib/ollama.ts)  │  AI Service Wrapper (lib/ai.ts)  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External AI APIs                              │
├─────────────────────────────────────────────────────────────────┤
│  Google Gemini API  │  DeepSeek API  │  Ollama API (Local/Remote)│
└─────────────────────────────────────────────────────────────────┘
```

## AI Services Overview

### 1. Google Gemini AI

**Purpose**: Admin chatbot and general AI assistance

**Use Cases**:
- Admin dashboard AI assistant
- General queries and support
- Content generation
- Smart recommendations

**API Key**: `AIzaSyDDr2itjEEBtoTNfTp6MsPubaNMiBQCNwc`

**Base URL**: `https://generativelanguage.googleapis.com`

**Model**: `gemini-pro`

### 2. DeepSeek AI

**Purpose**: Advanced AI responses and student recommendations

**Use Cases**:
- Student performance analysis
- Personalized learning recommendations
- Course suggestions
- Content optimization

**API Key**: `sk-778b92808c744fec91a7c1faebe9fff9`

**Base URL**: Custom API endpoint

**Model**: `deepseek-chat`

### 3. Ollama AI

**Purpose**: Teacher question generation

**Use Cases**:
- AI-powered test question generation
- Study material creation
- Question difficulty adjustment
- Multiple question types (MCQ, short answer, essay)

**API Key**: `45bd8d92e2ea44d285cba8c401d1638f.7XT5-K6BOIuW5rlCf0oDgVNA`

**Base URL**: `http://localhost:11434/api` (default local)

**Model**: `llama2` (configurable)

## Gemini Service Implementation

### Service Class

```typescript
// src/lib/gemini.ts

export interface GeminiMessage {
  role: "user" | "model";
  parts: {
    text: string;
  }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiService {
  private static apiKey: string | null = null;
  private static baseURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async chat(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not set");
    }

    const requestBody: GeminiMessage[] = [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ];

    try {
      const response = await fetch(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: requestBody,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("No response from Gemini API");
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  static async chatWithHistory(messages: GeminiMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not set");
    }

    try {
      const response = await fetch(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("No response from Gemini API");
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
}
```

### Admin Chatbot Integration

```typescript
// src/components/AdminChatbot.tsx

import { GeminiService } from "@/lib/gemini";
import { geminiApiKey } from "@/lib/constants";

export default function AdminChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([...]);
  const [provider, setProvider] = useState<"gemini" | "deepseek" | null>(null);

  useEffect(() => {
    // Auto-set Gemini API key
    if (geminiApiKey) {
      GeminiService.setApiKey(geminiApiKey);
      setProvider("gemini");
      setIsApiKeySet(true);
    }
  }, []);

  const handleSendMessage = async () => {
    try {
      const response = provider === "gemini"
        ? await GeminiService.chat(input.trim())
        : await DeepSeekService.askQuestion(input.trim());
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
}
```

## DeepSeek Service Implementation

### Service Class

```typescript
// src/lib/deepseek.ts

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

export class DeepSeekService {
  private static apiKey: string | null = null;
  private static baseURL = "https://api.deepseek.com/v1/chat/completions";

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }

  static async askQuestion(question: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("DeepSeek API key not set");
    }

    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: "You are a helpful AI assistant for the Nirmaan Educational Platform. Provide accurate and helpful responses about courses, careers, and educational content."
      },
      {
        role: "user",
        content: question
      }
    ];

    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error("No response from DeepSeek API");
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw error;
    }
  }

  static async chat(messages: DeepSeekMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("DeepSeek API key not set");
    }

    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error("No response from DeepSeek API");
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw error;
    }
  }

  static async generateRecommendations(
    studentProfile: {
      course: string;
      performance: number;
      interests: string[];
    }
  ): Promise<string> {
    const prompt = `Based on the following student profile, provide personalized learning recommendations:
    - Course: ${studentProfile.course}
    - Performance: ${studentProfile.performance}%
    - Interests: ${studentProfile.interests.join(", ")}
    
    Provide specific recommendations for improvement and next steps.`;

    return await this.askQuestion(prompt);
  }
}
```

## Ollama Service Implementation

### Service Class

```typescript
// src/lib/ollama.ts

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaService {
  private static apiKey: string | null = null;
  private static baseURL = "http://localhost:11434/api";

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }

  static async generateQuestions(
    topic: string,
    difficulty: "easy" | "medium" | "hard",
    count: number = 5,
    questionType: "mcq" | "short" | "essay" = "mcq"
  ): Promise<string> {
    const prompt = `Generate ${count} ${difficulty} level ${questionType.toUpperCase()} questions on the topic: "${topic}".

Requirements:
- Each question should be clear and concise
- For MCQ: Provide 4 options (A, B, C, D) with the correct answer marked
- For short answer: Provide questions that can be answered in 2-3 sentences
- For essay: Provide questions that require detailed responses
- Format the output as JSON array with structure: [{"question": "", "options": ["A", "B", "C", "D"], "correctAnswer": "X", "type": "${questionType}"}]
- Ensure questions are relevant to the topic and appropriate for ${difficulty} level`;

    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "Authorization": `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: "llama2",
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || "Could not generate questions.";
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      throw error;
    }
  }

  static async chat(
    messages: OllamaMessage[],
    model: string = "llama2"
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "Authorization": `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.message.content;
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      throw error;
    }
  }

  static async generateStudyMaterial(topic: string): Promise<string> {
    const prompt = `Generate comprehensive study material for the topic: "${topic}".

Include:
- Key concepts and definitions
- Important formulas or algorithms
- Practical examples
- Common pitfalls to avoid
- Practice exercises`;

    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "Authorization": `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: "llama2",
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || "Could not generate study material.";
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      throw error;
    }
  }
}
```

### Teacher Dashboard Integration

```typescript
// src/app/dashboard/teacher/page.tsx

import { OllamaService } from "@/lib/ollama";
import { ollamaApiKey } from "@/lib/constants";

export default function TeacherDashboard() {
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiQuestionType, setAiQuestionType] = useState<"mcq" | "short" | "essay">("mcq");
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    // Initialize Ollama service with API key
    if (ollamaApiKey) {
      OllamaService.setApiKey(ollamaApiKey);
    }
  }, []);

  const handleAiGenerateQuestions = async () => {
    if (!aiTopic.trim()) {
      showMessage("Please enter a topic for question generation", "error");
      return;
    }

    setIsAiGenerating(true);
    setAiGeneratedQuestions("");
    showMessage("Generating questions with AI...", "info");

    try {
      const questions = await OllamaService.generateQuestions(
        aiTopic,
        aiDifficulty,
        aiQuestionCount,
        aiQuestionType
      );
      setAiGeneratedQuestions(questions);
      showMessage("Questions generated successfully!", "success");
    } catch (error) {
      console.error("AI generation error:", error);
      showMessage("Failed to generate questions. Please check if Ollama is running.", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    // JSX with AI question generation UI
  );
}
```

## AI Service Configuration

### Constants Configuration

```typescript
// src/lib/constants.ts

export const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyAh4YUx8BJL4ea3jPB7KNRHJdau5MEMNos";
export const deepseekApiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "";
export const ollamaApiKey = process.env.NEXT_PUBLIC_OLLAMA_API_KEY || "45bd8d92e2ea44d285cba8c401d1638f.7XT5-K6BOIuW5rlCf0oDgVNA";
```

### Environment Variables

```env
# Frontend .env.local
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDDr2itjEEBtoTNfTp6MsPubaNMiBQCNwc
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-778b92808c744fec91a7c1faebe9fff9
NEXT_PUBLIC_OLLAMA_API_KEY=45bd8d92e2ea44d285cba8c401d1638f.7XT5-K6BOIuW5rlCf0oDgVNA

# Backend .env
GEMINI_API_KEY=AIzaSyDDr2itjEEBtoTNfTp6MsPubaNMiBQCNwc
DEEPSEEK_API_KEY=sk-778b92808c744fec91a7c1faebe9fff9
OLLAMA_API_KEY=45bd8d92e2ea44d285cba8c401d1638f.7XT5-K6BOIuW5rlCf0oDgVNA
```

## AI Service Usage Patterns

### 1. Admin Chatbot (Gemini)

```
Admin Dashboard
    ↓
AdminChatbot Component
    ↓
GeminiService.chat(prompt)
    ↓
Google Gemini API
    ↓
AI Response
    ↓
Display in Chat Interface
```

### 2. Student Recommendations (DeepSeek)

```
Student Profile Data
    ↓
DeepSeekService.generateRecommendations(profile)
    ↓
DeepSeek API
    ↓
Personalized Recommendations
    ↓
Display to Student
```

### 3. Teacher Question Generation (Ollama)

```
Teacher Dashboard
    ↓
Input: Topic, Difficulty, Count, Type
    ↓
OllamaService.generateQuestions(...)
    ↓
Ollama API
    ↓
Generated Questions (JSON)
    ↓
Display to Teacher
    ↓
Optionally Save to Test
```

## Error Handling

### Common Errors

**1. API Key Not Set**
```typescript
if (!this.apiKey) {
  throw new Error("API key not set");
}
```

**2. API Request Failed**
```typescript
if (!response.ok) {
  throw new Error(`API error: ${response.statusText}`);
}
```

**3. No Response from API**
```typescript
if (data.choices && data.choices.length > 0) {
  return data.choices[0].message.content;
}
throw new Error("No response from API");
```

**4. Ollama Not Running**
```typescript
catch (error) {
  showMessage("Failed to generate questions. Please check if Ollama is running.", "error");
}
```

### Fallback Mechanism

```typescript
const getAIResponse = async (prompt: string) => {
  try {
    // Try Gemini first
    return await GeminiService.chat(prompt);
  } catch (geminiError) {
    console.error("Gemini failed, trying DeepSeek:", geminiError);
    try {
      // Fallback to DeepSeek
      return await DeepSeekService.askQuestion(prompt);
    } catch (deepseekError) {
      console.error("DeepSeek failed:", deepseekError);
      // Final fallback: pre-defined responses
      return getFallbackResponse(prompt);
    }
  }
};
```

## Rate Limiting and Caching

### Rate Limiting

```typescript
class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static maxRequests = 60; // per minute
  private static windowMs = 60000; // 1 minute

  static async checkLimit(service: string): Promise<boolean> {
    const now = Date.now();
    const timestamps = this.requests.get(service) || [];
    
    // Remove old timestamps
    const recent = timestamps.filter(t => now - t < this.windowMs);
    
    if (recent.length >= this.maxRequests) {
      return false;
    }
    
    recent.push(now);
    this.requests.set(service, recent);
    return true;
  }
}

// Usage
if (await RateLimiter.checkLimit('gemini')) {
  const response = await GeminiService.chat(prompt);
} else {
  throw new Error("Rate limit exceeded");
}
```

### Response Caching

```typescript
class ResponseCache {
  private static cache: Map<string, { data: string; expiry: number }> = new Map();
  private static ttl = 300000; // 5 minutes

  static get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  static set(key: string, data: string): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }
}

// Usage
const cacheKey = `gemini:${prompt}`;
const cached = ResponseCache.get(cacheKey);
if (cached) {
  return cached;
}

const response = await GeminiService.chat(prompt);
ResponseCache.set(cacheKey, response);
return response;
```

## Ollama Setup Instructions

### Local Installation

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the llama2 model
ollama pull llama2

# Start Ollama server
ollama serve

# Test the API
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

### Docker Installation

```bash
# Run Ollama in Docker
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull model
docker exec -it ollama ollama pull llama2
```

### Configuration

```typescript
// Update Ollama base URL if running on different host/port
OllamaService.setBaseURL("http://your-ollama-server:11434/api");
OllamaService.setApiKey("your-api-key");
```

## Monitoring and Analytics

### AI Service Metrics

```typescript
class AIMetrics {
  private static metrics: Map<string, {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  }> = new Map();

  static recordRequest(service: string, success: boolean, responseTime: number) {
    const metrics = this.metrics.get(service) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Update average response time
    metrics.averageResponseTime = (
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) /
      metrics.totalRequests
    );

    this.metrics.set(service, metrics);
  }

  static getMetrics(service: string) {
    return this.metrics.get(service);
  }
}

// Usage
const startTime = Date.now();
try {
  const response = await GeminiService.chat(prompt);
  const responseTime = Date.now() - startTime;
  AIMetrics.recordRequest('gemini', true, responseTime);
  return response;
} catch (error) {
  const responseTime = Date.now() - startTime;
  AIMetrics.recordRequest('gemini', false, responseTime);
  throw error;
}
```

## Security Considerations

### 1. API Key Security
- Store API keys in environment variables
- Never commit API keys to version control
- Use .env.example for documentation
- Rotate API keys periodically

### 2. Input Validation
- Sanitize user inputs before sending to AI
- Limit input length to prevent abuse
- Validate topic/question formats
- Filter out malicious content

### 3. Response Filtering
- Filter inappropriate content from AI responses
- Validate JSON structure before parsing
- Handle malformed responses gracefully
- Implement content moderation

### 4. Access Control
- Restrict AI service access by user role
- Implement rate limiting per user
- Log all AI service calls
- Monitor for unusual patterns

## Future Enhancements

### 1. Additional AI Services
- OpenAI GPT-4 integration
- Claude AI integration
- Hugging Face models
- Custom fine-tuned models

### 2. Advanced Features
- Multi-turn conversations
- Context awareness
- Personalized AI responses
- Voice interaction

### 3. AI Model Training
- Custom model training on course data
- Fine-tuning for domain-specific responses
- Continuous learning from user feedback

### 4. Analytics Dashboard
- AI service usage statistics
- Response quality metrics
- Cost tracking
- Performance monitoring

## Summary

The AI services integration for Nirmaan Educational Platform provides intelligent features through multiple AI providers. The architecture is designed to be flexible, allowing easy addition of new AI services and fallback mechanisms. The system includes comprehensive error handling, rate limiting, caching, and security measures to ensure reliable and secure AI operations. The integration supports various use cases including admin assistance, student recommendations, and teacher question generation.

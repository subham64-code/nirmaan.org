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
  private static baseURL = "http://localhost:11434/api"; // Default Ollama local URL

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
          model: "llama2", // Default model, can be configured
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

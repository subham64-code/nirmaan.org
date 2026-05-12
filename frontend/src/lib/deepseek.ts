export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekService {
  private static apiKey: string | null = null;
  private static baseURL = "https://api.deepseek.com/v1";

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async chat(
    messages: DeepSeekMessage[],
    model: string = "deepseek-chat"
  ): Promise<DeepSeekResponse> {
    if (!this.apiKey) {
      throw new Error("DeepSeek API key not set. Please set the API key first.");
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw error;
    }
  }

  static async askQuestion(
    question: string,
    context?: string
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `You are an AI assistant for the Nirmaan educational platform. 
        You help students and administrators with questions related to AI training, 
        course content, assessments, and administrative tasks. 
        Be helpful, accurate, and provide detailed responses.
        ${context ? `Context: ${context}` : ""}`
      },
      {
        role: "user",
        content: question
      }
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
  }

  static async analyzeSyllabus(syllabusContent: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: "You are an educational AI expert. Analyze the provided syllabus and extract key information including course structure, topics, duration, and learning objectives."
      },
      {
        role: "user",
        content: `Please analyze this syllabus and provide a structured summary:\n\n${syllabusContent}`
      }
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content || "Could not analyze syllabus.";
  }
}

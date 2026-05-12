export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export class GeminiService {
  private static apiKey: string | null = null;
  private static baseURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async chat(question: string, context?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not set. Please set the API key first.");
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI assistant for the Nirmaan educational platform. Help with courses, students, assessments, and administrative tasks. Be helpful, accurate, and detailed.${context ? `\n\nContext: ${context}` : ""}\n\nQuestion: ${question}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "Sorry, I couldn't process your request.";
  }
}
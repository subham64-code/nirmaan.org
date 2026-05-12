const axios = require("axios");
const env = require("../config/env");

async function getAiRecommendation(studentData) {
  if (!env.deepseekApiKey) {
    return "Based on your performance, focus on fundamentals and practice daily.";
  }

  try {
    // Determine the prompt based on whether this is a custom question or a recommendation
    let prompt;
    if (studentData.customPrompt) {
      prompt = studentData.customPrompt;
    } else {
      prompt = `Given a student with attendance ${studentData.attendance}%, average test score ${studentData.avgScore}/100, and course ${studentData.course}, give one short personalized learning recommendation (1-2 sentences).`;
    }

    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: studentData.customPrompt ? 500 : 100,
      },
      {
        headers: {
          Authorization: `Bearer ${env.deepseekApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data?.choices?.[0]?.message?.content || "Keep up your momentum!";
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DeepSeek error:", error.message);
    return "Focus on consistent practice and attendance.";
  }
}

module.exports = { getAiRecommendation };

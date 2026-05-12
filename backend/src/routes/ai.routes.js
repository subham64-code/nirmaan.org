const express = require("express");
const { ok, fail } = require("../utils/apiResponse");
const { chat, generateQuestions, getProviderStatus } = require("../services/ai.service");

const router = express.Router();

router.get("/providers", async (_, res) => {
  try {
    const data = await getProviderStatus();
    return ok(res, data, "AI provider status");
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.post("/chat", async (req, res) => {
  const { message, provider = "auto", context = "" } = req.body || {};

  if (!message || !String(message).trim()) {
    return fail(res, 400, "Message is required");
  }

  try {
    const data = await chat({
      provider,
      message: String(message).trim(),
      context: String(context || "").trim(),
    });

    return ok(res, data, "AI response generated");
  } catch (error) {
    return fail(res, 500, error.message || "Failed to generate AI response");
  }
});

router.post("/generate-questions", async (req, res) => {
  const { topic, difficulty = "medium", count = 5, questionType = "mcq", provider = "ollama" } = req.body || {};

  if (!topic || !String(topic).trim()) {
    return fail(res, 400, "Topic is required");
  }

  try {
    const data = await generateQuestions({
      provider,
      topic: String(topic).trim(),
      difficulty,
      count: Number(count) || 5,
      questionType,
    });

    return ok(res, data, "Questions generated successfully");
  } catch (error) {
    return fail(res, 500, error.message || "Failed to generate questions");
  }
});

module.exports = router;
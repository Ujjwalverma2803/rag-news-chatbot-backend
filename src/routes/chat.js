const express = require("express");
const router = express.Router();
const { searchQdrant } = require("../services/qdrant");
const { callGemini } = require("../services/gemini");
const redisClient = require("../services/redisClient");
const { v4: uuidv4 } = require("uuid");

// Create new session
router.post("/session", async (req, res) => {
  const sessionId = uuidv4();
  await redisClient.set(sessionId, JSON.stringify([]), { EX: 3600 * 24 }); // TTL 24h
  res.json({ sessionId });
});

// Chat endpoint (RAG)
router.post("/chat", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "sessionId & message required" });
  }

  try {
    // 1) retrieve top-k passages from Qdrant
    const passages = await searchQdrant(message, 5); // array of {payload:{title,text,url}, score}

    // 2) construct prompt/context for Gemini
    const context = passages
      .map(
        (p, i) =>
          `[${i + 1}] ${p.payload.title}\n${p.payload.text.slice(
            0,
            1000
          )}\nURL:${p.payload.url}`
      )
      .join("\n\n");

    const prompt = `You are an assistant answering user queries about news. Use only the context below to answer. If answer is not in context, say "I don't know."\n\nContext:\n${context}\n\nUser: ${message}\nAnswer:`;

    // 3) call Gemini
    const answer = await callGemini(prompt);

    // 4) save into Redis session history
    const histRaw = await redisClient.get(sessionId);
    const history = histRaw ? JSON.parse(histRaw) : [];
    history.push({ role: "user", text: message, ts: Date.now() });
    history.push({ role: "assistant", text: answer, ts: Date.now() });
    await redisClient.set(sessionId, JSON.stringify(history), {
      EX: 3600 * 24,
    });

    res.json({ answer, passages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// fetch session history
router.get("/session/:id/history", async (req, res) => {
  const histRaw = await redisClient.get(req.params.id);
  res.json({ history: histRaw ? JSON.parse(histRaw) : [] });
});

// reset session
router.post("/session/:id/reset", async (req, res) => {
  await redisClient.set(req.params.id, JSON.stringify([]), { EX: 3600 * 24 });
  res.json({ ok: true });
});

module.exports = router;

const axios = require("axios");

async function callGemini(prompt) {
  const API_KEY = process.env.GEMINI_API_KEY;

  // 1. Updated URL to use the 'gemini-pro' model and include the API key as a query parameter.
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  // 2. Updated request body to use the 'contents' and 'parts' structure.
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    // The maxOutputTokens parameter is now under 'generationConfig'.
    generationConfig: {
      maxOutputTokens: 512,
    },
  };

  try {
    const resp = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 3. Updated response parsing to match the Gemini API's response structure.
    return (
      resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(resp.data)
    );
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { callGemini };

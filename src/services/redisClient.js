// src/services/redisClient.js
const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// create redis client
const client = createClient({ url: REDIS_URL });

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// connect right away
(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to Redis");
  } catch (e) {
    console.error("❌ Failed to connect to Redis:", e.message || e);
  }
})();

module.exports = client;

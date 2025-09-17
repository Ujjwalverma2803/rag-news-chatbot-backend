const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});

const COLLECTION = process.env.COLLECTION_NAME || "news_articles";

async function searchQdrant(query, topK = 5) {
  // 1️⃣ Get embedding from Python microservice
  const res = await fetch(`${process.env.EMBED_SERVICE}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: query }),
  });
  const emb = await res.json();
  if (!emb.vector) throw new Error("No vector returned from embedding service");

  // 2️⃣ Ensure collection exists with correct vector size
  const collections = await client.getCollections();
  if (!collections.collections.some((c) => c.name === COLLECTION)) {
    console.log(`Creating collection "${COLLECTION}"...`);
    await client.createCollection({
      collection_name: COLLECTION,
      vectors: { size: 384, distance: "Cosine" },
    });
  }

  // 3️⃣ Search Qdrant
const results = await client.search(COLLECTION, {
  vector: emb.vector,
  limit: topK,
  with_payload: true,
});

  return results;
}

module.exports = { client, searchQdrant };

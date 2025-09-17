RAG-Powered News Chatbot - Backend
Overview

This is the backend for a RAG (Retrieval-Augmented Generation) powered chatbot over news articles.
It handles:

Embedding user queries

Retrieving top news passages from Qdrant

Communicating with Google Gemini API for final responses

Managing chat sessions with Redis

Tech Stack

Backend: Node.js + Express

Embeddings: Python microservice using SentenceTransformers (all-MiniLM-L6-v2)

Vector Database: Qdrant

LLM API: Google Gemini API

Session & Cache: Redis

Containerization: Docker & Docker Compose

Prerequisites

Docker & Docker Compose installed

Node.js >= 18.x

Python >= 3.11 (for local embed service, optional if using Docker)

NPM >= 9.x

Getting Started (Local)

Clone the repository:

git clone https://github.com/Ujjwalverma2803/rag-news-chatbot-backend.git
cd rag-news-chatbot-backend


Create a .env file in the project root with the following content:

# Server
PORT=4000

# Gemini API
GEMINI_API_KEY=AIzaSyCJxRmkeNRMyJtSiSrakiYSoFsTYJQQRJY

# Qdrant
QDRANT_URL=http://qdrant:6333
COLLECTION_NAME=news_articles

# Redis
REDIS_URL=redis://redis:6379

# Embedding service
EMBED_SERVICE=http://embed-service:5001



Run the backend using Docker Compose:

docker-compose up --build


Health check:

curl http://localhost:4000/health
# Should return: {"ok": true}

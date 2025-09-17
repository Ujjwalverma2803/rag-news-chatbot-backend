import feedparser
from newspaper import Article
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
import time
import uuid

# RSS feeds
FEEDS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
]

# Load embedding model
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')  # 384d

# Connect to Qdrant
print("Connecting to Qdrant...")
qclient = QdrantClient(url="http://qdrant:6333")
COLLECTION = "news_articles"

try:
    qclient.get_collection(COLLECTION)
    print(f"Deleting existing collection '{COLLECTION}'...")
    qclient.delete_collection(COLLECTION)
except UnexpectedResponse:
    print(f"Collection '{COLLECTION}' does not exist. Creating new one...")

print(f"Creating collection '{COLLECTION}'...")
qclient.create_collection(
    collection_name=COLLECTION,
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

# Ingest articles
docs = []
count = 0
MAX_ARTICLES = 50

for feed in FEEDS:
    print(f"Parsing feed: {feed}")
    d = feedparser.parse(feed)
    print(f"Found {len(d.entries)} entries")

    for entry in d.entries:
        if count >= MAX_ARTICLES:
            break
        url = entry.get("link")
        try:
            art = Article(url)
            art.download()
            art.parse()
            text = art.text
            title = art.title or entry.get("title", "")

            if len(text.split()) < 100:  # skip very short articles
                continue

            emb = model.encode(text)
            point = models.PointStruct(
                id=str(uuid.uuid4()),
                vector=emb.tolist(),
                payload={"title": title, "url": url, "text": text[:2000]}
            )
            docs.append(point)
            count += 1
            time.sleep(0.2)  # avoid hammering server
        except Exception as e:
            print("Skipping:", url, e)

    if count >= MAX_ARTICLES:
        break

# Upsert points into Qdrant
if docs:
    qclient.upsert(collection_name=COLLECTION, points=docs, wait=True)
    print(f"✅ Indexed {len(docs)} articles successfully!")
else:
    print("No articles to index.")

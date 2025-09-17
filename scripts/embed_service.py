from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")  # same model used for ingest

@app.route("/embed", methods=["POST"])
def embed():
    data = request.json
    text = data.get("text", "")
    vector = model.encode(text).tolist()
    return jsonify({"vector": vector})

if __name__ == "__main__":
    # Bind to 0.0.0.0 so other Docker containers can reach this service
    app.run(host="0.0.0.0", port=5001, debug=False)

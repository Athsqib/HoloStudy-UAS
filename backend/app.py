import os
import tempfile

from flask import Flask, request, jsonify
from flask_cors import CORS

from gabungan import read_file, generate_flashcards

app = Flask(__name__)
CORS(app)


@app.route("/generate", methods=["POST"])
def generate():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    limit = request.form.get("limit", 10, type=int)

    suffix = os.path.splitext(file.filename)[1].lower()
    allowed = {".pdf", ".docx", ".txt"}
    if suffix not in allowed:
        return jsonify({"error": f"Unsupported file type: {suffix}. Use PDF, DOCX, or TXT."}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        text = read_file(tmp_path)
        if not text.strip():
            return jsonify({"error": "Could not extract text from the file"}), 400

        flashcards = generate_flashcards(text, limit=limit)

        return jsonify({
            "success": True,
            "filename": file.filename,
            "flashcards": flashcards,
        })
    finally:
        os.unlink(tmp_path)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

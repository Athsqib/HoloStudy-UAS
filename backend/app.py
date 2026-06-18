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

        try:
            flashcards = generate_flashcards(text, limit=limit)
        except Exception as e:
            return jsonify({"error": f"Generation failed: {str(e)}"}), 500

        return jsonify({
            "success": True,
            "filename": file.filename,
            "flashcards": flashcards,
        })
    finally:
        os.unlink(tmp_path)

@app.route("/generate-text", methods=["POST"])
def generate_text():
    data = request.get_json(silent=True)
    if not data or not data.get("text"):
        return jsonify({"error": "No text provided"}), 400

    text = data["text"].strip()
    if len(text) < 10:
        return jsonify({"error": "Text is too short (min 10 characters)"}), 400

    limit = data.get("limit", 10)
    try:
        flashcards = generate_flashcards(text, limit=limit)
    except Exception as e:
        return jsonify({"error": f"Generation failed: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "flashcards": flashcards,
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

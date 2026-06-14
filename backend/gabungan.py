import os
import re
from rake_nltk import Rake
from spacy.lang.id import Indonesian
import nltk
from pypdf import PdfReader

nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)

try:
    rake = Rake(language="indonesian")
except Exception:
    rake = Rake()

nlp = Indonesian()
nlp.add_pipe("sentencizer")


def read_file(file_path: str) -> str:
    extension = os.path.splitext(file_path)[1].lower()
    text = ""

    if extension == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

    elif extension == ".pdf":
        with open(file_path, "rb") as f:
            pdf_reader = PdfReader(f)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "

    elif extension == ".docx":
        from docx import Document
        doc = Document(file_path)
        text = "\n".join(p.text for p in doc.paragraphs)

    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def generate_flashcards(text: str, limit: int = 10) -> list[dict]:
    if not text or len(text.strip()) < 10:
        return []

    rake.extract_keywords_from_text(text)
    keywords = rake.get_ranked_phrases()[:15]

    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents if len(sent.text) > 10]

    flashcards = []
    seen_front = set()

    for kw in keywords:
        for sent in sentences:
            if kw.lower() in sent.lower() and kw.lower() not in seen_front:
                flashcards.append({
                    "front": kw.title(),
                    "back": sent,
                })
                seen_front.add(kw.lower())
                break
        if len(flashcards) >= limit:
            break

    return flashcards

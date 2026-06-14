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

ID_FILLERS = {
    "selain itu", "oleh karena itu", "dengan demikian",
    "oleh sebab itu", "maka dari itu", "di samping itu",
    "dalam hal ini", "pada dasarnya", "sementara itu",
    "kemudian", "selanjutnya", "bagaimanapun", "dengan kata lain",
    "artinya", "maksudnya", "berikut ini", "adapun",
}


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
                    text += page_text + "\n"

    elif extension == ".docx":
        from docx import Document
        doc = Document(file_path)
        text = "\n".join(p.text for p in doc.paragraphs)

    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\b\w\b", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_quality_sentence(s: str) -> bool:
    s = s.strip()
    if len(s) < 40 or len(s) > 350:
        return False
    if not s[-1] in ".!?":
        return False
    alpha = sum(c.isalpha() for c in s) / max(len(s), 1)
    if alpha < 0.4:
        return False
    lower = s.lower()
    if any(lower.startswith(f) for f in ID_FILLERS):
        return False
    if re.search(r"(?:^|\s)(?:gambar|tabel|bab|subbab)\s+\d", lower):
        return False
    return True


def tokenize_words(text: str) -> set:
    return set(re.findall(r"\b[a-z]{3,}\b", text.lower()))


def textrank_scores(sentences: list[str], damping: float = 0.85, max_iter: int = 100, tol: float = 1e-4) -> list[float]:
    n = len(sentences)
    if n == 0:
        return []
    if n == 1:
        return [1.0]

    tokens = [tokenize_words(s) for s in sentences]

    sim = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            if not tokens[i] or not tokens[j]:
                s = 0.0
            else:
                inter = len(tokens[i] & tokens[j])
                union = len(tokens[i] | tokens[j])
                s = inter / max(union, 1)
            sim[i][j] = s
            sim[j][i] = s

    trans = [[0.0] * n for _ in range(n)]
    for i in range(n):
        row = sum(sim[i])
        if row > 0:
            for j in range(n):
                trans[i][j] = sim[i][j] / row

    scores = [1.0 / n] * n
    for _ in range(max_iter):
        prev = scores[:]
        for i in range(n):
            rank = sum(trans[j][i] * prev[j] for j in range(n))
            scores[i] = (1 - damping) + damping * rank
        if sum(abs(scores[i] - prev[i]) for i in range(n)) < tol:
            break

    return scores


def parse_structured_flashcards(text: str) -> list[dict] | None:
    pattern = re.compile(
        r"(?:Flashcard|Card)\s+\d+\s*:\s*(.*?)"
        r"(?:Front\s*\(\s*Pertanyaan\s*\)|Front|Pertanyaan)\s*:\s*(.*?)"
        r"(?:Back\s*\(\s*Jawaban\s*\)|Back|Jawaban)\s*:\s*(.*?)?"
        r"(?=(?:Flashcard|Card)\s+\d+\s*:|\Z)",
        re.DOTALL | re.IGNORECASE,
    )

    matches = pattern.findall(text)
    if not matches:
        return None

    cards = []
    seen = set()
    for topic, front, back in matches:
        front = front.strip() if front else ""
        back = back.strip() if back else ""
        if not front or not back:
            continue
        key = front.lower()
        if key in seen:
            continue
        seen.add(key)
        cards.append({"front": front, "back": back})

    return cards if cards else None


DEF_MARKERS = r"adalah|merupakan|yakni|yaitu|is|are"


def extract_definition(sentence: str, keyword: str) -> tuple[str, str] | None:
    kw = re.escape(keyword.lower())
    markers = DEF_MARKERS

    m = re.search(
        r"\b" + kw + r"\s+(" + markers + r")\s+(.+)",
        sentence, re.IGNORECASE,
    )
    if m:
        definition = m.group(2).strip().rstrip(".;,!?")
        if len(definition) >= 10:
            label = m.group(1).lower()
            title = keyword.strip().title()
            front = f"What is {title}?" if label in ("is", "are") else f"Apa itu {title}?"
            return front, definition

    m = re.search(
        r"(\w[\w\s]*?)\s+(" + markers + r")\s+" + kw + r"\b(.+)?",
        sentence, re.IGNORECASE,
    )
    if m:
        subject = m.group(1).strip()
        rest = (m.group(3) or "").strip().rstrip(".;,!?")
        label = m.group(2).lower()
        definition = f"{keyword.strip().title()} {rest}".strip()
        if len(definition) >= 10 and len(subject) >= 3:
            title = subject.title()
            front = f"What is {title}?" if label in ("is", "are") else f"Apa itu {title}?"
            return front, definition

    m = re.search(
        r"(\w[\w\s]{2,60}?)\s+(" + markers + r")\s+(.+)",
        sentence, re.IGNORECASE,
    )
    if m:
        subject = m.group(1).strip()
        rest = m.group(3).strip().rstrip(".;,!?")
        if len(subject) >= 3 and len(rest) >= 10 and keyword.lower() in rest.lower():
            title = subject.title()
            label = m.group(2).lower()
            front = f"What is {title}?" if label in ("is", "are") else f"Apa itu {title}?"
            return front, rest
    return None


def _rake_textrank_generate(text: str, limit: int) -> list[dict]:
    text = clean_text(text)

    doc = nlp(text)
    raw = [sent.text.strip() for sent in doc.sents]
    sentences = [s for s in raw if is_quality_sentence(s)]

    if not sentences:
        return []

    tr_scores = textrank_scores(sentences)
    scored = list(zip(sentences, tr_scores))

    rake.extract_keywords_from_text(text)
    keywords = rake.get_ranked_phrases()[:20]

    flashcards = []
    seen_front = set()
    seen_prefixes = set()

    def extract_noun_phrase(phrase: str) -> str:
        words = phrase.split()
        return words[0] if len(words) > 4 else phrase

    def trim_overlap(front: str, back: str) -> str:
        front_words = front.lower().split()
        back_lower = back.lower()
        overlap_len = 0
        for i in range(len(front_words), 0, -1):
            prefix = " ".join(front_words[:i])
            if back_lower.startswith(prefix):
                overlap_len = len(prefix)
                break
        if overlap_len > 0:
            trimmed = back[overlap_len:].strip().lstrip(",;:.!? ")
            return trimmed if len(trimmed) >= 10 else back
        return back

    for kw in keywords:
        if len(flashcards) >= limit:
            break

        kw_lower = kw.lower()
        if kw_lower in seen_front:
            continue

        candidates = [
            (s, sc) for s, sc in scored if kw_lower in s.lower()
        ]
        if not candidates:
            continue

        candidates.sort(key=lambda x: x[1], reverse=True)

        best = None
        used_prefix = None
        for sent, _ in candidates:
            prefix = sent[:50].lower()
            if prefix not in seen_prefixes:
                best = sent
                used_prefix = prefix
                break

        if best is None:
            continue

        defn = extract_definition(best, kw)
        if defn:
            front, back = defn
        else:
            trimmed_kw = extract_noun_phrase(kw.strip())
            front = trimmed_kw.title()
            back = trim_overlap(front, best)

        flashcards.append({"front": front, "back": back})
        seen_front.add(kw_lower)
        if used_prefix:
            seen_prefixes.add(used_prefix)

    return flashcards


def parse_qa_flashcards(text: str) -> list[dict] | None:
    pattern = re.compile(
        r"(?:Q\d*|Pertanyaan\s*\d*)\s*:\s*(.*?)"
        r"(?:A\d*|Jawaban)\s*:\s*(.*?)"
        r"(?=(?:Q\d*|Pertanyaan\s*\d*)\s*:|\Z)",
        re.DOTALL | re.IGNORECASE,
    )

    matches = pattern.findall(text)
    if not matches:
        return None

    cards = []
    seen = set()
    for front, back in matches:
        front = front.strip()
        back = back.strip()
        if not front or not back:
            continue
        key = front.lower()[:60]
        if key in seen:
            continue
        seen.add(key)
        cards.append({"front": front, "back": back})

    return cards if cards else None


def generate_flashcards(text: str, limit: int = 10) -> list[dict]:
    if not text or len(text.strip()) < 10:
        return []

    structured = parse_structured_flashcards(text)
    if structured:
        return structured[:limit]

    qa = parse_qa_flashcards(text)
    if qa:
        return qa[:limit]

    return _rake_textrank_generate(text, limit)

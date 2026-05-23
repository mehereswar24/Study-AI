from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from groq import Groq
from pypdf import PdfReader
from pathlib import Path
import os, json, uuid, shutil
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StudyAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ───────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set. Add it to your .env file.")

client = Groq(api_key=GROQ_API_KEY)
MODEL  = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

BASE         = Path(__file__).parent
UPLOAD_DIR   = BASE / "uploads"
HISTORY_FILE = BASE / "history.json"
BUILD_DIR    = BASE / "frontend" / "build"
UPLOAD_DIR.mkdir(exist_ok=True)

# ── Cleanup Helper ──────────────────────────────────────────────────────────
def cleanup_old_uploads():
    """Removes PDF files older than 24 hours to save disk space."""
    now = datetime.now()
    for f in UPLOAD_DIR.glob("*.pdf"):
        if f.is_file():
            mtime = datetime.fromtimestamp(f.stat().st_mtime)
            if now - mtime > timedelta(hours=24):
                try:
                    f.unlink()
                except Exception:
                    pass

@app.on_event("startup")
async def startup_event():
    cleanup_old_uploads()

# ── PDF text extractor ───────────────────────────────────────────────────────
def extract_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    # Groq context limit ~6000 words to be safe
    words = text.split()
    if len(words) > 6000:
        text = " ".join(words[:6000]) + "\n\n[Document truncated for processing...]"
    return text.strip()

# ── History Helpers (JSON file) ──────────────────────────────────────────────
def load_history() -> list:
    if HISTORY_FILE.exists():
        try:
            return json.loads(HISTORY_FILE.read_text())
        except Exception:
            return []
    return []

def save_history(history: list):
    HISTORY_FILE.write_text(json.dumps(history, indent=2))

def add_to_history(entry: dict):
    history = load_history()
    history.insert(0, entry)
    # Keep only last 50 entries
    history = history[:50]
    save_history(history)

# ── Prompts ──────────────────────────────────────────────────────────────────
def make_prompt(mode: str, text: str, detail: str = "standard", flashcard_count: int = 15, quiz_count: int = 10) -> str:
    base = f"Here is the text extracted from a PDF document:\n\n{text}\n\n"

    if detail == "in-depth":
        detail_instruction = "extremely comprehensive, detailed notes covering every nuance, minor point, and extended explanations for this section (at least 6-8 detailed sentences or a well-developed paragraph)"
    elif detail == "brief":
        detail_instruction = "short, concise, high-level summary notes for this section in 1-2 sentences"
    else:
        detail_instruction = "standard balanced notes for this section in 3-5 sentences"

    if mode == "notes":
        return base + f"""Based on this document, generate {detail} structured study notes.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{{
  "subject": "detected subject/topic",
  "title": "document title or main topic",
  "summary": "2-3 sentence overview of the document",
  "sections": [
    {{
      "heading": "section name",
      "content": "{detail_instruction}",
      "key_terms": ["term1", "term2", "term3"]
    }}
  ],
  "key_takeaways": ["important point 1", "important point 2", "important point 3", "important point 4", "important point 5"]
}}"""

    elif mode == "flashcards":
        return base + f"""Based on this document, create comprehensive flashcards for studying.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{{
  "subject": "detected subject/topic",
  "title": "document title or main topic",
  "summary": "2-3 sentence overview",
  "flashcards": [
    {{
      "front": "question or term",
      "back": "answer or definition",
      "difficulty": "easy"
    }}
  ]
}}

Create exactly {flashcard_count} flashcards. Use "easy", "medium", or "hard" for difficulty."""

    elif mode == "quiz":
        return base + f"""Based on this document, create a multiple choice quiz.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{{
  "subject": "detected subject/topic",
  "title": "document title or main topic",
  "summary": "2-3 sentence overview",
  "questions": [
    {{
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "answer": "A",
      "explanation": "why this answer is correct"
    }}
  ]
}}

Create exactly {quiz_count} questions mixing easy, medium, and hard difficulty."""

    elif mode == "mindmap":
        return base + """Based on this document, create a mind map structure.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "subject": "detected subject/topic",
  "title": "document title or main topic",
  "summary": "2-3 sentence overview",
  "central_topic": "main topic of the document",
  "branches": [
    {
      "name": "main branch topic",
      "color": "#c8a96e",
      "subtopics": [
        {
          "name": "subtopic name",
          "details": ["detail point 1", "detail point 2"]
        }
      ]
    }
  ]
}

Create 4-6 branches with 2-3 subtopics each. Use different hex colors for each branch."""

    return base

# ── Helper: parse JSON from AI ────────────────────────────────────────────────
def clean_json(text: str) -> dict:
    text = text.strip()
    # Strip markdown fences if present
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    # Find the JSON object
    start = text.find("{")
    end   = text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]
    return json.loads(text)

# ── Request models ────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: list = []

class ExplainRequest(BaseModel):
    session_id: str
    selected_text: str

class ReloadRequest(BaseModel):
    session_id: str
    mode: str = "notes"
    detail: str = "standard"
    flashcard_count: int = 15
    quiz_count: int = 10

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def serve_index():
    return FileResponse(BUILD_DIR / "index.html")

# Serve static assets (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory=BUILD_DIR / "static"), name="static")

# Catch-all for other React files (manifest, etc.) or client-side routing
@app.get("/{file_path:path}")
async def serve_static_files(file_path: str):
    file = BUILD_DIR / file_path
    if file.exists() and file.is_file():
        return FileResponse(file)
    return FileResponse(BUILD_DIR / "index.html")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...), 
    mode: str = "notes", 
    detail: str = "standard", 
    flashcard_count: int = 15, 
    quiz_count: int = 10
):
    cleanup_old_uploads()
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    session_id = str(uuid.uuid4())
    pdf_path   = UPLOAD_DIR / f"{session_id}.pdf"

    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Extract text from PDF
        pdf_text = extract_pdf_text(pdf_path)
        if not pdf_text:
            raise HTTPException(400, "Could not extract text from PDF. The file may be scanned or image-based.")

        # Build prompt and call Groq
        prompt = make_prompt(mode, pdf_text, detail, flashcard_count, quiz_count)
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert study assistant. Always respond with valid JSON only, no explanation or markdown."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4000,
        )
        raw  = response.choices[0].message.content
        data = clean_json(raw)

    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid response. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Processing error: {str(e)}")

    result = {
        "session_id": session_id,
        "mode":       mode,
        "filename":   file.filename,
        "created_at": datetime.now().isoformat(),
        **data
    }

    add_to_history({
        "session_id": session_id,
        "filename":   file.filename,
        "mode":       mode,
        "subject":    data.get("subject", "Unknown"),
        "title":      data.get("title", file.filename),
        "created_at": datetime.now().isoformat()
    })

    return JSONResponse(result)


@app.post("/api/chat")
async def chat_with_pdf(req: ChatRequest):
    pdf_path = UPLOAD_DIR / f"{req.session_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(404, "Session not found. Please re-upload your PDF.")

    try:
        pdf_text = extract_pdf_text(pdf_path)
        messages = [
            {"role": "system", "content": f"You are a helpful study assistant. Answer questions based on this document:\n\n{pdf_text[:4000]}\n\nBe clear and concise."}
        ]
        # Add conversation history
        for msg in req.history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.5,
            max_tokens=1000,
        )
        return {"reply": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(500, f"Chat error: {str(e)}")


@app.post("/api/explain")
async def explain_text(req: ExplainRequest):
    pdf_path = UPLOAD_DIR / f"{req.session_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(404, "Session not found.")

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a study assistant. Explain concepts clearly and simply."},
                {"role": "user",   "content": f"""The user selected this text from a study document:

"{req.selected_text}"

Please:
1. Explain this concept in simple, clear terms
2. Give a real-world example if helpful
3. Keep it concise (3-5 sentences max)"""}
            ],
            temperature=0.4,
            max_tokens=400,
        )
        return {"explanation": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(500, f"Explanation error: {str(e)}")


@app.get("/api/history")
async def get_history():
    return load_history()


@app.delete("/api/history/{session_id}")
async def delete_history_item(session_id: str):
    history = load_history()
    history = [h for h in history if h["session_id"] != session_id]
    save_history(history)
    pdf_path = UPLOAD_DIR / f"{session_id}.pdf"
    if pdf_path.exists():
        pdf_path.unlink()
    return {"ok": True}

@app.post("/api/reload")
async def reload_session(req: ReloadRequest):
    pdf_path = UPLOAD_DIR / f"{req.session_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(404, "PDF no longer available. Please re-upload.")
    try:
        pdf_text = extract_pdf_text(pdf_path)
        prompt = make_prompt(req.mode, pdf_text, req.detail, req.flashcard_count, req.quiz_count)
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert study assistant. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4000,
        )
        data = clean_json(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(500, f"Reload error: {str(e)}")

    history = load_history()
    item = next((h for h in history if h["session_id"] == req.session_id), {})
    return JSONResponse({
        "session_id": req.session_id,
        "mode": req.mode,
        "filename": item.get("filename", "document.pdf"),
        "created_at": item.get("created_at", datetime.now().isoformat()),
        **data
    })
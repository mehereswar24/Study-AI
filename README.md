# 🎓 Study-AI

**Study-AI** is an AI-powered study assistant that lets you upload a PDF document and have an intelligent conversation with it. Powered by **Groq's blazing-fast LLaMA inference** and a clean, self-contained web UI — it's your personal tutor for any document.

---

## ✨ Features

- **📄 PDF Upload & Parsing**: Upload any PDF and the app extracts and indexes its full text automatically.
- **💬 Contextual Chat**: Ask questions about your document and get accurate, context-aware answers powered by LLaMA 3.3 70B.
- **📚 Session History**: Previous conversations are persisted across sessions via a local `history.json` file.
- **🧹 Auto-Cleanup**: Uploaded PDFs older than 24 hours are automatically purged to save disk space.
- **🚀 Fast Inference**: Powered by [Groq](https://groq.com/) — one of the fastest LLM inference APIs available.
- **🐳 Docker Ready**: Includes a `Dockerfile` for one-command containerized deployment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, FastAPI |
| **LLM** | Groq API (LLaMA 3.3 70B Versatile) |
| **PDF Parsing** | pypdf |
| **Frontend** | Vanilla HTML/CSS/JS (served as static files) |
| **Containerization** | Docker |

---

## 🚀 Quickstart

### 1. Get a Groq API Key

Sign up at [console.groq.com](https://console.groq.com) and grab a free API key.

### 2. Set Up the Project

```bash
# Clone the repo
git clone https://github.com/mehereswar24/Study-AI.git
cd Study-AI

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
# Add your GROQ_API_KEY to the .env file
```

### 3. Run the App

```bash
uvicorn main:app --reload
```

Open your browser at `http://localhost:8000`.

---

### 🐳 Run with Docker

```bash
docker build -t study-ai .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key_here study-ai
```

---

## 📂 Project Structure

```text
Study-AI/
├── main.py             # FastAPI backend and all API endpoints
├── frontend/           # Static HTML/CSS/JS frontend
├── uploads/            # Temporary storage for uploaded PDFs (auto-cleaned)
├── history.json        # Persisted chat session history
├── requirements.txt    # Python dependencies
└── Dockerfile          # Container configuration
```

---

**Upload. Ask. Learn. 🚀**

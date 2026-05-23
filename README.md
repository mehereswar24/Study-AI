# 📚 StudyAI - Intelligent Study Companion

StudyAI is a powerful tool that transforms your PDF documents into structured study material. Using advanced AI, it can generate notes, flashcards, quizzes, and mind maps to help you learn more effectively.

## ✨ Features
- **Structured Notes**: Concise summaries and key terms.
- **Interactive Flashcards**: Test your knowledge with front/back cards.
- **AI Quizzes**: Multiple-choice questions with instant feedback and scoring.
- **Visual Mind Maps**: Conceptual hierarchies of your documents.
- **Deep Explanation**: Select any text to get a simplified AI explanation.
- **Document Chat**: Ask specific questions about your uploaded PDFs.

## 🚀 How to Host

### 1. Environment Variables
Create a `.env` file in the root directory and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### 2. Manual Setup
1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. **Backend**:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### 3. Docker (Recommended)
The project includes a multi-stage `Dockerfile` for easy deployment.
```bash
docker build -t study-ai .
docker run -p 8000:8000 --env-file .env study-ai
```

## 🛠 Tech Stack
- **Frontend**: React, CSS (Glassmorphism & Claude-inspired design)
- **Backend**: FastAPI (Python)
- **AI**: Groq (Llama 3.3)
- **Processing**: PyPDF for text extraction

## 🧹 Maintenance
The server automatically cleans up uploaded PDFs older than 24 hours on startup to maintain disk space.

---
Built with ❤️ for better learning.

# NCC ABYAS Backend (FastAPI)

This is the modern backend for the NCC ABYAS platform, built with FastAPI for speed, scalability, and easy integration with the Next.js frontend.

## Features

- AI Chat Assistant endpoint (`/api/chat`)
- Quiz Generation endpoint (`/api/quiz`)
- Syllabus Management endpoints (`/api/syllabus`)
- Pydantic models for validation
- Ready for extension (auth, user, progress, etc.)

## Getting Started

1. **Install dependencies:**

   ```bash
   pip install fastapi uvicorn pydantic
   ```

2. **Run the server:**

   ```bash
   uvicorn main:app --reload
   ```

3. **API Endpoints:**

   - POST `/api/chat` — AI chat assistant
   - POST `/api/quiz` — Quiz generation
   - GET `/api/syllabus/chapters` — Get all syllabus chapters
   - POST `/api/syllabus/search` — Search syllabus content
   - POST `/api/syllabus/bookmarks` — Create bookmarks
   - GET `/api/syllabus/bookmarks` — Get user bookmarks

## Starting the Backend

To start the backend server, use the provided startup script:

```bash
bash start_backend.sh
```

This script ensures dependencies are installed, checks for port availability, and starts the FastAPI server with auto-reload enabled. The server will be available at:

- **Base URL:** `http://localhost:8000`
- **API Documentation:** `http://localhost:8000/docs`

Press `Ctrl+C` to stop the server.

## Project Structure

- `main.py` — FastAPI app entry point
- `models.py` — Pydantic models for requests/responses
- `routers/` — API route handlers (chat, quiz, etc.)
- `.github/copilot-instructions.md` — Copilot custom instructions

---

This backend is designed for easy extension and production deployment. Add your own features as needed!

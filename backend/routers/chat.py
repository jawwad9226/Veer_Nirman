from fastapi import APIRouter, UploadFile, File, Form, Request
from app_models import ChatRequest, ChatResponse
from fastapi.responses import JSONResponse
from typing import List

router = APIRouter()

# In-memory chat history per session (for demo; replace with DB for production)
chat_histories = {}

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, req: Request):
    session_id = req.cookies.get("session_id") or "default"
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    chat_histories[session_id].append({"role": "user", "content": request.message})
    reply = f"[Demo] You said: {request.message}"
    chat_histories[session_id].append({"role": "assistant", "content": reply})
    return ChatResponse(reply=reply)

@router.post("/chat/upload")
async def chat_upload_endpoint(file: UploadFile = File(...), message: str = Form(None), req: Request = None):
    session_id = req.cookies.get("session_id") if req else "default"
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    if message:
        chat_histories[session_id].append({"role": "user", "content": message})
    chat_histories[session_id].append({"role": "user", "content": f"Sent a file: {file.filename}"})
    reply = f"[Demo] Received file: {file.filename}"
    if message:
        reply += f" with message: {message}"
    chat_histories[session_id].append({"role": "assistant", "content": reply})
    return JSONResponse({"reply": reply})

@router.get("/chat/history")
def get_chat_history(req: Request):
    session_id = req.cookies.get("session_id") or "default"
    return chat_histories.get(session_id, [])

@router.post("/chat/clear")
def clear_chat_history(req: Request):
    session_id = req.cookies.get("session_id") or "default"
    chat_histories[session_id] = []
    return {"status": "cleared"}

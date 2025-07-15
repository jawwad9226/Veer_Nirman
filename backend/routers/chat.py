
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app_models import ChatRequest, ChatResponse
from services.ai_service import AIQuizService
import io
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract

router = APIRouter()

# Use the same Gemini AI service as quiz, but for chat
ai_service = AIQuizService()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    if ai_service.model_error or not ai_service.model:
        raise HTTPException(status_code=503, detail=f"AI model unavailable: {ai_service.model_error}")
    try:
        prompt = f"You are an expert NCC (National Cadet Corps) assistant. Answer the following user question in a clear, helpful, and concise way.\n\nUser: {request.message}\n\nAssistant:"
        response = ai_service.model.generate_content(prompt)
        reply = response.text.strip() if hasattr(response, 'text') else str(response)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

# File upload chat endpoint
@router.post("/chat/upload")
async def chat_upload_endpoint(file: UploadFile = File(...), message: str = Form(None)):
    if ai_service.model_error or not ai_service.model:
        raise HTTPException(status_code=503, detail=f"AI model unavailable: {ai_service.model_error}")
    try:
        file_content = await file.read()
        file_name = file.filename
        extracted_text = None
        # PDF extraction with OCR fallback
        if file.content_type == "application/pdf":
            try:
                pdf_reader = PdfReader(io.BytesIO(file_content))
                extracted_text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
                if not extracted_text.strip():
                    # OCR fallback for scanned PDFs
                    from pdf2image import convert_from_bytes
                    images = convert_from_bytes(file_content)
                    ocr_texts = []
                    for img in images:
                        ocr_texts.append(pytesseract.image_to_string(img))
                    extracted_text = "\n".join(ocr_texts)
                    if not extracted_text.strip():
                        extracted_text = None
            except Exception as e:
                extracted_text = None
        # Image extraction
        elif file.content_type in ["image/png", "image/jpeg", "image/jpg", "image/gif"]:
            try:
                image = Image.open(io.BytesIO(file_content))
                extracted_text = pytesseract.image_to_string(image)
                if not extracted_text.strip():
                    extracted_text = None
            except Exception as e:
                extracted_text = None
        # Fallback: treat as text
        if extracted_text:
            prompt = f"You are an expert NCC (National Cadet Corps) assistant. The user uploaded a file named '{file_name}' with the following extracted content:\n\n{extracted_text}\n\n"
        else:
            # fallback to raw bytes as text
            prompt = f"You are an expert NCC (National Cadet Corps) assistant. The user uploaded a file named '{file_name}'. Unable to extract readable text."
        if message and message.strip():
            prompt += f"User's question: {message.strip()}\n\nAssistant:"
        else:
            prompt += "Assistant:"
        response = ai_service.model.generate_content(prompt)
        reply = response.text.strip() if hasattr(response, 'text') else str(response)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat upload error: {str(e)}")

# Remove upload/history/clear endpoints for clarity and to avoid confusion

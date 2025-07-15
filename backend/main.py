from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
# from routers.chat import router as chat_router  # Temporarily disabled
from routers.auth import router as auth_router
from routers.quiz import router as quiz_router
from routers.syllabus import router as syllabus_router
from routers.pdf import router as pdf_router
from routers.video import router as videos_router
from routers.progress import router as progress_router

app = FastAPI(title="NCC ABYAS Backend", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.8:3000",
        "http://192.168.1.2:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(chat_router, prefix="/api")  # Temporarily disabled
app.include_router(auth_router, prefix="/api/auth")  # Enable auth API
app.include_router(quiz_router, prefix="/api")  # Enable quiz API
app.include_router(syllabus_router, prefix="/api/syllabus")  # Enable syllabus API
app.include_router(pdf_router, prefix="/api")  # Enable PDF API
app.include_router(videos_router, prefix="/api")  # Enable videos API
app.include_router(videos_router, prefix="")  # Also enable videos API at root
app.include_router(progress_router, prefix="/api/progress")  # Add progress API


@app.get("/")
async def root():
    return {"message": "NCC ABYAS 2.0 Backend API", "status": "running"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/api/user/profile")
async def get_user_profile():
    # Mock user data - will be replaced with real auth
    return {
        "name": "Cadet Rahul",
        "role": "cadet",
        "unit": "1st Battalion NCC",
        "avatar": "/avatar-placeholder.png",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

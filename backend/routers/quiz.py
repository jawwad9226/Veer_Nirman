from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import os
from app_models import (
    QuizRequest, QuizResponse, QuizQuestion, 
    QuizSubmissionRequest, QuizSubmissionResponse,
    QuizHistoryResponse, BookmarkRequest, QuizBookmarkResponse,
    QuizTopicsResponse, QuizAnalyticsResponse
)
from services.ai_service import get_ai_quiz_service, AIQuizService

router = APIRouter()

# NCC Quiz Topics (from original system)
NCC_TOPICS = [
    "NCC General",
    "National Integration", 
    "Drill",
    "Weapon Training",
    "Map Reading",
    "Field Craft Battle Craft",
    "Civil Defence",
    "First Aid",
    "Leadership",
    "Social Service"
]

# Difficulty configurations (updated system)
DIFFICULTY_CONFIG = {
    "Easy": {"questions": 10, "complexity": "basic concepts and definitions"},
    "Medium": {"questions": 5, "complexity": "intermediate concepts and application"},
    "Hard": {"questions": 5, "complexity": "advanced understanding and critical thinking"}
}

@router.get("/topics", response_model=QuizTopicsResponse)
async def get_quiz_topics():
    """Get available quiz topics"""
    return QuizTopicsResponse(topics=NCC_TOPICS, topic_stats={})

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    request: QuizRequest, 
    ai_service: AIQuizService = Depends(get_ai_quiz_service)
):
    """Generate AI-powered quiz questions"""
    try:
        # Check if this is a custom topic or file-based request
        is_custom = request.custom_topic is not None or request.source_material is not None
        
        if not is_custom:
            # Validate predefined topic
            if request.topic not in NCC_TOPICS:
                raise HTTPException(status_code=400, detail=f"Invalid topic. Available topics: {NCC_TOPICS}")
        
        # Validate difficulty
        if request.difficulty not in DIFFICULTY_CONFIG:
            raise HTTPException(status_code=400, detail="Invalid difficulty. Use: Easy, Medium, or Hard")
        
        # Clamp number of questions based on content type
        if is_custom:
            # For custom topics and uploaded materials, allow up to 15 questions
            num_questions = min(request.numQuestions, 15)
        else:
            # For predefined topics, use difficulty-based limits
            max_questions = DIFFICULTY_CONFIG[request.difficulty]["questions"]
            num_questions = min(request.numQuestions, max_questions)
        
        # Determine the effective topic and content for AI generation
        if request.source_material:
            # File-based quiz generation
            effective_topic = request.custom_topic or f"Custom Content ({request.file_type})"
            print(f"Generating quiz from uploaded content: {effective_topic}")
            questions, error = ai_service.generate_quiz_from_content(
                content=request.source_material,
                topic=effective_topic,
                difficulty=request.difficulty,
                num_questions=num_questions
            )
        elif request.custom_topic:
            # Custom topic quiz generation
            effective_topic = request.custom_topic
            print(f"Generating quiz for custom topic: {effective_topic}")
            questions, error = ai_service.generate_quiz_questions(
                topic=effective_topic,
                difficulty=request.difficulty,
                num_questions=num_questions,
                is_custom=True
            )
        else:
            # Standard NCC topic quiz generation
            effective_topic = request.topic
            questions, error = ai_service.generate_quiz_questions(
                topic=request.topic,
                difficulty=request.difficulty,
                num_questions=num_questions
            )
        
        if error:
            raise HTTPException(status_code=500, detail=f"AI service error: {error}")
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate quiz questions")
        # Calculate time limit for timed mode
        time_limit = None
        if request.timedMode:
            time_limit = request.timeLimit or (num_questions * 120)
        return QuizResponse(
            questions=questions,
            metadata={
                "quiz_id": f"{effective_topic}_{request.difficulty}_{datetime.now().timestamp()}",
                "topic": effective_topic,
                "difficulty": request.difficulty,
                "generated_at": datetime.now().isoformat(),
                "total_questions": len(questions),
                "timed_mode": request.timedMode,
                "time_limit_seconds": time_limit,
                "max_points": sum(getattr(q, 'points', 1) for q in questions),
                "custom_topic": is_custom,
                "source_material": "uploaded_file" if request.source_material else None,
                "ai_generated": error is None
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.post("/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(submission: QuizSubmissionRequest):
    """Submit quiz answers and get results"""
    try:
        # No answer validation in production (AI only)
        correct_answers = 0
        wrong_questions = []
        total_questions = len(submission.answers)
        
        score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Calculate duration
        duration_seconds = 0
        if submission.start_time and submission.end_time:
            start = datetime.fromisoformat(submission.start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(submission.end_time.replace('Z', '+00:00'))
            duration_seconds = (end - start).total_seconds()
        
        result = QuizSubmissionResponse(
            score=score_percentage,
            correct_answers=correct_answers,
            wrong_answers=len(wrong_questions),
            total_questions=total_questions,
            duration_seconds=duration_seconds,
            wrong_questions=wrong_questions,
            difficulty=submission.difficulty,
            topic=submission.topic,
            submitted_at=datetime.now().isoformat()
        )
        
        # No quiz history in production (AI only)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")




# Legacy endpoint for backward compatibility



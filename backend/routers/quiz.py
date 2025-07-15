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
            # Fallback to mock questions if AI service fails
            print(f"AI service error: {error}. Falling back to mock questions.")
            questions = await _generate_mock_questions(effective_topic, request.difficulty, num_questions)
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate quiz questions")
        
        # Store generated quiz for later validation during submission
        quiz_id = f"{effective_topic}_{request.difficulty}_{datetime.now().timestamp()}"
        await _store_quiz_session(quiz_id, questions)
        
        # Calculate time limit for timed mode
        time_limit = None
        if request.timedMode:
            # Default: 2 minutes per question
            time_limit = request.timeLimit or (num_questions * 120)
        
        return QuizResponse(
            questions=questions,
            metadata={
                "quiz_id": quiz_id,
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
        # Retrieve quiz session for validation
        quiz_session = await _get_quiz_session(submission.quiz_id) if submission.quiz_id else None
        
        if not quiz_session and submission.quiz_id:
            raise HTTPException(status_code=404, detail="Quiz session not found or expired")
        
        correct_answers = 0
        wrong_questions = []
        total_questions = len(submission.answers)
        
        # Validate answers against stored quiz questions
        if quiz_session and quiz_session["questions"]:
            stored_questions = quiz_session["questions"]
            
            for i, user_answer in enumerate(submission.answers):
                if i < len(stored_questions):
                    correct_answer = stored_questions[i].answer
                    is_correct = user_answer.upper() == correct_answer.upper()
                    
                    if is_correct:
                        correct_answers += 1
                    else:
                        wrong_questions.append({
                            "question_index": i,
                            "question": stored_questions[i].question,
                            "user_answer": user_answer,
                            "correct_answer": correct_answer,
                            "explanation": stored_questions[i].explanation
                        })
        else:
            # Fallback validation (mock)
            correct_answers = total_questions // 2  # Mock 50% score
        
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
        
        # Save to quiz history
        history_entry = {
            "id": f"quiz_{datetime.now().timestamp()}",
            "topic": submission.topic,
            "difficulty": submission.difficulty,
            "score": score_percentage,
            "completed_at": datetime.now().isoformat(),
            "duration_seconds": duration_seconds,
            "correct_answers": correct_answers,
            "wrong_answers": len(wrong_questions),
            "total_questions": total_questions
        }
        await _save_quiz_history(history_entry)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

@router.get("/history", response_model=QuizHistoryResponse)
async def get_quiz_history(user_id: Optional[str] = None, limit: int = 10):
    """Get user's quiz history"""
    try:
        # TODO: Fetch from database
        return QuizHistoryResponse(
            history=QUIZ_HISTORY[-limit:],  # Return latest `limit` entries
            total_count=len(QUIZ_HISTORY),
            page_size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quiz history: {str(e)}")

@router.post("/bookmark", response_model=QuizBookmarkResponse)
async def bookmark_question(bookmark: BookmarkRequest):
    """Bookmark a question for later review"""
    try:
        bookmark_data = {
            "question_id": bookmark.question_id,
            "user_id": bookmark.user_id,
            "bookmarked_at": datetime.now().isoformat()
        }
        
        # Check if already bookmarked
        existing = any(
            b["question_id"] == bookmark.question_id and b["user_id"] == bookmark.user_id 
            for b in BOOKMARKS
        )
        
        if not existing:
            BOOKMARKS.append(bookmark_data)
            await _save_quiz_data()  # Save to file
        
        return QuizBookmarkResponse(
            success=True,
            message=f"Question bookmarked successfully" if not existing else "Question already bookmarked",
            bookmark_id=f"bookmark_{bookmark.question_id}_{bookmark.user_id}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bookmark question: {str(e)}")

@router.get("/analytics", response_model=QuizAnalyticsResponse)
async def get_quiz_analytics(user_id: Optional[str] = None):
    """Get user's quiz performance analytics"""
    try:
        if not QUIZ_HISTORY:
            # Return default analytics if no history
            return QuizAnalyticsResponse(
                total_quizzes=0,
                average_score=0.0,
                best_score=0.0,
                worst_score=0.0,
                favorite_topic="N/A",
                strength_areas=[],
                improvement_areas=[],
                recent_trend="neutral",
                total_time_spent=0
            )
        
        # Calculate real analytics from quiz history
        scores = [h["score"] for h in QUIZ_HISTORY if "score" in h]
        topics = [h["topic"] for h in QUIZ_HISTORY if "topic" in h]
        durations = [h.get("duration_seconds", 0) for h in QUIZ_HISTORY]
        
        # Topic performance analysis
        topic_scores = {}
        for h in QUIZ_HISTORY:
            topic = h.get("topic", "Unknown")
            score = h.get("score", 0)
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(score)
        
        # Calculate averages per topic
        topic_averages = {
            topic: sum(scores_list) / len(scores_list) 
            for topic, scores_list in topic_scores.items()
        }
        
        # Determine strengths and weaknesses
        sorted_topics = sorted(topic_averages.items(), key=lambda x: x[1], reverse=True)
        strength_areas = [topic for topic, _ in sorted_topics[:2]] if len(sorted_topics) > 2 else []
        improvement_areas = [topic for topic, _ in sorted_topics[-2:]] if len(sorted_topics) > 2 else []
        
        # Recent trend analysis (last 3 vs previous 3)
        recent_trend = "neutral"
        if len(scores) >= 6:
            recent_avg = sum(scores[-3:]) / 3
            previous_avg = sum(scores[-6:-3]) / 3
            if recent_avg > previous_avg + 5:
                recent_trend = "improving"
            elif recent_avg < previous_avg - 5:
                recent_trend = "declining"
        
        analytics = QuizAnalyticsResponse(
            total_quizzes=len(QUIZ_HISTORY),
            average_score=sum(scores) / len(scores) if scores else 0.0,
            best_score=max(scores) if scores else 0.0,
            worst_score=min(scores) if scores else 0.0,
            favorite_topic=max(set(topics), key=topics.count) if topics else "N/A",
            strength_areas=strength_areas,
            improvement_areas=improvement_areas,
            recent_trend=recent_trend,
            total_time_spent=sum(durations)
        )
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

# Legacy endpoint for backward compatibility
@router.post("/quiz", response_model=QuizResponse)
def quiz_endpoint(request: QuizRequest):
    """Legacy quiz endpoint - redirects to generate"""
    # This maintains compatibility while encouraging use of new endpoint
    return generate_quiz(request)

# Data storage (in production, use proper database)
QUIZ_SESSIONS = {}  # quiz_id -> quiz_data
QUIZ_HISTORY = []   # List of submitted quizzes
BOOKMARKS = []      # List of bookmarked questions

async def _store_quiz_session(quiz_id: str, questions: List[QuizQuestion]):
    """Store quiz session for later validation"""
    QUIZ_SESSIONS[quiz_id] = {
        "questions": questions,
        "created_at": datetime.now().isoformat()
    }

async def _get_quiz_session(quiz_id: str) -> Optional[Dict]:
    """Retrieve quiz session data"""
    return QUIZ_SESSIONS.get(quiz_id)

async def _save_quiz_history(submission_data: Dict):
    """Save quiz submission to history"""
    QUIZ_HISTORY.append({
        **submission_data,
        "submitted_at": datetime.now().isoformat()
    })
    
    # Also save to file immediately
    await _save_quiz_data()

async def _load_quiz_data():
    """Load quiz data from files (similar to original system)"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    
    # Create data directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    # Load quiz history
    history_file = os.path.join(data_dir, "quiz_score_history.json")
    if os.path.exists(history_file):
        try:
            with open(history_file, 'r') as f:
                data = json.load(f)
                QUIZ_HISTORY.extend(data)
        except Exception as e:
            print(f"Error loading quiz history: {e}")
    
    # Load bookmarks
    bookmarks_file = os.path.join(data_dir, "quiz_bookmarks.json")
    if os.path.exists(bookmarks_file):
        try:
            with open(bookmarks_file, 'r') as f:
                data = json.load(f)
                BOOKMARKS.extend(data)
        except Exception as e:
            print(f"Error loading bookmarks: {e}")

async def _save_quiz_data():
    """Save quiz data to files"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(data_dir, exist_ok=True)
    
    # Save quiz history
    history_file = os.path.join(data_dir, "quiz_score_history.json")
    try:
        with open(history_file, 'w') as f:
            json.dump(QUIZ_HISTORY, f, indent=2)
    except Exception as e:
        print(f"Error saving quiz history: {e}")
    
    # Save bookmarks
    bookmarks_file = os.path.join(data_dir, "quiz_bookmarks.json")
    try:
        with open(bookmarks_file, 'w') as f:
            json.dump(BOOKMARKS, f, indent=2)
    except Exception as e:
        print(f"Error saving bookmarks: {e}")

# Initialize data on module load
try:
    import asyncio
    
    def _init_data():
        """Initialize quiz data synchronously"""
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        os.makedirs(data_dir, exist_ok=True)
        
        # Load quiz history
        history_file = os.path.join(data_dir, "quiz_score_history.json")
        if os.path.exists(history_file):
            try:
                with open(history_file, 'r') as f:
                    data = json.load(f)
                    QUIZ_HISTORY.extend(data)
            except Exception as e:
                print(f"Error loading quiz history: {e}")
        
        # Load bookmarks
        bookmarks_file = os.path.join(data_dir, "quiz_bookmarks.json")
        if os.path.exists(bookmarks_file):
            try:
                with open(bookmarks_file, 'r') as f:
                    data = json.load(f)
                    BOOKMARKS.extend(data)
            except Exception as e:
                print(f"Error loading bookmarks: {e}")
    
    _init_data()
    
except Exception as e:
    print(f"Error initializing quiz data: {e}")

async def _generate_mock_questions(topic: str, difficulty: str, num_questions: int) -> List[QuizQuestion]:
    """Generate enhanced mock questions based on topic and difficulty"""
    
    # Enhanced question bank based on original system
    question_templates = {
        "NCC General": [
            {
                "question": "What does NCC stand for?",
                "options": {
                    "A": "National Cadet Corps",
                    "B": "National Cricket Club", 
                    "C": "New Cadet Course",
                    "D": "National Culture Council"
                },
                "answer": "A",
                "explanation": "NCC stands for National Cadet Corps, a youth development movement that aims to develop character, comradeship, discipline, and a secular outlook among young citizens."
            },
            {
                "question": "Who is the Supreme Commander of the NCC?",
                "options": {
                    "A": "Chief of Army Staff",
                    "B": "President of India",
                    "C": "Prime Minister of India", 
                    "D": "Defence Minister"
                },
                "answer": "B",
                "explanation": "The President of India is the Supreme Commander of the NCC, reflecting the constitutional role of the President as the Supreme Commander of the Armed Forces."
            },
            {
                "question": "What is the motto of NCC?",
                "options": {
                    "A": "Unity and Discipline",
                    "B": "Service Before Self",
                    "C": "Ekta aur Anushasan", 
                    "D": "Duty, Honor, Country"
                },
                "answer": "A",
                "explanation": "The motto of NCC is 'Unity and Discipline' (Ekta aur Anushasan in Hindi), which emphasizes the core values that NCC seeks to instill in cadets."
            }
        ],
        "Leadership": [
            {
                "question": "What is the most important quality of a good leader?",
                "options": {
                    "A": "Intelligence",
                    "B": "Integrity",
                    "C": "Charisma",
                    "D": "Strength"
                },
                "answer": "B", 
                "explanation": "Integrity is the foundation of good leadership as it builds trust, ensures ethical decision-making, and sets a positive example for others to follow."
            }
        ]
    }
    
    # Get questions for the topic
    topic_questions = question_templates.get(topic, question_templates["NCC General"])
    
    # Repeat questions if needed (in real implementation, would generate new ones via AI)
    questions = []
    for i in range(num_questions):
        base_question = topic_questions[i % len(topic_questions)]
        question = QuizQuestion(
            id=f"q_{i+1}",
            question=base_question["question"],
            options=base_question["options"],
            answer=base_question["answer"],
            explanation=base_question["explanation"],
            topic=topic,
            difficulty=difficulty,
            created_at=datetime.now().isoformat()
        )
        questions.append(question)
    
    return questions

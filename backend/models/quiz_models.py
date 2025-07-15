"""
Quiz models for NCC ABYAS backend
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int = Field(..., ge=0, le=3, description="Index of correct option (0-3)")
    explanation: Optional[str] = None
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    topic: Optional[str] = None

class QuizRequest(BaseModel):
    topic: str
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    num_questions: int = Field(default=5, ge=1, le=20)
    question_type: str = Field(default="multiple_choice")

class QuizResponse(BaseModel):
    quiz_id: str
    questions: List[QuizQuestion]
    topic: str
    difficulty: str
    created_at: datetime

class QuizSubmissionRequest(BaseModel):
    quiz_id: str
    answers: List[int] = Field(..., description="List of selected option indices")
    time_taken: Optional[int] = Field(None, description="Time taken in seconds")

class QuizSubmissionResponse(BaseModel):
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    correct_answers: List[bool]
    explanations: List[str]
    time_taken: Optional[int] = None
    submitted_at: datetime

class QuizHistoryItem(BaseModel):
    quiz_id: str
    topic: str
    difficulty: str
    score: int
    total_questions: int
    percentage: float
    time_taken: Optional[int] = None
    submitted_at: datetime

class QuizHistoryResponse(BaseModel):
    quizzes: List[QuizHistoryItem]
    total_count: int
    average_score: float

class BookmarkRequest(BaseModel):
    quiz_id: str
    question_index: int
    note: Optional[str] = None

class BookmarkResponse(BaseModel):
    bookmark_id: str
    quiz_id: str
    question_index: int
    question: str
    note: Optional[str] = None
    created_at: datetime

class QuizTopicsResponse(BaseModel):
    topics: List[str]
    topic_stats: Dict[str, Dict[str, Any]]

class QuizAnalyticsResponse(BaseModel):
    total_quizzes: int
    average_score: float
    best_topic: str
    worst_topic: str
    improvement_trend: List[float]
    recent_performance: List[Dict[str, Any]]

# Add missing imports for model definitions
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
# Video Models
class VideoModel(BaseModel):
    id: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    duration: Optional[int] = None  # Now expects seconds as int
    category_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    instructor: Optional[str] = None
    difficulty_level: Optional[str] = None
    is_featured: Optional[bool] = None
    prerequisites: Optional[list] = None

class VideoCategoryModel(BaseModel):
    name: str
    video_count: int

class VideoListResponse(BaseModel):
    videos: List[VideoModel]
    total: int

class VideoCategoriesResponse(BaseModel):
    categories: List[VideoCategoryModel]
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# Chat
class ChatRequest(BaseModel):
    message: str = Field(..., example="What is NCC?")

class ChatResponse(BaseModel):
    reply: str

# Quiz Models
class QuizRequest(BaseModel):
    topic: str = Field(..., example="NCC General")
    difficulty: str = Field(..., example="Medium")
    numQuestions: int = Field(..., example=5, ge=1, le=10)
    timedMode: Optional[bool] = Field(False, description="Enable timed mode with countdown")
    timeLimit: Optional[int] = Field(None, description="Time limit in seconds (if timed mode)")
    custom_topic: Optional[str] = Field(None, description="Custom topic name")
    source_material: Optional[str] = Field(None, description="Content to generate questions from")
    file_type: Optional[str] = Field(None, description="Type of uploaded file")

class QuizQuestion(BaseModel):
    id: Optional[str] = None
    question: str
    options: Dict[str, str]
    answer: str
    explanation: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    created_at: Optional[str] = None
    points: Optional[int] = Field(1, description="Points for this question")

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    metadata: Optional[Dict[str, Any]] = None

class QuizSubmissionRequest(BaseModel):
    quiz_id: Optional[str] = None
    answers: List[str] = Field(..., description="List of user's selected answers (A, B, C, D)")
    topic: str
    difficulty: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    question_ids: Optional[List[str]] = None

class QuizSubmissionResponse(BaseModel):
    score: float = Field(..., description="Score percentage (0-100)")
    correct_answers: int
    wrong_answers: int
    total_questions: int
    duration_seconds: float
    wrong_questions: List[Dict[str, Any]]
    difficulty: str
    topic: str
    submitted_at: str
    performance_level: Optional[str] = Field(None, description="Excellent/Good/Average/Needs Improvement")
    time_per_question: Optional[float] = Field(None, description="Average time per question")
    accuracy_by_topic: Optional[Dict[str, float]] = Field(None, description="Accuracy breakdown by subtopic")
    speed_rank: Optional[str] = Field(None, description="Fast/Average/Slow completion")

class QuizHistoryEntry(BaseModel):
    id: str
    topic: str
    difficulty: str
    score: float
    completed_at: str
    duration_seconds: float

class QuizHistoryResponse(BaseModel):
    history: List[QuizHistoryEntry]
    total_count: int
    page_size: int

class BookmarkRequest(BaseModel):
    question_id: str
    question: str
    answer: str
    explanation: Optional[str] = None
    topic: str
    user_id: Optional[str] = None


# Quiz Bookmark Response
class QuizBookmarkResponse(BaseModel):
    success: bool
    message: str
    bookmark_id: Optional[str] = None

class QuizTopicsResponse(BaseModel):
    topics: List[str]
    topic_stats: Optional[dict] = None

class QuizAnalyticsResponse(BaseModel):
    total_quizzes: int
    average_score: float
    best_score: float
    worst_score: float
    total_time_spent: float
    favorite_topics: List[Dict[str, Any]]
    difficulty_breakdown: Dict[str, int]
    recent_performance: List[Dict[str, Any]]
    improvement_suggestions: List[str]
    performance_trend: Optional[str] = Field(None, description="Improving/Stable/Declining")
    mastery_levels: Optional[Dict[str, str]] = Field(None, description="Topic mastery levels")
    strength_areas: List[str]
    improvement_areas: List[str]

# Legacy support
class QuizResult(BaseModel):
    """Legacy quiz result model for backward compatibility"""
    score: float
    correct: int
    wrong: int
    total: int

# Syllabus Models
class SyllabusSection(BaseModel):
    name: str
    page_number: Optional[int] = None
    content: Optional[str] = None
    keywords: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None
    difficulty: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    page_start: Optional[int] = None  # PDF page where section starts
    page_end: Optional[int] = None    # PDF page where section ends

class SyllabusChapter(BaseModel):
    title: str
    wing: Optional[str] = None
    sections: List[SyllabusSection] = []

class SyllabusData(BaseModel):
    version: str
    chapters: List[SyllabusChapter] = []

class SyllabusSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query for syllabus content")
    chapter_filter: Optional[str] = Field(None, description="Filter by specific chapter")
    difficulty_filter: Optional[List[str]] = Field(None, description="Filter by difficulty levels")

class SyllabusSearchResult(BaseModel):
    chapter_title: str
    section_name: Optional[str] = None
    match_type: str  # 'chapter', 'section', 'content', 'keyword'
    content_preview: str
    page_number: Optional[int] = None
    relevance_score: Optional[float] = None
    page_start: Optional[int] = None  # PDF page where section starts
    page_end: Optional[int] = None    # PDF page where section ends

class SyllabusSearchResponse(BaseModel):
    results: List[SyllabusSearchResult]
    total_results: int
    query: str
    search_time_ms: Optional[float] = None

class SyllabusChaptersResponse(BaseModel):
    chapters: List[SyllabusChapter]
    total_chapters: int
    version: str

class BookmarkCreateRequest(BaseModel):
    title: str
    page_number: int
    chapter_title: Optional[str] = None
    section_name: Optional[str] = None
    user_id: Optional[str] = None  # For future user system integration


# Syllabus Bookmark Response
class SyllabusBookmarkResponse(BaseModel):
    id: str
    title: str
    page_number: int
    chapter_title: Optional[str] = None
    section_name: Optional[str] = None
    created_at: str

class BookmarksListResponse(BaseModel):
    bookmarks: List[SyllabusBookmarkResponse]
    total_count: int

# Progress Dashboard Models
class QuizResultRecord(BaseModel):
    """Individual quiz result record for progress tracking"""
    id: str
    topic: str
    difficulty: str
    score: float  # Percentage score (0-100)
    total_questions: int
    correct_answers: int
    time_spent: int  # Time in seconds
    completed_at: datetime
    custom_topic: Optional[str] = None
    
class VideoProgressRecord(BaseModel):
    """Video watching progress record"""
    video_id: str
    video_title: str
    category: str
    watch_time: int  # Time watched in seconds
    total_duration: int  # Total video duration in seconds
    completed: bool
    last_watched: datetime
    
class StudySessionRecord(BaseModel):
    """Study session tracking"""
    session_id: str
    activity_type: str  # 'quiz', 'video', 'syllabus'
    duration: int  # Duration in seconds
    started_at: datetime
    ended_at: datetime
    
class ProgressSummary(BaseModel):
    """Overall progress summary statistics"""
    total_quizzes: int
    average_score: float
    best_score: float
    worst_score: float
    total_study_time: int  # Total time in seconds
    completed_videos: int
    total_videos: int
    bookmarked_sections: int
    current_streak: int  # Days
    longest_streak: int  # Days
    last_activity: Optional[datetime] = None
    
class TopicPerformance(BaseModel):
    """Performance statistics for a specific topic"""
    topic: str
    attempts: int
    average_score: float
    best_score: float
    improvement_trend: float  # Positive = improving, negative = declining
    time_spent: int  # Total time in seconds
    mastery_level: str  # 'beginner', 'intermediate', 'advanced', 'expert'
    
class LearningRecommendation(BaseModel):
    """AI-powered learning recommendation"""
    type: str  # 'weak_topic', 'review', 'next_level', 'practice_more'
    title: str
    description: str
    priority: str  # 'high', 'medium', 'low'
    estimated_time: int  # Minutes
    action_url: Optional[str] = None
    
class ProgressAnalyticsResponse(BaseModel):
    """Complete progress analytics response"""
    summary: ProgressSummary
    topic_performance: List[TopicPerformance]
    recent_activity: List[Dict[str, Any]]
    recommendations: List[LearningRecommendation]
    charts_data: Dict[str, Any]
    
class ProgressFilterRequest(BaseModel):
    """Request model for filtering progress data"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    topics: Optional[List[str]] = None
    difficulties: Optional[List[str]] = None
    activity_types: Optional[List[str]] = None
    
class Achievement(BaseModel):
    """Achievement/badge model"""
    id: str
    title: str
    description: str
    icon: str
    earned_at: Optional[datetime] = None
    progress: float  # 0.0 to 1.0
    target: int
    current: int

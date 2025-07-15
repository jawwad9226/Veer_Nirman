# Syllabus models for NCC ABYAS backend
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SyllabusSection(BaseModel):
    name: str
    page_number: Optional[int] = None
    subsections: Optional[List[str]] = []
    difficulty_level: Optional[str] = "intermediate"
    estimated_time: Optional[int] = None  # in minutes

class SyllabusChapter(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    sections: List[SyllabusSection] = []
    page_range: Optional[Dict[str, int]] = None  # {"start": 1, "end": 10}
    difficulty_level: str = "intermediate"
    estimated_hours: Optional[float] = None

class SyllabusChaptersResponse(BaseModel):
    version: str = "1.0"
    chapters: List[SyllabusChapter]
    total_chapters: int
    last_updated: datetime = Field(default_factory=datetime.now)

class SyllabusSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    chapter_filter: Optional[str] = None
    difficulty_filter: Optional[List[str]] = None
    page_range: Optional[Dict[str, int]] = None

class SyllabusSearchResult(BaseModel):
    chapter_title: str
    section_name: str
    page_number: Optional[int] = None
    content_snippet: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    difficulty_level: str

class SyllabusSearchResponse(BaseModel):
    query: str
    results: List[SyllabusSearchResult]
    total_results: int
    search_time_ms: float

class BookmarkCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    page_number: int = Field(..., ge=1)
    chapter_title: str
    section_name: Optional[str] = None
    notes: Optional[str] = None


class SyllabusBookmarkResponse(BaseModel):
    id: str
    title: str
    page_number: int
    chapter_title: str
    section_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    user_id: Optional[str] = None

class BookmarkUpdateRequest(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None

class BookmarksListResponse(BaseModel):
    bookmarks: List[SyllabusBookmarkResponse]
    total_bookmarks: int

class SyllabusData(BaseModel):
    version: str
    chapters: List[SyllabusChapter] = []

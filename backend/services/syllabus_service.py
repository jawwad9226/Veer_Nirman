"""
Syllabus Service for NCC ABYAS
Handles syllabus data loading, searching, and management
"""
import json
import os
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import re
from app_models import (
    SyllabusData, SyllabusChapter, SyllabusSection,
    SyllabusSearchResult, SyllabusBookmarkResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SyllabusService:
    def __init__(self):
        self.syllabus_data: Optional[SyllabusData] = None
        self.bookmarks: List[SyllabusBookmarkResponse] = []
        self._load_syllabus_data()
    
    def _load_syllabus_data(self) -> None:
        """Load syllabus data from JSON file"""
        try:
            # Look for syllabus.json in data directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Go up to backend dir
            syllabus_path = os.path.join(base_dir, "data", "syllabus.json")
            
            if not os.path.exists(syllabus_path):
                logger.warning(f"Syllabus file not found at {syllabus_path}")
                self._create_sample_syllabus_data()
                return
            
            with open(syllabus_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Validate and convert to Pydantic model
            self.syllabus_data = SyllabusData(**data)
            logger.info(f"Loaded syllabus data with {len(self.syllabus_data.chapters)} chapters")
            
        except Exception as e:
            logger.error(f"Error loading syllabus data: {e}")
            self._create_sample_syllabus_data()
    
    def _create_sample_syllabus_data(self) -> None:
        """Create sample syllabus data for testing"""
        sample_data = {
            "version": "1.0",
            "chapters": [
                {
                    "title": "NCC General",
                    "wing": "COMMON",
                    "sections": [
                        {
                            "name": "History and Formation",
                            "page_number": 13,
                            "content": "The National Cadet Corps (NCC) is a youth development movement in India...",
                            "keywords": ["ncc", "history", "formation", "youth development"],
                            "learning_objectives": ["Understanding NCC's role in nation building"],
                            "difficulty": ["JD/JW", "SD/SW"],
                            "topics": ["History of NCC", "Formation", "Aims and objectives"]
                        },
                        {
                            "name": "Organization Structure",
                            "page_number": 18,
                            "content": "NCC organizational hierarchy and command structure...",
                            "keywords": ["organization", "hierarchy", "command"],
                            "learning_objectives": ["Knowledge of NCC structure"],
                            "difficulty": ["JD/JW", "SD/SW"],
                            "topics": ["Hierarchy", "Command structure", "Units"]
                        }
                    ]
                },
                {
                    "title": "Drill",
                    "wing": "COMMON",
                    "sections": [
                        {
                            "name": "Foot Drill",
                            "page_number": 45,
                            "content": "Basic foot drill commands and movements...",
                            "keywords": ["drill", "foot", "commands", "movements"],
                            "learning_objectives": ["Master basic drill movements"],
                            "difficulty": ["JD/JW"],
                            "topics": ["Attention", "Stand at ease", "Marching"]
                        }
                    ]
                }
            ]
        }
        self.syllabus_data = SyllabusData(**sample_data)
        logger.info("Created sample syllabus data")
    
    def get_all_chapters(self) -> Optional[SyllabusData]:
        """Get all syllabus chapters"""
        return self.syllabus_data
    
    def search_syllabus(
        self, 
        query: str, 
        chapter_filter: Optional[str] = None,
        difficulty_filter: Optional[List[str]] = None
    ) -> List[SyllabusSearchResult]:
        """Search syllabus content"""
        if not self.syllabus_data or not query:
            return []
        
        results = []
        query_lower = query.lower()
        
        for chapter in self.syllabus_data.chapters:
            # Apply chapter filter if specified
            if chapter_filter and chapter.title.lower() != chapter_filter.lower():
                continue
            
            # Check chapter title match
            if query_lower in chapter.title.lower():
                # Get PDF page references for this chapter
                try:
                    from services.pdf_service import pdf_service
                    chapter_pages = pdf_service.get_page_for_chapter(chapter.title)
                    page_start = chapter_pages.get("start") if chapter_pages else None
                    page_end = chapter_pages.get("end") if chapter_pages else None
                except ImportError:
                    page_start = page_end = None
                
                results.append(SyllabusSearchResult(
                    chapter_title=chapter.title,
                    match_type="chapter",
                    content_preview=f"Chapter: {chapter.title}",
                    relevance_score=0.9,
                    page_start=page_start,
                    page_end=page_end
                ))
            
            # Search within sections
            for section in chapter.sections:
                # Apply difficulty filter if specified
                if difficulty_filter and section.difficulty:
                    if not any(diff in difficulty_filter for diff in section.difficulty):
                        continue
                
                match_found = False
                match_type = ""
                preview = ""
                score = 0.0
                
                # Check section name
                if query_lower in section.name.lower():
                    match_found = True
                    match_type = "section"
                    preview = f"Section: {section.name}"
                    score = 0.8
                
                # Check section content
                elif section.content and query_lower in section.content.lower():
                    match_found = True
                    match_type = "content"
                    # Extract context around the match
                    content_lower = section.content.lower()
                    match_index = content_lower.find(query_lower)
                    start = max(0, match_index - 50)
                    end = min(len(section.content), match_index + len(query) + 50)
                    preview = f"...{section.content[start:end]}..."
                    score = 0.7
                
                # Check keywords
                elif section.keywords:
                    matching_keywords = [kw for kw in section.keywords if query_lower in kw.lower()]
                    if matching_keywords:
                        match_found = True
                        match_type = "keyword"
                        preview = f"Keywords: {', '.join(matching_keywords)}"
                        score = 0.6
                
                # Check topics
                elif section.topics:
                    matching_topics = [topic for topic in section.topics if query_lower in topic.lower()]
                    if matching_topics:
                        match_found = True
                        match_type = "topic"
                        preview = f"Topics: {', '.join(matching_topics)}"
                        score = 0.5
                
                if match_found:
                    # Get PDF page references for this chapter
                    try:
                        from services.pdf_service import pdf_service
                        chapter_pages = pdf_service.get_page_for_chapter(chapter.title)
                        page_start = chapter_pages.get("start") if chapter_pages else None
                        page_end = chapter_pages.get("end") if chapter_pages else None
                    except ImportError:
                        page_start = page_end = None
                    
                    results.append(SyllabusSearchResult(
                        chapter_title=chapter.title,
                        section_name=section.name,
                        match_type=match_type,
                        content_preview=preview,
                        page_number=section.page_number,
                        relevance_score=score,
                        page_start=page_start,
                        page_end=page_end
                    ))
        
        # Sort by relevance score (highest first)
        results.sort(key=lambda x: x.relevance_score or 0, reverse=True)
        return results
    
    def get_chapter_by_title(self, title: str) -> Optional[SyllabusChapter]:
        """Get a specific chapter by title"""
        if not self.syllabus_data:
            return None
        
        for chapter in self.syllabus_data.chapters:
            if chapter.title.lower() == title.lower():
                return chapter
        return None
    
    def add_bookmark(
        self, 
        title: str, 
        page_number: int,
        chapter_title: Optional[str] = None,
        section_name: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> SyllabusBookmarkResponse:
        """Add a new bookmark"""
        bookmark_id = f"bookmark_{len(self.bookmarks)}_{datetime.now().timestamp()}"
        bookmark = SyllabusBookmarkResponse(
            id=bookmark_id,
            title=title,
            page_number=page_number,
            chapter_title=chapter_title,
            section_name=section_name,
            created_at=datetime.now().isoformat()
        )
        self.bookmarks.append(bookmark)
        return bookmark
    
    def get_bookmarks(self, user_id: Optional[str] = None) -> List[SyllabusBookmarkResponse]:
        """Get all bookmarks (filtered by user_id if provided)"""
        # For now, return all bookmarks since we don't have user system yet
        return self.bookmarks
    
    def delete_bookmark(self, bookmark_id: str) -> bool:
        """Delete a bookmark by ID"""
        for i, bookmark in enumerate(self.bookmarks):
            if bookmark.id == bookmark_id:
                del self.bookmarks[i]
                return True
        return False

# Global service instance
syllabus_service = SyllabusService()

def get_syllabus_service() -> SyllabusService:
    """Dependency injection for FastAPI"""
    return syllabus_service

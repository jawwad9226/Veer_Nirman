"""
Syllabus API Router for NCC ABYAS
Provides endpoints for syllabus browsing, searching, and bookmark management
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import time
from app_models import (
    SyllabusChaptersResponse, SyllabusSearchRequest, SyllabusSearchResponse,
    BookmarkCreateRequest, SyllabusBookmarkResponse, BookmarksListResponse
)
from services.syllabus_service import get_syllabus_service, SyllabusService

router = APIRouter()

@router.get("/chapters", response_model=SyllabusChaptersResponse)
async def get_syllabus_chapters(
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Get all syllabus chapters and sections"""
    try:
        syllabus_data = syllabus_service.get_all_chapters()
        
        if not syllabus_data:
            raise HTTPException(status_code=404, detail="Syllabus data not found")
        
        return SyllabusChaptersResponse(
            chapters=syllabus_data.chapters,
            total_chapters=len(syllabus_data.chapters),
            version=syllabus_data.version
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve syllabus chapters: {str(e)}")

@router.post("/search", response_model=SyllabusSearchResponse)
async def search_syllabus(
    request: SyllabusSearchRequest,
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Search syllabus content by query"""
    try:
        start_time = time.time()
        
        results = syllabus_service.search_syllabus(
            query=request.query,
            chapter_filter=request.chapter_filter,
            difficulty_filter=request.difficulty_filter
        )
        
        search_time_ms = (time.time() - start_time) * 1000
        
        return SyllabusSearchResponse(
            results=results,
            total_results=len(results),
            query=request.query,
            search_time_ms=round(search_time_ms, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/search", response_model=SyllabusSearchResponse)
async def search_syllabus_get(
    q: str = Query(..., description="Search query"),
    chapter: Optional[str] = Query(None, description="Filter by chapter"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (comma-separated)"),
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Search syllabus content via GET request (for URL-based searches)"""
    try:
        start_time = time.time()
        
        difficulty_filter = None
        if difficulty:
            difficulty_filter = [d.strip() for d in difficulty.split(",")]
        
        results = syllabus_service.search_syllabus(
            query=q,
            chapter_filter=chapter,
            difficulty_filter=difficulty_filter
        )
        
        search_time_ms = (time.time() - start_time) * 1000
        
        return SyllabusSearchResponse(
            results=results,
            total_results=len(results),
            query=q,
            search_time_ms=round(search_time_ms, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/chapters/{chapter_title}")
async def get_chapter_by_title(
    chapter_title: str,
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Get a specific chapter by title"""
    try:
        chapter = syllabus_service.get_chapter_by_title(chapter_title)
        
        if not chapter:
            raise HTTPException(status_code=404, detail=f"Chapter '{chapter_title}' not found")
        
        return chapter
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chapter: {str(e)}")

@router.post("/bookmarks", response_model=SyllabusBookmarkResponse)
async def create_bookmark(
    request: BookmarkCreateRequest,
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Create a new bookmark"""
    try:
        bookmark = syllabus_service.add_bookmark(
            title=request.title,
            page_number=request.page_number,
            chapter_title=request.chapter_title,
            section_name=request.section_name,
            user_id=request.user_id
        )
        return bookmark
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create bookmark: {str(e)}")

@router.get("/bookmarks", response_model=BookmarksListResponse)
async def get_bookmarks(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Get all bookmarks"""
    try:
        bookmarks = syllabus_service.get_bookmarks(user_id=user_id)
        
        return BookmarksListResponse(
            bookmarks=bookmarks,
            total_count=len(bookmarks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve bookmarks: {str(e)}")

@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: str,
    syllabus_service: SyllabusService = Depends(get_syllabus_service)
):
    """Delete a bookmark"""
    try:
        success = syllabus_service.delete_bookmark(bookmark_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        
        return {"message": "Bookmark deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete bookmark: {str(e)}")

# Health check endpoint
@router.get("/health")
async def syllabus_health_check():
    """Health check for syllabus service"""
    return {
        "status": "healthy",
        "service": "syllabus",
        "timestamp": time.time()
    }

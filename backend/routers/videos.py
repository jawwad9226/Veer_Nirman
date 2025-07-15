"""
Video management API endpoints for NCC ABYAS
Handles video CRUD operations, search, categories, and progress tracking
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime
import asyncio

from models.video_models import (
    Video, VideoCreate, VideoUpdate, VideoResponse,
    Category, CategoryCreate, CategoryResponse,
    VideoProgress, VideoProgressUpdate,
    VideoAnalytics, SearchFilters, VideoSearchResponse
)
from services.youtube_service import YouTubeService

router = APIRouter(prefix="/videos", tags=["videos"])

# Data file paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
VIDEOS_FILE = os.path.join(DATA_DIR, "videos.json")
CATEGORIES_FILE = os.path.join(DATA_DIR, "categories.json")
PROGRESS_FILE = os.path.join(DATA_DIR, "video_progress.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize YouTube service
youtube_service = YouTubeService()

# Helper functions for data persistence
def load_videos() -> List[Dict[str, Any]]:
    """Load videos from JSON file"""
    if os.path.exists(VIDEOS_FILE):
        with open(VIDEOS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_videos(videos: List[Dict[str, Any]]):
    """Save videos to JSON file"""
    with open(VIDEOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)

def load_categories() -> List[Dict[str, Any]]:
    """Load categories from JSON file"""
    if os.path.exists(CATEGORIES_FILE):
        with open(CATEGORIES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return [
        {"id": "general", "name": "General", "description": "General military training"},
        {"id": "drill", "name": "Drill & Ceremony", "description": "Military drill and ceremonies"},
        {"id": "leadership", "name": "Leadership", "description": "Leadership training and development"},
        {"id": "academics", "name": "Academics", "description": "Academic subjects and coursework"}
    ]

def save_categories(categories: List[Dict[str, Any]]):
    """Save categories to JSON file"""
    with open(CATEGORIES_FILE, 'w', encoding='utf-8') as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)

def load_progress() -> Dict[str, Any]:
    """Load user progress from JSON file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_progress(progress: Dict[str, Any]):
    """Save user progress to JSON file"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)

# Video CRUD endpoints
@router.get("/", response_model=List[VideoResponse])
async def get_videos(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of videos to return"),
    offset: int = Query(0, ge=0, description="Number of videos to skip")
):
    """Get all videos with optional filtering"""
    videos_data = load_videos()
    
    # Filter by category
    if category:
        videos_data = [v for v in videos_data if v.get("category_id") == category]
    
    # Search filter
    if search:
        search_lower = search.lower()
        videos_data = [
            v for v in videos_data 
            if (search_lower in v.get("title", "").lower() or 
                search_lower in v.get("description", "").lower() or
                search_lower in " ".join(v.get("tags", [])).lower())
        ]
    
    # Apply pagination
    total = len(videos_data)
    videos_data = videos_data[offset:offset + limit]
    
    # Convert to response models
    videos = []
    for video_data in videos_data:
        try:
            video = VideoResponse(**video_data)
            videos.append(video)
        except Exception as e:
            print(f"Error converting video data: {e}")
            continue
    
    return videos

@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str):
    """Get a specific video by ID"""
    videos_data = load_videos()
    
    for video_data in videos_data:
        if video_data.get("id") == video_id:
            try:
                return VideoResponse(**video_data)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Invalid video data: {e}")
    
    raise HTTPException(status_code=404, detail="Video not found")

@router.post("/", response_model=VideoResponse)
async def create_video(video: VideoCreate, background_tasks: BackgroundTasks):
    """Create a new video"""
    videos_data = load_videos()
    
    # Generate ID
    video_id = f"video_{len(videos_data) + 1}_{int(datetime.now().timestamp())}"
    
    # Create video data
    video_data = video.dict()
    video_data["id"] = video_id
    video_data["created_at"] = datetime.now().isoformat()
    video_data["updated_at"] = datetime.now().isoformat()
    
    # If it's a YouTube URL, enrich with metadata
    if video.url and "youtube.com" in video.url or "youtu.be" in video.url:
        background_tasks.add_task(enrich_video_metadata, video_id)
    
    videos_data.append(video_data)
    save_videos(videos_data)
    
    return VideoResponse(**video_data)

@router.put("/{video_id}", response_model=VideoResponse)
async def update_video(video_id: str, video_update: VideoUpdate):
    """Update an existing video"""
    videos_data = load_videos()
    
    for i, video_data in enumerate(videos_data):
        if video_data.get("id") == video_id:
            # Update fields
            update_data = video_update.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.now().isoformat()
            
            videos_data[i].update(update_data)
            save_videos(videos_data)
            
            return VideoResponse(**videos_data[i])
    
    raise HTTPException(status_code=404, detail="Video not found")

@router.delete("/{video_id}")
async def delete_video(video_id: str):
    """Delete a video"""
    videos_data = load_videos()
    
    for i, video_data in enumerate(videos_data):
        if video_data.get("id") == video_id:
            videos_data.pop(i)
            save_videos(videos_data)
            return {"message": "Video deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Video not found")

# Category endpoints
@router.get("/categories/", response_model=List[CategoryResponse])
async def get_categories():
    """Get all video categories"""
    categories_data = load_categories()
    return [CategoryResponse(**cat) for cat in categories_data]

@router.post("/categories/", response_model=CategoryResponse)
async def create_category(category: CategoryCreate):
    """Create a new category"""
    categories_data = load_categories()
    
    # Check if category ID already exists
    for cat in categories_data:
        if cat.get("id") == category.id:
            raise HTTPException(status_code=400, detail="Category ID already exists")
    
    category_data = category.dict()
    categories_data.append(category_data)
    save_categories(categories_data)
    
    return CategoryResponse(**category_data)

# Progress tracking endpoints
@router.get("/progress/{user_id}", response_model=Dict[str, VideoProgress])
async def get_user_progress(user_id: str):
    """Get video progress for a user"""
    progress_data = load_progress()
    user_progress = progress_data.get(user_id, {})
    
    # Convert to VideoProgress models
    result = {}
    for video_id, prog_data in user_progress.items():
        try:
            result[video_id] = VideoProgress(**prog_data)
        except Exception:
            continue
    
    return result

@router.post("/progress/{user_id}/{video_id}")
async def update_video_progress(
    user_id: str, 
    video_id: str, 
    progress_update: VideoProgressUpdate
):
    """Update video progress for a user"""
    progress_data = load_progress()
    
    if user_id not in progress_data:
        progress_data[user_id] = {}
    
    if video_id not in progress_data[user_id]:
        progress_data[user_id][video_id] = {
            "video_id": video_id,
            "user_id": user_id,
            "watch_time": 0,
            "completed": False,
            "last_position": 0,
            "started_at": datetime.now().isoformat(),
            "completed_at": None
        }
    
    # Update progress
    current_progress = progress_data[user_id][video_id]
    update_data = progress_update.dict(exclude_unset=True)
    
    if update_data.get("completed") and not current_progress.get("completed"):
        update_data["completed_at"] = datetime.now().isoformat()
    
    current_progress.update(update_data)
    save_progress(progress_data)
    
    return {"message": "Progress updated successfully"}

# Search and analytics endpoints
@router.post("/search", response_model=VideoSearchResponse)
async def search_videos(filters: SearchFilters):
    """Advanced video search with filters"""
    videos_data = load_videos()
    results = []
    
    for video_data in videos_data:
        video = VideoResponse(**video_data)
        
        # Apply filters
        if filters.query:
            query_lower = filters.query.lower()
            if not (query_lower in video.title.lower() or 
                   query_lower in video.description.lower() or
                   any(query_lower in tag.lower() for tag in video.tags)):
                continue
        
        if filters.category_id and video.category_id != filters.category_id:
            continue
        
        if filters.min_duration and video.duration < filters.min_duration:
            continue
        
        if filters.max_duration and video.duration > filters.max_duration:
            continue
        
        if filters.tags and not any(tag in video.tags for tag in filters.tags):
            continue
        
        results.append(video)
    
    # Sort results
    if filters.sort_by == "date":
        results.sort(key=lambda x: x.created_at, reverse=True)
    elif filters.sort_by == "duration":
        results.sort(key=lambda x: x.duration or 0)
    elif filters.sort_by == "title":
        results.sort(key=lambda x: x.title.lower())
    
    # Apply pagination
    total = len(results)
    start = (filters.page - 1) * filters.page_size
    end = start + filters.page_size
    results = results[start:end]
    
    return VideoSearchResponse(
        videos=results,
        total=total,
        page=filters.page,
        page_size=filters.page_size,
        total_pages=(total + filters.page_size - 1) // filters.page_size
    )

@router.get("/analytics/{video_id}", response_model=VideoAnalytics)
async def get_video_analytics(video_id: str):
    """Get analytics for a specific video"""
    progress_data = load_progress()
    
    total_views = 0
    total_completions = 0
    total_watch_time = 0
    avg_completion_rate = 0.0
    
    # Calculate analytics from progress data
    for user_id, user_progress in progress_data.items():
        if video_id in user_progress:
            video_progress = user_progress[video_id]
            total_views += 1
            total_watch_time += video_progress.get("watch_time", 0)
            
            if video_progress.get("completed"):
                total_completions += 1
    
    if total_views > 0:
        avg_completion_rate = total_completions / total_views
    
    return VideoAnalytics(
        video_id=video_id,
        total_views=total_views,
        total_completions=total_completions,
        avg_completion_rate=avg_completion_rate,
        total_watch_time=total_watch_time
    )

# Background task for YouTube metadata enrichment
async def enrich_video_metadata(video_id: str):
    """Background task to enrich video with YouTube metadata"""
    try:
        videos_data = load_videos()
        
        for i, video_data in enumerate(videos_data):
            if video_data.get("id") == video_id:
                url = video_data.get("url")
                if url:
                    metadata = await youtube_service.get_video_metadata(url)
                    if metadata:
                        # Update video with metadata
                        videos_data[i].update({
                            "title": metadata.get("title", video_data.get("title")),
                            "description": metadata.get("description", video_data.get("description")),
                            "duration": metadata.get("duration", video_data.get("duration")),
                            "thumbnail_url": metadata.get("thumbnail_url", video_data.get("thumbnail_url")),
                            "tags": list(set((video_data.get("tags", []) + metadata.get("tags", [])))),
                            "updated_at": datetime.now().isoformat()
                        })
                        save_videos(videos_data)
                break
    except Exception as e:
        print(f"Error enriching video metadata: {e}")

# Utility endpoints
@router.post("/import-from-json")
async def import_videos_from_json(background_tasks: BackgroundTasks):
    """Import videos from original videos.json file"""
    try:
        # Path to original videos.json
        original_videos_path = "/home/jawwad-linux/Documents/NCC_ABYAS/data/videos.json"
        
        if not os.path.exists(original_videos_path):
            raise HTTPException(status_code=404, detail="Original videos.json not found")
        
        with open(original_videos_path, 'r', encoding='utf-8') as f:
            original_videos = json.load(f)
        
        current_videos = load_videos()
        
        # Convert and import videos
        imported_count = 0
        for orig_video in original_videos:
            # Check if video already exists
            existing = any(v.get("url") == orig_video.get("url") for v in current_videos)
            if existing:
                continue
            
            # Convert to new format
            video_data = {
                "id": f"imported_{imported_count}_{int(datetime.now().timestamp())}",
                "title": orig_video.get("title", "Untitled"),
                "description": orig_video.get("description", ""),
                "url": orig_video.get("url", ""),
                "category_id": orig_video.get("category", "general"),
                "tags": orig_video.get("tags", []),
                "duration": orig_video.get("duration"),
                "thumbnail_url": orig_video.get("thumbnail"),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "is_featured": False,
                "difficulty_level": "beginner",
                "instructor": orig_video.get("instructor", ""),
                "prerequisites": []
            }
            
            current_videos.append(video_data)
            imported_count += 1
            
            # Schedule metadata enrichment for YouTube videos
            if video_data["url"] and ("youtube.com" in video_data["url"] or "youtu.be" in video_data["url"]):
                background_tasks.add_task(enrich_video_metadata, video_data["id"])
        
        save_videos(current_videos)
        
        return {
            "message": f"Successfully imported {imported_count} videos",
            "total_videos": len(current_videos)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

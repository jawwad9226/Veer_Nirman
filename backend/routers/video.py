from fastapi import Request
"""
Video API Router for NCC ABYAS
Provides endpoints for video listing and categories
"""
from fastapi import APIRouter, HTTPException
from typing import List
import os
import json
from app_models import VideoModel, VideoListResponse, VideoCategoryModel, VideoCategoriesResponse

router = APIRouter()

# Stub endpoint for video progress update (to avoid frontend errors)
@router.post("/videos/progress/{user_id}/{video_id}")
async def update_video_progress(user_id: str, video_id: str, request: Request):
    # Accept and ignore the posted data for now
    _ = await request.json()
    return {"success": True, "message": "Progress updated (stub)"}

VIDEOS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "videos.json")

def load_videos_json():
    if not os.path.exists(VIDEOS_PATH):
        raise HTTPException(status_code=404, detail="Videos data not found")
    with open(VIDEOS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/videos", response_model=VideoListResponse)
def get_videos():
    import re
    from datetime import datetime
    def parse_duration(d):
        if not d:
            return None
        if isinstance(d, int):
            return d
        if isinstance(d, str):
            # Try HH:MM:SS or MM:SS
            if d.startswith('PT'):
                # ISO 8601 duration (e.g., PT8M54S)
                match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d)
                if match:
                    h = int(match.group(1) or 0)
                    m = int(match.group(2) or 0)
                    s = int(match.group(3) or 0)
                    return h * 3600 + m * 60 + s
            elif ':' in d:
                parts = d.split(':')
                if len(parts) == 3:
                    h, m, s = map(int, parts)
                    return h * 3600 + m * 60 + s
                elif len(parts) == 2:
                    m, s = map(int, parts)
                    return m * 60 + s
            try:
                return int(d)
            except Exception:
                return None
        return None

    data = load_videos_json()
    videos = []
    now = datetime.utcnow().isoformat() + 'Z'
    def get_youtube_thumbnail(url):
        # Extract YouTube video ID from various URL formats
        patterns = [
            r'youtu\.be/([^?&]+)',
            r'youtube\.com/watch\\?v=([^?&]+)',
            r'youtube\.com/embed/([^?&]+)',
            r'youtube\.com/v/([^?&]+)'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return f'https://img.youtube.com/vi/{match.group(1)}/hqdefault.jpg'
        return None

    for category, items in data.items():
        if category == "version":
            continue
        for item in items:
            # Auto-fetch YouTube thumbnail if not present
            thumbnail = item.get("thumbnail")
            if not thumbnail and ("youtube.com" in item["url"] or "youtu.be" in item["url"]):
                thumbnail = get_youtube_thumbnail(item["url"])
            # Compose the video dict to match frontend Video type
            video = {
                "id": item.get("id") or item.get("url"),
                "url": item["url"],
                "title": item.get("title_override") or item.get("title") or "Untitled Video",
                "description": item.get("description_override") or item.get("description") or "",
                "tags": item.get("tags", []),
                "duration": parse_duration(item.get("duration")),
                "category_id": item.get("category") or category,
                "thumbnail_url": thumbnail,
                "created_at": item.get("created_at", now),
                "updated_at": item.get("updated_at", now),
                "instructor": item.get("instructor", ""),
                "difficulty_level": item.get("difficulty_level", "beginner"),
                "is_featured": item.get("is_featured", False),
                "prerequisites": item.get("prerequisites", []),
            }
            videos.append(video)
    return {"videos": videos, "total": len(videos)}

@router.get("/videos/categories", response_model=VideoCategoriesResponse)
def get_video_categories():
    data = load_videos_json()
    categories = []
    for category, items in data.items():
        if category == "version":
            continue
        categories.append(VideoCategoryModel(name=category, video_count=len(items)))
    return VideoCategoriesResponse(categories=categories)

# Video system data models for the NCC ABYAS backend

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from enum import Enum

class VideoCategory(str, Enum):
    """Video categories enum"""
    NCC_BASICS = "NCC Basics"
    DRILL_PARADE = "Drill and Parade"
    MAP_READING = "Map Reading"
    WEAPON_TRAINING = "Weapon Training"
    FIRST_AID = "First Aid"
    LEADERSHIP = "Leadership"
    SOCIAL_SERVICE = "Social Service"
    LOCAL_VIDEOS = "Local Videos"
    FIELD_CRAFT = "Field Craft"
    ADVENTURE_ACTIVITIES = "Adventure Activities"

class VideoQuality(str, Enum):
    """Video quality options"""
    LOW = "360p"
    MEDIUM = "480p"
    HIGH = "720p"
    HD = "1080p"

class VideoSource(str, Enum):
    """Video source types"""
    YOUTUBE = "youtube"
    LOCAL = "local"
    VIMEO = "vimeo"
    DIRECT_URL = "direct_url"

# Base Video Model
class VideoBase(BaseModel):
    """Base video model with common fields"""
    title: str = Field(..., min_length=1, max_length=200, description="Video title")
    description: Optional[str] = Field(None, max_length=2000, description="Video description")
    category: VideoCategory = Field(..., description="Video category")
    tags: List[str] = Field(default_factory=list, description="Video tags")
    duration: Optional[str] = Field(None, description="Video duration (HH:MM:SS or MM:SS)")
    thumbnail: Optional[str] = Field(None, description="Thumbnail URL or path")
    source: VideoSource = Field(default=VideoSource.YOUTUBE, description="Video source type")

class VideoCreate(VideoBase):
    """Model for creating a new video"""
    url: str = Field(..., description="Video URL")
    youtube_id: Optional[str] = Field(None, description="YouTube video ID (auto-extracted)")
    manual_metadata: bool = Field(default=False, description="Whether metadata was manually entered")

class VideoUpdate(BaseModel):
    """Model for updating video"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[VideoCategory] = None
    tags: Optional[List[str]] = None
    thumbnail: Optional[str] = None
    url: Optional[str] = None

class Video(VideoBase):
    """Complete video model"""
    id: str = Field(..., description="Unique video identifier")
    url: str = Field(..., description="Video URL")
    youtube_id: Optional[str] = Field(None, description="YouTube video ID")
    view_count: int = Field(default=0, description="Number of views")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")
    is_active: bool = Field(default=True, description="Whether video is active")
    
    class Config:
        from_attributes = True

# Response Models
class VideoResponse(Video):
    """Video response model with additional metadata"""
    watch_url: str = Field(..., description="Direct watch URL")
    embed_url: Optional[str] = Field(None, description="Embed URL for iframe")
    download_available: bool = Field(default=False, description="Whether download is available")

class VideosResponse(BaseModel):
    """Response model for multiple videos"""
    videos: List[VideoResponse]
    total_count: int
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=50)
    total_pages: int
    categories: List[str]
    
class VideoSearchRequest(BaseModel):
    """Video search request model"""
    query: Optional[str] = Field(None, min_length=1, max_length=100, description="Search query")
    category: Optional[VideoCategory] = Field(None, description="Filter by category")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=12, ge=1, le=50, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$", description="Sort order")

class SearchFilters(BaseModel):
    """Advanced search filters"""
    query: Optional[str] = Field(None, description="Search query")
    category_id: Optional[str] = Field(None, description="Filter by category")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    min_duration: Optional[int] = Field(None, ge=0, description="Minimum duration in seconds")
    max_duration: Optional[int] = Field(None, ge=0, description="Maximum duration in seconds")
    sort_by: str = Field(default="created_at", description="Sort field")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=12, ge=1, le=50, description="Items per page")

class VideoSearchResponse(BaseModel):
    """Video search response"""
    videos: List[VideoResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class VideoAnalytics(BaseModel):
    """Video analytics data"""
    video_id: str
    total_views: int
    total_completions: int
    avg_completion_rate: float
    total_watch_time: int
    last_updated: datetime = Field(default_factory=datetime.now)

# YouTube API Models
class YouTubeVideoInfo(BaseModel):
    """YouTube video information from API"""
    id: str
    title: str
    description: str
    duration: str
    thumbnail: str
    tags: List[str]
    view_count: int
    published_at: datetime
    channel_title: str

class YouTubeSearchRequest(BaseModel):
    """YouTube search request"""
    video_url: str = Field(..., description="YouTube video URL or ID")
    fetch_metadata: bool = Field(default=True, description="Whether to fetch metadata from YouTube")

# Video Progress Tracking
class VideoProgress(BaseModel):
    """Video watching progress"""
    video_id: str
    user_id: str
    progress_seconds: int = Field(ge=0, description="Progress in seconds")
    duration_seconds: Optional[int] = Field(None, ge=0, description="Total duration in seconds")
    completed: bool = Field(default=False, description="Whether video is completed")
    last_watched: datetime = Field(default_factory=datetime.now)
    
class VideoProgressUpdate(BaseModel):
    """Update video progress"""
    progress_seconds: int = Field(ge=0)
    duration_seconds: Optional[int] = Field(None, ge=0)

# Statistics and Analytics
class VideoStats(BaseModel):
    """Video statistics"""
    video_id: str
    view_count: int
    average_watch_time: float
    completion_rate: float
    likes: int = Field(default=0)
    dislikes: int = Field(default=0)
    comments_count: int = Field(default=0)

class CategoryStats(BaseModel):
    """Category statistics"""
    category: str
    video_count: int
    total_views: int
    average_duration: str
    most_popular_video: Optional[VideoResponse]

class VideoDashboardStats(BaseModel):
    """Overall video system statistics"""
    total_videos: int
    total_views: int
    total_categories: int
    most_viewed_category: str
    recent_videos: List[VideoResponse]
    popular_videos: List[VideoResponse]
    category_breakdown: List[CategoryStats]

# Error Models
class VideoError(BaseModel):
    """Video operation error"""
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class VideoValidationError(BaseModel):
    """Video validation error"""
    field: str
    message: str
    invalid_value: Any

# Admin Models
class VideoAdminCreate(VideoCreate):
    """Admin video creation with additional fields"""
    featured: bool = Field(default=False, description="Whether video is featured")
    priority: int = Field(default=0, ge=0, le=10, description="Display priority")
    access_level: str = Field(default="public", pattern="^(public|premium|admin)$")

class VideoAdminResponse(VideoResponse):
    """Admin video response with additional metadata"""
    featured: bool
    priority: int
    access_level: str
    created_by: Optional[str]
    last_modified_by: Optional[str]
    metadata_source: str  # manual, youtube_api, etc.

class BulkVideoOperation(BaseModel):
    """Bulk video operations"""
    video_ids: List[str] = Field(..., min_items=1, max_items=50)
    operation: str = Field(..., pattern="^(delete|activate|deactivate|update_category)$")
    parameters: Optional[Dict[str, Any]] = None

class VideoImportRequest(BaseModel):
    """Video import from external source"""
    source_type: str = Field(..., pattern="^(youtube_playlist|csv_file|json_file)$")
    source_url: Optional[str] = None
    file_content: Optional[str] = None
    default_category: VideoCategory
    auto_categorize: bool = Field(default=False)

# Category models
class CategoryBase(BaseModel):
    """Base category model"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=50)

class CategoryCreate(CategoryBase):
    """Category creation model"""
    id: str = Field(..., min_length=1, max_length=50, pattern="^[a-z0-9_]+$")

class Category(CategoryBase):
    """Full category model"""
    id: str
    created_at: datetime
    updated_at: datetime
    video_count: int = Field(default=0)

class CategoryResponse(Category):
    """Category response model"""
    pass

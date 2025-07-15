# YouTube API service for NCC ABYAS video system

import os
import re
import asyncio
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import httpx
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import isodate

from models.video_models import YouTubeVideoInfo, VideoSource

class YouTubeService:
    """Service for interacting with YouTube Data API"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY")
        self.youtube = None
        if self.api_key:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.api_key)
            except Exception as e:
                print(f"Failed to initialize YouTube API: {e}")
        
    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract YouTube video ID from various URL formats
        
        Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - https://www.youtube.com/v/VIDEO_ID
        - Direct VIDEO_ID
        """
        if not url:
            return None
            
        # URL patterns for YouTube video ID extraction
        patterns = [
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})',
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        # Check if the URL itself is a valid YouTube ID
        if re.fullmatch(r'[a-zA-Z0-9_-]{11}', url.strip()):
            return url.strip()
            
        return None
    
    def is_youtube_url(self, url: str) -> bool:
        """Check if URL is a YouTube URL"""
        return self.extract_video_id(url) is not None
    
    def get_video_source(self, url: str) -> VideoSource:
        """Determine video source from URL"""
        if self.is_youtube_url(url):
            return VideoSource.YOUTUBE
        elif 'vimeo.com' in url.lower():
            return VideoSource.VIMEO
        elif url.startswith(('http://', 'https://')):
            return VideoSource.DIRECT_URL
        else:
            return VideoSource.LOCAL
    
    def format_duration(self, iso_duration: str) -> str:
        """
        Convert ISO 8601 duration (PT1H2M3S) to readable format (1:02:03)
        """
        try:
            duration = isodate.parse_duration(iso_duration)
            total_seconds = int(duration.total_seconds())
            
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes:02d}:{seconds:02d}"
        except Exception:
            return iso_duration
    
    async def fetch_video_metadata(self, video_id: str) -> Optional[YouTubeVideoInfo]:
        """
        Fetch video metadata from YouTube API for a single video
        """
        if not self.youtube or not video_id:
            return None
            
        try:
            request = self.youtube.videos().list(
                part='snippet,contentDetails,statistics',
                id=video_id
            )
            response = request.execute()
            
            if not response.get('items'):
                return None
                
            item = response['items'][0]
            snippet = item['snippet']
            content_details = item['contentDetails']
            statistics = item.get('statistics', {})
            
            return YouTubeVideoInfo(
                id=video_id,
                title=snippet['title'],
                description=snippet.get('description', ''),
                duration=self.format_duration(content_details['duration']),
                thumbnail=snippet['thumbnails'].get('high', {}).get('url', ''),
                tags=snippet.get('tags', []),
                view_count=int(statistics.get('viewCount', 0)),
                published_at=datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00')),
                channel_title=snippet.get('channelTitle', '')
            )
            
        except HttpError as e:
            print(f"YouTube API error for video {video_id}: {e}")
            return None
        except Exception as e:
            print(f"Error fetching YouTube metadata for {video_id}: {e}")
            return None
    
    async def fetch_multiple_videos_metadata(self, video_ids: List[str]) -> List[YouTubeVideoInfo]:
        """
        Fetch metadata for multiple videos in batch (more efficient)
        """
        if not self.youtube or not video_ids:
            return []
            
        # YouTube API allows up to 50 IDs per request
        batch_size = 50
        all_videos = []
        
        for i in range(0, len(video_ids), batch_size):
            batch_ids = video_ids[i:i + batch_size]
            
            try:
                request = self.youtube.videos().list(
                    part='snippet,contentDetails,statistics',
                    id=','.join(batch_ids)
                )
                response = request.execute()
                
                for item in response.get('items', []):
                    video_id = item['id']
                    snippet = item['snippet']
                    content_details = item['contentDetails']
                    statistics = item.get('statistics', {})
                    
                    video_info = YouTubeVideoInfo(
                        id=video_id,
                        title=snippet['title'],
                        description=snippet.get('description', ''),
                        duration=self.format_duration(content_details['duration']),
                        thumbnail=snippet['thumbnails'].get('high', {}).get('url', ''),
                        tags=snippet.get('tags', []),
                        view_count=int(statistics.get('viewCount', 0)),
                        published_at=datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00')),
                        channel_title=snippet.get('channelTitle', '')
                    )
                    all_videos.append(video_info)
                    
            except HttpError as e:
                print(f"YouTube API error for batch {batch_ids}: {e}")
                continue
            except Exception as e:
                print(f"Error fetching YouTube batch metadata: {e}")
                continue
                
        return all_videos
    
    async def search_youtube_videos(self, query: str, max_results: int = 25) -> List[str]:
        """
        Search YouTube for videos and return video IDs
        """
        if not self.youtube or not query:
            return []
            
        try:
            request = self.youtube.search().list(
                part='id',
                type='video',
                q=query,
                maxResults=min(max_results, 50),
                order='relevance'
            )
            response = request.execute()
            
            video_ids = []
            for item in response.get('items', []):
                if item['id']['kind'] == 'youtube#video':
                    video_ids.append(item['id']['videoId'])
                    
            return video_ids
            
        except HttpError as e:
            print(f"YouTube search error: {e}")
            return []
        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return []
    
    def get_embed_url(self, video_id: str, autoplay: bool = False, start_time: int = 0) -> str:
        """Generate YouTube embed URL"""
        params = []
        if autoplay:
            params.append("autoplay=1")
        if start_time > 0:
            params.append(f"start={start_time}")
            
        query_string = "&".join(params)
        base_url = f"https://www.youtube.com/embed/{video_id}"
        
        return f"{base_url}?{query_string}" if query_string else base_url
    
    def get_watch_url(self, video_id: str, start_time: int = 0) -> str:
        """Generate YouTube watch URL"""
        base_url = f"https://www.youtube.com/watch?v={video_id}"
        return f"{base_url}&t={start_time}s" if start_time > 0 else base_url
    
    def get_thumbnail_url(self, video_id: str, quality: str = "hqdefault") -> str:
        """
        Generate YouTube thumbnail URL
        
        Quality options:
        - default: 120x90
        - mqdefault: 320x180  
        - hqdefault: 480x360
        - sddefault: 640x480
        - maxresdefault: 1280x720 (if available)
        """
        return f"https://img.youtube.com/vi/{video_id}/{quality}.jpg"
    
    async def validate_video_url(self, url: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validate video URL and return (is_valid, video_id, error_message)
        """
        video_id = self.extract_video_id(url)
        
        if not video_id:
            return False, None, "Invalid YouTube URL format"
        
        # Check if video exists and is accessible
        metadata = await self.fetch_video_metadata(video_id)
        if not metadata:
            return False, video_id, "Video not found or not accessible"
            
        return True, video_id, None
    
    async def get_video_info_from_url(self, url: str) -> Optional[YouTubeVideoInfo]:
        """
        Get complete video information from URL
        """
        video_id = self.extract_video_id(url)
        if not video_id:
            return None
            
        return await self.fetch_video_metadata(video_id)

# Create a global instance
youtube_service = YouTubeService()

# Utility functions for backward compatibility
async def fetch_youtube_videos(video_ids: List[str], api_key: Optional[str] = None) -> List[Dict]:
    """
    Legacy function for backward compatibility with original implementation
    """
    service = YouTubeService(api_key) if api_key else youtube_service
    videos_info = await service.fetch_multiple_videos_metadata(video_ids)
    
    # Convert to legacy format
    legacy_format = []
    for video in videos_info:
        legacy_format.append({
            'id': video.id,
            'title': video.title,
            'description': video.description,
            'duration': video.duration,
            'thumbnail': video.thumbnail,
            'tags': video.tags
        })
    
    return legacy_format

def extract_youtube_id(url: str) -> Optional[str]:
    """Legacy function for backward compatibility"""
    return youtube_service.extract_video_id(url)

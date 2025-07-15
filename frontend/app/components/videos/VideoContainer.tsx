       'use client';

import React, { useState, useEffect } from 'react';
import './videos-glass.css';
import VideoGrid from './VideoGrid';
import VideoPlayer from './VideoPlayer';
import { videoApi, categoryApi, progressApi, Video, Category } from './api';

interface VideoProgress {
  currentTime: number;
  duration: number;
  completed: boolean;
}

const VideoContainer: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  // For scroll lock on modal open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  // Keyboard navigation: close modal on Escape
  useEffect(() => {
    if (!selectedVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [videosData, categoriesData] = await Promise.all([
        videoApi.getVideos(),
        categoryApi.getCategories()
      ]);
      
      setVideos(Array.isArray(videosData) ? videosData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setFilteredVideos(Array.isArray(videosData) ? videosData : []);
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setCurrentSearch(query);
    filterVideos(query, currentCategory);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setCurrentCategory(categoryId);
    filterVideos(currentSearch, categoryId);
  } 

  // Add a reset for category filter
  const handleResetCategory = () => {
    setCurrentCategory(null);
    filterVideos(currentSearch, null);
  };

  const filterVideos = (search: string, category: string | null) => {
    let filtered = videos;

    // Filter by category
    if (category) {
      filtered = filtered.filter(video => video.category_id === category);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchLower) ||
        video.description.toLowerCase().includes(searchLower) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        (video.instructor && video.instructor.toLowerCase().includes(searchLower))
      );
    }

    setFilteredVideos(filtered);
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handleVideoProgress = async (progress: VideoProgress) => {
    if (selectedVideo) {
      try {
        await progressApi.updateVideoProgress(
          'user123', // In real implementation, get from auth context
          selectedVideo.id,
          {
            watch_time: progress.currentTime,
            completed: progress.completed,
            last_position: progress.currentTime
          }
        );
      } catch (error) {
        console.error('Failed to update video progress:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="header-aware-content bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="header-aware-content bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Videos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-glass header-aware-content">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <span className="relative z-10">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto"><rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" className="text-blue-600"/><polygon points="10,9 16,12 10,15" fill="#fff"/></svg>
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2 mb-4">
            Video Training Library
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Access comprehensive video training materials for NCC cadets.
            {filteredVideos.length > 0 && (
              <span className="ml-2">
                Showing {filteredVideos.length} of {videos.length} videos
              </span>
            )}
          </p>
        </div>

        {/* Category Filter Reset Button */}
        <div className="flex justify-end mb-4">
          {currentCategory && (
            <button
              onClick={handleResetCategory}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:bg-gray-300"
              aria-label="Show all categories"
            >
              Show All
            </button>
          )}
        </div>

        {/* Video Grid */}
        <VideoGrid
          videos={filteredVideos}
          categories={categories}
          onVideoSelect={handleVideoSelect}
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
        />

        {/* Video Player Modal with accessibility improvements */}
        {selectedVideo && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedVideo.title}
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.2s' }}
          >
            <VideoPlayer
              video={selectedVideo}
              onClose={handleClosePlayer}
              onProgress={handleVideoProgress}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoContainer;

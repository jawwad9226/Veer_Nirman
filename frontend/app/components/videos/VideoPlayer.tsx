'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings } from 'lucide-react';
import { Video } from './api';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onProgress?: (progress: { currentTime: number; duration: number; completed: boolean }) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose, onProgress }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const isYouTubeVideo = video.url.includes('youtube.com') || video.url.includes('youtu.be');
  const youtubeVideoId = isYouTubeVideo ? getYouTubeVideoId(video.url) : null;

  useEffect(() => {
    // Report progress to parent
    if (onProgress) {
      const completed = duration > 0 && currentTime >= duration * 0.9; // 90% completion threshold
      onProgress({ currentTime, duration, completed });
    }
  }, [currentTime, duration, onProgress]);

  useEffect(() => {
    // Auto-hide controls
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (isPlaying) {
      hideControls();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center header-aware-modal">
      <div
        className="relative w-full h-full max-w-6xl max-h-[calc(100vh-var(--combined-header-height)-2rem)]"
        ref={containerRef}
        style={{
          paddingTop: 'env(safe-area-inset-top, 80px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 80px) + 80px)', // 80px for header/bottom nav
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          style={{ top: 'max(1rem, env(safe-area-inset-top, 1rem))' }}
        >
          ✕
        </button>

        {/* Video Info */}
        <div
          className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-4 rounded-lg max-w-md"
          style={{ top: 'max(1rem, env(safe-area-inset-top, 1rem))' }}
        >
          <h2 className="text-xl font-bold mb-2">{video.title}</h2>
          <p className="text-sm text-gray-300 mb-2">{video.instructor || 'NCC Instructor'}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-blue-600 rounded">
              {video.difficulty_level}
            </span>
            {video.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-gray-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Video Container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          onMouseMove={handleMouseMove}
        >
          {isYouTubeVideo && youtubeVideoId ? (
            /* YouTube Embed */
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                borderRadius: 12,
                marginTop: 'max(0px, env(safe-area-inset-top, 0px))',
                marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))',
              }}
            />
          ) : (
            /* HTML5 Video */
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={video.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlayPause}
                style={{
                  borderRadius: 12,
                  marginTop: 'max(0px, env(safe-area-inset-top, 0px))',
                  marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))',
                }}
              />
              {/* Custom Controls */}
              {showControls && (
                <div
                  className="absolute left-0 right-0 bg-gradient-to-t from-black to-transparent p-6"
                  style={{
                    bottom: 'max(0px, calc(env(safe-area-inset-bottom, 0px) + 64px))', // 64px for bottom nav
                    paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))',
                  }}
                >
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-4 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-mobile"
                      style={{ touchAction: 'none' }}
                    />
                    <div className="flex justify-between text-white text-base mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => skipTime(-10)}
                        className="text-white hover:text-blue-400 transition-colors text-2xl p-2"
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        <SkipBack size={32} />
                      </button>
                      <button
                        onClick={togglePlayPause}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 transition-colors text-2xl"
                        style={{ minWidth: 56, minHeight: 56 }}
                      >
                        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                      </button>
                      <button
                        onClick={() => skipTime(10)}
                        className="text-white hover:text-blue-400 transition-colors text-2xl p-2"
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        <SkipForward size={32} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Volume Control */}
                      <div className="flex items-center space-x-2">
                        <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors text-2xl">
                          {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          style={{ touchAction: 'none' }}
                        />
                      </div>

                      {/* Playback Speed */}
                      <select
                        value={playbackRate}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value);
                          setPlaybackRate(rate);
                          if (videoRef.current) {
                            videoRef.current.playbackRate = rate;
                          }
                        }}
                        className="bg-gray-800 text-white rounded px-3 py-2 text-lg"
                        style={{ minWidth: 60 }}
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-blue-400 transition-colors text-2xl"
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        <Maximize size={28} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .slider-mobile::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider-mobile::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;

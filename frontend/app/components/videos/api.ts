// Video API service for frontend
// This handles all communication with the backend video API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  category_id: string;
  tags: string[];
  duration?: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  instructor?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_featured: boolean;
  prerequisites?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  video_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VideoProgress {
  video_id: string;
  user_id: string;
  watch_time: number;
  completed: boolean;
  last_position: number;
  started_at: string;
  completed_at?: string;
}

export interface VideoSearchFilters {
  query?: string;
  category_id?: string;
  tags?: string[];
  min_duration?: number;
  max_duration?: number;
  sort_by?: 'created_at' | 'title' | 'duration';
  page?: number;
  page_size?: number;
}

export interface VideoSearchResponse {
  videos: Video[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface VideoAnalytics {
  video_id: string;
  total_views: number;
  total_completions: number;
  avg_completion_rate: number;
  total_watch_time: number;
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Video CRUD operations
export const videoApi = {
  // Get all videos with optional filtering
  async getVideos(filters?: VideoSearchFilters): Promise<Video[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.query) params.append('search', filters.query);
      if (filters?.category_id) params.append('category', filters.category_id);
      if (filters?.page_size) params.append('limit', filters.page_size.toString());
      if (filters?.page) params.append('offset', ((filters.page - 1) * (filters.page_size || 12)).toString());

      const response = await fetch(`${API_BASE_URL}/videos?${params}`);
      const data = await handleApiResponse<any>(response);
      if (data && Array.isArray(data.videos)) {
        return data.videos;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Return mock data on error for development
      return getMockVideos(filters);
    }
  },

  // Get a specific video by ID
  async getVideo(id: string): Promise<Video> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${id}`);
      return handleApiResponse<Video>(response);
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Create a new video
  async createVideo(video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video)
      });
      return handleApiResponse<Video>(response);
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  // Update a video
  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return handleApiResponse<Video>(response);
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  // Delete a video
  async deleteVideo(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: 'DELETE'
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // Advanced search
  async searchVideos(filters: VideoSearchFilters): Promise<VideoSearchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      return handleApiResponse<VideoSearchResponse>(response);
    } catch (error) {
      console.error('Error searching videos:', error);
      // Return mock search response on error
      const mockVideos = getMockVideos();
      return {
        videos: mockVideos.slice(0, filters.page_size || 12),
        total: mockVideos.length,
        page: filters.page || 1,
        page_size: filters.page_size || 12,
        total_pages: Math.ceil(mockVideos.length / (filters.page_size || 12))
      };
    }
  }
};

// Category operations
export const categoryApi = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/categories/`);
      const data = await handleApiResponse<any>(response);
      if (data && Array.isArray(data.categories)) {
        // If backend returns { categories: [...] }
        return data.categories.map((cat: any) => ({
          id: cat.name, // Use name as id for compatibility
          name: cat.name,
          description: cat.name,
          video_count: cat.video_count,
        }));
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return mock categories on error
      return getMockCategories();
    }
  },

  // Create a new category
  async createCategory(category: Omit<Category, 'created_at' | 'updated_at' | 'video_count'>): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      return handleApiResponse<Category>(response);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
};

// Progress tracking operations
export const progressApi = {
  // Get user progress for all videos
  async getUserProgress(userId: string): Promise<Record<string, VideoProgress>> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/progress/${userId}`);
      return handleApiResponse<Record<string, VideoProgress>>(response);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return {};
    }
  },

  // Update video progress
  async updateVideoProgress(
    userId: string, 
    videoId: string, 
    progress: {
      watch_time?: number;
      completed?: boolean;
      last_position?: number;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/progress/${userId}/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      console.error('Error updating video progress:', error);
      // Silently fail for progress updates
    }
  }
};

// Analytics operations
export const analyticsApi = {
  // Get video analytics
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/analytics/${videoId}`);
      return handleApiResponse<VideoAnalytics>(response);
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      throw error;
    }
  }
};

// Import operations
export const importApi = {
  // Import videos from original JSON
  async importFromJson(): Promise<{ message: string; total_videos: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/import-from-json`, {
        method: 'POST'
      });
      return handleApiResponse<{ message: string; total_videos: number }>(response);
    } catch (error) {
      console.error('Error importing videos:', error);
      throw error;
    }
  }
};

// Mock data for development/fallback
function getMockCategories(): Category[] {
  return [
    { id: 'general', name: 'General', description: 'General military training', video_count: 5 },
    { id: 'drill', name: 'Drill & Ceremony', description: 'Military drill and ceremonies', video_count: 3 },
    { id: 'leadership', name: 'Leadership', description: 'Leadership training and development', video_count: 4 },
    { id: 'academics', name: 'Academics', description: 'Academic subjects and coursework', video_count: 2 }
  ];
}

function getMockVideos(filters?: VideoSearchFilters): Video[] {
  const mockVideos: Video[] = [
    {
      id: '1',
      title: 'Introduction to NCC',
      description: 'Learn the basics of National Cadet Corps, its history, and objectives.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category_id: 'general',
      tags: ['introduction', 'basics', 'history'],
      duration: 600,
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      instructor: 'Colonel Singh',
      difficulty_level: 'beginner',
      is_featured: true,
      prerequisites: []
    },
    {
      id: '2',
      title: 'Basic Drill Movements',
      description: 'Master the fundamental drill movements and formations.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category_id: 'drill',
      tags: ['drill', 'movements', 'formation'],
      duration: 900,
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-10T14:30:00Z',
      instructor: 'Major Kumar',
      difficulty_level: 'beginner',
      is_featured: false,
      prerequisites: []
    },
    {
      id: '3',
      title: 'Leadership Principles',
      description: 'Understanding the core principles of military leadership.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category_id: 'leadership',
      tags: ['leadership', 'principles', 'management'],
      duration: 1200,
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      created_at: '2024-01-05T09:15:00Z',
      updated_at: '2024-01-05T09:15:00Z',
      instructor: 'Brigadier Sharma',
      difficulty_level: 'intermediate',
      is_featured: true,
      prerequisites: ['Introduction to NCC']
    },
    {
      id: '4',
      title: 'Advanced Marching Techniques',
      description: 'Perfect your marching and parade ground skills.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category_id: 'drill',
      tags: ['marching', 'parade', 'advanced'],
      duration: 1500,
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      created_at: '2024-01-01T08:00:00Z',
      updated_at: '2024-01-01T08:00:00Z',
      instructor: 'Major Kumar',
      difficulty_level: 'advanced',
      is_featured: false,
      prerequisites: ['Basic Drill Movements']
    },
    {
      id: '5',
      title: 'Map Reading and Navigation',
      description: 'Essential navigation skills for field exercises.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category_id: 'academics',
      tags: ['navigation', 'maps', 'compass'],
      duration: 1800,
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      created_at: '2023-12-28T15:45:00Z',
      updated_at: '2023-12-28T15:45:00Z',
      instructor: 'Captain Verma',
      difficulty_level: 'intermediate',
      is_featured: true,
      prerequisites: []
    },
    {
      id: '6',
      title: 'Team Building Exercises',
      description: 'Build cohesion and teamwork among cadets.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category_id: 'leadership',
      tags: ['teamwork', 'exercises', 'cohesion'],
      duration: 1050,
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      created_at: '2023-12-25T11:30:00Z',
      updated_at: '2023-12-25T11:30:00Z',
      instructor: 'Brigadier Sharma',
      difficulty_level: 'beginner',
      is_featured: false,
      prerequisites: []
    }
  ];

  // Apply filters to mock data
  let filtered = mockVideos;

  if (filters?.category_id) {
    filtered = filtered.filter(video => video.category_id === filters.category_id);
  }

  if (filters?.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (video.instructor && video.instructor.toLowerCase().includes(query))
    );
  }

  return filtered;
}

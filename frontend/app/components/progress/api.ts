import { 
  ProgressSummary, 
  TopicPerformance, 
  LearningRecommendation, 
  RecentActivity,
  Achievement,
  ChartData,
  ProgressAnalytics,
  QuizResultRecord,
  VideoProgressRecord,
  StudySessionRecord
} from './types'

// Use your LAN IP so mobile devices can access the backend
const API_BASE = 'http://192.168.1.8:8000/api/progress'

// API functions for progress dashboard
export const progressApi = {
  // Get overall progress summary
  getSummary: async (): Promise<ProgressSummary> => {
    const response = await fetch(`${API_BASE}/summary`)
    if (!response.ok) {
      throw new Error('Failed to fetch progress summary')
    }
    return response.json()
  },

  // Get topic-wise performance
  getTopicPerformance: async (): Promise<TopicPerformance[]> => {
    const response = await fetch(`${API_BASE}/topic-performance`)
    if (!response.ok) {
      throw new Error('Failed to fetch topic performance')
    }
    return response.json()
  },

  // Get recent learning activities
  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await fetch(`${API_BASE}/recent-activity?limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity')
    }
    return response.json()
  },

  // Get learning recommendations
  getRecommendations: async (): Promise<LearningRecommendation[]> => {
    const response = await fetch(`${API_BASE}/recommendations`)
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations')
    }
    return response.json()
  },

  // Get achievements/badges
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await fetch(`${API_BASE}/achievements`)
    if (!response.ok) {
      throw new Error('Failed to fetch achievements')
    }
    return response.json()
  },

  // Get chart data
  getChartsData: async (): Promise<ChartData> => {
    const response = await fetch(`${API_BASE}/charts-data`)
    if (!response.ok) {
      throw new Error('Failed to fetch charts data')
    }
    return response.json()
  },

  // Get complete analytics (all data in one call)
  getCompleteAnalytics: async (): Promise<ProgressAnalytics> => {
    const response = await fetch(`${API_BASE}/analytics`)
    if (!response.ok) {
      throw new Error('Failed to fetch progress analytics')
    }
    return response.json()
  },

  // Record new quiz result
  recordQuizResult: async (result: QuizResultRecord): Promise<{ message: string; id: string }> => {
    const response = await fetch(`${API_BASE}/quiz-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    })
    
    if (!response.ok) {
      throw new Error('Failed to record quiz result')
    }
    return response.json()
  },

  // Record video progress
  recordVideoProgress: async (progress: VideoProgressRecord): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/video-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
    })
    
    if (!response.ok) {
      throw new Error('Failed to record video progress')
    }
    return response.json()
  },

  // Record study session
  recordStudySession: async (session: StudySessionRecord): Promise<{ message: string; session_id: string }> => {
    const response = await fetch(`${API_BASE}/study-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    })
    
    if (!response.ok) {
      throw new Error('Failed to record study session')
    }
    return response.json()
  }
}

// Utility functions
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const getMasteryColor = (level: string): string => {
  switch (level) {
    case 'expert':
      return 'text-purple-700 bg-purple-100'
    case 'advanced':
      return 'text-blue-700 bg-blue-100'
    case 'intermediate':
      return 'text-green-700 bg-green-100'
    case 'beginner':
      return 'text-yellow-700 bg-yellow-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-700 bg-red-100 border-red-200'
    case 'medium':
      return 'text-orange-700 bg-orange-100 border-orange-200'
    case 'low':
      return 'text-blue-700 bg-blue-100 border-blue-200'
    default:
      return 'text-gray-700 bg-gray-100 border-gray-200'
  }
}

// Individual export functions for backward compatibility
export const fetchProgressSummary = progressApi.getSummary
export const fetchTopicPerformance = progressApi.getTopicPerformance
export const fetchRecentActivity = progressApi.getRecentActivity
export const fetchLearningRecommendations = progressApi.getRecommendations
export const fetchAnalytics = progressApi.getChartsData

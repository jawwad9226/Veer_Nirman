// Progress Dashboard Types
export interface ProgressSummary {
  total_quizzes: number
  average_score: number
  best_score: number
  worst_score: number
  total_study_time: number // in seconds
  completed_videos: number
  total_videos: number
  bookmarked_sections: number
  current_streak: number
  longest_streak: number
  last_activity?: string
}

export interface TopicPerformance {
  topic: string
  attempts: number
  average_score: number
  best_score: number
  improvement_trend: number
  time_spent: number // in seconds
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface LearningRecommendation {
  type: 'weak_topic' | 'review' | 'next_level' | 'practice_more'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimated_time: number // in minutes
  action_url?: string
}

export interface RecentActivity {
  type: 'quiz' | 'video' | 'syllabus'
  title: string
  description: string
  timestamp: string
  score?: number
  completion?: number
  icon: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned_at?: string
  progress: number // 0.0 to 1.0
  target: number
  current: number
}

export interface ChartData {
  score_trend: Array<{
    date: string
    score: number
    topic: string
  }>
  topic_distribution: Array<{
    topic: string
    count: number
  }>
  difficulty_distribution: Array<{
    difficulty: string
    count: number
  }>
  study_time_data: Array<{
    activity: string
    time: number // in minutes
  }>
  weekly_activity: Record<string, number>
}

export interface ProgressAnalytics {
  summary: ProgressSummary
  topic_performance: TopicPerformance[]
  recent_activity: RecentActivity[]
  recommendations: LearningRecommendation[]
  charts_data: ChartData
}

export interface QuizResultRecord {
  id: string
  topic: string
  difficulty: string
  score: number
  total_questions: number
  correct_answers: number
  time_spent: number
  completed_at: string
  custom_topic?: string
}

export interface VideoProgressRecord {
  video_id: string
  video_title: string
  category: string
  watch_time: number
  total_duration: number
  completed: boolean
  last_watched: string
}

export interface StudySessionRecord {
  session_id: string
  activity_type: 'quiz' | 'video' | 'syllabus'
  duration: number
  started_at: string
  ended_at: string
}

// Alias for chart data - used in dashboard components
export interface AnalyticsData extends ChartData {}

// Quiz API types and interfaces


export interface QuizQuestion {
  id: string
  question: string
  options: { [key: string]: string }
  answer: string
  explanation?: string
  topic?: string
  difficulty?: string
  created_at?: string
}

export interface QuizResponse {
  questions: QuizQuestion[]
  metadata: {
    quiz_id: string
    topic: string
    difficulty: string
    generated_at: string
    total_questions: number
    ai_generated: boolean
    timed_mode?: boolean
    time_limit_seconds?: number
    max_points?: number
    custom_topic?: boolean
    source_material?: string
  }
}


export interface QuizSubmissionRequest {
  quiz_id?: string;
  answers: string[];
  topic: string;
  difficulty: string;
  start_time?: string;
  end_time?: string;
  question_ids?: string[];
}

export interface QuizSubmissionResponse {
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  duration_seconds: number;
  wrong_questions: Array<{
    question_index: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    explanation: string;
  }>;
  difficulty: string;
  topic: string;
  submitted_at: string;
  // Frontend only: all questions with correctness for review
  all_questions?: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
    explanation?: string;
    is_correct: boolean;
  }>;
}

export interface QuizTopicsResponse {
  topics: string[]
}

export interface QuizHistoryEntry {
  id: string
  topic: string
  difficulty: string
  score: number
  completed_at: string
  duration_seconds: number
}

export interface QuizHistoryResponse {
  history: QuizHistoryEntry[]
  total_count: number
  page_size: number
}

export interface BookmarkRequest {
  question_id: string
  question: string
  answer: string
  explanation?: string
  topic: string
  user_id?: string
}

export interface BookmarkResponse {
  success: boolean
  message: string
  bookmark_id?: string
}

export interface CustomQuizRequest {
  custom_topic: string
  difficulty: string
  numQuestions: number
  timedMode?: boolean
  source_material?: string
  file_content?: string
  file_type?: 'pdf' | 'text' | 'notes'
}

export interface QuizAnalyticsResponse {
  total_quizzes: number
  average_score: number
  best_score: number
  worst_score: number
  favorite_topic: string
  strength_areas: string[]
  improvement_areas: string[]
  recent_trend: string
  total_time_spent: number
}

// Quiz configuration constants
export const QUIZ_DIFFICULTIES = [
  { 
    value: 'Easy', 
    label: 'Easy', 
    maxQuestions: 10,
    description: 'Basic concepts and definitions - Perfect for beginners'
  },
  { 
    value: 'Medium', 
    label: 'Medium', 
    maxQuestions: 5,
    description: 'Intermediate concepts and applications - Good for practice'
  },
  { 
    value: 'Hard', 
    label: 'Hard', 
    maxQuestions: 5,
    description: 'Advanced understanding and critical thinking - Challenge yourself'
  }
]

// Use your LAN IP so mobile devices can access the backend
// Update this IP if your backend machine's LAN IP changes (see `hostname -I`)
export const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`

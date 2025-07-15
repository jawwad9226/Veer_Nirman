// Quiz API service functions
import { 
  QuizResponse, 
  QuizSubmissionRequest, 
  QuizSubmissionResponse,
  QuizTopicsResponse,
  QuizHistoryResponse,
  BookmarkRequest,
  BookmarkResponse,
  QuizAnalyticsResponse,
  API_BASE 
} from './types'

// Export individual API functions directly (no class needed)
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE}${endpoint}`
    console.log(`Making API call to: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    console.log(`API Response from ${endpoint}:`, data)
    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

export async function getTopics(): Promise<QuizTopicsResponse> {
  return fetchApi<QuizTopicsResponse>('/topics')
}

export async function generateQuiz(
  topic: string, 
  difficulty: string, 
  numQuestions: number,
  timedMode: boolean = false,
  customData?: { customTopic?: string, fileContent?: string, fileType?: string }
): Promise<QuizResponse> {
  const requestBody: any = {
    topic,
    difficulty,
    numQuestions,
    timedMode,
    timeLimit: timedMode ? numQuestions * 120 : undefined
  }

  // Add custom data if provided
  if (customData) {
    if (customData.customTopic) {
      requestBody.custom_topic = customData.customTopic
    }
    if (customData.fileContent) {
      requestBody.source_material = customData.fileContent
      requestBody.file_type = customData.fileType
    }
  }

  return fetchApi<QuizResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  })
}

export async function submitQuiz(submission: QuizSubmissionRequest): Promise<QuizSubmissionResponse> {
  return fetchApi<QuizSubmissionResponse>('/submit', {
    method: 'POST',
    body: JSON.stringify(submission)
  })
}

export async function getHistory(userId?: string, limit: number = 10): Promise<QuizHistoryResponse> {
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  if (limit) params.append('limit', limit.toString())
  
  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchApi<QuizHistoryResponse>(`/history${query}`)
}

export async function bookmarkQuestion(bookmark: BookmarkRequest): Promise<BookmarkResponse> {
  return fetchApi<BookmarkResponse>('/bookmark', {
    method: 'POST',
    body: JSON.stringify(bookmark)
  })
}

export async function getAnalytics(userId?: string): Promise<QuizAnalyticsResponse> {
  const params = userId ? `?user_id=${userId}` : ''
  return fetchApi<QuizAnalyticsResponse>(`/analytics${params}`)
}

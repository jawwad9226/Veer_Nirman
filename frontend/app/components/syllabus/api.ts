// Syllabus API service functions
import { 
  SyllabusChaptersResponse,
  SyllabusSearchRequest,
  SyllabusSearchResponse,
  BookmarkCreateRequest,
  BookmarkResponse,
  BookmarksListResponse,
  SyllabusChapter,
  SYLLABUS_API_BASE,
  PDFMetadata,
  PDFPageResponse,
  PDFSearchResponse,
  ChapterPageMapping
} from './types'

// Generic API fetch function
async function fetchSyllabusApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${SYLLABUS_API_BASE}${endpoint}`
    console.log(`Making syllabus API call to: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Syllabus API Error ${response.status}:`, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    console.log(`Syllabus API Response from ${endpoint}:`, data)
    return data
  } catch (error) {
    console.error(`Syllabus API call failed for ${endpoint}:`, error)
    throw error
  }
}

export async function getSyllabusChapters(): Promise<SyllabusChaptersResponse> {
  return fetchSyllabusApi<SyllabusChaptersResponse>('/chapters')
}

export async function searchSyllabus(request: SyllabusSearchRequest): Promise<SyllabusSearchResponse> {
  return fetchSyllabusApi<SyllabusSearchResponse>('/search', {
    method: 'POST',
    body: JSON.stringify(request)
  })
}

export async function searchSyllabusSimple(
  query: string, 
  chapter?: string, 
  difficulty?: string[]
): Promise<SyllabusSearchResponse> {
  const params = new URLSearchParams({ q: query })
  if (chapter) params.append('chapter', chapter)
  if (difficulty && difficulty.length > 0) {
    params.append('difficulty', difficulty.join(','))
  }
  
  return fetchSyllabusApi<SyllabusSearchResponse>(`/search?${params.toString()}`)
}

export async function getChapterByTitle(title: string): Promise<SyllabusChapter> {
  return fetchSyllabusApi<SyllabusChapter>(`/chapters/${encodeURIComponent(title)}`)
}

export async function createBookmark(request: BookmarkCreateRequest): Promise<BookmarkResponse> {
  return fetchSyllabusApi<BookmarkResponse>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify(request)
  })
}

export async function getBookmarks(userId?: string): Promise<BookmarksListResponse> {
  const params = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
  return fetchSyllabusApi<BookmarksListResponse>(`/bookmarks${params}`)
}

export async function deleteBookmark(bookmarkId: string): Promise<{ message: string }> {
  return fetchSyllabusApi<{ message: string }>(`/bookmarks/${encodeURIComponent(bookmarkId)}`, {
    method: 'DELETE'
  })
}

export async function checkSyllabusHealth(): Promise<{ status: string, service: string, timestamp: number }> {
  return fetchSyllabusApi<{ status: string, service: string, timestamp: number }>('/health')
}

// PDF API functions
const PDF_API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf`

async function fetchPdfApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${PDF_API_BASE}${endpoint}`
    console.log(`Making PDF API call to: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`PDF API Error ${response.status}:`, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    console.log(`PDF API Response from ${endpoint}:`, data)
    return data
  } catch (error) {
    console.error(`PDF API call failed for ${endpoint}:`, error)
    throw error
  }
}

export async function getPDFMetadata(): Promise<PDFMetadata> {
  return fetchPdfApi('/metadata')
}

export async function getPDFPageInfo(pageNumber: number): Promise<PDFPageResponse> {
  return fetchPdfApi(`/page/${pageNumber}`)
}

export async function searchPDF(query: string, pageStart?: number, pageEnd?: number): Promise<PDFSearchResponse> {
  const params = new URLSearchParams({ q: query })
  if (pageStart) params.append('page_start', pageStart.toString())
  if (pageEnd) params.append('page_end', pageEnd.toString())
  
  return fetchPdfApi(`/search?${params.toString()}`)
}

export async function getChapterPageMapping(): Promise<{ chapter_pages: ChapterPageMapping, total_chapters: number }> {
  return fetchPdfApi('/chapter-mapping')
}

export async function getChapterPages(chapterTitle: string): Promise<{
  chapter_title: string
  page_start: number
  page_end: number
  total_pages: number
}> {
  return fetchPdfApi(`/chapter/${encodeURIComponent(chapterTitle)}/pages`)
}

export function getPDFViewUrl(): string {
  return `${PDF_API_BASE}/view`
}

export function getPDFDownloadUrl(): string {
  return `${PDF_API_BASE}/download`
}

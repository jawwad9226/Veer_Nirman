// Syllabus API types and interfaces for the frontend

// Props for SyllabusStructure component
export interface SyllabusStructureProps {
  syllabusData: SyllabusData;
  onBookmarkAdd: (bookmark: BookmarkResponse) => void;
  onViewPDF?: (chapter: string, page?: number) => void;
  onTakeAssessment?: (chapter: SyllabusChapter) => void; // Pass full chapter object
}
export interface SyllabusSection {
  name: string
  page_number?: number
  content?: string
  keywords?: string[]
  learning_objectives?: string[]
  difficulty?: string[]
  topics?: string[]
}

export interface SyllabusChapter {
  title: string
  wing?: string
  sections: SyllabusSection[]
}

export interface SyllabusData {
  version: string
  chapters: SyllabusChapter[]
}

export interface SyllabusChaptersResponse {
  chapters: SyllabusChapter[]
  total_chapters: number
  version: string
}

export interface SyllabusSearchRequest {
  query: string
  chapter_filter?: string
  difficulty_filter?: string[]
}

export interface SyllabusSearchResult {
  chapter_title: string
  section_name?: string
  match_type: string  // 'chapter' | 'section' | 'content' | 'keyword' | 'topic'
  content_preview: string
  page_number?: number
  relevance_score?: number
}

export interface SyllabusSearchResponse {
  results: SyllabusSearchResult[]
  total_results: number
  query: string
  search_time_ms?: number
}

export interface BookmarkCreateRequest {
  title: string
  page_number: number
  chapter_title?: string
  section_name?: string
  user_id?: string
}

export interface BookmarkResponse {
  id: string
  title: string
  page_number: number
  chapter_title?: string
  section_name?: string
  created_at: string
}

export interface BookmarksListResponse {
  bookmarks: BookmarkResponse[]
  total_count: number
}

// UI State interfaces
export interface SyllabusUIState {
  currentPage: number
  selectedChapter?: string
  searchQuery: string
  searchResults: SyllabusSearchResult[]
  bookmarks: BookmarkResponse[]
  loading: boolean
  error?: string
}

export interface SyllabusViewMode {
  type: 'structure' | 'pdf' | 'search' | 'bookmarks' | 'assessment'
  data?: any
  page?: number
  chapter?: string
}

// Constants
// Use your LAN IP so mobile devices can access the backend
export const SYLLABUS_API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/syllabus`
export const DEFAULT_ITEMS_PER_PAGE = 10
export const DIFFICULTY_LEVELS = ['JD/JW', 'SD/SW', 'Senior Wing']

// PDF-related types
export interface PDFMetadata {
  title: string
  total_pages: number
  version: string
  file_size: number
  last_modified: string
}

export interface PDFPageResponse {
  page_number: number
  total_pages: number
  content_url: string
}

export interface PDFSearchResult {
  page_number: number
  match_text: string
  context: string
  relevance_score?: number
}

export interface PDFSearchResponse {
  results: PDFSearchResult[]
  total_results: number
  query: string
  search_time_ms?: number
}

export interface ChapterPageMapping {
  [chapterTitle: string]: {
    start: number
    end: number
  }
}

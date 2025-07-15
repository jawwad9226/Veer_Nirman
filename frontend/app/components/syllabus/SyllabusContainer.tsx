'use client'

import React, { useState, useEffect } from 'react'
import './syllabus-glass.css'
import { Search, BookOpen, FileText, Bookmark, Navigation, RefreshCw } from 'lucide-react'
import SyllabusStructure from './SyllabusStructure'
import SyllabusSearch from './SyllabusSearch'
import BookmarkManager from './BookmarkManager'
import PDFViewer from './PDFViewer'
import QuizSetup from '../quiz/QuizSetup'
import { useRouter } from 'next/navigation'
import { 
  SyllabusData, 
  SyllabusUIState, 
  SyllabusViewMode,
  BookmarkResponse
} from './types'
import { getSyllabusChapters, getBookmarks } from './api'

interface SyllabusContainerProps {
  onTakeAssessment?: (topic: string, difficulty: string, numQuestions: number, timedMode?: boolean, customData?: any) => void;
}

export default function SyllabusContainer({ onTakeAssessment }: SyllabusContainerProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<SyllabusViewMode>({ type: 'structure' })
  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null)
  const [uiState, setUiState] = useState<SyllabusUIState>({
    currentPage: 1,
    searchQuery: '',
    searchResults: [],
    bookmarks: [],
    loading: true,
    error: undefined
  })
  // Assessment state: holds the selected major topic for assessment
  const [assessmentTopic, setAssessmentTopic] = useState<null | {
    title: string;
    subtopics: string[];
    topicsCovered: string[];
  }>(null)

  useEffect(() => {
    loadSyllabusData()
    loadBookmarks()
  }, [])

  const loadSyllabusData = async () => {
    try {
      setUiState(prev => ({ ...prev, loading: true, error: undefined }))
      const response = await getSyllabusChapters()
      setSyllabusData({
        version: response.version,
        chapters: response.chapters
      })
    } catch (error) {
      console.error('Failed to load syllabus data:', error)
      setUiState(prev => ({ 
        ...prev, 
        error: 'Failed to load syllabus data. Please try again.' 
      }))
    } finally {
      setUiState(prev => ({ ...prev, loading: false }))
    }
  }

  const loadBookmarks = async () => {
    try {
      const response = await getBookmarks()
      setUiState(prev => ({ ...prev, bookmarks: response.bookmarks }))
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    }
  }

  const handleViewModeChange = (mode: SyllabusViewMode) => {
    setViewMode(mode)
  }

  const handleBookmarkAdd = (bookmark: BookmarkResponse) => {
    setUiState(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, bookmark]
    }))
  }

  const handleBookmarkDelete = (bookmarkId: string) => {
    setUiState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== bookmarkId)
    }))
  }

  const handleViewPDF = (chapter: string, page?: number) => {
    setViewMode({ 
      type: 'pdf', 
      chapter, 
      page 
    })
  }

  if (uiState.loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-xl">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
              <BookOpen className="relative mx-auto h-16 w-16 text-white z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Loading Syllabus</h2>
            <p className="text-gray-600 mb-6">Preparing your study materials...</p>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (uiState.error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 shadow-xl">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Syllabus</h2>
            <p className="text-red-600 mb-6">{uiState.error}</p>
            <button
              onClick={loadSyllabusData}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="syllabus-glass max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
          <BookOpen className="relative mx-auto h-16 w-16 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text z-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-6 mb-4">
          NCC Syllabus
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Comprehensive study materials and curriculum for NCC cadets
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
        <button
          onClick={() => handleViewModeChange({ type: 'structure' })}
          className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center text-sm md:text-base ${
            viewMode.type === 'structure'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Navigation className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          Browse Structure
        </button>
        
        <button
          onClick={() => handleViewModeChange({ type: 'search' })}
          className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center text-sm md:text-base ${
            viewMode.type === 'search'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          Search Content
        </button>
        
        <button
          onClick={() => handleViewModeChange({ type: 'pdf' })}
          className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center text-sm md:text-base ${
            viewMode.type === 'pdf'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          PDF Handbook
        </button>
        
        <button
          onClick={() => handleViewModeChange({ type: 'bookmarks' })}
          className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center text-sm md:text-base ${
            viewMode.type === 'bookmarks'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Bookmark className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          Bookmarks
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {viewMode.type === 'structure' && syllabusData && (
          <SyllabusStructure 
            syllabusData={syllabusData}
            onBookmarkAdd={handleBookmarkAdd}
            onViewPDF={handleViewPDF}
            onTakeAssessment={(chapter) => {
              // Gather all subtopic names and topics covered from sections
              const subtopics = chapter.sections.map(s => s.name)
              const topicsCovered = chapter.sections.flatMap(s => s.topics || [])
              setAssessmentTopic({
                title: chapter.title,
                subtopics,
                topicsCovered
              })
              setViewMode({ type: 'assessment' })
            }}
          />
        )}

        {viewMode.type === 'assessment' && assessmentTopic && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                onClick={() => {
                  setViewMode({ type: 'structure' });
                  setAssessmentTopic(null);
                }}
              >
                ← Back to Syllabus
              </button>
            </div>
            <QuizSetup
              assessmentTopic={assessmentTopic}
              onStartQuiz={(topic, difficulty, numQuestions, timedMode, customData) => {
                if (onTakeAssessment) {
                  onTakeAssessment(topic, difficulty, numQuestions, timedMode, customData);
                }
              }}
              loading={false}
            />
          </div>
        )}

        {viewMode.type === 'search' && (
          <SyllabusSearch 
            onBookmarkAdd={handleBookmarkAdd}
          />
        )}

        {viewMode.type === 'pdf' && (
          <div className="h-[80vh]">
            <PDFViewer 
              initialPage={viewMode.page || 1}
              chapter={viewMode.chapter}
              onPageChange={(page) => setViewMode(prev => ({ ...prev, page }))}
              onChapterSelect={(chapter) => setViewMode(prev => ({ ...prev, chapter }))}
            />
          </div>
        )}

        {viewMode.type === 'bookmarks' && (
          <BookmarkManager 
            bookmarks={uiState.bookmarks}
            onBookmarkDelete={handleBookmarkDelete}
            onRefresh={loadBookmarks}
          />
        )}
      </div>
    </div>
  )
}

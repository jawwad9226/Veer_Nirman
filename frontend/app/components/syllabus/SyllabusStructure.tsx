'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, FileText, Bookmark, ExternalLink, Tag, Sparkles, XCircle } from 'lucide-react'

import { SyllabusData, SyllabusChapter, SyllabusSection, BookmarkResponse, SyllabusStructureProps } from './types'
import { createBookmark } from './api'



export default function SyllabusStructure({ syllabusData, onBookmarkAdd, onViewPDF, onTakeAssessment }: SyllabusStructureProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [bookmarkingSection, setBookmarkingSection] = useState<string | null>(null)

  const toggleChapter = (chapterTitle: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterTitle)) {
      newExpanded.delete(chapterTitle)
    } else {
      newExpanded.add(chapterTitle)
    }
    setExpandedChapters(newExpanded)
  }

  const handleBookmark = async (chapter: SyllabusChapter, section: SyllabusSection) => {
    if (!section.page_number) return
    
    const sectionKey = `${chapter.title}-${section.name}`
    setBookmarkingSection(sectionKey)
    
    try {
      const bookmark = await createBookmark({
        title: `${chapter.title} - ${section.name}`,
        page_number: section.page_number,
        chapter_title: chapter.title,
        section_name: section.name
      })
      onBookmarkAdd(bookmark)
    } catch (error) {
      console.error('Failed to create bookmark:', error)
    } finally {
      setBookmarkingSection(null)
    }
  }

  const getDifficultyColor = (difficulty?: string[]) => {
    if (!difficulty || difficulty.length === 0) return 'bg-gray-100 text-gray-600'
    if (difficulty.includes('JD/JW')) return 'bg-green-100 text-green-700'
    if (difficulty.includes('SD/SW')) return 'bg-blue-100 text-blue-700'
    return 'bg-purple-100 text-purple-700'
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Syllabus Structure</h2>
            <p className="text-gray-600 mt-1">Browse chapters and sections interactively</p>
          </div>
          <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Version {syllabusData.version} • {syllabusData.chapters.length} Chapters
          </div>
        </div>
      </div>


      <div className="space-y-4">
        {syllabusData.chapters.map((chapter, chapterIndex) => {
          const isExpanded = expandedChapters.has(chapter.title)
          return (
            <div key={`${chapter.title}-${chapterIndex}`} className="border border-gray-200 rounded-xl overflow-hidden relative">
              {/* Chapter Header */}
              <div className="w-full p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-left gap-2 sm:gap-0">
                <div className="flex items-center w-full sm:w-auto">
                  <button
                    onClick={() => toggleChapter(chapter.title)}
                    className="flex items-center space-x-3 focus:outline-none flex-shrink-0 w-full text-left"
                    aria-label={isExpanded ? `Collapse ${chapter.title}` : `Expand ${chapter.title}`}
                    style={{ padding: 0, background: 'none', border: 'none' }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                    <span className="ml-2 text-base sm:text-lg md:text-xl font-semibold text-blue-900 truncate block w-full">
                      {chapter.title}
                    </span>
                  </button>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 mt-2 sm:mt-0 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-blue-700 bg-blue-100 px-2 sm:px-3 py-1 rounded-full min-w-[90px] text-center">
                    {chapter.sections.length} sections
                  </span>
                  {/* Take Assessment Button for Major Topic */}
                  {onTakeAssessment && (
                    <button
                      onClick={() => onTakeAssessment(chapter)}
                      className="flex items-center justify-center space-x-1 text-xs sm:text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold shadow-sm transition-all border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-[120px]"
                      style={{ minHeight: '32px' }}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      <span>Take Assessment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chapter Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 relative">
                  {/* Floating Close Button */}
                  <button
                    className="fixed md:absolute z-30 bottom-8 right-8 md:bottom-4 md:right-4 bg-white border border-gray-300 shadow-lg rounded-full p-3 flex items-center justify-center hover:bg-gray-100 transition-all"
                    style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
                    aria-label={`Close ${chapter.title}`}
                    onClick={() => toggleChapter(chapter.title)}
                  >
                    <XCircle className="h-7 w-7 text-red-500" />
                  </button>
                  {chapter.sections.map((section, sectionIndex) => {
                    const sectionKey = `${chapter.title}-${section.name}`
                    const isBookmarking = bookmarkingSection === sectionKey
                    return (
                      <div key={`${section.name}-${sectionIndex}`} className="p-4 md:p-6 border-b border-gray-100 last:border-b-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start space-x-3">
                              <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                  {section.name}
                                </h4>
                                {section.content && (
                                  <p className="text-gray-700 mb-3 leading-relaxed">
                                    {section.content}
                                  </p>
                                )}
                                {/* Topics */}
                                {section.topics && section.topics.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {section.topics.map((topic, topicIndex) => (
                                        <span key={topicIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                          {topic}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Learning Objectives */}
                                {section.learning_objectives && section.learning_objectives.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {section.learning_objectives.map((objective, objIndex) => (
                                        <li key={objIndex} className="flex items-start">
                                          <span className="text-blue-500 mr-2">•</span>
                                          {objective}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {/* Keywords */}
                                {section.keywords && section.keywords.length > 0 && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                      <Tag className="h-4 w-4 mr-1" />
                                      Keywords:
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {section.keywords.map((keyword, keywordIndex) => (
                                        <span key={keywordIndex} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                          #{keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Section Actions */}
                          <div className="flex flex-col items-end space-y-2 md:ml-4">
                            {/* Difficulty Level */}
                            {section.difficulty && section.difficulty.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {section.difficulty.map((diff, diffIndex) => (
                                  <span key={diffIndex} className={`text-xs px-2 py-1 rounded-md font-medium ${getDifficultyColor(section.difficulty)}`}>
                                    {diff}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Page Number and Actions */}
                            {section.page_number && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  Page {section.page_number}
                                </span>
                                <button
                                  onClick={() => handleBookmark(chapter, section)}
                                  disabled={isBookmarking}
                                  className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                                >
                                  <Bookmark className="h-4 w-4" />
                                  <span>{isBookmarking ? 'Adding...' : 'Bookmark'}</span>
                                </button>
                                <button 
                                  onClick={() => onViewPDF?.(chapter.title, section.page_number)}
                                  className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span>View PDF</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {syllabusData.chapters.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Chapters Available</h3>
          <p className="text-gray-500">The syllabus data is currently empty.</p>
        </div>
      )}
    </div>
  )
}

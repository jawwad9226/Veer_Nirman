'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Clock, Bookmark, ExternalLink, Tag, AlertCircle } from 'lucide-react'
import { 
  SyllabusSearchRequest, 
  SyllabusSearchResponse, 
  SyllabusSearchResult,
  BookmarkResponse,
  DIFFICULTY_LEVELS 
} from './types'
import { searchSyllabus, createBookmark } from './api'

interface SyllabusSearchProps {
  onBookmarkAdd: (bookmark: BookmarkResponse) => void
}

export default function SyllabusSearch({ onBookmarkAdd }: SyllabusSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SyllabusSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    chapter_filter: '',
    difficulty_filter: [] as string[]
  })
  const [showFilters, setShowFilters] = useState(false)
  const [bookmarkingResult, setBookmarkingResult] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const request: SyllabusSearchRequest = {
        query: searchQuery.trim(),
        ...(filters.chapter_filter && { chapter_filter: filters.chapter_filter }),
        ...(filters.difficulty_filter.length > 0 && { difficulty_filter: filters.difficulty_filter })
      }

      const response = await searchSyllabus(request)
      setSearchResults(response)
    } catch (err) {
      setError('Failed to search syllabus. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleBookmark = async (result: SyllabusSearchResult) => {
    if (!result.page_number) return

    const resultKey = `${result.chapter_title}-${result.section_name || 'chapter'}`
    setBookmarkingResult(resultKey)

    try {
      const bookmark = await createBookmark({
        title: result.section_name 
          ? `${result.chapter_title} - ${result.section_name}`
          : result.chapter_title,
        page_number: result.page_number,
        chapter_title: result.chapter_title,
        section_name: result.section_name
      })
      onBookmarkAdd(bookmark)
    } catch (error) {
      console.error('Failed to create bookmark:', error)
    } finally {
      setBookmarkingResult(null)
    }
  }

  const toggleDifficultyFilter = (difficulty: string) => {
    setFilters(prev => ({
      ...prev,
      difficulty_filter: prev.difficulty_filter.includes(difficulty)
        ? prev.difficulty_filter.filter(d => d !== difficulty)
        : [...prev.difficulty_filter, difficulty]
    }))
  }

  const clearFilters = () => {
    setFilters({
      chapter_filter: '',
      difficulty_filter: []
    })
  }

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'chapter': return '📖'
      case 'section': return '📄'
      case 'content': return '📝'
      case 'keyword': return '🏷️'
      case 'topic': return '🎯'
      default: return '📄'
    }
  }

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'chapter': return 'bg-blue-100 text-blue-700'
      case 'section': return 'bg-green-100 text-green-700'
      case 'content': return 'bg-purple-100 text-purple-700'
      case 'keyword': return 'bg-orange-100 text-orange-700'
      case 'topic': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Search Syllabus</h2>
        <p className="text-gray-600">Find specific topics, chapters, or content across the entire syllabus</p>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for topics, chapters, keywords..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                showFilters || filters.chapter_filter || filters.difficulty_filter.length > 0
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filters.chapter_filter || filters.difficulty_filter.length > 0) && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {(filters.chapter_filter ? 1 : 0) + filters.difficulty_filter.length}
                </span>
              )}
            </button>
            
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Chapter Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chapter</label>
                <input
                  type="text"
                  value={filters.chapter_filter}
                  onChange={(e) => setFilters(prev => ({ ...prev, chapter_filter: e.target.value }))}
                  placeholder="Filter by chapter name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => toggleDifficultyFilter(difficulty)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        filters.difficulty_filter.includes(difficulty)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.chapter_filter || filters.difficulty_filter.length > 0) && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results for "{searchResults.query}"
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {searchResults.total_results} results
              </span>
            </div>
            {searchResults.search_time_ms && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {searchResults.search_time_ms}ms
              </div>
            )}
          </div>

          {/* Results List */}
          {searchResults.results.length > 0 ? (
            <div className="space-y-4">
              {searchResults.results.map((result, index) => {
                const resultKey = `${result.chapter_title}-${result.section_name || 'chapter'}`
                const isBookmarking = bookmarkingResult === resultKey

                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3 mb-3">
                          <span className="text-lg">{getMatchTypeIcon(result.match_type)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {result.chapter_title}
                                {result.section_name && (
                                  <span className="text-gray-600 font-normal"> - {result.section_name}</span>
                                )}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-md font-medium ${getMatchTypeColor(result.match_type)}`}>
                                {result.match_type}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {result.content_preview}
                            </p>
                            {result.relevance_score && (
                              <div className="mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">Relevance:</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-24">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full" 
                                      style={{ width: `${(result.relevance_score || 0) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round((result.relevance_score || 0) * 100)}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Result Actions */}
                      <div className="flex items-center space-x-2">
                        {result.page_number && (
                          <>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              Page {result.page_number}
                            </span>
                            
                            <button
                              onClick={() => handleBookmark(result)}
                              disabled={isBookmarking}
                              className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Bookmark className="h-4 w-4" />
                              <span>{isBookmarking ? 'Adding...' : 'Bookmark'}</span>
                            </button>

                            <button className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md transition-colors">
                              <ExternalLink className="h-4 w-4" />
                              <span>View PDF</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Results Found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Search Yet */}
      {!searchResults && !loading && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Start Your Search</h3>
          <p className="text-gray-500 mb-4">
            Enter keywords to search across all syllabus content including chapters, sections, and topics.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['drill', 'leadership', 'organization', 'history'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchQuery(suggestion)
                  handleSearch()
                }}
                className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
              >
                Try "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

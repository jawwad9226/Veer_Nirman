'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight,
  Search,
  BookOpen,
  Navigation
} from 'lucide-react'
import { 
  PDFMetadata, 
  PDFPageResponse, 
  ChapterPageMapping,
  PDFSearchResponse 
} from './types'
import { 
  getPDFMetadata, 
  getPDFPageInfo, 
  getChapterPageMapping,
  getPDFViewUrl,
  getPDFDownloadUrl,
  searchPDF
} from './api'

interface PDFViewerProps {
  initialPage?: number
  chapter?: string
  onPageChange?: (page: number) => void
  onChapterSelect?: (chapter: string) => void
}

export default function PDFViewer({ 
  initialPage = 1, 
  chapter,
  onPageChange,
  onChapterSelect 
}: PDFViewerProps) {
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [chapterMapping, setChapterMapping] = useState<ChapterPageMapping>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PDFSearchResponse | null>(null)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    loadPDFData()
  }, [])

  useEffect(() => {
    if (chapter && chapterMapping[chapter]) {
      const chapterData = chapterMapping[chapter];
      setCurrentPage(prev => {
        if (prev !== chapterData.start) {
          onPageChange?.(chapterData.start);
          return chapterData.start;
        }
        return prev;
      });
    }
  }, [chapter, chapterMapping, onPageChange]);

  const loadPDFData = async () => {
    try {
      setLoading(true)
      setError(undefined)

      const [metadataData, mappingData] = await Promise.all([
        getPDFMetadata(),
        getChapterPageMapping()
      ])

      setMetadata(metadataData)
      setChapterMapping(mappingData.chapter_pages)
      
      // If we have a specific chapter, navigate to it
      if (chapter && mappingData.chapter_pages[chapter]) {
        const chapterData = mappingData.chapter_pages[chapter]
        setCurrentPage(chapterData.start)
        onPageChange?.(chapterData.start)
      }
    } catch (error) {
      console.error('Failed to load PDF data:', error)
      setError('Failed to load PDF data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page: number) => {
    if (metadata && page >= 1 && page <= metadata.total_pages) {
      setCurrentPage(page)
      onPageChange?.(page)
    }
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const results = await searchPDF(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('PDF search failed:', error)
      setError('Search failed. Please try again.')
    }
  }

  const getCurrentChapter = () => {
    for (const [chapterTitle, pages] of Object.entries(chapterMapping)) {
      if (currentPage >= pages.start && currentPage <= pages.end) {
        return chapterTitle
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading PDF viewer...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPDFData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const currentChapter = getCurrentChapter()

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* PDF Controls */}
      {showControls && (
        <div className="bg-gray-800 text-white p-4 space-y-4">
          {/* Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-lg">NCC Cadet Handbook</h3>
              {currentChapter && (
                <div className="flex items-center space-x-2 text-sm bg-blue-600 px-3 py-1 rounded-full">
                  <BookOpen className="w-4 h-4" />
                  <span>{currentChapter}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={getPDFViewUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Open PDF</span>
              </a>
              <a
                href={getPDFDownloadUrl()}
                download
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-500 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  min={1}
                  max={metadata?.total_pages || 1}
                  className="w-20 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 text-center"
                />
                <span className="text-sm text-gray-300">
                  of {metadata?.total_pages || 0}
                </span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= (metadata?.total_pages || 1)}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-500 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search in PDF..."
                className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              />
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(chapterMapping).slice(0, 6).map(([chapterTitle, pages]) => (
              <button
                key={chapterTitle}
                onClick={() => {
                  setCurrentPage(pages.start)
                  onPageChange?.(pages.start)
                  onChapterSelect?.(chapterTitle)
                }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  currentChapter === chapterTitle
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {chapterTitle}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div className="flex-1 relative">
        <iframe
          src={`${getPDFViewUrl()}#page=${currentPage}&zoom=100`}
          className="w-full h-full border-0"
          title="NCC Cadet Handbook"
        />
        
        {/* Controls Toggle */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="absolute top-4 right-4 p-2 bg-gray-800 bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Search Results */}
      {searchResults && searchResults.results.length > 0 && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            Search Results ({searchResults.total_results} found)
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {searchResults.results.slice(0, 5).map((result, index) => (
              <button
                key={index}
                onClick={() => goToPage(result.page_number)}
                className="w-full text-left p-2 bg-white rounded border hover:bg-yellow-50 transition-colors"
              >
                <div className="text-sm">
                  <span className="font-semibold text-blue-600">Page {result.page_number}:</span>
                  <span className="ml-2 text-gray-700">{result.context}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

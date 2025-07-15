'use client'

import React, { useState } from 'react'
import { Bookmark, Trash2, ExternalLink, RefreshCw, Calendar, BookOpen } from 'lucide-react'
import { BookmarkResponse } from './types'
import { deleteBookmark } from './api'

interface BookmarkManagerProps {
  bookmarks: BookmarkResponse[]
  onBookmarkDelete: (bookmarkId: string) => void
  onRefresh: () => void
}

export default function BookmarkManager({ bookmarks, onBookmarkDelete, onRefresh }: BookmarkManagerProps) {
  const [deletingBookmark, setDeletingBookmark] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'page'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleDeleteBookmark = async (bookmarkId: string) => {
    setDeletingBookmark(bookmarkId)
    
    try {
      await deleteBookmark(bookmarkId)
      onBookmarkDelete(bookmarkId)
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
    } finally {
      setDeletingBookmark(null)
    }
  }

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'page':
        comparison = a.page_number - b.page_number
        break
    }
    
    return sortOrder === 'desc' ? -comparison : comparison
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleSort = (field: 'date' | 'title' | 'page') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">My Bookmarks</h2>
            <p className="text-gray-600 mt-1">Quick access to your saved syllabus pages</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              {bookmarks.length} bookmarks
            </span>
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      {bookmarks.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 flex items-center mr-3">Sort by:</span>
          <button
            onClick={() => toggleSort('date')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              sortBy === 'date' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Date</span>
            {sortBy === 'date' && (
              <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
          <button
            onClick={() => toggleSort('title')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              sortBy === 'title' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>Title</span>
            {sortBy === 'title' && (
              <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
          <button
            onClick={() => toggleSort('page')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              sortBy === 'page' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Page</span>
            {sortBy === 'page' && (
              <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
        </div>
      )}

      {/* Bookmarks List */}
      {sortedBookmarks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedBookmarks.map((bookmark) => {
            const isDeleting = deletingBookmark === bookmark.id

            return (
              <div key={bookmark.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bookmark className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        Page {bookmark.page_number}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {bookmark.title}
                    </h3>
                    
                    {/* Chapter and Section Info */}
                    <div className="space-y-1 mb-3">
                      {bookmark.chapter_title && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Chapter:</span> {bookmark.chapter_title}
                        </p>
                      )}
                      {bookmark.section_name && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Section:</span> {bookmark.section_name}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Saved on {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    <span>View PDF</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    disabled={isDeleting}
                    className="flex items-center space-x-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 group-hover:opacity-100 opacity-0"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Bookmarks Yet</h3>
          <p className="text-gray-500 mb-6">
            Start bookmarking pages from the syllabus structure or search results to access them quickly here.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>💡 <strong>Tip:</strong> Use bookmarks to mark important sections for quick reference</p>
            <p>📖 <strong>Tip:</strong> Bookmarks sync across all your devices when you're logged in</p>
            <p>🔍 <strong>Tip:</strong> You can bookmark sections from both structure view and search results</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {bookmarks.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Bookmark Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">{bookmarks.length}</div>
              <div className="text-xs text-gray-600">Total Bookmarks</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {new Set(bookmarks.map(b => b.chapter_title)).size}
              </div>
              <div className="text-xs text-gray-600">Chapters Covered</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {bookmarks.reduce((min, b) => Math.min(min, b.page_number), Infinity)}
              </div>
              <div className="text-xs text-gray-600">Earliest Page</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {bookmarks.reduce((max, b) => Math.max(max, b.page_number), 0)}
              </div>
              <div className="text-xs text-gray-600">Latest Page</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

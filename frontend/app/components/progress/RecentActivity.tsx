'use client'

import React from 'react'
import { Clock, Calendar, Target, Play, Book } from 'lucide-react'
import { RecentActivity } from './types'
import { formatDateTime } from './api'

interface RecentActivityProps {
  activities: RecentActivity[]
  loading?: boolean
}

export default function RecentActivityPanel({ activities, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="progress-card rounded-2xl p-6">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <Target className="h-5 w-5" />
      case 'video':
        return <Play className="h-5 w-5" />
      case 'syllabus':
        return <Book className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-blue-100 text-blue-600'
      case 'video':
        return 'bg-green-100 text-green-600'
      case 'syllabus':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="progress-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            Recent Activity
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Your latest learning sessions
          </p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto progress-scroll">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400">Start learning to see your progress here!</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={`${activity.type}-${index}`} className="relative">
              <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Activity icon */}
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>

                  {/* Performance indicators */}
                  <div className="flex items-center space-x-4 mt-2">
                    {activity.score !== undefined && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Score:</span>
                        <span className={`text-xs font-semibold ${getScoreColor(activity.score)}`}>
                          {activity.score.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    
                    {activity.completion !== undefined && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Progress:</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {activity.completion}%
                        </span>
                      </div>
                    )}

                    {/* Activity emoji */}
                    <span className="text-lg">{activity.icon}</span>
                  </div>

                  {/* Progress bar for videos */}
                  {activity.type === 'video' && activity.completion !== undefined && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-1.5 bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${activity.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline connector */}
              {index < activities.length - 1 && (
                <div className="absolute left-7 top-14 w-0.5 h-6 bg-gray-200"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Show all activities link */}
      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All Activities
          </button>
        </div>
      )}
    </div>
  )
}

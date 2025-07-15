'use client'

import React from 'react'
import { Lightbulb, ChevronRight, Clock, Target, BookOpen, Zap } from 'lucide-react'
import { LearningRecommendation } from './types'
import { getPriorityColor } from './api'

interface LearningRecommendationsProps {
  recommendations: LearningRecommendation[]
  loading?: boolean
}

export default function LearningRecommendations({ recommendations, loading }: LearningRecommendationsProps) {
  if (loading) {
    return (
      <div className="progress-card rounded-2xl p-6">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'weak_topic':
        return { icon: <Target className="h-5 w-5" />, emoji: '🎯' }
      case 'review':
        return { icon: <BookOpen className="h-5 w-5" />, emoji: '📖' }
      case 'next_level':
        return { icon: <Zap className="h-5 w-5" />, emoji: '⚡' }
      case 'practice_more':
        return { icon: <Clock className="h-5 w-5" />, emoji: '💪' }
      default:
        return { icon: <Lightbulb className="h-5 w-5" />, emoji: '💡' }
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weak_topic':
        return '🎯 Need Practice'
      case 'review':
        return '📚 Time to Review'
      case 'next_level':
        return '🚀 Ready to Level Up!'
      case 'practice_more':
        return '💪 More Practice Time'
      default:
        return '💡 Smart Suggestion'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔥'
      case 'medium':
        return '⚡'
      case 'low':
        return '💡'
      default:
        return '💭'
    }
  }

  const handleRecommendationClick = (recommendation: LearningRecommendation) => {
    if (recommendation.action_url) {
      // In a real app, you'd navigate to the URL
      console.log('Navigate to:', recommendation.action_url)
    }
  }

  return (
    <div className="progress-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Learning Recommendations
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Personalized suggestions to improve your learning
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recommendations available</p>
            <p className="text-sm text-gray-400">Complete more activities to get personalized suggestions!</p>
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <div
              key={`${rec.type}-${index}`}
              className={`border-l-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${getPriorityColor(rec.priority)}`}
              onClick={() => handleRecommendationClick(rec)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Icon with Emoji */}
                  <div className={`p-2 rounded-lg ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                    rec.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  } relative`}>
                    {getRecommendationIcon(rec.type).icon}
                    <div className="absolute -top-1 -right-1 text-sm">
                      {getRecommendationIcon(rec.type).emoji}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span className="text-lg">{getPriorityIcon(rec.priority)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {rec.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {rec.estimated_time} min
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {getTypeLabel(rec.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action buttons */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {recommendations.filter(r => r.priority === 'high').length} high priority items
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Mark All as Read
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
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
        return '⭐'
      default:
        return '💡'
    }
  }

  const handleRecommendationClick = (recommendation: LearningRecommendation) => {
    if (recommendation.action_url) {
      console.log('Navigate to:', recommendation.action_url)
    }
  }

  return (
    <div className="space-y-4">
      {/* Friendly Introduction */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="text-3xl mb-2">🤖</div>
        <p className="text-sm text-gray-600">
          Your AI study buddy has some helpful suggestions! 🌟
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">You're doing great! Keep up the excellent work.</p>
          <div className="flex justify-center mt-4 space-x-2">
            <span className="text-2xl">⭐</span>
            <span className="text-2xl">🏆</span>
            <span className="text-2xl">👏</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              onClick={() => handleRecommendationClick(rec)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {rec.estimated_time} min
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {getTypeLabel(rec.type)}
                      </span>
                    </div>
                    
                    {rec.action_url && (
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

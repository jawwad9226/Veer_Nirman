'use client'

import React from 'react'
import { Target, TrendingUp, TrendingDown, Brain, Award } from 'lucide-react'
import { TopicPerformance } from './types'
import { getMasteryColor } from './api'

interface TopicMasteryProps {
  topicPerformance: TopicPerformance[]
  loading?: boolean
}

export default function TopicMastery({ topicPerformance, loading }: TopicMasteryProps) {
  if (loading) {
    return (
      <div className="progress-card rounded-2xl p-6 mb-8">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getMasteryIcon = (level: string) => {
    switch (level) {
      case 'expert':
        return <Award className="h-5 w-5" />
      case 'advanced':
        return <Brain className="h-5 w-5" />
      case 'intermediate':
        return <Target className="h-5 w-5" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4"></div>
  }

  // Sort by mastery level and average score
  const sortedTopics = [...topicPerformance].sort((a, b) => {
    const masteryOrder = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 }
    const aLevel = masteryOrder[a.mastery_level as keyof typeof masteryOrder] || 0
    const bLevel = masteryOrder[b.mastery_level as keyof typeof masteryOrder] || 0
    
    if (aLevel !== bLevel) return bLevel - aLevel
    return b.average_score - a.average_score
  })

  return (
    <div className="progress-card rounded-2xl p-3 sm:p-6 mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Topic Mastery
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Your performance across different subjects
          </p>
        </div>
      </div>

      {/* Horizontal scroll for mobile */}
      <div className="flex flex-col gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible">
        {sortedTopics.map((topic, index) => (
          <div key={topic.topic} className="relative min-w-[260px] sm:min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Mastery icon */}
                <div className={`p-2 sm:p-3 rounded-lg ${getMasteryColor(topic.mastery_level)}`}>
                  {getMasteryIcon(topic.mastery_level)}
                </div>
                {/* Topic info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{topic.topic}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(topic.mastery_level)}`}>{topic.mastery_level}</span>
                    {getTrendIcon(topic.improvement_trend)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                    <span>{topic.attempts} attempts</span>
                    <span>•</span>
                    <span>{Math.floor(topic.time_spent / 60)} min studied</span>
                    <span>•</span>
                    <span>Best: {topic.best_score.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              {/* Score and progress */}
              <div className="text-right mt-2 sm:mt-0">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {topic.average_score.toFixed(1)}%
                </div>
                <div className="w-20 sm:w-24 h-2 bg-gray-200 rounded-full mt-1 sm:mt-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${topic.average_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {/* Rank indicator */}
            {index < 3 && (
              <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
              }`}>
                {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Strongest</p>
            <p className="font-semibold text-green-600 truncate">
              {sortedTopics[0]?.topic || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Needs Work</p>
            <p className="font-semibold text-red-600 truncate">
              {sortedTopics[sortedTopics.length - 1]?.topic || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Expert Level</p>
            <p className="font-semibold text-purple-600">
              {sortedTopics.filter(t => t.mastery_level === 'expert').length}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Improving</p>
            <p className="font-semibold text-blue-600">
              {sortedTopics.filter(t => t.improvement_trend > 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

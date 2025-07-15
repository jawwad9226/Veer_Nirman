'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, Trophy, Target, BookOpen, Clock } from 'lucide-react'
import { ProgressSummary } from './types'
import { formatTime } from './api'

interface OverviewCardsProps {
  summary: ProgressSummary
  loading?: boolean
}

export default function OverviewCards({ summary, loading }: OverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="progress-card rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: '🧠 Quizzes Completed',
      value: summary.total_quizzes.toString(),
      subtitle: `Average Score: ${summary.average_score.toFixed(1)}% ⭐`,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      emoji: '📝'
    },
    {
      title: '🏆 Best Achievement',
      value: `${summary.best_score.toFixed(1)}%`,
      subtitle: `Amazing work! Keep it up! 🎉`,
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      emoji: '🌟'
    },
    {
      title: '⏰ Study Time',
      value: formatTime(summary.total_study_time),
      subtitle: `${summary.current_streak} day streak! 🔥`,
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      emoji: '📚'
    },
    {
      title: '📹 Videos Watched',
      value: `${summary.completed_videos}/${summary.total_videos}`,
      subtitle: `${Math.round((summary.completed_videos / summary.total_videos) * 100)}% completed! 🎯`,
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      emoji: '🎬'
    }
  ]

  const getTrendIcon = (current: number, best: number, worst: number) => {
    const range = best - worst
    const position = (current - worst) / range
    
    if (position > 0.7) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (position < 0.3) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        
        return (
          <div
            key={card.title}
            className="progress-card rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform relative`}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                  {card.emoji && (
                    <div className="absolute -top-1 -right-1 text-lg">
                      {card.emoji}
                    </div>
                  )}
                </div>
                {index === 0 && getTrendIcon(summary.average_score, summary.best_score, summary.worst_score)}
              </div>
              
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </h3>
              
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform">
                {card.value}
              </p>
              
              <p className="text-sm text-gray-500">
                {card.subtitle}
              </p>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          </div>
        )
      })}
    </div>
  )
}

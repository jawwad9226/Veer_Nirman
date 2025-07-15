'use client'

import React, { useState, useEffect } from 'react'
import OverviewCards from './OverviewCards'
import PerformanceTrends from './PerformanceTrends'
import TopicMastery from './TopicMastery'
import RecentActivity from './RecentActivity'
import LearningRecommendations from './LearningRecommendations'
import { 
  fetchProgressSummary, 
  fetchTopicPerformance, 
  fetchRecentActivity, 
  fetchLearningRecommendations,
  fetchAnalytics
} from './api'
import type { 
  ProgressSummary, 
  TopicPerformance, 
  RecentActivity as RecentActivityType, 
  LearningRecommendation,
  AnalyticsData 
} from './types'
import './progress-glass.css'

export default function ProgressDashboard() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityType[]>([])
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all dashboard data
        const [
          summaryData,
          topicData,
          activityData,
          recommendationsData,
          analyticsData
        ] = await Promise.all([
          fetchProgressSummary(),
          fetchTopicPerformance(),
          fetchRecentActivity(),
          fetchLearningRecommendations(),
          fetchAnalytics()
        ])

        setSummary(summaryData)
        setTopicPerformance(topicData)
        setRecentActivity(activityData)
        setRecommendations(recommendationsData)
        setAnalytics(analyticsData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="progress-glass max-w-7xl mx-auto p-4 md:p-6">
        {/* Header with Glassmorphism Style */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative z-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4">
              <svg className="w-16 h-16 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-6 mb-4">
            📊 My Progress Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Track your learning journey with easy-to-understand charts and insights! 🚀
          </p>
          
          {/* Quick Stats Bar with Icons and Emojis */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="glass-card rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
                <div className="text-3xl mb-2">📹</div>
                <div className="text-2xl font-bold text-blue-600">{summary.completed_videos}</div>
                <div className="text-sm text-gray-600">Videos Watched</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
                <div className="text-3xl mb-2">🧠</div>
                <div className="text-2xl font-bold text-green-600">{summary.total_quizzes}</div>
                <div className="text-sm text-gray-600">Quizzes Taken</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-purple-600">{summary.average_score}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-200">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-orange-600">{summary.current_streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          )}
        </div>

        {/* Overview Cards with Better Visual Design */}
        {summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">📈</span>
              Your Learning Overview
            </h2>
            <OverviewCards summary={summary} />
          </div>
        )}

        {/* Performance Trends Section */}
        <div className="mb-8">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              How You're Improving Over Time
              <span className="text-lg ml-2">📈</span>
            </h3>
            {analytics && <PerformanceTrends analytics={analytics} />}
          </div>
        </div>

        {/* Topic Mastery Section - Below Performance Trends */}
        <div className="mb-8">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              Subject Mastery Levels
              <span className="text-lg ml-2">🏆</span>
            </h3>
            <TopicMastery topicPerformance={topicPerformance} />
          </div>
        </div>

        {/* Bottom Section with Friendly Headers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">⏰</span>
              What You've Been Learning
              <span className="text-lg ml-2">📚</span>
            </h3>
            <RecentActivity activities={recentActivity} />
          </div>

          {/* Learning Recommendations */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">💡</span>
              Smart Study Suggestions
              <span className="text-lg ml-2">🌟</span>
            </h3>
            <LearningRecommendations recommendations={recommendations} />
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="glass-card rounded-2xl p-6 mt-8 text-center bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Keep Up the Great Work!</h3>
          <p className="text-gray-600">
            You're making excellent progress in your NCC journey. Every step counts! 🚀
          </p>
          <div className="flex justify-center mt-4 space-x-2">
            <span className="text-2xl">💪</span>
            <span className="text-2xl">🎖️</span>
            <span className="text-2xl">🏅</span>
          </div>
        </div>

        {/* Mobile-specific spacing */}
        <div className="h-20 lg:hidden"></div>
      </div>
    </>
  )
}

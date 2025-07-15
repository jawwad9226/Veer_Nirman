'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { ChartData } from './types'

interface PerformanceTrendsProps {
  analytics: ChartData
  loading?: boolean
}

export default function PerformanceTrends({ analytics, loading }: PerformanceTrendsProps) {
  if (loading) {
    return (
      <div className="progress-card rounded-2xl p-6 mb-8">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    )
  }

  // Process score trend data for chart
  const scoreData = analytics.score_trend.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  // Calculate trend
  const scores = analytics.score_trend.map(item => item.score)
  const recentScores = scores.slice(-5)
  const earlierScores = scores.slice(0, 5)
  const trend = recentScores.length > 0 && earlierScores.length > 0 
    ? (recentScores.reduce((a, b) => a + b) / recentScores.length) - 
      (earlierScores.reduce((a, b) => a + b) / earlierScores.length)
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          <p className="text-blue-600">
            {`Score: ${payload[0].value.toFixed(1)}%`}
          </p>
          {payload[0].payload.topic && (
            <p className="text-gray-600 text-sm">
              {`Topic: ${payload[0].payload.topic}`}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="progress-card rounded-2xl p-4 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Performance Trends
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Your quiz scores over time
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className={`w-3 h-3 rounded-full ${trend > 0 ? 'bg-green-500' : trend < 0 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'}
            </span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            Last 30 days
          </div>
        </div>
      </div>

      <div className="h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={scoreData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={10}
              tick={{ fill: '#6b7280' }}
              minTickGap={8}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#6b7280"
              fontSize={10}
              tick={{ fill: '#6b7280' }}
              label={undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats below chart */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">Best Streak</p>
          <p className="text-base sm:text-lg font-semibold text-green-600">
            {Math.max(...scoreData.map(d => d.score)).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">Average</p>
          <p className="text-base sm:text-lg font-semibold text-blue-600">
            {(scoreData.reduce((sum, d) => sum + d.score, 0) / scoreData.length).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">Trend</p>
          <p className={`text-base sm:text-lg font-semibold ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}

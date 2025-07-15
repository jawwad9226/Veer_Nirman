"use client"

import React, { useEffect, useState } from "react"

interface AnalyticsData {
  total_quizzes: number
  average_score: number
  best_score: number
  worst_score: number
  favorite_topic: string
  strength_areas: string[]
  improvement_areas: string[]
  recent_trend: string
  total_time_spent: number
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/quiz/overview`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Quiz Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="Total Quizzes" value={data.total_quizzes} />
        <StatCard label="Average Score" value={data.average_score + '%'} />
        <StatCard label="Best Score" value={data.best_score + '%'} />
        <StatCard label="Worst Score" value={data.worst_score + '%'} />
        <StatCard label="Total Time Spent" value={formatDuration(data.total_time_spent)} />
        <StatCard label="Favorite Topic" value={data.favorite_topic} />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Strength Areas</h2>
        <TagList tags={data.strength_areas} color="green" />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Improvement Areas</h2>
        <TagList tags={data.improvement_areas} color="red" />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recent Trend</h2>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg inline-block">{data.recent_trend}</div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="text-gray-500 text-sm mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function TagList({ tags, color }: { tags: string[], color: 'green' | 'red' }) {
  if (!tags || tags.length === 0) return <div className="text-gray-400">None</div>
  const colorClass = color === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>{tag}</span>
      ))}
    </div>
  )
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

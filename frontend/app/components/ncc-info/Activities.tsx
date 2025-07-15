'use client'

import React, { useState } from 'react'
import { Tent, Users, Palette, ChevronDown, ChevronUp, Calendar, MapPin, Clock } from 'lucide-react'
import { nccActivities } from './data'
import './ncc-glass.css'

export default function Activities() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'camps' | 'social' | 'cultural'>('all')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: 'All Activities', icon: <Users className="h-5 w-5" />, emoji: '🌟' },
    { id: 'camps', label: 'Camps & Training', icon: <Tent className="h-5 w-5" />, emoji: '🏕️' },
    { id: 'social', label: 'Social Service', icon: <Users className="h-5 w-5" />, emoji: '🤝' },
    { id: 'cultural', label: 'Cultural Events', icon: <Palette className="h-5 w-5" />, emoji: '🎭' }
  ]

  const filteredActivities = selectedCategory === 'all' 
    ? nccActivities 
    : nccActivities.filter(activity => activity.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'camps': return 'from-green-500 to-emerald-600'
      case 'social': return 'from-orange-500 to-amber-600'
      case 'cultural': return 'from-purple-500 to-violet-600'
      default: return 'from-blue-500 to-cyan-600'
    }
  }

  const getCategoryStats = () => {
    const camps = nccActivities.filter(a => a.category === 'camps').length
    const social = nccActivities.filter(a => a.category === 'social').length
    const cultural = nccActivities.filter(a => a.category === 'cultural').length
    return { camps, social, cultural }
  }

  const stats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="text-6xl mr-4 bounce-icon">🎯</div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              NCC Activities
            </h1>
            <p className="text-lg text-gray-700 mt-2">Adventures, Service, and Excellence</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="ncc-content-card text-center">
          <div className="text-3xl mb-2">🏕️</div>
          <div className="text-2xl font-bold text-green-600">{stats.camps}</div>
          <div className="text-sm text-gray-600">Training Camps</div>
        </div>
        <div className="ncc-content-card text-center">
          <div className="text-3xl mb-2">🤝</div>
          <div className="text-2xl font-bold text-orange-600">{stats.social}</div>
          <div className="text-sm text-gray-600">Social Activities</div>
        </div>
        <div className="ncc-content-card text-center">
          <div className="text-3xl mb-2">🎭</div>
          <div className="text-2xl font-bold text-purple-600">{stats.cultural}</div>
          <div className="text-sm text-gray-600">Cultural Events</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-white bg-opacity-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{category.emoji}</span>
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={`ncc-activity-card ${activity.category}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(activity.category)} rounded-full flex items-center justify-center text-white mr-3`}>
                  <span className="text-xl">{activity.emoji}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{activity.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.category === 'camps' ? 'bg-green-100 text-green-700' :
                      activity.category === 'social' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpandedActivity(
                  expandedActivity === activity.id ? null : activity.id
                )}
                className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {expandedActivity === activity.id ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{activity.description}</p>

            {expandedActivity === activity.id && (
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 text-sm mb-2">Key Features:</h4>
                {activity.details.map((detail, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-gray-600 text-xs">{detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upcoming Events Section */}
      <div className="ncc-content-card">
        <div className="flex items-center mb-4">
          <div className="text-3xl mr-3 bounce-icon">📅</div>
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
        </div>
        
        <div className="space-y-3">
          {[
            {
              title: 'Annual Training Camp 2025',
              date: 'March 15-25, 2025',
              location: 'Camp Khamgaon',
              type: 'Training Camp',
              emoji: '🏕️'
            },
            {
              title: 'Environment Day Celebration',
              date: 'June 5, 2025',
              location: 'Multiple Locations',
              type: 'Social Service',
              emoji: '🌱'
            },
            {
              title: 'Independence Day Parade',
              date: 'August 15, 2025',
              location: 'District Headquarters',
              type: 'Cultural Event',
              emoji: '🇮🇳'
            }
          ].map((event, index) => (
            <div key={index} className="flex items-center p-3 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
              <div className="text-2xl mr-3">{event.emoji}</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{event.title}</h4>
                <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {event.date}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {event.location}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.type === 'Training Camp' ? 'bg-green-100 text-green-700' :
                event.type === 'Social Service' ? 'bg-orange-100 text-orange-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="flex justify-center space-x-3 mb-3">
          <span className="text-2xl">🚀</span>
          <span className="text-2xl">💪</span>
          <span className="text-2xl">🎉</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Ready for Adventure?</h3>
        <p className="text-gray-600 text-sm">
          Join us in these exciting activities and make memories that will last a lifetime!
        </p>
      </div>
    </div>
  )
}

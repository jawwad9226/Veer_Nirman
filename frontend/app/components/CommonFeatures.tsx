'use client'

import React from 'react'
import { 
  BookOpen, 
  Brain, 
  Play, 
  BarChart3, 
  Target, 
  History,
  TrendingUp,
  Users,
  PlayCircle,
  Award,
  Info
} from 'lucide-react'

interface CommonFeaturesProps {
  setActiveTab?: (tab: string) => void
}

const priorityFeatures = [
  { 
    title: 'Syllabus Viewer', 
    description: 'Access complete training curriculum', 
    icon: BookOpen, 
    color: 'bg-gradient-to-br from-blue-600 to-blue-700',
    hoverColor: 'hover:from-blue-700 hover:to-blue-800',
    targetTab: 'syllabus'
  },
  { 
    title: 'Take Assessment', 
    description: 'Test your knowledge and skills', 
    icon: Brain, 
    color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
    hoverColor: 'hover:from-indigo-700 hover:to-indigo-800',
    targetTab: 'quiz'
  },
  { 
    title: 'Know About NCC', 
    description: 'Learn NCC history, values & activities', 
    icon: Info, 
    color: 'bg-gradient-to-br from-orange-600 to-green-600',
    hoverColor: 'hover:from-orange-700 hover:to-green-700',
    targetTab: 'ncc-info'
  }
]

const secondaryFeatures = [
  { 
    title: 'Training Videos', 
    description: 'Watch interactive tutorials', 
    icon: PlayCircle, 
    color: 'bg-gradient-to-br from-purple-600 to-purple-700',
    hoverColor: 'hover:from-purple-700 hover:to-purple-800',
    targetTab: 'videos'
  },
  { 
    title: 'Progress Dashboard', 
    description: 'Track your learning journey', 
    icon: TrendingUp, 
    color: 'bg-gradient-to-br from-green-600 to-green-700',
    hoverColor: 'hover:from-green-700 hover:to-green-800',
    targetTab: 'dashboard'
  },
  { 
    title: 'Practice Mode', 
    description: 'Sharpen your skills', 
    icon: Target, 
    color: 'bg-gradient-to-br from-orange-600 to-orange-700',
    hoverColor: 'hover:from-orange-700 hover:to-orange-800',
    targetTab: 'quiz'
  },
  { 
    title: 'Activity History', 
    description: 'Review past activities', 
    icon: History, 
    color: 'bg-gradient-to-br from-gray-600 to-gray-700',
    hoverColor: 'hover:from-gray-700 hover:to-gray-800',
    targetTab: 'dashboard'
  }
]

export default function CommonFeatures({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  return (
    <div className="mx-2 sm:mx-4 mb-4 sm:mb-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-100 p-4 sm:p-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Training Center
            </h2>
            <p className="text-xs sm:text-gray-600">Your learning and development hub</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Priority Features - 2 Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 flex items-center">
              <span className="w-1.5 h-5 sm:w-2 sm:h-6 bg-gradient-to-b from-green-600 to-blue-600 rounded-full mr-2 sm:mr-3"></span>
              Core Learning
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {priorityFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    onClick={() => setActiveTab?.(feature.targetTab)}
                    className={`${feature.color} ${feature.hoverColor} text-white p-5 sm:p-8 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden`}
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full -mr-8 sm:-mr-12 -mt-8 sm:-mt-12 transition-transform group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-10 sm:w-16 h-10 sm:h-16 bg-white/5 rounded-full -ml-5 sm:-ml-8 -mb-5 sm:-mb-8"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3">
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h4 className="font-bold text-base sm:text-xl mb-2 sm:mb-3">{feature.title}</h4>
                      <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{feature.description}</p>
                      {/* Action arrow */}
                      <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="mr-1 sm:mr-2">Get Started</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Secondary Features - Right Column */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 flex items-center">
              <span className="w-1.5 h-5 sm:w-2 sm:h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full mr-2 sm:mr-3"></span>
              Quick Tools
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {secondaryFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    onClick={() => setActiveTab?.(feature.targetTab)}
                    className={`${feature.color} ${feature.hoverColor} text-white p-3 sm:p-5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg group relative overflow-hidden`}
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-10 sm:w-16 h-10 sm:h-16 bg-white/10 rounded-full -mr-5 sm:-mr-8 -mt-5 sm:-mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center space-x-2 sm:space-x-4 relative z-10">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs sm:text-base">{feature.title}</h4>
                        <p className="text-xs sm:text-sm opacity-90 mt-1">{feature.description}</p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-60 group-hover:opacity-100 transition-all group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* Enhanced Stats Section */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4 text-center">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border border-blue-200 group hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-0.5 sm:mb-1">1,250</div>
              <div className="text-xs sm:text-sm text-blue-600/80 font-medium">Active Cadets</div>
            </div>
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl border border-purple-200 group hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-0.5 sm:mb-1">45</div>
              <div className="text-xs sm:text-sm text-purple-600/80 font-medium">Training Videos</div>
            </div>
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl border border-green-200 group hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-green-600 mb-0.5 sm:mb-1">120</div>
              <div className="text-xs sm:text-sm text-green-600/80 font-medium">Assessments</div>
            </div>
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl border border-yellow-200 group hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-yellow-600 mb-0.5 sm:mb-1">98%</div>
              <div className="text-xs sm:text-sm text-yellow-600/80 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

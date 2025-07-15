'use client'

import React, { useEffect, useState } from 'react'
import { 
  Home, 
  Play, 
  Brain, 
  BookOpen, 
  BarChart3, 
  Info,
  Settings 
} from 'lucide-react'

interface TabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  position: 'sidebar' | 'bottom'
}

const tabs = [
  { id: 'home', name: 'Home', icon: Home },
  { id: 'videos', name: 'Videos', icon: Play },
  { id: 'quiz', name: 'Assessment', icon: Brain },
  { id: 'syllabus', name: 'Syllabus', icon: BookOpen },
  { id: 'dashboard', name: 'Progress', icon: BarChart3 },
  { id: 'settings', name: 'Settings', icon: Settings }
];

export default function TabNavigation({ activeTab, setActiveTab, position }: TabNavigationProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  if (position === 'sidebar') {
    return (
      <aside className="fixed left-0 header-aware-fixed h-[calc(100vh-var(--combined-header-height))] w-20 bg-white/95 backdrop-blur-lg shadow-xl border-r border-gray-200 z-30">
        <nav className="flex flex-col items-center py-8 space-y-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative w-14 h-14 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
                title={tab.name}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <IconComponent className="w-6 h-6" />
                </div>
                
                {/* Enhanced Tooltip */}
                <div className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  {tab.name}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                )}
              </button>
            )
          })}
        </nav>
      </aside>
    )
  }

  // Bottom navigation for mobile
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-30 shadow-lg">
      <div className="flex items-center justify-around py-2 px-1 sm:py-3 sm:px-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2 sm:py-2 sm:px-3 rounded-lg transition-all duration-200 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-400 relative ${
                isActive
                  ? 'text-blue-600 bg-blue-50 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{ minWidth: 0, flex: 1, maxWidth: 80 }}
              aria-label={tab.name}
            >
              <div className={`w-6 h-6 mb-0.5 sm:mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                <IconComponent className="w-full h-full" />
              </div>
              <span className={`text-[10px] sm:text-xs font-medium truncate ${isActive ? 'font-semibold' : ''}`}>{tab.name}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

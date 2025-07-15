'use client'

import React, { useState } from 'react'
import { Info, Shield, Calendar, MapPin } from 'lucide-react'
import { NCCTabType } from './types'
import AboutNCC from './AboutNCC'
import CadetCommandments from './CadetCommandments'
import Activities from './Activities'
import LocalNCC from './LocalNCC'
import './ncc-glass.css'

const nccTabs: NCCTabType[] = [
  { id: 'about', label: 'About NCC', icon: 'Info', emoji: '📚' },
  { id: 'commandments', label: 'Cadet Commandments', icon: 'Shield', emoji: '🎖️' },
  { id: 'activities', label: 'Activities', icon: 'Calendar', emoji: '🎯' },
  { id: 'local', label: 'Local NCC Info', icon: 'MapPin', emoji: '🏛️' }
]

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Info': return <Info className="h-5 w-5" />
    case 'Shield': return <Shield className="h-5 w-5" />
    case 'Calendar': return <Calendar className="h-5 w-5" />
    case 'MapPin': return <MapPin className="h-5 w-5" />
    default: return <Info className="h-5 w-5" />
  }
}

export default function NCCInfoContainer() {
  const [activeTab, setActiveTab] = useState<NCCTabType['id']>('about')

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutNCC />
      case 'commandments':
        return <CadetCommandments />
      case 'activities':
        return <Activities />
      case 'local':
        return <LocalNCC />
      default:
        return <AboutNCC />
    }
  }

  return (
    <div className="ncc-glass">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="text-6xl mr-4 bounce-icon">🇮🇳</div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
              Know About NCC
            </h1>
            <p className="text-xl text-gray-700 mt-2">National Cadet Corps • राष्ट्रीय कैडेट कोर</p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1 w-32 rounded-full"></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {nccTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`ncc-tab-button flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            <span className="text-xl">{tab.emoji}</span>
            {getIcon(tab.icon)}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="transition-all duration-500 ease-in-out">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 p-6 bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-xl border border-gray-200">
        <div className="flex justify-center space-x-4 mb-3">
          <span className="text-2xl">🏅</span>
          <span className="text-2xl">🇮🇳</span>
          <span className="text-2xl">⭐</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Unity and Discipline • एकता और अनुशासन</h3>
        <p className="text-gray-600 text-sm">
          Building tomorrow's leaders, serving the nation with pride and dedication
        </p>
      </div>
    </div>
  )
}

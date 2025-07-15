'use client'

import React, { useState } from 'react'
import { Info, Users, Calendar, MapPin, ChevronDown, ChevronUp, Play, Music } from 'lucide-react'
import { aboutNCC, nccSongs } from './data'
import './ncc-glass.css'

export default function AboutNCC() {
  const [expandedSong, setExpandedSong] = useState<string | null>(null)

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const sections = [
    { key: 'history', icon: <Info className="h-6 w-6" />, data: aboutNCC.history },
    { key: 'motto', icon: <Users className="h-6 w-6" />, data: aboutNCC.motto },
    { key: 'aims', icon: <Calendar className="h-6 w-6" />, data: aboutNCC.aims },
    { key: 'role', icon: <MapPin className="h-6 w-6" />, data: aboutNCC.role }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="text-6xl mr-4 bounce-icon">🇮🇳</div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
              About NCC
            </h1>
            <p className="text-lg text-gray-700 mt-2">Unity and Discipline • एकता और अनुशासन</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.key} className="ncc-content-card">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white mr-4">
                {section.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">{section.data.emoji}</span>
                  {section.data.title}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {section.data.content.map((point, index) => (
                <div key={index} className="flex items-start ncc-text-content">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-800 text-sm leading-relaxed font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* NCC Songs Section */}
      <div className="mt-8">
        <div className="flex items-center mb-6">
          <div className="text-4xl mr-3 bounce-icon">🎵</div>
          <h2 className="text-3xl font-bold text-gray-800">NCC Songs</h2>
        </div>
        
        <div className="space-y-4">
          {nccSongs.map((song) => (
            <div key={song.id} className="ncc-song-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white mr-3">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{song.title}</h3>
                    <p className="text-sm text-gray-600">{song.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {song.audioUrl && (
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                      <Play className="h-3 w-3" />
                      <span>Play</span>
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    <span>Lyrics</span>
                    {expandedSong === song.id ? 
                      <ChevronUp className="h-3 w-3" /> : 
                      <ChevronDown className="h-3 w-3" />
                    }
                  </button>
                </div>
              </div>
              
              {expandedSong === song.id && (
                <div className="ncc-lyrics">
                  {song.lyrics.map((line, index) => (
                    <div key={index} className="text-blue-800 mb-1">
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inspirational Footer */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-xl border border-gray-200">
        <div className="flex justify-center space-x-3 mb-3">
          <span className="text-2xl">🏆</span>
          <span className="text-2xl">⭐</span>
          <span className="text-2xl">🎖️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Proud to be an NCC Cadet!</h3>
        <p className="text-gray-600 text-sm">
          Building character, serving the nation, and creating future leaders since 1948
        </p>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Shield, ChevronDown, ChevronUp, Star, Award } from 'lucide-react'
import { cadetCommandments } from './data'
import './ncc-glass.css'

export default function CadetCommandments() {
  const [expandedCommandment, setExpandedCommandment] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="text-6xl mr-4 bounce-icon">🎖️</div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cadet Commandments
            </h1>
            <p className="text-lg text-gray-700 mt-2">Core Values Every NCC Cadet Must Follow</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="ncc-content-card text-center">
        <div className="flex justify-center mb-4">
          <div className="text-4xl">⚡</div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">The Foundation of Character</h3>
        <p className="text-gray-700">
          These commandments form the backbone of every NCC cadet's character. They are not just rules, 
          but principles that guide us in becoming better citizens and future leaders of our nation.
        </p>
      </div>

      {/* Commandments */}
      <div className="space-y-4">
        {cadetCommandments.map((commandment) => (
          <div key={commandment.id} className="ncc-commandment-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white mr-4">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">{commandment.emoji}</span>
                    {commandment.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{commandment.description}</p>
                </div>
              </div>
              <button
                onClick={() => setExpandedCommandment(
                  expandedCommandment === commandment.id ? null : commandment.id
                )}
                className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {expandedCommandment === commandment.id ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>

            {expandedCommandment === commandment.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commandment.details.map((detail, index) => (
                    <div key={index} className="flex items-start p-3 bg-white bg-opacity-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700 text-sm">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pledge Section */}
      <div className="ncc-content-card bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl bounce-icon">🤝</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">The NCC Pledge</h3>
          <div className="bg-white bg-opacity-70 rounded-lg p-6 text-left">
            <p className="text-gray-800 leading-relaxed italic">
              "We, the cadets of the National Cadet Corps, do solemnly pledge that we shall always uphold 
              the unity of India. We resolve to be disciplined and responsible citizens of our nation. 
              We shall undertake positive community service in the spirit of selflessness and concern for our fellow beings."
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Discipline', emoji: '⚡', color: 'from-red-500 to-orange-500' },
          { title: 'Unity', emoji: '🤝', color: 'from-blue-500 to-cyan-500' },
          { title: 'Service', emoji: '🙏', color: 'from-green-500 to-emerald-500' },
          { title: 'Integrity', emoji: '✨', color: 'from-purple-500 to-pink-500' }
        ].map((badge, index) => (
          <div key={index} className="ncc-content-card text-center pulse-glow">
            <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-r ${badge.color} rounded-full flex items-center justify-center text-white text-2xl`}>
              {badge.emoji}
            </div>
            <h4 className="font-bold text-gray-800">{badge.title}</h4>
            <div className="flex justify-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Footer */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <div className="flex justify-center space-x-3 mb-3">
          <span className="text-2xl">🏅</span>
          <span className="text-2xl">🌟</span>
          <span className="text-2xl">💪</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Live by these values, lead by example!</h3>
        <p className="text-gray-600 text-sm">
          Every great leader was once a disciplined follower. Embrace these commandments and shape your destiny.
        </p>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Video, 
  BookOpen, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  ClipboardList,
  GraduationCap,
  FileText,
  Shield,
  Settings,
  Database,
  Globe,
  Lock,
  Zap,
  TrendingUp,
  Activity,
  Star,
  Calendar
} from 'lucide-react'

interface RoleBasedFeaturesProps {
  userRole: 'admin' | 'instructor'
  onFeatureClick?: (featureTitle: string) => void
}

const adminFeatures = {
  priority: [
    { 
      title: 'User Management', 
      description: 'Manage cadets, instructors, and admin roles with advanced permissions', 
      icon: Users, 
      color: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700',
      hoverColor: 'hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800',
      badge: 'Core',
      stats: '1,250 users'
    },
    { 
      title: 'Content Studio', 
      description: 'Advanced video management with AI-powered tagging and analytics', 
      icon: Video, 
      color: 'bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700',
      hoverColor: 'hover:from-purple-700 hover:via-purple-800 hover:to-pink-800',
      badge: 'Enhanced',
      stats: '45 videos'
    },
    { 
      title: 'Curriculum Engine', 
      description: 'AI-assisted syllabus creation with adaptive learning paths', 
      icon: BookOpen, 
      color: 'bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700',
      hoverColor: 'hover:from-emerald-700 hover:via-green-800 hover:to-teal-800',
      badge: 'Smart',
      stats: '12 courses'
    },
    { 
      title: 'Security Console', 
      description: 'Advanced security monitoring and access control management', 
      icon: Shield, 
      color: 'bg-gradient-to-br from-red-600 via-red-700 to-rose-700',
      hoverColor: 'hover:from-red-700 hover:via-red-800 hover:to-rose-800',
      badge: 'Critical',
      stats: '100% secure'
    }
  ],
  secondary: [
    { 
      title: 'Analytics Hub', 
      description: 'Real-time platform insights', 
      icon: BarChart3, 
      color: 'bg-gradient-to-br from-yellow-600 to-orange-600',
      hoverColor: 'hover:from-yellow-700 hover:to-orange-700'
    },
    { 
      title: 'Feedback Center', 
      description: 'Advanced sentiment analysis', 
      icon: MessageSquare, 
      color: 'bg-gradient-to-br from-cyan-600 to-blue-600',
      hoverColor: 'hover:from-cyan-700 hover:to-blue-700'
    },
    { 
      title: 'System Monitor', 
      description: 'Real-time health tracking', 
      icon: Activity, 
      color: 'bg-gradient-to-br from-green-600 to-emerald-600',
      hoverColor: 'hover:from-green-700 hover:to-emerald-700'
    },
    { 
      title: 'Global Settings', 
      description: 'Platform configuration', 
      icon: Settings, 
      color: 'bg-gradient-to-br from-slate-600 to-gray-600',
      hoverColor: 'hover:from-slate-700 hover:to-gray-700'
    },
    { 
      title: 'Data Management', 
      description: 'Database administration', 
      icon: Database, 
      color: 'bg-gradient-to-br from-indigo-600 to-purple-600',
      hoverColor: 'hover:from-indigo-700 hover:to-purple-700'
    },
    { 
      title: 'API Gateway', 
      description: 'External integrations', 
      icon: Globe, 
      color: 'bg-gradient-to-br from-teal-600 to-cyan-600',
      hoverColor: 'hover:from-teal-700 hover:to-cyan-700'
    }
  ]
}

const instructorFeatures = {
  priority: [
    { 
      title: 'Content Studio', 
      description: 'Create and manage training content with advanced authoring tools', 
      icon: Video, 
      color: 'bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700',
      hoverColor: 'hover:from-purple-700 hover:via-purple-800 hover:to-pink-800',
      badge: 'Create',
      stats: '25 videos'
    },
    { 
      title: 'Course Builder', 
      description: 'Design adaptive learning paths with interactive modules', 
      icon: BookOpen, 
      color: 'bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-700',
      hoverColor: 'hover:from-indigo-700 hover:via-blue-800 hover:to-cyan-800',
      badge: 'Design',
      stats: '8 courses'
    },
    { 
      title: 'Assessment Hub', 
      description: 'Create intelligent assessments with real-time feedback', 
      icon: GraduationCap, 
      color: 'bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700',
      hoverColor: 'hover:from-emerald-700 hover:via-green-800 hover:to-teal-800',
      badge: 'Assess',
      stats: '45 tests'
    },
    { 
      title: 'Progress Analytics', 
      description: 'Monitor cadet performance with detailed insights', 
      icon: BarChart3, 
      color: 'bg-gradient-to-br from-orange-600 via-red-700 to-pink-700',
      hoverColor: 'hover:from-orange-700 hover:via-red-800 hover:to-pink-800',
      badge: 'Monitor',
      stats: '95% success'
    }
  ],
  secondary: [
    { 
      title: 'Content Library', 
      description: 'Access shared resources', 
      icon: FileText, 
      color: 'bg-gradient-to-br from-blue-600 to-indigo-600',
      hoverColor: 'hover:from-blue-700 hover:to-indigo-700'
    },
    { 
      title: 'Collaboration Hub', 
      description: 'Work with other instructors', 
      icon: Users, 
      color: 'bg-gradient-to-br from-green-600 to-teal-600',
      hoverColor: 'hover:from-green-700 hover:to-teal-700'
    },
    { 
      title: 'Schedule Manager', 
      description: 'Organize training sessions', 
      icon: Calendar, 
      color: 'bg-gradient-to-br from-purple-600 to-pink-600',
      hoverColor: 'hover:from-purple-700 hover:to-pink-700'
    },
    { 
      title: 'Resource Bank', 
      description: 'Training materials', 
      icon: Database, 
      color: 'bg-gradient-to-br from-yellow-600 to-orange-600',
      hoverColor: 'hover:from-yellow-700 hover:to-orange-700'
    }
  ]
}

export default function RoleBasedFeatures({ userRole, onFeatureClick }: RoleBasedFeaturesProps) {
  const features = userRole === 'admin' ? adminFeatures : instructorFeatures
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [animatedStats, setAnimatedStats] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-4 mb-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-500/5 to-blue-500/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent capitalize">
                  {userRole} Command Center
                </h2>
                <p className="text-xs sm:text-base text-gray-600 font-medium">Advanced administrative control panel</p>
              </div>
            </div>
            {/* Status indicator */}
            <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-green-700">All Systems Online</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-8">
            {/* Priority Features - Larger Grid */}
            <div className="xl:col-span-3">
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <span className="w-2 h-6 sm:w-3 sm:h-8 bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-600 rounded-full mr-2 sm:mr-4"></span>
                Mission Critical Operations
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {features.priority.map((feature, index) => {
                  const IconComponent = feature.icon
                  const isHovered = hoveredCard === `priority-${index}`
                  return (
                    <div
                      key={index}
                      className={`${feature.color} ${feature.hoverColor} text-white p-4 sm:p-8 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden`}
                      onMouseEnter={() => setHoveredCard(`priority-${index}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => onFeatureClick?.(feature.title)}
                    >
                      {/* Animated background decorations */}
                      <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 transition-all duration-500 group-hover:scale-125 group-hover:rotate-45"></div>
                      <div className="absolute bottom-0 left-0 w-12 sm:w-20 h-12 sm:h-20 bg-white/5 rounded-full -ml-6 sm:-ml-10 -mb-6 sm:-mb-10 transition-all duration-500 group-hover:scale-110"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 sm:w-40 h-24 sm:h-40 bg-white/5 rounded-full -ml-12 sm:-ml-20 -mt-12 sm:-mt-20 transition-all duration-700 group-hover:scale-150 group-hover:rotate-180"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          {feature.badge && (
                            <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              {feature.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base sm:text-xl mb-2 sm:mb-3 leading-tight">{feature.title}</h4>
                        <p className="text-xs sm:text-sm opacity-90 leading-relaxed mb-2 sm:mb-4">{feature.description}</p>
                        {feature.stats && (
                          <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-white/20">
                            <span className="text-xs opacity-75">Current Status</span>
                            <span className="text-xs sm:text-sm font-bold">{feature.stats}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Quick Access Panel */}
            <div className="xl:col-span-1">
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <span className="w-2 h-6 sm:w-3 sm:h-8 bg-gradient-to-b from-green-600 via-teal-600 to-cyan-600 rounded-full mr-2 sm:mr-4"></span>
                Quick Actions
              </h3>
              <div className="space-y-2 sm:space-y-4">
                {features.secondary.map((feature, index) => {
                  const IconComponent = feature.icon
                  const isHovered = hoveredCard === `secondary-${index}`
                  return (
                    <div
                      key={index}
                      className={`${feature.color} ${feature.hoverColor} text-white p-3 sm:p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl group relative overflow-hidden`}
                      onMouseEnter={() => setHoveredCard(`secondary-${index}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-10 sm:w-20 h-10 sm:h-20 bg-white/10 rounded-full -mr-5 sm:-mr-10 -mt-5 sm:-mt-10 transition-all duration-300 group-hover:scale-125"></div>
                      <div className="flex items-center space-x-2 sm:space-x-4 relative z-10">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm truncate">{feature.title}</h4>
                          <p className="text-[10px] sm:text-xs opacity-90 mt-0.5 sm:mt-1 leading-tight">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-blue-600" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { label: 'Active Users', value: '1,250', color: 'blue', icon: Users, trend: '+12%' },
                { label: 'Training Videos', value: '45', color: 'purple', icon: Video, trend: '+5%' },
                { label: 'Assessments', value: '120', color: 'green', icon: GraduationCap, trend: '+8%' },
                { label: 'Success Rate', value: '98%', color: 'yellow', icon: Star, trend: '+2%' },
                { label: 'Uptime', value: '99.9%', color: 'emerald', icon: Zap, trend: '0%' },
                { label: 'Satisfaction', value: '4.8/5', color: 'pink', icon: Star, trend: '+0.2' }
              ].map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div
                    key={index}
                    className={`text-center p-6 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-xl border border-${stat.color}-200 hover:shadow-lg transition-all duration-300 group`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-2xl font-bold text-${stat.color}-600 transition-all duration-1000 ${animatedStats ? 'scale-100' : 'scale-0'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm text-${stat.color}-600/80 font-medium mb-1`}>{stat.label}</div>
                    <div className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : stat.trend === '0%' ? 'text-gray-500' : 'text-red-600'}`}>
                      {stat.trend}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

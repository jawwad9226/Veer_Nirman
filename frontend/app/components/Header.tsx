"use client"
import React, { useState, useEffect, useRef } from 'react'
import { User, Bell, Settings, ChevronDown, Info, Search, Menu, LogOut } from 'lucide-react'
import { useAuth } from './FirebaseAuthProvider'
import { useRouter } from 'next/navigation'

interface User {
  name: string
  role: string
  avatar: string
  unit: string
}

interface HeaderProps {
  user?: User
  onRoleChange?: (role: string) => void
  setActiveTab?: (tab: string) => void
}

export default function Header({ user: propUser, onRoleChange, setActiveTab }: HeaderProps) {
  const { user: authUser, logout, loading } = useAuth()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count
  const [currentTime, setCurrentTime] = useState('')
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Use auth user if available, fallback to prop user
  const user = authUser || propUser

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isProfileOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
      case 'instructor':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
      case 'cadet':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50 h-20">
      <div className="flex items-center justify-between px-6 py-4 h-full">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-white">
            <img src="/logo.svg" alt="VEER NIRMAN Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300">
              VEER NIRMAN
            </h1>
            <p className="text-sm text-gray-600 hidden sm:block font-medium">Valor & Excellence Platform</p>
          </div>
        </div>

        {/* Center: Search and Quick Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  {notifications}
                </span>
              )}
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Right: Time and Profile Section */}
        <div className="flex items-center space-x-4">
          {/* Current Time */}
          <div className="hidden md:block text-right">
            <div className="text-sm font-bold text-gray-800">{currentTime}</div>
            <div className="text-xs text-gray-500">Local Time</div>
          </div>
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-all duration-200 group"
              onClick={handleProfileClick}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {user?.name || 'User'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${getRoleBadgeColor(user?.role || 'cadet')}`}>
                    {user?.role || 'cadet'}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {user?.unit || 'NCC Unit'}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {(user as any)?.avatar ? (
                    <img
                      src={(user as any).avatar}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover rounded-xl"
                      style={{ background: '#fff' }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user?.unit || 'NCC Unit'}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setIsProfileOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => { setActiveTab && setActiveTab('ncc-info'); setIsProfileOpen(false); }}
                  >
                    <Info className="w-4 h-4 mr-3 text-blue-600" />
                    NCC Info
                  </button>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 mr-3" />
                    Preferences
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                  </a>
                </div>
                {/* Role Switcher for Demo/Testing */}
                {onRoleChange && (
                  <div className="border-t border-gray-100 py-2 px-4">
                    <label className="block text-xs text-gray-500 mb-1 font-semibold">Switch Role (Demo)</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={user?.role || 'cadet'}
                      onChange={e => onRoleChange(e.target.value)}
                    >
                      <option value="cadet">Cadet</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
                <div className="border-t border-gray-100 py-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

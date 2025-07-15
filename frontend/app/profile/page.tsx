'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  User, Mail, Building, Shield, Edit3, Save, X, Camera, Award, 
  Calendar, MapPin, Phone, Globe, Star, Trophy, Target, BookOpen 
} from 'lucide-react'
import { useAuth } from '../components/FirebaseAuthProvider'
import { updateUserProfile } from '../lib/firebase-auth'

interface ProfileData {
  name: string
  email: string
  unit: string
  role: string
  avatar: string
  phone: string
  location: string
  joinDate: string
  bio: string
  achievements: string[]
  stats: {
    quizzesCompleted: number
    averageScore: number
    totalPoints: number
    streak: number
  }
}

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Cadet Sharma',
    email: 'cadet.sharma@ncc.gov.in',
    unit: 'NCC Headquarters',
    role: 'cadet',
    avatar: '/file.svg',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    joinDate: '2024-01-15',
    bio: 'Dedicated NCC cadet with a passion for leadership, discipline, and service to the nation. Currently pursuing Certificate A with excellent performance in drill and adventure activities.',
    achievements: ['Certificate A Completed', 'Best Cadet Award 2024', 'Leadership Camp Graduate', 'Adventure Activity Champion'],
    stats: {
      quizzesCompleted: 47,
      averageScore: 85,
      totalPoints: 3250,
      streak: 12
    }
  })
  const [editData, setEditData] = useState<ProfileData>(profileData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user data from Firebase auth
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        unit: user.unit || '1st Battalion NCC',
        role: user.role,
        avatar: user.photoURL || '/default-avatar.png',
        phone: user.phone || '',
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      }))
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({ ...profileData })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update Firebase user profile
      const updatedUser = await updateUserProfile({
        name: editData.name,
        unit: editData.unit,
        phone: editData.phone,
        photoURL: editData.avatar
      })
      
      // Update local state
      setProfileData({ ...editData })
      updateUser(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      // TODO: Show error message
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({ ...profileData })
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      case 'instructor':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      case 'cadet':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 font-medium">Manage your VEER NIRMAN account and training progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-8 relative overflow-hidden">
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-blue-600 to-green-500"></div>
            
            {/* Edit Controls */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div 
                    className={`w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-white ${
                      isEditing ? 'cursor-pointer hover:scale-105' : ''
                    } transition-all duration-300`}
                    onClick={handleAvatarClick}
                  >
                    {(isEditing ? editData.avatar : profileData.avatar) ? (
                      <img
                        src={isEditing ? editData.avatar : profileData.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none mb-2"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${getRoleBadgeColor(profileData.role)}`}>
                    {profileData.role}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-600" />
                  Organization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.unit}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cadet Verification - Only show for cadets */}
              {user?.role === 'cadet' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Cadet Verification
                  </h3>
                  {user?.isVerifiedCadet ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <Shield className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-bold text-green-800">Verified NCC Cadet</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Regimental Number</label>
                          <p className="text-gray-600 font-mono">{user.regimentalNumber}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                          <p className="text-gray-600">{user.nccState}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Division</label>
                          <p className="text-gray-600">{user.nccDivision}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Wing</label>
                          <p className="text-gray-600">{user.nccWing}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
                          <p className="text-gray-600">{user.nccYear}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="font-bold text-yellow-800">Verification Pending</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        Complete your cadet verification to access all features. Contact your unit admin for assistance.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  About
                </h3>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">{profileData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats and Achievements Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2 text-blue-600" />
                Training Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Quizzes Completed</span>
                  <span className="text-2xl font-bold text-blue-600">{profileData.stats.quizzesCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Average Score</span>
                  <span className="text-2xl font-bold text-green-600">{profileData.stats.averageScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Points</span>
                  <span className="text-2xl font-bold text-purple-600">{profileData.stats.totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Current Streak</span>
                  <span className="text-2xl font-bold text-orange-600">{profileData.stats.streak} days</span>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                {profileData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Award className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>View Progress</span>
                </button>
                <button className="w-full p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Take Quiz</span>
                </button>
                <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

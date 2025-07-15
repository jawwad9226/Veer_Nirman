'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from './components/FirebaseAuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import NotificationTicker from './components/NotificationTicker'
import BannerSection from './components/BannerSection'
import RoleBasedFeatures from './components/RoleBasedFeatures'
import CommonFeatures from './components/CommonFeatures'
import FloatingChat from './components/FloatingChat'
import TabNavigation from './components/TabNavigation'
import QuizContainer from './components/quiz/QuizContainer'
import VideoContainer from './components/videos/VideoContainer'
import VideoAdmin from './components/videos/VideoAdmin'
import SyllabusContainer from './components/syllabus/SyllabusContainer'
import NCCInfoContainer from './components/ncc-info/NCCInfoContainer'
import ProgressDashboard from './components/progress/ProgressDashboard'
import CadetIntro from './components/CadetIntro'

export default function HomePage() {
  const { user, loading } = useAuth()
  
  // State to track if user has completed intro in current session
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<'A' | 'B' | 'C' | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'cadet'>('cadet')

  // Check intro completion status for authenticated user
  useEffect(() => {
    if (user) {
      // Set user role from authenticated user data
      setUserRole(user.role as 'admin' | 'instructor' | 'cadet')
      
      // Check if user has completed intro (can be based on profile or localStorage)
      const savedIntroStatus = localStorage.getItem(`intro_completed_${user.id}`)
      if (savedIntroStatus === 'true') {
        setHasCompletedIntro(true)
        // Get saved certificate preference
        const savedCertificate = localStorage.getItem(`certificate_${user.id}`)
        if (savedCertificate && ['A', 'B', 'C'].includes(savedCertificate)) {
          setSelectedCertificate(savedCertificate as 'A' | 'B' | 'C')
        }
      }
    }
  }, [user])

  // Mock user data - will be replaced with actual auth
  const [localUser, setLocalUser] = useState({
    name: 'Cadet User',
    role: userRole,
    avatar: '/file.svg',
    unit: 'NCC Unit',
    certificate: selectedCertificate
  })

  // Update user data when role or certificate changes
  useEffect(() => {
    if (user) {
      setLocalUser({
        name: userRole === 'admin' ? 'Admin User' : user.name || 'Cadet User',
        role: userRole,
        avatar: user.photoURL || '/file.svg',
        unit: userRole === 'admin' ? 'NCC Administration' : user.unit || 'NCC Unit',
        certificate: selectedCertificate
      })
    }
  }, [user, userRole, selectedCertificate])

  const [activeTab, setActiveTab] = useState('home')

  const handleCertificateSelect = (certificate: 'A' | 'B' | 'C' | 'ADMIN') => {
    if (!user) return
    
    if (certificate === 'ADMIN') {
      // Continue as Admin
      setUserRole('admin')
      setSelectedCertificate('A') // Default certificate for admin
      localStorage.setItem(`user_role_${user.id}`, 'admin')
      localStorage.setItem(`certificate_${user.id}`, 'A')
    } else {
      // Continue as Cadet with selected certificate
      setSelectedCertificate(certificate)
      setUserRole('cadet')
      localStorage.setItem(`certificate_${user.id}`, certificate)
      localStorage.setItem(`user_role_${user.id}`, 'cadet')
    }
    localStorage.setItem(`intro_completed_${user.id}`, 'true')
    setHasCompletedIntro(true)
  }

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated (this will be handled by useEffect)

  // Show intro if user hasn't completed it yet
  if (!hasCompletedIntro) {
    return (
      <ProtectedRoute>
        <CadetIntro onCertificateSelect={handleCertificateSelect} preSelectedCertificate={selectedCertificate} />
      </ProtectedRoute>
    )
  }

  const handleCertificateChange = () => {
    // Clear saved certificate and role, then show intro again
    localStorage.removeItem('ncc_certificate')
    localStorage.removeItem('ncc_user_role')
    setSelectedCertificate(null)
    setUserRole('cadet')
    setHasCompletedIntro(false)
  }

  // Force intro to show (useful for testing)
  const showIntroAgain = () => {
    handleCertificateChange()
  }

  const handleFeatureClick = (featureTitle: string) => {
    if (featureTitle === 'Content Studio') {
      setActiveTab('video-admin')
    }
    // Add more feature handlers as needed
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden" style={{
        backgroundImage: `url('/ncc flag.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}>
      {/* Fixed Header */}
      <Header user={localUser} setActiveTab={setActiveTab} />
      {/* Notification Ticker */}
      <NotificationTicker />
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row relative z-10">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block">
          <TabNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            position="sidebar"
          />
        </div>
        {/* Main Content */}
        <main className="flex-1 lg:ml-20 pb-20 lg:pb-8 header-aware-content">
          {activeTab === 'home' && (
            <>
              {/* Banner Section */}
              <BannerSection user={localUser} onCertificateChange={handleCertificateChange} />
              {/* Role-based Features */}
              {(user.role === 'admin' || user.role === 'instructor') && (
                <RoleBasedFeatures userRole={user.role} onFeatureClick={handleFeatureClick} />
              )}
              {/* Common Features */}
              <CommonFeatures setActiveTab={setActiveTab} />
            </>
          )}
          
          {activeTab === 'quiz' && (
            <QuizContainer />
          )}
          
          {activeTab === 'videos' && (
            <VideoContainer />
          )}

          {activeTab === 'video-admin' && (user.role === 'admin' || user.role === 'instructor') && (
            <VideoAdmin userRole={user.role} />
          )}
          
          {activeTab === 'syllabus' && (
            <SyllabusContainer />
          )}
          
          {activeTab === 'ncc-info' && (
            <NCCInfoContainer />
          )}
          
          {activeTab === 'dashboard' && (
            <ProgressDashboard />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">Settings content coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Mobile Bottom Navigation (default) */}
      <div className="lg:hidden">
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          position="bottom"
        />
      </div>
      {/* Floating Chat Button */}
      <FloatingChat />
      </div>
    </ProtectedRoute>
  )
}

// Tailwind custom animation classes (add to tailwind.config.js):
// 'slide-down': {
//   '0%': { transform: 'translateY(-2rem)', opacity: '0' },
//   '100%': { transform: 'translateY(0)', opacity: '1' },
// },
// 'slide-up': {
//   '0%': { transform: 'translateY(2rem)', opacity: '0' },
//   '100%': { transform: 'translateY(0)', opacity: '1' },
// },

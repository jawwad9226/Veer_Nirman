'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from './components/FirebaseAuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import NotificationTicker from './components/NotificationTicker'
import BannerSection from './components/BannerSection'
import RoleBasedFeatures from './components/RoleBasedFeatures'
import dynamic from 'next/dynamic'
// Dynamically import the analytics dashboard for client-side rendering
const AnalyticsDashboard = dynamic(() => import('./admin/analytics-dashboard'), { ssr: false })
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

  // Always show intro on reload: reset hasCompletedIntro to false on user change
  useEffect(() => {
    if (user) {
      setUserRole(user.role as 'admin' | 'instructor' | 'cadet');
      setHasCompletedIntro(false);
      setSelectedCertificate(null);
    } else {
      setHasCompletedIntro(false);
      setSelectedCertificate(null);
      setUserRole('cadet');
    }
  }, [user]);

  // Local user for UI display, always in sync with user/userRole
  const localUser = user ? {
    name: userRole === 'admin' ? 'Admin User' : user.name || 'Cadet User',
    role: userRole,
    avatar: user.photoURL || '/file.svg',
    unit: userRole === 'admin' ? 'NCC Administration' : user.unit || 'NCC Unit',
    certificate: selectedCertificate
  } : {
    name: 'Cadet User',
    role: userRole,
    avatar: '/file.svg',
    unit: 'NCC Unit',
    certificate: selectedCertificate
  }

  const [activeTab, setActiveTab] = useState('home')
  // Assessment state for quiz
  const [assessmentProps, setAssessmentProps] = useState<null | {
    topic: string;
    difficulty: string;
    numQuestions: number;
    timedMode?: boolean;
    customData?: any;
  }>(null)

  const handleCertificateSelect = (certificate: 'A' | 'B' | 'C') => {
    if (!user) return;
    setSelectedCertificate(certificate);
    // Only set to 'cadet' if not already admin or instructor
    setUserRole(prev => (prev === 'admin' || prev === 'instructor') ? prev : 'cadet');
    // Optionally, you can still store the certificate if needed:
    // localStorage.setItem(`certificate_${user.id}`, certificate);
    // localStorage.setItem(`user_role_${user.id}`, userRole);
    setHasCompletedIntro(true);
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
    if (!user) return;
    setSelectedCertificate(null);
    setUserRole('cadet');
    setHasCompletedIntro(false);
  }

  // Force intro to show (useful for testing)
  const showIntroAgain = () => {
    handleCertificateChange();
  }

  const handleFeatureClick = (featureTitle: string) => {
    if (featureTitle === 'Content Studio') {
      setActiveTab('video-admin')
    } else if (featureTitle === 'Security Console') {
      setActiveTab('admin-dashboard')
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
                {(userRole === 'admin' || userRole === 'instructor') && (
                  <RoleBasedFeatures userRole={userRole} onFeatureClick={handleFeatureClick} />
                )}
                {/* Common Features */}
                <CommonFeatures setActiveTab={setActiveTab} />
              </>
            )}

            {activeTab === 'admin-dashboard' && userRole === 'admin' && (
              <div className="mt-8">
                <AnalyticsDashboard />
              </div>
            )}

            {activeTab === 'quiz' && <QuizContainer assessmentProps={assessmentProps} clearAssessmentProps={() => setAssessmentProps(null)} />}
            {activeTab === 'videos' && <VideoContainer />}
            {activeTab === 'video-admin' && (userRole === 'admin' || userRole === 'instructor') && (
              <VideoAdmin userRole={userRole} />
            )}
            {activeTab === 'syllabus' && (
              <SyllabusContainer
                onTakeAssessment={(topic, difficulty, numQuestions, timedMode, customData) => {
                  setAssessmentProps({ topic, difficulty, numQuestions, timedMode, customData });
                  setActiveTab('quiz');
                }}
              />
            )}
            {activeTab === 'ncc-info' && <NCCInfoContainer />}
            {activeTab === 'dashboard' && <ProgressDashboard />}
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

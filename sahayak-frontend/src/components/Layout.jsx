import React from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Header from './Header'
import NotificationBar from './NotificationBar'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'

const Layout = () => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { isOnline } = useApp()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect to onboarding if not completed
  if (user && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="min-h-screen bg-sahayak-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Offline/Online Status */}
      <NotificationBar />
      
      {/* Main Content */}
      <main className="flex-1 mobile-container mb-nav">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default Layout

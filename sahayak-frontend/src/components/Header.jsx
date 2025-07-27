import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { Bell, Wifi, WifiOff } from 'lucide-react'

const Header = () => {
  const { user } = useAuth()
  const { isOnline, notifications } = useApp()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="bg-white border-b border-sahayak-gray-200 safe-area-inset">
      <div className="mobile-container">
        <div className="flex items-center justify-between py-4">
          {/* Greeting and User Info */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-sahayak-gray-800">
              {getGreeting()}!
            </h1>
            {user && (
              <p className="text-sm text-sahayak-gray-600">
                {user.name}
              </p>
            )}
          </div>

          {/* Status Icons */}
          <div className="flex items-center space-x-3">
            {/* Network Status */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi size={20} className="text-sahayak-green" />
              ) : (
                <WifiOff size={20} className="text-red-500" />
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-sahayak-gray-100">
              <Bell size={20} className="text-sahayak-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

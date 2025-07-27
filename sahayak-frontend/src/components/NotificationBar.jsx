import React from 'react'
import { useApp } from '../contexts/AppContext'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

const NotificationBar = () => {
  const { notifications, removeNotification, isOnline, syncQueue } = useApp()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'error':
        return AlertCircle
      case 'warning':
        return AlertTriangle
      default:
        return Info
    }
  }

  const getColorClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="mobile-container">
      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
          <div className="flex items-center">
            <AlertTriangle size={16} className="text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              You're offline. Changes will sync when connection is restored.
            </span>
          </div>
          {syncQueue.length > 0 && (
            <div className="mt-1 text-xs text-yellow-700">
              {syncQueue.length} item(s) waiting to sync
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type)
        const colorClasses = getColorClasses(notification.type)

        return (
          <div
            key={notification.id}
            className={`border rounded-lg p-3 mb-2 ${colorClasses}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <Icon size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 flex-shrink-0 hover:opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotificationBar

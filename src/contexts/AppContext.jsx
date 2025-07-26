import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncQueue, setSyncQueue] = useState([])
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      processSyncQueue()
    }
  }, [isOnline])

  const addToSyncQueue = (item) => {
    setSyncQueue(prev => [...prev, { ...item, timestamp: Date.now() }])
  }

  const processSyncQueue = async () => {
    // Mock sync processing - replace with actual API calls
    console.log('Processing sync queue:', syncQueue)
    
    // Simulate processing
    for (const item of syncQueue) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Synced item:', item)
      } catch (error) {
        console.error('Sync failed for item:', item, error)
      }
    }
    
    setSyncQueue([])
    addNotification('All items synced successfully!', 'success')
  }

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    const notification = { id, message, type, timestamp: Date.now() }
    
    setNotifications(prev => [...prev, notification])
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Local storage helpers
  const saveToLocal = (key, data) => {
    try {
      localStorage.setItem(`sahayak_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const getFromLocal = (key) => {
    try {
      const data = localStorage.getItem(`sahayak_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  const removeFromLocal = (key) => {
    try {
      localStorage.removeItem(`sahayak_${key}`)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  // Content tracking functions
  const addUserContent = (contentType, contentData) => {
    try {
      const existingContent = getFromLocal(`user_${contentType}s`) || []
      const newContent = {
        ...contentData,
        id: `${contentType}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: contentType
      }
      const updatedContent = [newContent, ...existingContent]
      saveToLocal(`user_${contentType}s`, updatedContent)

      // Add to recent activity
      addRecentActivity('created', `Created ${contentType}`, contentData.title || contentData.topic)

      return newContent
    } catch (error) {
      console.error('Error adding user content:', error)
      return null
    }
  }

  const addSavedContent = (contentData) => {
    try {
      const existingContent = getFromLocal('saved_community_content') || []
      const isAlreadySaved = existingContent.some(item => item.id === contentData.id)

      if (!isAlreadySaved) {
        const updatedContent = [contentData, ...existingContent]
        saveToLocal('saved_community_content', updatedContent)

        // Add to recent activity
        addRecentActivity('saved', 'Saved content', contentData.title)
      }
    } catch (error) {
      console.error('Error saving content:', error)
    }
  }

  const addRecentActivity = (type, action, content) => {
    try {
      const existingActivity = getFromLocal('recent_activity') || []
      const newActivity = {
        id: `activity_${Date.now()}`,
        type,
        action,
        content,
        timestamp: Date.now()
      }
      const updatedActivity = [newActivity, ...existingActivity].slice(0, 50) // Keep last 50 activities
      saveToLocal('recent_activity', updatedActivity)
    } catch (error) {
      console.error('Error adding recent activity:', error)
    }
  }

  const addLikeActivity = (contentData) => {
    try {
      const existingLikes = getFromLocal('recent_likes') || []
      const newLike = {
        ...contentData,
        timestamp: Date.now()
      }
      const updatedLikes = [newLike, ...existingLikes].slice(0, 20)
      saveToLocal('recent_likes', updatedLikes)

      addRecentActivity('liked', 'Liked content', contentData.title)
    } catch (error) {
      console.error('Error adding like activity:', error)
    }
  }

  const value = {
    isOnline,
    syncQueue,
    notifications,
    activeTab,
    setActiveTab,
    addToSyncQueue,
    processSyncQueue,
    addNotification,
    removeNotification,
    clearAllNotifications,
    saveToLocal,
    getFromLocal,
    removeFromLocal,
    addUserContent,
    addSavedContent,
    addRecentActivity,
    addLikeActivity
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  User,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Heart,
  Download,
  Edit3,
  Settings,
  Award,
  TrendingUp,
  Clock,
  Star,
  Save,
  X
} from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { getFromLocal, addNotification } = useApp()

  // State management
  const [activeTab, setActiveTab] = useState('myContent') // 'myContent', 'saved', 'recent'
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [myContent, setMyContent] = useState([])
  const [savedContent, setSavedContent] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Load user content and activity
  useEffect(() => {
    loadUserContent()
    loadSavedContent()
    loadRecentActivity()
  }, [])

  const loadUserContent = () => {
    // Get content from localStorage (simulating backend data)
    const worksheets = getFromLocal('user_worksheets') || []
    const stories = getFromLocal('user_stories') || []
    const visualAids = getFromLocal('user_visual_aids') || []

    // Combine all content with type information
    const allContent = [
      ...worksheets.map(item => ({ ...item, type: 'worksheet', icon: FileText, color: 'bg-sahayak-blue' })),
      ...stories.map(item => ({ ...item, type: 'story', icon: BookOpen, color: 'bg-sahayak-orange' })),
      ...visualAids.map(item => ({ ...item, type: 'visual_aid', icon: ImageIcon, color: 'bg-sahayak-green' }))
    ].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))

    setMyContent(allContent)
  }

  const loadSavedContent = () => {
    // Get saved content from community interactions
    const saved = getFromLocal('saved_community_content') || []
    setSavedContent(saved)
  }

  const loadRecentActivity = () => {
    // Get recent activity from sync queue and interactions
    const syncQueue = getFromLocal('sync_queue') || []
    const recentLikes = getFromLocal('recent_likes') || []
    const recentSaves = getFromLocal('recent_saves') || []

    const activity = [
      ...syncQueue.map(item => ({
        id: `sync-${item.timestamp}`,
        type: 'created',
        action: `Created ${item.type}`,
        content: item.data?.formData?.topic || 'New Content',
        timestamp: item.timestamp,
        icon: item.type === 'worksheet' ? FileText : item.type === 'story' ? BookOpen : ImageIcon
      })),
      ...recentLikes.map(item => ({
        id: `like-${item.timestamp}`,
        type: 'liked',
        action: 'Liked content',
        content: item.title,
        timestamp: item.timestamp,
        icon: Heart
      })),
      ...recentSaves.map(item => ({
        id: `save-${item.timestamp}`,
        type: 'saved',
        action: 'Saved content',
        content: item.title,
        timestamp: item.timestamp,
        icon: Download
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)

    setRecentActivity(activity)
  }

  // Calculate profile statistics
  const profileStats = {
    totalContent: myContent.length,
    totalSaves: savedContent.length,
    totalWorksheets: myContent.filter(item => item.type === 'worksheet').length,
    totalStories: myContent.filter(item => item.type === 'story').length,
    totalVisualAids: myContent.filter(item => item.type === 'visual_aid').length,
    totalLikes: myContent.reduce((sum, item) => sum + (item.likes || 0), 0),
    joinedDays: user?.joinedDate ? Math.floor((Date.now() - new Date(user.joinedDate)) / (1000 * 60 * 60 * 24)) : 0
  }

  const handleEditProfile = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      school: user?.school || '',
      location: user?.location || '',
      teachingExperience: user?.teachingExperience || '',
      subjects: user?.subjects || [],
      grades: user?.grades || []
    })
    setShowEditModal(true)
  }

  const handleSaveProfile = () => {
    updateUser(editForm)
    setShowEditModal(false)
    addNotification('Profile updated successfully!', 'success')
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently'
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN')
  }

  const getSubjectBadgeColor = (subject) => {
    const colors = {
      'Math': 'bg-blue-100 text-blue-800',
      'English': 'bg-orange-100 text-orange-800',
      'Science': 'bg-green-100 text-green-800',
      'Social Studies': 'bg-purple-100 text-purple-800',
      'Hindi': 'bg-red-100 text-red-800',
      'EVS': 'bg-yellow-100 text-yellow-800'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-sahayak-blue rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-sahayak-gray-800 mb-1">
                {user?.name || 'Teacher Name'}
              </h1>
              <div className="space-y-1 text-sm text-sahayak-gray-600">
                <div className="flex items-center">
                  <School size={14} className="mr-2" />
                  {user?.school || 'School Name'}
                </div>
                <div className="flex items-center">
                  <MapPin size={14} className="mr-2" />
                  {user?.location || 'Location'}
                </div>
                {user?.phone && (
                  <div className="flex items-center">
                    <Phone size={14} className="mr-2" />
                    {user.phone}
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center">
                    <Mail size={14} className="mr-2" />
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleEditProfile}
            className="flex items-center text-sahayak-blue hover:bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Edit3 size={16} className="mr-1" />
            Edit
          </button>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-sahayak-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-sahayak-blue">{profileStats.totalContent}</div>
            <div className="text-sm text-sahayak-gray-600">Content Created</div>
          </div>
          <div className="text-center p-3 bg-sahayak-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-sahayak-green">{profileStats.totalSaves}</div>
            <div className="text-sm text-sahayak-gray-600">Content Saved</div>
          </div>
          <div className="text-center p-3 bg-sahayak-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-sahayak-orange">{profileStats.totalLikes}</div>
            <div className="text-sm text-sahayak-gray-600">Likes Received</div>
          </div>
          <div className="text-center p-3 bg-sahayak-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-sahayak-gray-700">{profileStats.joinedDays}</div>
            <div className="text-sm text-sahayak-gray-600">Days Active</div>
          </div>
        </div>

        {/* Teaching Experience */}
        {user?.teachingExperience && (
          <div className="flex items-center text-sm text-sahayak-gray-600 mb-4">
            <Award size={14} className="mr-2" />
            {user.teachingExperience} years of teaching experience
          </div>
        )}
      </div>

      {/* Teaching Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
          Teaching Information
        </h2>

        <div className="space-y-4">
          {/* Subjects */}
          <div>
            <h3 className="text-sm font-medium text-sahayak-gray-700 mb-2">Subjects Taught</h3>
            <div className="flex flex-wrap gap-2">
              {user?.subjects?.length > 0 ? (
                user.subjects.map(subject => (
                  <span
                    key={subject}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectBadgeColor(subject)}`}
                  >
                    {subject}
                  </span>
                ))
              ) : (
                <span className="text-sm text-sahayak-gray-500">No subjects specified</span>
              )}
            </div>
          </div>

          {/* Grade Levels */}
          <div>
            <h3 className="text-sm font-medium text-sahayak-gray-700 mb-2">Grade Levels</h3>
            <div className="flex flex-wrap gap-2">
              {user?.grades?.length > 0 ? (
                user.grades.map(grade => (
                  <span
                    key={grade}
                    className="px-3 py-1 bg-sahayak-blue text-white rounded-full text-sm font-medium"
                  >
                    Grade {grade}
                  </span>
                ))
              ) : (
                <span className="text-sm text-sahayak-gray-500">No grades specified</span>
              )}
            </div>
          </div>

          {/* Content Breakdown */}
          <div>
            <h3 className="text-sm font-medium text-sahayak-gray-700 mb-2">Content Created</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <FileText size={20} className="mx-auto mb-1 text-sahayak-blue" />
                <div className="text-lg font-semibold text-sahayak-blue">{profileStats.totalWorksheets}</div>
                <div className="text-xs text-sahayak-gray-600">Worksheets</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <BookOpen size={20} className="mx-auto mb-1 text-sahayak-orange" />
                <div className="text-lg font-semibold text-sahayak-orange">{profileStats.totalStories}</div>
                <div className="text-xs text-sahayak-gray-600">Stories</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <ImageIcon size={20} className="mx-auto mb-1 text-sahayak-green" />
                <div className="text-lg font-semibold text-sahayak-green">{profileStats.totalVisualAids}</div>
                <div className="text-xs text-sahayak-gray-600">Visual Aids</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Library */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sahayak-gray-800">
            Content Library
          </h2>
          <div className="flex items-center text-sm text-sahayak-gray-600">
            <TrendingUp size={16} className="mr-1" />
            {myContent.length + savedContent.length} Total Items
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-sahayak-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('myContent')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'myContent'
                ? 'bg-white text-sahayak-blue shadow-sm'
                : 'text-sahayak-gray-600 hover:text-sahayak-gray-800'
            }`}
          >
            My Content ({myContent.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-white text-sahayak-blue shadow-sm'
                : 'text-sahayak-gray-600 hover:text-sahayak-gray-800'
            }`}
          >
            Saved ({savedContent.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-white text-sahayak-blue shadow-sm'
                : 'text-sahayak-gray-600 hover:text-sahayak-gray-800'
            }`}
          >
            Recent ({recentActivity.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === 'myContent' && (
            <>
              {myContent.length > 0 ? (
                myContent.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-4 bg-sahayak-gray-50 rounded-lg hover:bg-sahayak-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                        <item.icon size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sahayak-gray-800">
                          {item.title || item.topic || 'Untitled Content'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-sahayak-gray-600">
                          <span>{item.subject || 'General'}</span>
                          {item.gradeLevel && <span>Grade {Array.isArray(item.gradeLevel) ? item.gradeLevel.join(', ') : item.gradeLevel}</span>}
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-sahayak-gray-500">
                      {item.likes && (
                        <div className="flex items-center">
                          <Heart size={14} className="mr-1" />
                          {item.likes}
                        </div>
                      )}
                      {item.saves && (
                        <div className="flex items-center">
                          <Download size={14} className="mr-1" />
                          {item.saves}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
                    No content created yet
                  </h3>
                  <p className="text-sahayak-gray-600 mb-4">
                    Start creating worksheets, stories, and visual aids to see them here
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedContent.length > 0 ? (
                savedContent.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-4 bg-sahayak-gray-50 rounded-lg hover:bg-sahayak-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${item.type === 'story' ? 'bg-sahayak-orange' : 'bg-sahayak-green'} rounded-lg flex items-center justify-center`}>
                        {item.type === 'story' ? (
                          <BookOpen size={20} className="text-white" />
                        ) : (
                          <ImageIcon size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sahayak-gray-800">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-sahayak-gray-600">
                          <span>By {item.author}</span>
                          <span>Grade {item.grade}</span>
                          <span>{item.subject}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-sahayak-gray-500">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💾</div>
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
                    No saved content
                  </h3>
                  <p className="text-sahayak-gray-600">
                    Save content from the community to access it here
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'recent' && (
            <>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center space-x-3 p-4 bg-sahayak-gray-50 rounded-lg">
                    <div className={`w-10 h-10 ${
                      activity.type === 'created' ? 'bg-sahayak-blue' :
                      activity.type === 'liked' ? 'bg-red-500' : 'bg-sahayak-green'
                    } rounded-lg flex items-center justify-center`}>
                      <activity.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sahayak-gray-800">
                        {activity.action}
                      </p>
                      <p className="text-sm text-sahayak-gray-600">
                        {activity.content}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-sahayak-gray-500">
                      <Clock size={14} className="mr-1" />
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⏰</div>
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-sahayak-gray-600">
                    Your recent actions will appear here
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-sahayak-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-sahayak-gray-400 hover:text-sahayak-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={editForm.school || ''}
                  onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                  className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
                  placeholder="Enter your school name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
                  placeholder="City, District, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Teaching Experience (Years)
                </label>
                <input
                  type="number"
                  value={editForm.teachingExperience || ''}
                  onChange={(e) => setEditForm({...editForm, teachingExperience: parseInt(e.target.value) || 0})}
                  className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sahayak-gray-600 hover:bg-sahayak-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center px-4 py-2 bg-sahayak-blue text-white rounded-lg hover:bg-sahayak-blue-dark"
                >
                  <Save size={16} className="mr-1" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile

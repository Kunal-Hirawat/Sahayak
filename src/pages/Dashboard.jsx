import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  FileText,
  Image,
  BookOpen,
  Mic,
  TrendingUp,
  Clock,
  Star,
  Users,
  Lightbulb,
  Gamepad2,
  Calendar
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const quickActions = [
    {
      id: 'worksheet',
      title: 'Create Worksheet',
      description: 'Generate differentiated worksheets',
      icon: FileText,
      color: 'bg-sahayak-blue',
      path: '/create/worksheet'
    },
    {
      id: 'visual-aid',
      title: 'Visual Aid',
      description: 'Create blackboard diagrams',
      icon: Image,
      color: 'bg-sahayak-green',
      path: '/create/visual-aid'
    },
    {
      id: 'story',
      title: 'Generate Story',
      description: 'Local context stories',
      icon: BookOpen,
      color: 'bg-sahayak-orange',
      path: '/create/story'
    },
    {
      id: 'eli5',
      title: 'Explain Like I\'m 5',
      description: 'Simplify complex topics',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      path: '/create/eli5'
    },
    {
      id: 'game',
      title: 'Educational Game',
      description: 'Create learning games',
      icon: Gamepad2,
      color: 'bg-pink-500',
      path: '/create/game'
    },
    {
      id: 'lesson-plan',
      title: 'Lesson Plan',
      description: 'Weekly lesson planning',
      icon: Calendar,
      color: 'bg-indigo-500',
      path: '/create/lesson-plan'
    },
    {
      id: 'assessment',
      title: 'Record Reading',
      description: 'Assess student fluency',
      icon: Mic,
      color: 'bg-purple-600',
      path: '/assess'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'worksheet',
      title: 'Math Worksheet - Grade 3',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'story',
      title: 'Village Market Story',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Reading Assessment - Ravi',
      time: '2 days ago',
      status: 'pending_sync'
    }
  ]

  const stats = [
    {
      label: 'Content Created',
      value: '24',
      icon: TrendingUp,
      color: 'text-sahayak-blue'
    },
    {
      label: 'Students Assessed',
      value: '45',
      icon: Users,
      color: 'text-sahayak-green'
    },
    {
      label: 'Hours Saved',
      value: '12',
      icon: Clock,
      color: 'text-sahayak-orange'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-sahayak-gray-800 mb-1">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h2>
            <p className="text-sahayak-gray-600">
              Ready to create amazing learning experiences?
            </p>
          </div>
          <div className="text-4xl">👋</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="card hover:shadow-md transition-shadow duration-200 text-left"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h4 className="font-medium text-sahayak-gray-800 mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-sahayak-gray-600">
                  {action.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
          Your Impact
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card text-center">
                <Icon size={24} className={`${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-sahayak-gray-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-sahayak-gray-600">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
          Recent Activity
        </h3>
        <div className="card space-y-3">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <h4 className="font-medium text-sahayak-gray-800">
                  {item.title}
                </h4>
                <p className="text-sm text-sahayak-gray-600">
                  {item.time}
                </p>
              </div>
              <div className="flex items-center">
                {item.status === 'completed' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                {item.status === 'pending_sync' && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Highlights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-sahayak-gray-800">
            Community Highlights
          </h3>
          <button 
            onClick={() => navigate('/community')}
            className="text-sahayak-blue text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="card">
          <div className="flex items-center mb-3">
            <Star size={16} className="text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-sahayak-gray-800">
              Top Rated This Week
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-sahayak-gray-700">
              "Fraction Pizza Activity" by Teacher Priya
            </div>
            <div className="text-sm text-sahayak-gray-700">
              "Local Heroes Story Collection" by Teacher Raj
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

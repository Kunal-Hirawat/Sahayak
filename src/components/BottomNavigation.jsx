import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Plus, 
  ClipboardList, 
  Users, 
  User 
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const BottomNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTab, setActiveTab } = useApp()

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/',
      color: 'text-sahayak-blue'
    },
    {
      id: 'create',
      label: 'Create',
      icon: Plus,
      path: '/create/worksheet',
      color: 'text-sahayak-green'
    },
    {
      id: 'assess',
      label: 'Assess',
      icon: ClipboardList,
      path: '/assess',
      color: 'text-sahayak-orange'
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      path: '/community',
      color: 'text-purple-600'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      color: 'text-sahayak-gray-600'
    }
  ]

  const handleNavigation = (item) => {
    setActiveTab(item.id)
    navigate(item.path)
  }

  const isActive = (item) => {
    if (item.id === 'dashboard') {
      return location.pathname === '/'
    }
    if (item.id === 'create') {
      return location.pathname.startsWith('/create')
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <nav className="bottom-nav safe-area-inset">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item)
        
        return (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`nav-item ${active ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon 
              size={24} 
              className={`mb-1 ${active ? item.color : 'text-sahayak-gray-400'}`}
            />
            <span 
              className={`text-xs font-medium ${
                active ? item.color : 'text-sahayak-gray-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNavigation

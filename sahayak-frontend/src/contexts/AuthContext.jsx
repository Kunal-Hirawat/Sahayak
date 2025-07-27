import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Mock authentication - replace with real auth logic
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('sahayak_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('sahayak_user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (phoneNumber, otp, teacherName) => {
    try {
      setLoading(true)
      // Mock login - replace with actual API call
      const mockUser = {
        id: '1',
        name: teacherName || 'Teacher Name',
        phone: phoneNumber,
        school: 'Government Primary School',
        grades: ['1', '2', '3'],
        subjects: ['Math', 'English', 'Science'],
        location: 'Village Name, District',
        onboardingComplete: false
      }
      
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem('sahayak_user', JSON.stringify(mockUser))
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('sahayak_user')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('sahayak_user', JSON.stringify(updatedUser))
  }

  const completeOnboarding = (onboardingData) => {
    const updatedUser = { 
      ...user, 
      ...onboardingData, 
      onboardingComplete: true 
    }
    setUser(updatedUser)
    localStorage.setItem('sahayak_user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    completeOnboarding
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

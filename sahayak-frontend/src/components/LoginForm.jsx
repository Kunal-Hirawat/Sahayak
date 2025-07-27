import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { Mail, Lock, User, Phone, School, MapPin, Eye, EyeOff } from 'lucide-react'

const LoginForm = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, register } = useAuth()
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    school_name: '',
    district: '',
    state: '',
    grade_levels: [],
    subjects: [],
    experience_years: '',
    bio: ''
  })

  const gradeOptions = ['K', '1', '2', '3', '4', '5']
  const subjectOptions = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Art']
  const stateOptions = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password)
        if (result.success) {
          addNotification('Login successful! Welcome to Sahayak.', 'success')
          onClose()
        } else {
          addNotification(result.message, 'error')
        }
      } else {
        // Validate required fields for registration
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
          addNotification('Please fill in all required fields', 'error')
          return
        }

        if (formData.password.length < 8) {
          addNotification('Password must be at least 8 characters long', 'error')
          return
        }

        const result = await register(formData)
        if (result.success) {
          addNotification('Registration successful! You can now log in.', 'success')
          setIsLogin(true)
          // Clear form
          setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone: '',
            school_name: '',
            district: '',
            state: '',
            grade_levels: [],
            subjects: [],
            experience_years: '',
            bio: ''
          })
        } else {
          addNotification(result.message, 'error')
        }
      }
    } catch (error) {
      addNotification('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-sahayak-gray-800">
              {isLogin ? 'Login to Sahayak' : 'Join Sahayak'}
            </h2>
            <button
              onClick={onClose}
              className="text-sahayak-gray-400 hover:text-sahayak-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex mb-6 bg-sahayak-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-sahayak-blue shadow-sm'
                  : 'text-sahayak-gray-600 hover:text-sahayak-gray-800'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-sahayak-blue shadow-sm'
                  : 'text-sahayak-gray-600 hover:text-sahayak-gray-800'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                      First Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-sahayak-gray-400" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                        placeholder="First name"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-sahayak-gray-400" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                        placeholder="Last name"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-sahayak-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                    School Name
                  </label>
                  <div className="relative">
                    <School size={16} className="absolute left-3 top-3 text-sahayak-gray-400" />
                    <input
                      type="text"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                      placeholder="Your school name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {stateOptions.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Grade Levels You Teach
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {gradeOptions.map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleMultiSelect('grade_levels', grade)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.grade_levels.includes(grade)
                            ? 'bg-sahayak-blue text-white'
                            : 'bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Subjects You Teach
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subjectOptions.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleMultiSelect('subjects', subject)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.subjects.includes(subject)
                            ? 'bg-sahayak-blue text-white'
                            : 'bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-sahayak-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                  placeholder="your.email@school.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sahayak-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-sahayak-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
                  placeholder={isLogin ? 'Enter your password' : 'Create a password (min 8 characters)'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sahayak-gray-400 hover:text-sahayak-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sahayak-blue text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-sahayak-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-sahayak-gray-600">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-sahayak-blue hover:underline font-medium"
                >
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-sahayak-blue hover:underline font-medium"
                >
                  Login here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

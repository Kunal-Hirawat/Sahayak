import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { Phone, Lock, Eye, EyeOff, Loader } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addNotification } = useApp()
  
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [teacherName, setTeacherName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()

    if (!teacherName.trim()) {
      addNotification('Please enter your name', 'error')
      return
    }

    if (phoneNumber.length !== 10) {
      addNotification('Please enter a valid 10-digit phone number', 'error')
      return
    }

    setLoading(true)

    // Mock OTP sending - replace with actual API call
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      addNotification('OTP sent to your phone number', 'success')
    }, 1500)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      addNotification('Please enter a valid 6-digit OTP', 'error')
      return
    }

    setLoading(true)
    
    try {
      const result = await login(phoneNumber, otp, teacherName)
      if (result.success) {
        addNotification(`Welcome ${teacherName}!`, 'success')
        navigate('/')
      } else {
        addNotification(result.error || 'Login failed', 'error')
      }
    } catch (error) {
      addNotification('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = () => {
    addNotification('OTP resent successfully', 'success')
  }

  return (
    <div className="min-h-screen bg-sahayak-gray-50 flex flex-col justify-center">
      <div className="mobile-container">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-sahayak-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-sahayak-gray-800 mb-2">
            Sahayak
          </h1>
          <p className="text-sahayak-gray-600">
            Empowering teachers, enriching education
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-sahayak-gray-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-sahayak-gray-600 mb-6">
                  Enter your details to continue
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-3 text-sahayak-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit phone number"
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10 || !teacherName.trim()}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin mr-2" />
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-sahayak-gray-800 mb-2">
                  Verify OTP
                </h2>
                <p className="text-sahayak-gray-600 mb-6">
                  Enter the 6-digit code sent to +91 {phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-sahayak-gray-400" />
                  <input
                    type={showOtp ? 'text' : 'password'}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="input-field pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-3 text-sahayak-gray-400"
                  >
                    {showOtp ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sahayak-blue text-sm font-medium"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sahayak-gray-600 text-sm"
                >
                  Change Number
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin mr-2" />
                ) : (
                  'Verify & Login'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-sahayak-gray-500">
          <p>By continuing, you agree to our Terms of Service</p>
          <p className="mt-2">Need help? Contact support</p>
        </div>
      </div>
    </div>
  )
}

export default Login

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const Onboarding = () => {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()
  const { addNotification } = useApp()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    school: '',
    grades: [],
    subjects: [],
    location: '',
    studentCount: '',
    experience: ''
  })

  const steps = [
    {
      title: 'Welcome to Sahayak!',
      subtitle: 'Let\'s set up your profile to personalize your experience',
      component: WelcomeStep
    },
    {
      title: 'School Information',
      subtitle: 'Tell us about your school',
      component: SchoolStep
    },
    {
      title: 'Teaching Details',
      subtitle: 'What grades and subjects do you teach?',
      component: TeachingStep
    },
    {
      title: 'Local Context',
      subtitle: 'Help us create relevant content for your students',
      component: LocationStep
    },
    {
      title: 'All Set!',
      subtitle: 'You\'re ready to start using Sahayak',
      component: CompletionStep
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    completeOnboarding(formData)
    addNotification('Welcome to Sahayak! Your profile has been set up.', 'success')
    navigate('/')
  }

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-sahayak-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-sahayak-gray-200 safe-area-inset">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sahayak-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-sahayak-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-sahayak-gray-200 rounded-full h-2">
            <div 
              className="bg-sahayak-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mobile-container py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-sahayak-gray-800 mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-sahayak-gray-600">
            {steps[currentStep].subtitle}
          </p>
        </div>

        <CurrentStepComponent 
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-sahayak-gray-200 safe-area-inset">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-lg ${
                currentStep === 0 
                  ? 'text-sahayak-gray-400 cursor-not-allowed' 
                  : 'text-sahayak-blue hover:bg-sahayak-gray-100'
              }`}
            >
              <ChevronLeft size={20} className="mr-1" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="btn-primary flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep !== steps.length - 1 && (
                <ChevronRight size={20} className="ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
const WelcomeStep = () => (
  <div className="text-center">
    <div className="w-32 h-32 bg-sahayak-blue rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-4xl font-bold text-white">S</span>
    </div>
    <div className="space-y-4 text-sahayak-gray-700">
      <p>Sahayak is designed to help teachers like you create amazing learning experiences with AI-powered tools.</p>
      <div className="grid grid-cols-1 gap-4 mt-8">
        <div className="flex items-center p-4 bg-white rounded-lg border border-sahayak-gray-200">
          <Check size={20} className="text-sahayak-green mr-3" />
          <span>Generate differentiated worksheets</span>
        </div>
        <div className="flex items-center p-4 bg-white rounded-lg border border-sahayak-gray-200">
          <Check size={20} className="text-sahayak-green mr-3" />
          <span>Create blackboard-ready visual aids</span>
        </div>
        <div className="flex items-center p-4 bg-white rounded-lg border border-sahayak-gray-200">
          <Check size={20} className="text-sahayak-green mr-3" />
          <span>Assess reading fluency</span>
        </div>
      </div>
    </div>
  </div>
)

const SchoolStep = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
        School Name
      </label>
      <input
        type="text"
        value={formData.school}
        onChange={(e) => updateFormData({ school: e.target.value })}
        placeholder="Enter your school name"
        className="input-field"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
        Number of Students
      </label>
      <select
        value={formData.studentCount}
        onChange={(e) => updateFormData({ studentCount: e.target.value })}
        className="input-field"
      >
        <option value="">Select range</option>
        <option value="1-20">1-20 students</option>
        <option value="21-50">21-50 students</option>
        <option value="51-100">51-100 students</option>
        <option value="100+">More than 100 students</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
        Teaching Experience
      </label>
      <select
        value={formData.experience}
        onChange={(e) => updateFormData({ experience: e.target.value })}
        className="input-field"
      >
        <option value="">Select experience</option>
        <option value="0-2">0-2 years</option>
        <option value="3-5">3-5 years</option>
        <option value="6-10">6-10 years</option>
        <option value="10+">More than 10 years</option>
      </select>
    </div>
  </div>
)

const TeachingStep = ({ formData, updateFormData }) => {
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8']
  const subjects = ['Math', 'English', 'Hindi', 'Science', 'Social Studies', 'EVS']

  const toggleGrade = (grade) => {
    const newGrades = formData.grades.includes(grade)
      ? formData.grades.filter(g => g !== grade)
      : [...formData.grades, grade]
    updateFormData({ grades: newGrades })
  }

  const toggleSubject = (subject) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject]
    updateFormData({ subjects: newSubjects })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-sahayak-gray-700 mb-3">
          Which grades do you teach? (Select all that apply)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {grades.map(grade => (
            <button
              key={grade}
              onClick={() => toggleGrade(grade)}
              className={`p-3 rounded-lg border-2 text-center font-medium ${
                formData.grades.includes(grade)
                  ? 'border-sahayak-blue bg-sahayak-blue text-white'
                  : 'border-sahayak-gray-300 text-sahayak-gray-700 hover:border-sahayak-blue'
              }`}
            >
              Grade {grade}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-sahayak-gray-700 mb-3">
          Which subjects do you teach? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              className={`p-3 rounded-lg border-2 text-center font-medium ${
                formData.subjects.includes(subject)
                  ? 'border-sahayak-green bg-sahayak-green text-white'
                  : 'border-sahayak-gray-300 text-sahayak-gray-700 hover:border-sahayak-green'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const LocationStep = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
        Village/City Name
      </label>
      <input
        type="text"
        value={formData.location}
        onChange={(e) => updateFormData({ location: e.target.value })}
        placeholder="e.g., Bhimavaram, Andhra Pradesh"
        className="input-field"
      />
      <p className="text-sm text-sahayak-gray-500 mt-1">
        This helps us create stories and examples relevant to your students' local context
      </p>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">Why do we need this?</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Create stories with familiar places and names</li>
        <li>• Generate examples using local context</li>
        <li>• Make learning more relatable for your students</li>
      </ul>
    </div>
  </div>
)

const CompletionStep = () => (
  <div className="text-center">
    <div className="w-24 h-24 bg-sahayak-green rounded-full flex items-center justify-center mx-auto mb-6">
      <Check size={40} className="text-white" />
    </div>
    <h3 className="text-xl font-semibold text-sahayak-gray-800 mb-4">
      You're all set!
    </h3>
    <p className="text-sahayak-gray-600 mb-8">
      Your profile has been configured. You can now start creating amazing learning experiences with Sahayak.
    </p>
    <div className="bg-sahayak-gray-100 rounded-lg p-4">
      <p className="text-sm text-sahayak-gray-700">
        💡 <strong>Tip:</strong> Start with creating a worksheet or story to get familiar with the tools!
      </p>
    </div>
  </div>
)

export default Onboarding

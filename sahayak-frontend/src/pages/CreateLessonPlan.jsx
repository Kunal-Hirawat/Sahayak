import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  Calendar,
  ArrowLeft,
  Loader,
  Clock,
  BookOpen,
  Target,
  Users,
  CheckCircle,
  Sparkles,
  Copy,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  X,
  PlayCircle
} from 'lucide-react'

const CreateLessonPlan = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()
  
  const [step, setStep] = useState('input') // 'input', 'generating', 'result'
  const [formData, setFormData] = useState({
    subject: 'Math',
    gradeLevel: '3',
    topic: '',
    weekStartDate: '',
    duration: '5', // days
    periodsPerDay: '1',
    periodDuration: '45',
    learningObjectives: '',
    includeAssessment: true,
    includeHomework: true,
    teachingMethod: 'mixed',
    syllabusFile: null
  })
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedDay, setExpandedDay] = useState(0) // Start with first day expanded

  const subjects = [
    'Math', 'Science', 'English', 'Hindi', 'Social Studies', 
    'Environmental Studies', 'Geography', 'History', 'Art', 'Physical Education'
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' }
  ]

  const teachingMethods = [
    { value: 'traditional', label: 'Traditional', description: 'Lecture and demonstration based' },
    { value: 'interactive', label: 'Interactive', description: 'Student participation and discussion' },
    { value: 'hands-on', label: 'Hands-on', description: 'Activity and experiment based' },
    { value: 'mixed', label: 'Mixed Approach', description: 'Combination of all methods' }
  ]

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        addNotification('Please select a PDF file only', 'error')
        return
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        addNotification('File size must be less than 10MB', 'error')
        return
      }

      setFormData({...formData, syllabusFile: file})
      addNotification('Syllabus PDF uploaded successfully', 'success')
    }
  }

  const removeFile = () => {
    setFormData({...formData, syllabusFile: null})
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }

  const handleGenerate = async () => {
    if (!formData.topic.trim() || !formData.weekStartDate) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Prepare form data for API
      const formDataToSend = new FormData()

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'syllabusFile') {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add file if present
      if (formData.syllabusFile) {
        formDataToSend.append('syllabusFile', formData.syllabusFile)
      }

      // Call backend API
      const response = await fetch('http://localhost:5000/api/generate_weekly_plan', {
        method: 'POST',
        body: formDataToSend  // Don't set Content-Type, let browser set it for FormData
      })

      const data = await response.json()

      if (data.status === 'success') {
        setGeneratedPlan(data.data)
        setStep('result')

        if (!isOnline) {
          addToSyncQueue({
            type: 'lesson_plan',
            data: { formData, result: data.data },
            timestamp: Date.now()
          })
        }

        addNotification('Weekly lesson plan created successfully!', 'success')
      } else {
        throw new Error(data.message || 'Failed to generate lesson plan')
      }
    } catch (error) {
      console.error('API Error:', error)
      addNotification(
        error.message || 'Failed to create lesson plan. Please try again.',
        'error'
      )
      setStep('input')
    } finally {
      setLoading(false)
    }
  }



  const handleCopy = () => {
    let planText = `Weekly Lesson Plan: ${generatedPlan.topic}\nSubject: ${generatedPlan.subject}\nGrade: ${generatedPlan.gradeLevel}\n\n`

    if (generatedPlan.dailyPlans && generatedPlan.dailyPlans.length > 0) {
      // Format structured data
      if (generatedPlan.overallGoal) {
        planText += `Learning Goal: ${generatedPlan.overallGoal}\n\n`
      }

      generatedPlan.dailyPlans.forEach((day, index) => {
        planText += `Day ${index + 1}: ${day.day}\n`
        if (day.date) planText += `Date: ${day.date}\n`

        day.periods?.forEach((period, pIndex) => {
          planText += `\nPeriod ${period.periodNumber} (${period.duration}):\n`
          planText += `Topic: ${period.topic}\n`
          planText += `Objective: ${period.learningObjective}\n`
          if (period.assessment) planText += `Assessment: ${period.assessment}\n`
          if (period.homework) planText += `Homework: ${period.homework}\n`
        })
        planText += '\n'
      })
    } else {
      // Fallback to raw content
      planText += generatedPlan.generatedContent
    }

    navigator.clipboard.writeText(planText)
    addNotification('Lesson plan copied to clipboard!', 'success')
  }

  const handleShare = () => {
    addNotification('Sharing lesson plan to community...', 'info')
  }

  const handleSave = () => {
    addNotification('Lesson plan saved to your library!', 'success')
  }

  const toggleDay = (dayIndex) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex)
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-3 p-2 hover:bg-sahayak-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} className="text-sahayak-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-sahayak-gray-800">
              Weekly Lesson Plan Generator
            </h1>
            <p className="text-sahayak-gray-600">
              Create comprehensive weekly lesson plans
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Calendar size={24} className="text-white" />
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Topic/Unit Name *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Fractions, Photosynthesis, Indian Freedom Struggle"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input-field"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                    className="input-field"
                  >
                    {gradeLevels.map(grade => (
                      <option key={grade.value} value={grade.value}>{grade.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Week Start Date *
                </label>
                <input
                  type="date"
                  value={formData.weekStartDate}
                  onChange={(e) => setFormData({...formData, weekStartDate: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Learning Objectives
                </label>
                <textarea
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData({...formData, learningObjectives: e.target.value})}
                  placeholder="What should students learn by the end of this week?"
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Schedule Configuration
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Duration (days)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="input-field"
                >
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5">5 days (full week)</option>
                  <option value="6">6 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <BookOpen size={16} className="inline mr-1" />
                  Periods per day
                </label>
                <select
                  value={formData.periodsPerDay}
                  onChange={(e) => setFormData({...formData, periodsPerDay: e.target.value})}
                  className="input-field"
                >
                  <option value="1">1 period</option>
                  <option value="2">2 periods</option>
                  <option value="3">3 periods</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Period duration
                </label>
                <select
                  value={formData.periodDuration}
                  onChange={(e) => setFormData({...formData, periodDuration: e.target.value})}
                  className="input-field"
                >
                  <option value="30">30 minutes</option>
                  <option value="40">40 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Teaching Approach */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Teaching Approach
            </h3>
            
            <div className="space-y-3">
              {teachingMethods.map(method => (
                <label key={method.value} className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="teachingMethod"
                    value={method.value}
                    checked={formData.teachingMethod === method.value}
                    onChange={(e) => setFormData({...formData, teachingMethod: e.target.value})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-sahayak-gray-800">{method.label}</div>
                    <div className="text-sm text-sahayak-gray-600">{method.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeAssessment}
                  onChange={(e) => setFormData({...formData, includeAssessment: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-sahayak-gray-700">Include daily assessments</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeHomework}
                  onChange={(e) => setFormData({...formData, includeHomework: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-sahayak-gray-700">Include homework assignments</span>
              </label>
            </div>
          </div>

          {/* Syllabus Upload */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-indigo-500" />
              Syllabus Upload (Optional)
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-sahayak-gray-600">
                Upload your curriculum or syllabus PDF to create more accurate and aligned lesson plans.
              </p>

              {!formData.syllabusFile ? (
                <div className="border-2 border-dashed border-sahayak-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <Upload size={32} className="mx-auto text-sahayak-gray-400 mb-2" />
                  <p className="text-sm text-sahayak-gray-600 mb-2">
                    Click to upload or drag and drop your syllabus PDF
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="syllabusUpload"
                  />
                  <label
                    htmlFor="syllabusUpload"
                    className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                  >
                    <Upload size={16} className="mr-2" />
                    Choose PDF File
                  </label>
                  <p className="text-xs text-sahayak-gray-500 mt-2">
                    Maximum file size: 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText size={20} className="text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {formData.syllabusFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(formData.syllabusFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 text-green-600 hover:text-red-600 transition-colors"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim() || !formData.weekStartDate}
            className="btn-primary w-full flex items-center justify-center"
          >
            <Sparkles size={20} className="mr-2" />
            Generate Weekly Lesson Plan
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Creating Your Lesson Plan...
          </h3>
          <p className="text-sahayak-gray-600">
            Planning {formData.duration} days of {formData.subject} lessons on {formData.topic}
          </p>
        </div>
      )}

      {step === 'result' && generatedPlan && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('input')}
              className="flex items-center text-sahayak-blue hover:bg-blue-50 px-3 py-2 rounded-lg"
            >
              <ArrowLeft size={16} className="mr-1" />
              Create Another
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center text-sahayak-gray-600 hover:bg-sahayak-gray-100 px-3 py-2 rounded-lg"
              >
                <Copy size={16} className="mr-1" />
                Copy
              </button>
              <button
                onClick={handleSave}
                className="flex items-center text-sahayak-gray-600 hover:bg-sahayak-gray-100 px-3 py-2 rounded-lg"
              >
                <Download size={16} className="mr-1" />
                Save
              </button>
              <button
                onClick={handleShare}
                className="flex items-center text-sahayak-blue hover:bg-blue-50 px-3 py-2 rounded-lg"
              >
                <Share2 size={16} className="mr-1" />
                Share
              </button>
            </div>
          </div>

          {/* Plan Overview */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Calendar size={20} className="text-indigo-500 mr-2" />
              <h3 className="text-lg font-semibold text-sahayak-gray-800">
                Weekly Plan: {generatedPlan.topic}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Subject</div>
                <div className="text-sahayak-gray-600">{generatedPlan.subject}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Grade</div>
                <div className="text-sahayak-gray-600">{generatedPlan.gradeLevel}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Duration</div>
                <div className="text-sahayak-gray-600">{generatedPlan.duration}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Start Date</div>
                <div className="text-sahayak-gray-600">{generatedPlan.startDate || 'Not specified'}</div>
              </div>
            </div>

            {generatedPlan.summary && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-sahayak-gray-800 mb-2 flex items-center">
                  <Target size={16} className="mr-2 text-indigo-500" />
                  Plan Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Teaching Method:</span> {generatedPlan.summary.teachingMethod}
                  </div>
                  <div>
                    <span className="font-medium">Period Duration:</span> {generatedPlan.summary.periodDuration}
                  </div>
                  <div>
                    <span className="font-medium">Includes Assessment:</span> {generatedPlan.summary.includesAssessment ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Includes Homework:</span> {generatedPlan.summary.includesHomework ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Check if we have structured data or fallback content */}
          {generatedPlan.dailyPlans && generatedPlan.dailyPlans.length > 0 ? (
            <>
              {/* Overall Goal */}
              {generatedPlan.overallGoal && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                    <Target size={20} className="mr-2 text-indigo-500" />
                    Learning Goal
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sahayak-gray-700">{generatedPlan.overallGoal}</p>
                  </div>
                </div>
              )}

              {/* Materials */}
              {generatedPlan.materials && generatedPlan.materials.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                    <BookOpen size={20} className="mr-2 text-orange-500" />
                    Required Materials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {generatedPlan.materials.map((material, index) => (
                      <div key={index} className="flex items-center p-2 bg-orange-50 rounded-lg">
                        <CheckCircle size={16} className="text-orange-500 mr-2 flex-shrink-0" />
                        <span className="text-sahayak-gray-700 text-sm">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-sahayak-gray-800 flex items-center">
                  <Calendar size={20} className="mr-2 text-indigo-500" />
                  Daily Lesson Plans
                </h3>

                {generatedPlan.dailyPlans.map((dayPlan, dayIndex) => (
                  <div key={dayIndex} className="card">
                    <button
                      onClick={() => toggleDay(dayIndex)}
                      className="w-full flex items-center justify-between p-3 hover:bg-sahayak-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                          {dayIndex + 1}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sahayak-gray-800">
                            {dayPlan.day}
                          </div>
                          <div className="text-sm text-sahayak-gray-600">
                            {dayPlan.date} • {dayPlan.periods?.length || 0} period{(dayPlan.periods?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      {expandedDay === dayIndex ?
                        <ChevronDown size={20} className="text-sahayak-gray-400" /> :
                        <ChevronRight size={20} className="text-sahayak-gray-400" />
                      }
                    </button>

                    {expandedDay === dayIndex && dayPlan.periods && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        {dayPlan.periods.map((period, periodIndex) => (
                          <div key={periodIndex} className="border-l-4 border-indigo-500 pl-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-sahayak-gray-800 flex items-center">
                                <PlayCircle size={16} className="mr-2 text-indigo-500" />
                                Period {period.periodNumber}
                              </h5>
                              <span className="text-sm text-sahayak-gray-500 flex items-center">
                                <Clock size={14} className="mr-1" />
                                {period.duration}
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <h6 className="font-medium text-sahayak-gray-800 mb-1">Topic:</h6>
                                <p className="text-sahayak-gray-700 text-sm">{period.topic}</p>
                              </div>

                              <div className="bg-green-50 p-3 rounded-lg">
                                <h6 className="font-medium text-sahayak-gray-800 mb-1">Learning Objective:</h6>
                                <p className="text-sahayak-gray-700 text-sm">{period.learningObjective}</p>
                              </div>

                              {period.teachingActivities && period.teachingActivities.length > 0 && (
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                  <h6 className="font-medium text-sahayak-gray-800 mb-2">Teaching Activities:</h6>
                                  <ul className="space-y-1">
                                    {period.teachingActivities.map((activity, actIndex) => (
                                      <li key={actIndex} className="text-sahayak-gray-700 text-sm flex items-start">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {period.assessment && (
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <h6 className="font-medium text-sahayak-gray-800 mb-1">Assessment:</h6>
                                  <p className="text-sahayak-gray-700 text-sm">{period.assessment}</p>
                                </div>
                              )}

                              {period.homework && (
                                <div className="bg-orange-50 p-3 rounded-lg">
                                  <h6 className="font-medium text-sahayak-gray-800 mb-1">Homework:</h6>
                                  <p className="text-sahayak-gray-700 text-sm">{period.homework}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Weekly Assessment */}
              {generatedPlan.weeklyAssessment && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                    <Target size={20} className="mr-2 text-purple-500" />
                    Weekly Assessment
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sahayak-gray-800">{generatedPlan.weeklyAssessment.type}</h5>
                      <span className="text-sm text-sahayak-gray-600">{generatedPlan.weeklyAssessment.scheduledFor}</span>
                    </div>
                    <p className="text-sahayak-gray-700">{generatedPlan.weeklyAssessment.description}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Fallback: Show raw content if structured data not available */
            <div className="card">
              <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4 flex items-center">
                <BookOpen size={20} className="mr-2 text-indigo-500" />
                Weekly Lesson Plan
              </h3>

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sahayak-gray-700 leading-relaxed break-words">
                  {generatedPlan.generatedContent}
                </div>
              </div>
            </div>
          )}




        </div>
      )}
    </div>
  )
}

export default CreateLessonPlan

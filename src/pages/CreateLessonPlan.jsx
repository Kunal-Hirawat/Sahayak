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
  ChevronRight
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
    teachingMethod: 'mixed'
  })
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedDay, setExpandedDay] = useState(null)

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

  const handleGenerate = async () => {
    if (!formData.topic.trim() || !formData.weekStartDate) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockPlan = generateMockLessonPlan()
      setGeneratedPlan(mockPlan)
      setStep('result')
      
      if (!isOnline) {
        addToSyncQueue({
          type: 'lesson_plan',
          data: { formData, result: mockPlan },
          timestamp: Date.now()
        })
      }
      
      addNotification('Weekly lesson plan created successfully!', 'success')
    } catch (error) {
      addNotification('Failed to create lesson plan. Please try again.', 'error')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const generateMockLessonPlan = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const startDate = new Date(formData.weekStartDate)
    
    const dailyPlans = days.slice(0, parseInt(formData.duration)).map((day, index) => {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)
      
      return {
        day,
        date: currentDate.toLocaleDateString('en-IN'),
        periods: Array.from({ length: parseInt(formData.periodsPerDay) }, (_, periodIndex) => ({
          periodNumber: periodIndex + 1,
          duration: `${formData.periodDuration} minutes`,
          objective: `Understand ${formData.topic} - Part ${periodIndex + 1}`,
          activities: [
            {
              time: '0-10 min',
              activity: 'Introduction and Review',
              description: `Review previous concepts and introduce today's ${formData.topic} topic`
            },
            {
              time: '10-30 min',
              activity: 'Main Teaching',
              description: `Explain ${formData.topic} using ${formData.teachingMethod} approach with examples`
            },
            {
              time: '30-40 min',
              activity: 'Practice Activity',
              description: `Students practice ${formData.topic} through guided exercises`
            },
            {
              time: '40-45 min',
              activity: 'Wrap-up & Assessment',
              description: 'Quick assessment and summary of key points learned'
            }
          ],
          materials: [
            'Blackboard/Whiteboard',
            'Chalk/Markers',
            'Textbook',
            'Practice worksheets',
            'Local examples/materials'
          ],
          homework: formData.includeHomework ? `Practice ${formData.topic} exercises from textbook pages ${20 + index}-${22 + index}` : null,
          assessment: formData.includeAssessment ? `Quick oral questions about ${formData.topic}` : null
        }))
      }
    })

    return {
      subject: formData.subject,
      gradeLevel: formData.gradeLevel,
      topic: formData.topic,
      weekStartDate: formData.weekStartDate,
      duration: `${formData.duration} days`,
      overallObjective: formData.learningObjectives || `Students will understand and apply concepts of ${formData.topic}`,
      dailyPlans,
      weeklyAssessment: formData.includeAssessment ? {
        type: 'Weekly Test',
        description: `Comprehensive assessment covering all aspects of ${formData.topic}`,
        duration: '30 minutes',
        scheduledFor: 'Friday'
      } : null,
      resources: [
        `${formData.subject} textbook for Grade ${formData.gradeLevel}`,
        'Supplementary worksheets',
        'Local context examples',
        'Visual aids and charts',
        'Assessment rubrics'
      ]
    }
  }

  const handleCopy = () => {
    const planText = `Weekly Lesson Plan: ${generatedPlan.topic}\nSubject: ${generatedPlan.subject}\nGrade: ${generatedPlan.gradeLevel}\n\nObjective: ${generatedPlan.overallObjective}`
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
                <div className="text-sahayak-gray-600">Grade {generatedPlan.gradeLevel}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Duration</div>
                <div className="text-sahayak-gray-600">{generatedPlan.duration}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Start Date</div>
                <div className="text-sahayak-gray-600">{new Date(generatedPlan.weekStartDate).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-sahayak-gray-800 mb-2 flex items-center">
                <Target size={16} className="mr-2 text-indigo-500" />
                Overall Learning Objective
              </h4>
              <p className="text-sahayak-gray-700">{generatedPlan.overallObjective}</p>
            </div>
          </div>

          {/* Daily Plans */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sahayak-gray-800">Daily Lesson Plans</h3>
            
            {generatedPlan.dailyPlans.map((dayPlan, dayIndex) => (
              <div key={dayIndex} className="card">
                <button
                  onClick={() => toggleDay(dayIndex)}
                  className="w-full flex items-center justify-between p-2 hover:bg-sahayak-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {dayIndex + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sahayak-gray-800">
                        {dayPlan.day} - {dayPlan.date}
                      </div>
                      <div className="text-sm text-sahayak-gray-600">
                        {dayPlan.periods.length} period{dayPlan.periods.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {expandedDay === dayIndex ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {expandedDay === dayIndex && (
                  <div className="mt-4 space-y-4">
                    {dayPlan.periods.map((period, periodIndex) => (
                      <div key={periodIndex} className="border-l-4 border-indigo-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sahayak-gray-800">
                            Period {period.periodNumber} ({period.duration})
                          </h5>
                        </div>
                        
                        <div className="text-sm text-sahayak-gray-700 mb-3">
                          <strong>Objective:</strong> {period.objective}
                        </div>

                        <div className="space-y-2 mb-3">
                          <h6 className="font-medium text-sahayak-gray-800">Activities:</h6>
                          {period.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="bg-sahayak-gray-50 p-2 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{activity.activity}</span>
                                <span className="text-xs text-sahayak-gray-500">{activity.time}</span>
                              </div>
                              <p className="text-sm text-sahayak-gray-600">{activity.description}</p>
                            </div>
                          ))}
                        </div>

                        {period.homework && (
                          <div className="bg-yellow-50 p-2 rounded mb-2">
                            <strong className="text-sm">Homework:</strong>
                            <p className="text-sm text-sahayak-gray-700">{period.homework}</p>
                          </div>
                        )}

                        {period.assessment && (
                          <div className="bg-green-50 p-2 rounded">
                            <strong className="text-sm">Assessment:</strong>
                            <p className="text-sm text-sahayak-gray-700">{period.assessment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <BookOpen size={18} className="mr-2 text-sahayak-orange" />
              Required Resources
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {generatedPlan.resources.map((resource, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle size={16} className="text-sahayak-green mr-2" />
                  <span className="text-sahayak-gray-700">{resource}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly Assessment */}
          {generatedPlan.weeklyAssessment && (
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <Target size={18} className="mr-2 text-purple-500" />
                Weekly Assessment
              </h4>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sahayak-gray-800">{generatedPlan.weeklyAssessment.type}</h5>
                  <span className="text-sm text-sahayak-gray-600">
                    {generatedPlan.weeklyAssessment.duration} • {generatedPlan.weeklyAssessment.scheduledFor}
                  </span>
                </div>
                <p className="text-sahayak-gray-700">{generatedPlan.weeklyAssessment.description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateLessonPlan

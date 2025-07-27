import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  Mic,
  ArrowLeft,
  Loader,
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  User,
  BookOpen,
  Volume2,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Save
} from 'lucide-react'

const Assessment = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()

  const [step, setStep] = useState('setup') // 'setup', 'recording', 'analyzing', 'results'
  const [formData, setFormData] = useState({
    studentName: '',
    gradeLevel: '3',
    textType: 'story',
    difficulty: 'medium',
    selectedText: '',
    customText: ''
  })
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const gradeLevels = [
    { value: '1', label: 'Grade 1 (Age 6-7)' },
    { value: '2', label: 'Grade 2 (Age 7-8)' },
    { value: '3', label: 'Grade 3 (Age 8-9)' },
    { value: '4', label: 'Grade 4 (Age 9-10)' },
    { value: '5', label: 'Grade 5 (Age 10-11)' }
  ]

  const textTypes = [
    { value: 'story', label: 'Story', description: 'Narrative text with characters and plot' },
    { value: 'informational', label: 'Informational', description: 'Factual text about a topic' },
    { value: 'poem', label: 'Poem', description: 'Rhythmic text with rhymes' },
    { value: 'dialogue', label: 'Dialogue', description: 'Conversation between characters' },
    { value: 'custom', label: 'Custom Text', description: 'Upload your own text' }
  ]

  const sampleTexts = {
    story: {
      easy: "Once there was a little cat. The cat was very hungry. It saw a big fish. The cat tried to catch the fish. But the fish was too fast. The cat went home sad.",
      medium: "Ravi lived in a small village near the mountains. Every morning, he would help his father in the fields. One day, he found a beautiful butterfly with golden wings. He decided to follow it through the forest.",
      hard: "The ancient banyan tree stood majestically in the center of the village square, its sprawling branches providing shade for generations of families who gathered beneath its protective canopy to share stories and celebrate festivals."
    },
    informational: {
      easy: "Plants need water and sunlight to grow. They make their own food. The green parts of plants help make food. Plants give us oxygen to breathe.",
      medium: "Photosynthesis is the process by which plants make their own food. They use sunlight, water, and carbon dioxide from the air. This process happens in the green leaves of the plant.",
      hard: "The intricate process of photosynthesis involves the absorption of light energy by chlorophyll molecules, which then convert carbon dioxide and water into glucose and oxygen through a series of complex chemical reactions."
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      addNotification('Recording started', 'success')
    } catch (error) {
      addNotification('Could not access microphone', 'error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
      addNotification('Recording stopped', 'info')
    }
  }

  const analyzeRecording = async () => {
    if (!audioBlob) {
      addNotification('No recording to analyze', 'error')
      return
    }

    setLoading(true)
    setStep('analyzing')

    try {
      // Mock analysis - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockResults = {
        studentName: formData.studentName,
        teacherName: user?.name || 'Teacher',
        gradeLevel: formData.gradeLevel,
        wordsPerMinute: Math.floor(Math.random() * 50) + 80,
        accuracy: Math.floor(Math.random() * 20) + 80,
        fluencyScore: Math.floor(Math.random() * 30) + 70,
        strengths: ['Clear pronunciation', 'Good pace', 'Appropriate pauses'],
        improvements: ['Work on expression', 'Practice difficult words'],
        recommendations: ['Read aloud daily', 'Practice sight words']
      }

      setAnalysisResults(mockResults)
      setStep('results')

      addNotification('Analysis completed!', 'success')
    } catch (error) {
      addNotification('Analysis failed. Please try again.', 'error')
      setStep('recording')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSelectedText = () => {
    if (formData.textType === 'custom') {
      return formData.customText
    }
    return sampleTexts[formData.textType]?.[formData.difficulty] || sampleTexts.story.medium
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
              Reading Fluency Assessment
            </h1>
            <p className="text-sahayak-gray-600">
              Record and analyze student reading fluency
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <Mic size={24} className="text-white" />
        </div>
      </div>

      {step === 'setup' && (
        <div className="space-y-6">
          {/* Student Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Student Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Student Name
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  placeholder="Enter student's name"
                  className="input-field"
                />
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
          </div>

          {/* Text Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Reading Text Selection
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Text Type
                </label>
                <select
                  value={formData.textType}
                  onChange={(e) => setFormData({...formData, textType: e.target.value})}
                  className="input-field"
                >
                  {textTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.textType !== 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="input-field"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              )}

              {formData.textType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Custom Text
                  </label>
                  <textarea
                    value={formData.customText}
                    onChange={(e) => setFormData({...formData, customText: e.target.value})}
                    placeholder="Paste or type the text for the student to read"
                    rows={4}
                    className="input-field"
                  />
                </div>
              )}

              {/* Text Preview */}
              <div className="bg-sahayak-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sahayak-gray-800 mb-2">Text Preview:</h4>
                <p className="text-sahayak-gray-700 leading-relaxed">
                  {getSelectedText()}
                </p>
              </div>
            </div>
          </div>

          {/* Start Assessment Button */}
          <button
            onClick={() => setStep('recording')}
            disabled={!formData.studentName.trim() || (formData.textType === 'custom' && !formData.customText.trim())}
            className="btn-primary w-full flex items-center justify-center"
          >
            <BookOpen size={20} className="mr-2" />
            Start Reading Assessment
          </button>
        </div>
      )}

      {step === 'recording' && (
        <div className="space-y-6">
          {/* Recording Interface */}
          <div className="card text-center">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Recording: {formData.studentName}
            </h3>

            {/* Timer */}
            <div className="text-4xl font-bold text-purple-600 mb-6">
              {formatTime(recordingTime)}
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {!recording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full"
                >
                  <Mic size={24} />
                </button>
              )}

              {recording && (
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full animate-pulse"
                >
                  <Square size={24} />
                </button>
              )}

              {audioBlob && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setAudioBlob(null)
                      setRecordingTime(0)
                    }}
                    className="bg-sahayak-gray-500 hover:bg-sahayak-gray-600 text-white p-3 rounded-full"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button
                    onClick={analyzeRecording}
                    className="btn-primary px-6 py-3"
                  >
                    Analyze Recording
                  </button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-sm text-sahayak-gray-600">
              {!recording && !audioBlob && "Click the microphone to start recording"}
              {recording && "Student is reading... Click stop when finished"}
              {audioBlob && "Recording complete! Click analyze to get results"}
            </div>
          </div>

          {/* Reading Text */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3">
              Reading Text for {formData.studentName}:
            </h4>
            <div className="bg-white p-6 border-2 border-sahayak-gray-200 rounded-lg">
              <p className="text-lg leading-relaxed text-sahayak-gray-800">
                {getSelectedText()}
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Analyzing Reading Fluency...
          </h3>
          <p className="text-sahayak-gray-600">
            Processing {formData.studentName}'s reading performance
          </p>
        </div>
      )}

      {step === 'results' && analysisResults && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp size={20} className="text-purple-600 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold text-sahayak-gray-800">
                    Assessment Results: {analysisResults.studentName}
                  </h3>
                  <p className="text-sm text-sahayak-gray-600">
                    Assessed by: {analysisResults.teacherName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => addNotification('Results saved!', 'success')}
                className="btn-secondary flex items-center"
              >
                <Save size={16} className="mr-1" />
                Save Results
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{analysisResults.wordsPerMinute}</div>
                <div className="text-sm text-blue-800">Words per Minute</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{analysisResults.accuracy}%</div>
                <div className="text-sm text-green-800">Accuracy</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{analysisResults.fluencyScore}</div>
                <div className="text-sm text-purple-800">Fluency Score</div>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <CheckCircle size={18} className="mr-2 text-green-500" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {analysisResults.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-sahayak-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <AlertCircle size={18} className="mr-2 text-orange-500" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1">
                {analysisResults.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-sahayak-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Star size={18} className="mr-2 text-sahayak-blue" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {analysisResults.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-sahayak-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sahayak-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                setStep('setup')
                setAudioBlob(null)
                setAnalysisResults(null)
                setRecordingTime(0)
                setFormData({
                  studentName: '',
                  gradeLevel: '3',
                  textType: 'story',
                  difficulty: 'medium',
                  selectedText: '',
                  customText: ''
                })
              }}
              className="btn-secondary"
            >
              Assess Another Student
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assessment

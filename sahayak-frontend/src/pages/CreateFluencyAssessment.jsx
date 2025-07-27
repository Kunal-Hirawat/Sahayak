import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Download,
  FileText,
  Volume2,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader,
  BookOpen,
  BarChart3,
  TrendingUp,
  Award,
  FileDown
} from 'lucide-react'
import TextEditor from '../components/TextEditor'
import AudioRecorder from '../components/AudioRecorder'
import { prepareAudioForSubmission, checkAudioSupport } from '../utils/audioConverter'

const CreateFluencyAssessment = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline } = useApp()
  
  const [step, setStep] = useState('setup') // 'setup', 'recording', 'processing', 'results'
  const [assessmentData, setAssessmentData] = useState({
    studentName: '',
    gradeLevel: '1',
    assessmentText: '',
    customText: false
  })
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Analysis results
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Refs
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  // Predefined texts for different grade levels
  const gradeTexts = {
    '1': {
      title: "The Cat and the Hat",
      text: "The cat sat on the mat. The cat has a red hat. The hat is big. The cat likes the hat. The cat runs and plays. The sun is bright today."
    },
    '2': {
      title: "My Pet Dog",
      text: "I have a pet dog named Max. Max is brown and white. He likes to play fetch in the park. Every morning, Max wakes me up. We go for walks together. Max is my best friend."
    },
    '3': {
      title: "The School Garden",
      text: "Our school has a beautiful garden. Students plant flowers and vegetables. We water the plants every day. The tomatoes are red and juicy. The sunflowers grow very tall. Gardening teaches us about nature."
    },
    '4': {
      title: "The Amazing Ocean",
      text: "The ocean is home to many wonderful creatures. Dolphins swim gracefully through the waves. Colorful fish live in coral reefs. Whales are the largest animals in the sea. The ocean covers most of our planet Earth."
    },
    '5': {
      title: "Exploring Space",
      text: "Space exploration has always fascinated humans. Astronauts travel to the International Space Station. They conduct important scientific experiments. Mars is the next planet we hope to visit. Technology helps us learn about distant galaxies and stars."
    }
  }

  // Initialize audio recording
  const initializeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      return true
    } catch (error) {
      console.error('Error accessing microphone:', error)
      addNotification('Could not access microphone. Please check permissions.', 'error')
      return false
    }
  }

  // Start recording
  const startRecording = async () => {
    const initialized = await initializeRecording()
    if (!initialized) return
    
    setIsRecording(true)
    setIsPaused(false)
    setRecordingTime(0)
    
    mediaRecorderRef.current.start(100) // Collect data every 100ms
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
    
    addNotification('Recording started', 'success')
  }

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return
    
    if (isPaused) {
      mediaRecorderRef.current.resume()
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setIsPaused(false)
      addNotification('Recording resumed', 'info')
    } else {
      mediaRecorderRef.current.pause()
      clearInterval(timerRef.current)
      setIsPaused(true)
      addNotification('Recording paused', 'info')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    
    mediaRecorderRef.current.stop()
    clearInterval(timerRef.current)
    setIsRecording(false)
    setIsPaused(false)
    
    addNotification('Recording completed', 'success')
  }

  // Play/Pause audio playback
  const togglePlayback = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get current text based on grade level or custom text
  const getCurrentText = () => {
    if (assessmentData.customText) {
      return {
        title: "Custom Reading Text",
        text: assessmentData.assessmentText
      }
    }
    return gradeTexts[assessmentData.gradeLevel] || gradeTexts['1']
  }

  // Submit for analysis
  const submitForAnalysis = async () => {
    if (!audioBlob) {
      addNotification('No audio recording found', 'error')
      return
    }

    setIsAnalyzing(true)
    setStep('processing')

    try {
      console.log('🎤 DEBUG: Starting audio analysis submission...')

      // Prepare audio with proper format conversion
      const audioData = await prepareAudioForSubmission(audioBlob, assessmentData.studentName)
      console.log('🎤 DEBUG: Audio prepared:', {
        filename: audioData.file.name,
        size: (audioData.finalSize / 1024).toFixed(2) + ' KB',
        duration: audioData.duration.toFixed(2) + 's'
      })

      // Create form data for backend
      const formData = new FormData()
      formData.append('audio', audioData.file)
      formData.append('reference_text', getCurrentText().text)
      formData.append('student_name', assessmentData.studentName)
      formData.append('grade_level', assessmentData.gradeLevel)

      // Additional metadata
      formData.append('assessment_type', 'fluency')
      formData.append('text_title', getCurrentText().title)
      formData.append('audio_duration', audioData.duration.toString())
      formData.append('teacher_name', user?.name || 'Unknown Teacher')
      formData.append('timestamp', new Date().toISOString())

      console.log('🎤 DEBUG: Submitting to /api/evaluate...')
      console.log('🎤 DEBUG: Form data contents:', {
        audio_file: audioData.file.name,
        text_length: getCurrentText().text.length,
        student_name: assessmentData.studentName,
        grade_level: assessmentData.gradeLevel
      })

      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for FormData
      })

      console.log('🎤 DEBUG: Response status:', response.status)
      console.log('🎤 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🎤 DEBUG: Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('🎤 DEBUG: Initial response:', result)

      // Handle asynchronous task queue pattern
      if (response.status === 202 && result.task_id) {
        console.log('🎤 DEBUG: Task queued with ID:', result.task_id)
        addNotification('Analysis started, please wait...', 'info')

        // Poll for results
        const taskId = result.task_id
        const maxAttempts = 30 // 30 attempts = 5 minutes max
        let attempts = 0

        const pollResults = async () => {
          try {
            attempts++
            console.log(`🎤 DEBUG: Polling attempt ${attempts}/${maxAttempts} for task ${taskId}`)

            const resultResponse = await fetch(`http://localhost:5000/api/results/${taskId}`, {
              method: 'GET'
            })

            if (!resultResponse.ok) {
              throw new Error(`Failed to get results: HTTP ${resultResponse.status}`)
            }

            const resultData = await resultResponse.json()
            console.log('🎤 DEBUG: Poll result:', resultData)

            if (resultResponse.status === 200) {
              // Task completed successfully
              console.log('🎤 DEBUG: Task completed, processing results...')

              // Process the results
              const processedResults = {
                reading_speed: resultData.reading_speed || resultData.wpm || 'N/A',
                accuracy: resultData.accuracy || resultData.accuracy_percentage || 'N/A',
                fluency_score: resultData.fluency_score || resultData.overall_score || 'N/A',
                feedback: resultData.feedback || resultData.overall_feedback || 'Analysis completed successfully',
                recommendations: resultData.recommendations || resultData.improvement_suggestions || 'Keep practicing reading aloud',
                detailed_analysis: resultData.detailed_analysis || null,
                pronunciation_score: resultData.pronunciation_score || null,
                pace_analysis: resultData.pace_analysis || null,
                word_accuracy: resultData.word_accuracy || null
              }

              console.log('🎤 DEBUG: Processed results:', processedResults)

              setAnalysisResults(processedResults)
              setStep('results')
              addNotification('Analysis completed successfully!', 'success')

            } else if (resultResponse.status === 202) {
              // Task still processing
              if (attempts < maxAttempts) {
                console.log('🎤 DEBUG: Task still processing, waiting...')
                setTimeout(pollResults, 10000) // Poll every 10 seconds
              } else {
                throw new Error('Analysis timed out. Please try again.')
              }
            } else {
              throw new Error('Analysis failed during processing')
            }

          } catch (pollError) {
            console.error('🎤 DEBUG: Polling error:', pollError)
            throw pollError
          }
        }

        // Start polling after a short delay
        setTimeout(pollResults, 2000) // Start polling after 2 seconds

      } else if (result.success || result.status === 'success') {
        // Handle direct synchronous response (fallback)
        const analysisData = result.data || result.analysis || result

        const processedResults = {
          reading_speed: analysisData.reading_speed || analysisData.wpm || 'N/A',
          accuracy: analysisData.accuracy || analysisData.accuracy_percentage || 'N/A',
          fluency_score: analysisData.fluency_score || analysisData.overall_score || 'N/A',
          feedback: analysisData.feedback || analysisData.overall_feedback || 'Analysis completed successfully',
          recommendations: analysisData.recommendations || analysisData.improvement_suggestions || 'Keep practicing reading aloud',
          detailed_analysis: analysisData.detailed_analysis || null,
          pronunciation_score: analysisData.pronunciation_score || null,
          pace_analysis: analysisData.pace_analysis || null,
          word_accuracy: analysisData.word_accuracy || null
        }

        console.log('🎤 DEBUG: Processed results:', processedResults)

        setAnalysisResults(processedResults)
        setStep('results')
        addNotification('Analysis completed successfully!', 'success')
      } else {
        throw new Error(result.error || result.message || 'Analysis failed - unknown error')
      }

    } catch (error) {
      console.error('🎤 DEBUG: Analysis submission failed:', error)
      addNotification(`Analysis failed: ${error.message}`, 'error')
      setStep('recording') // Go back to recording step
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Export functions
  const exportToPDF = () => {
    try {
      // Create a comprehensive report
      const reportData = {
        student: assessmentData.studentName,
        grade: assessmentData.gradeLevel,
        date: new Date().toLocaleDateString(),
        teacher: user?.name || 'Unknown Teacher',
        text: {
          title: getCurrentText().title,
          content: getCurrentText().text,
          wordCount: getCurrentText().text.split(' ').length
        },
        results: analysisResults,
        timestamp: new Date().toISOString()
      }

      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <title>Fluency Assessment Report - ${assessmentData.studentName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
              .metric { text-align: center; padding: 10px; border: 1px solid #ddd; }
              .section { margin: 20px 0; }
              .text-content { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Audio Fluency Assessment Report</h1>
              <p>Student: ${assessmentData.studentName} | Grade: ${assessmentData.gradeLevel} | Date: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="metrics">
              <div class="metric">
                <h3>${analysisResults.reading_speed || 'N/A'}</h3>
                <p>Words per Minute</p>
              </div>
              <div class="metric">
                <h3>${analysisResults.accuracy || 'N/A'}%</h3>
                <p>Accuracy</p>
              </div>
              <div class="metric">
                <h3>${analysisResults.fluency_score || 'N/A'}/10</h3>
                <p>Fluency Score</p>
              </div>
            </div>

            <div class="section">
              <h2>Reading Text</h2>
              <h3>${getCurrentText().title}</h3>
              <div class="text-content">${getCurrentText().text}</div>
            </div>

            <div class="section">
              <h2>Analysis Results</h2>
              <p><strong>Overall Feedback:</strong> ${analysisResults.feedback || 'No feedback available'}</p>
              <p><strong>Recommendations:</strong> ${analysisResults.recommendations || 'No recommendations available'}</p>
            </div>

            <div class="section">
              <p><em>Generated by Sahayak AI Teaching Assistant on ${new Date().toLocaleString()}</em></p>
            </div>
          </body>
        </html>
      `

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Fluency_Report_${assessmentData.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
      link.click()
      URL.revokeObjectURL(url)

      addNotification('PDF report exported successfully!', 'success')
    } catch (error) {
      console.error('Export error:', error)
      addNotification('Failed to export report', 'error')
    }
  }

  const exportToCSV = () => {
    try {
      const csvData = [
        ['Field', 'Value'],
        ['Student Name', assessmentData.studentName],
        ['Grade Level', assessmentData.gradeLevel],
        ['Assessment Date', new Date().toLocaleDateString()],
        ['Teacher', user?.name || 'Unknown Teacher'],
        ['Text Title', getCurrentText().title],
        ['Text Word Count', getCurrentText().text.split(' ').length],
        ['Reading Speed (WPM)', analysisResults.reading_speed || 'N/A'],
        ['Accuracy (%)', analysisResults.accuracy || 'N/A'],
        ['Fluency Score (/10)', analysisResults.fluency_score || 'N/A'],
        ['Pronunciation Score (/10)', analysisResults.pronunciation_score || 'N/A'],
        ['Overall Feedback', analysisResults.feedback || 'No feedback'],
        ['Recommendations', analysisResults.recommendations || 'No recommendations'],
        ['Export Timestamp', new Date().toISOString()]
      ]

      const csvContent = csvData.map(row =>
        row.map(field => `"${field}"`).join(',')
      ).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Fluency_Data_${assessmentData.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)

      addNotification('CSV data exported successfully!', 'success')
    } catch (error) {
      console.error('CSV export error:', error)
      addNotification('Failed to export CSV data', 'error')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Audio playback event handlers
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      
      const handleEnded = () => setIsPlaying(false)
      const handlePause = () => setIsPlaying(false)
      
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('pause', handlePause)
      
      return () => {
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('pause', handlePause)
      }
    }
  }, [audioUrl])

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-sahayak-gray-600 hover:text-sahayak-gray-800 mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-sahayak-gray-800">
              Audio Fluency Assessment
            </h1>
            <p className="text-sahayak-gray-600">
              Assess reading fluency with AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 py-4">
        {[
          { id: 'setup', label: 'Setup', icon: FileText },
          { id: 'recording', label: 'Recording', icon: Mic },
          { id: 'processing', label: 'Analysis', icon: Loader },
          { id: 'results', label: 'Results', icon: CheckCircle }
        ].map((stepItem, index) => {
          const Icon = stepItem.icon
          const isActive = step === stepItem.id
          const isCompleted = ['setup', 'recording', 'processing', 'results'].indexOf(step) > index
          
          return (
            <div key={stepItem.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive 
                  ? 'border-sahayak-blue bg-sahayak-blue text-white' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-sahayak-gray-300 text-sahayak-gray-400'
              }`}>
                <Icon size={16} />
              </div>
              <span className={`ml-2 text-sm ${
                isActive ? 'text-sahayak-blue font-medium' : 'text-sahayak-gray-600'
              }`}>
                {stepItem.label}
              </span>
              {index < 3 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-sahayak-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Setup Step */}
      {step === 'setup' && (
        <div className="card w-full max-w-full">
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-6">
            Assessment Setup
          </h3>

          <div className="space-y-6">
            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Student Name
                </label>
                <input
                  type="text"
                  value={assessmentData.studentName}
                  onChange={(e) => setAssessmentData({...assessmentData, studentName: e.target.value})}
                  placeholder="Enter student's name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={assessmentData.gradeLevel}
                  onChange={(e) => setAssessmentData({...assessmentData, gradeLevel: e.target.value})}
                  className="input-field"
                >
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                </select>
              </div>
            </div>

            {/* Text Selection Mode */}
            <div>
              <label className="block text-sm font-medium text-sahayak-gray-700 mb-3">
                Choose Text Source
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Use Grade-Level Text */}
                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors ${
                  !assessmentData.customText ? 'border-sahayak-blue bg-blue-50' : 'border-sahayak-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="textType"
                    checked={!assessmentData.customText}
                    onChange={() => setAssessmentData({...assessmentData, customText: false, assessmentText: ''})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-sahayak-gray-800 flex items-center">
                      <BookOpen size={16} className="mr-2" />
                      Grade-Level Text
                    </div>
                    <div className="text-sm text-sahayak-gray-600 mt-1">
                      Use pre-selected text appropriate for Grade {assessmentData.gradeLevel}
                    </div>
                  </div>
                </label>

                {/* Custom Text */}
                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors ${
                  assessmentData.customText ? 'border-sahayak-blue bg-blue-50' : 'border-sahayak-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="textType"
                    checked={assessmentData.customText}
                    onChange={() => setAssessmentData({...assessmentData, customText: true})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-sahayak-gray-800 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Custom Text
                    </div>
                    <div className="text-sm text-sahayak-gray-600 mt-1">
                      Enter your own text for the student to read
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Text Input/Preview */}
            {assessmentData.customText ? (
              <TextEditor
                value={assessmentData.assessmentText}
                onChange={(text) => setAssessmentData({...assessmentData, assessmentText: text})}
                gradeLevel={assessmentData.gradeLevel}
                placeholder="Enter the text for the student to read aloud..."
                showAnalysis={true}
              />
            ) : (
              <div className="bg-sahayak-gray-50 border border-sahayak-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sahayak-gray-800 flex items-center">
                    <BookOpen size={16} className="mr-2" />
                    Grade {assessmentData.gradeLevel} Reading Text
                  </h4>
                  <div className="text-sm text-sahayak-gray-500">
                    Pre-selected content
                  </div>
                </div>

                <div className="bg-white border border-sahayak-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-sahayak-gray-700 mb-3 text-center">
                    {getCurrentText().title}
                  </h5>
                  <p className="text-sahayak-gray-700 leading-relaxed text-center">
                    {getCurrentText().text}
                  </p>
                </div>

                <div className="mt-4 text-sm text-sahayak-gray-600 text-center">
                  This text is specifically designed for Grade {assessmentData.gradeLevel} reading level
                </div>
              </div>
            )}

            {/* Start Assessment Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setStep('recording')}
                disabled={!assessmentData.studentName.trim() || (assessmentData.customText && !assessmentData.assessmentText.trim())}
                className="btn-primary flex items-center"
              >
                Start Assessment
                <ArrowLeft size={16} className="ml-2 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Step */}
      {step === 'recording' && (
        <div className="space-y-6 w-full max-w-full">
          {/* Reading Text Display */}
          <div className="card w-full max-w-full">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-sahayak-blue" />
              Reading Text for {assessmentData.studentName}
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-xl font-medium text-blue-800 mb-4 text-center">
                {getCurrentText().title}
              </h4>
              <p className="text-lg text-blue-900 leading-relaxed text-center">
                {getCurrentText().text}
              </p>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle size={16} className="text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Instructions:</strong> Read the text above clearly and at a comfortable pace.
                  Click the record button when ready to begin.
                </div>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="card w-full max-w-full">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4 flex items-center">
              <Mic size={20} className="mr-2 text-red-500" />
              Audio Recording
            </h3>

            <div className="text-center space-y-6">
              {/* Recording Status */}
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center px-4 py-2 rounded-full ${
                  isRecording
                    ? isPaused
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-sahayak-gray-100 text-sahayak-gray-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    isRecording
                      ? isPaused
                        ? 'bg-yellow-500'
                        : 'bg-red-500 animate-pulse'
                      : 'bg-sahayak-gray-400'
                  }`} />
                  <span className="font-medium">
                    {isRecording
                      ? isPaused
                        ? 'Paused'
                        : 'Recording'
                      : 'Ready to Record'
                    }
                  </span>
                </div>

                <div className="flex items-center text-sahayak-gray-600">
                  <Clock size={16} className="mr-1" />
                  <span className="font-mono text-lg">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>

              {/* Recording Buttons */}
              <div className="flex items-center justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-medium"
                  >
                    <Mic size={24} className="mr-2" />
                    Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePauseRecording}
                      className={`flex items-center px-6 py-3 rounded-full text-white font-medium ${
                        isPaused
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      {isPaused ? (
                        <>
                          <Play size={20} className="mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause size={20} className="mr-2" />
                          Pause
                        </>
                      )}
                    </button>

                    <button
                      onClick={stopRecording}
                      className="flex items-center bg-sahayak-gray-600 hover:bg-sahayak-gray-700 text-white px-6 py-3 rounded-full font-medium"
                    >
                      <Square size={20} className="mr-2" />
                      Stop
                    </button>
                  </>
                )}
              </div>

              {/* Audio Playback */}
              {audioUrl && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-sahayak-gray-800 mb-4">
                    Review Your Recording
                  </h4>

                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                      onClick={togglePlayback}
                      className="flex items-center bg-sahayak-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={16} className="mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-2" />
                          Play
                        </>
                      )}
                    </button>

                    <Volume2 size={20} className="text-sahayak-gray-500" />
                  </div>

                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    className="hidden"
                  />

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setAudioBlob(null)
                        setAudioUrl(null)
                        setRecordingTime(0)
                      }}
                      className="btn-secondary"
                    >
                      Record Again
                    </button>

                    <button
                      onClick={submitForAnalysis}
                      className="btn-primary flex items-center"
                    >
                      Analyze Recording
                      <ArrowLeft size={16} className="ml-2 rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <div className="card text-center py-12 w-full max-w-full">
          <Loader size={48} className="animate-spin text-sahayak-blue mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Analyzing Audio Recording...
          </h3>
          <p className="text-sahayak-gray-600 mb-4">
            Our AI is analyzing {assessmentData.studentName}'s reading fluency
          </p>

          <div className="space-y-2 text-sm text-sahayak-gray-500 mb-6">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-sahayak-blue rounded-full animate-pulse mr-2"></div>
              Processing audio file...
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-sahayak-gray-300 rounded-full mr-2"></div>
              Analyzing speech patterns...
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-sahayak-gray-300 rounded-full mr-2"></div>
              Generating fluency report...
            </div>
          </div>

          <div className="text-sm text-sahayak-gray-500">
            This may take 1-3 minutes depending on audio length
          </div>

          <div className="mt-4 text-xs text-sahayak-gray-400">
            Please keep this page open while processing...
          </div>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && analysisResults && (
        <div className="space-y-6 w-full max-w-full">
          {/* Results Header */}
          <div className="card w-full max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-sahayak-gray-800 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-500" />
                Fluency Assessment Results
              </h3>
              <div className="text-sm text-sahayak-gray-500">
                Student: {assessmentData.studentName} | Grade: {assessmentData.gradeLevel}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle size={16} className="text-green-600 mr-2" />
                <span className="font-medium text-green-800">Analysis Complete!</span>
              </div>
              <p className="text-green-700 text-sm">
                The audio recording has been successfully analyzed for reading fluency.
              </p>
            </div>
          </div>

          {/* Fluency Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock size={20} className="text-sahayak-blue mr-2" />
              </div>
              <div className="text-3xl font-bold text-sahayak-blue mb-2">
                {analysisResults.reading_speed || 'N/A'}
              </div>
              <div className="text-sm text-sahayak-gray-600">Words per Minute</div>
              <div className="text-xs text-sahayak-gray-500 mt-1">
                {assessmentData.gradeLevel === '1' ? 'Target: 60+ WPM' :
                 assessmentData.gradeLevel === '2' ? 'Target: 90+ WPM' :
                 assessmentData.gradeLevel === '3' ? 'Target: 110+ WPM' :
                 assessmentData.gradeLevel === '4' ? 'Target: 140+ WPM' :
                 'Target: 160+ WPM'}
              </div>
            </div>

            <div className="card text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle size={20} className="text-green-500 mr-2" />
              </div>
              <div className="text-3xl font-bold text-green-500 mb-2">
                {analysisResults.accuracy || 'N/A'}%
              </div>
              <div className="text-sm text-sahayak-gray-600">Accuracy</div>
              <div className="text-xs text-sahayak-gray-500 mt-1">
                Words read correctly
              </div>
            </div>

            <div className="card text-center">
              <div className="flex items-center justify-center mb-2">
                <Award size={20} className="text-purple-500 mr-2" />
              </div>
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {analysisResults.fluency_score || 'N/A'}/10
              </div>
              <div className="text-sm text-sahayak-gray-600">Fluency Score</div>
              <div className="text-xs text-sahayak-gray-500 mt-1">
                Overall reading fluency
              </div>
            </div>

            {analysisResults.pronunciation_score && (
              <div className="card text-center">
                <div className="flex items-center justify-center mb-2">
                  <Volume2 size={20} className="text-orange-500 mr-2" />
                </div>
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {analysisResults.pronunciation_score}/10
                </div>
                <div className="text-sm text-sahayak-gray-600">Pronunciation</div>
                <div className="text-xs text-sahayak-gray-500 mt-1">
                  Sound accuracy
                </div>
              </div>
            )}
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Section */}
            <div className="card w-full max-w-full">
              <h4 className="font-semibold text-sahayak-gray-800 mb-4 flex items-center">
                <BarChart3 size={18} className="mr-2 text-sahayak-blue" />
                Analysis Feedback
              </h4>

              <div className="space-y-4">
                {analysisResults.feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Overall Performance
                    </h5>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {analysisResults.feedback}
                    </p>
                  </div>
                )}

                {analysisResults.pace_analysis && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2 flex items-center">
                      <TrendingUp size={16} className="mr-2" />
                      Reading Pace
                    </h5>
                    <p className="text-green-700 text-sm leading-relaxed">
                      {analysisResults.pace_analysis}
                    </p>
                  </div>
                )}

                {analysisResults.word_accuracy && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                      <Award size={16} className="mr-2" />
                      Word Recognition
                    </h5>
                    <p className="text-purple-700 text-sm leading-relaxed">
                      {analysisResults.word_accuracy}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="card w-full max-w-full">
              <h4 className="font-semibold text-sahayak-gray-800 mb-4 flex items-center">
                <BookOpen size={18} className="mr-2 text-orange-500" />
                Improvement Recommendations
              </h4>

              <div className="space-y-4">
                {analysisResults.recommendations && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">
                      Next Steps for {assessmentData.studentName}
                    </h5>
                    <p className="text-yellow-700 text-sm leading-relaxed">
                      {analysisResults.recommendations}
                    </p>
                  </div>
                )}

                {/* Grade-specific recommendations */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">
                    Grade {assessmentData.gradeLevel} Focus Areas
                  </h5>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {assessmentData.gradeLevel === '1' && (
                      <>
                        <li>• Practice sight words daily</li>
                        <li>• Focus on letter-sound relationships</li>
                        <li>• Read simple books with repetitive patterns</li>
                      </>
                    )}
                    {assessmentData.gradeLevel === '2' && (
                      <>
                        <li>• Work on reading with expression</li>
                        <li>• Practice reading longer sentences smoothly</li>
                        <li>• Build vocabulary through context clues</li>
                      </>
                    )}
                    {assessmentData.gradeLevel === '3' && (
                      <>
                        <li>• Focus on reading comprehension</li>
                        <li>• Practice reading different text types</li>
                        <li>• Work on reading rate and accuracy balance</li>
                      </>
                    )}
                    {assessmentData.gradeLevel === '4' && (
                      <>
                        <li>• Develop advanced vocabulary</li>
                        <li>• Practice reading complex sentences</li>
                        <li>• Focus on reading with appropriate pacing</li>
                      </>
                    )}
                    {assessmentData.gradeLevel === '5' && (
                      <>
                        <li>• Master reading with proper intonation</li>
                        <li>• Practice reading informational texts</li>
                        <li>• Develop critical reading skills</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="card w-full max-w-full">
            <h4 className="font-semibold text-sahayak-gray-800 mb-4">Assessment Summary</h4>

            <div className="bg-sahayak-gray-50 border border-sahayak-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Student:</strong> {assessmentData.studentName}
                </div>
                <div>
                  <strong>Grade Level:</strong> {assessmentData.gradeLevel}
                </div>
                <div>
                  <strong>Text:</strong> {getCurrentText().title}
                </div>
                <div>
                  <strong>Assessment Date:</strong> {new Date().toLocaleDateString()}
                </div>
                <div>
                  <strong>Teacher:</strong> {user?.name || 'Unknown'}
                </div>
                <div>
                  <strong>Text Length:</strong> {getCurrentText().text.split(' ').length} words
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => {
                setStep('setup')
                setAudioBlob(null)
                setAudioUrl(null)
                setAnalysisResults(null)
                setRecordingTime(0)
              }}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              New Assessment
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportToPDF}
                className="btn-secondary flex items-center justify-center"
              >
                <FileDown size={16} className="mr-2" />
                Export PDF Report
              </button>

              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center justify-center"
              >
                <Download size={16} className="mr-2" />
                Export CSV Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateFluencyAssessment

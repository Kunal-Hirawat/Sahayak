import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  FileText,
  ArrowLeft,
  Loader,
  Clock,
  Download,
  Upload,
  File,
  X,
  Camera,
  Eye,
  Sparkles
} from 'lucide-react'

const CreateWorksheet = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()

  const [step, setStep] = useState('input') // 'input', 'generating', 'result'
  const [formData, setFormData] = useState({
    subject: 'Math',
    topic: '',
    gradeLevel: ['3'], // Changed to array for multi-grade selection
    difficultyLevels: ['medium'], // Can select multiple
    questionTypes: ['multiple-choice'],
    questionCount: '10',
    includeInstructions: true,
    includeAnswerKey: true,
    includeLocalExamples: true,
    timeLimit: '30',
    format: 'mixed',
    uploadedFiles: [], // New field for file uploads
    extractedContent: '' // New field for extracted text content
  })
  const [generatedWorksheet, setGeneratedWorksheet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null) // For PDF viewer tabs

  // File handling functions
  const handleFileUpload = async (event) => {
    console.log('🔧 DEBUG: File upload started...')
    const files = Array.from(event.target.files)
    console.log('🔧 DEBUG: Files selected:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))

    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' ||
                         file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      console.log(`🔧 DEBUG: File ${file.name} - Valid type: ${isValidType}, Valid size: ${isValidSize}`)
      return isValidType && isValidSize
    })

    console.log(`🔧 DEBUG: Valid files: ${validFiles.length}/${files.length}`)

    if (validFiles.length !== files.length) {
      console.log('⚠️ DEBUG: Some files were filtered out')
      addNotification('Some files were skipped. Only PDF and image files under 10MB are allowed.', 'warning')
    }

    // Extract content from files (mock implementation)
    let extractedText = ''
    for (const file of validFiles) {
      console.log(`🔧 DEBUG: Extracting content from ${file.name} (${file.type})`)
      if (file.type === 'application/pdf') {
        extractedText += `[PDF Content from ${file.name}] Sample text content extracted from PDF file. `
      } else if (file.type.startsWith('image/')) {
        extractedText += `[Image Content from ${file.name}] Sample text content extracted from image using OCR. `
      }
    }

    console.log(`🔧 DEBUG: Extracted text length: ${extractedText.length} characters`)

    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...validFiles],
      extractedContent: prev.extractedContent + extractedText
    }))

    console.log(`✅ DEBUG: ${validFiles.length} files uploaded successfully`)
    addNotification(`${validFiles.length} file(s) uploaded successfully`, 'success')
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
  }

  // Camera capture functionality
  const capturePhoto = async () => {
    console.log('🔧 DEBUG: Starting camera capture...')

    try {
      console.log('🔧 DEBUG: Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      console.log('✅ DEBUG: Camera access granted')

      // Create video element
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Wait for video to load
      video.onloadedmetadata = () => {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)

        // Convert to blob
        canvas.toBlob((blob) => {
          const file = new File([blob], `captured_image_${Date.now()}.jpg`, { type: 'image/jpeg' })

          // Add to uploaded files
          setFormData(prev => ({
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, file],
            extractedContent: prev.extractedContent + `[Captured Image from ${file.name}] Sample text content extracted from captured image using OCR. `
          }))

          addNotification('Photo captured successfully!', 'success')

          // Stop camera
          stream.getTracks().forEach(track => track.stop())
          setShowCamera(false)
        }, 'image/jpeg', 0.8)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      addNotification('Camera access denied or not available. Please use file upload instead.', 'warning')
      setShowCamera(false)
    }
  }



  const subjects = [
    'Math', 'Science', 'English', 'Hindi', 'Social Studies',
    'Environmental Studies', 'Geography', 'History'
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1 (Age 6-7)' },
    { value: '2', label: 'Grade 2 (Age 7-8)' },
    { value: '3', label: 'Grade 3 (Age 8-9)' },
    { value: '4', label: 'Grade 4 (Age 9-10)' },
    { value: '5', label: 'Grade 5 (Age 10-11)' },
    { value: '6', label: 'Grade 6 (Age 11-12)' },
    { value: '7', label: 'Grade 7 (Age 12-13)' },
    { value: '8', label: 'Grade 8 (Age 13-14)' }
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', description: 'Basic concepts and simple problems', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', description: 'Standard level with moderate complexity', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', description: 'Advanced problems requiring deeper thinking', color: 'bg-red-100 text-red-800' }
  ]

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice', description: '4 options with one correct answer', icon: '🔘' },
    { value: 'fill-blanks', label: 'Fill in the Blanks', description: 'Complete sentences or equations', icon: '📝' },
    { value: 'short-answer', label: 'Short Answer', description: 'Brief written responses', icon: '✍️' },
    { value: 'true-false', label: 'True/False', description: 'Simple yes/no questions', icon: '✅' },
    { value: 'matching', label: 'Matching', description: 'Connect related items', icon: '🔗' },
    { value: 'word-problems', label: 'Word Problems', description: 'Real-world application questions', icon: '📊' }
  ]

  const handleGenerate = async () => {
    console.log('🔧 DEBUG: Starting worksheet generation...')
    console.log('🔧 DEBUG: Current form data:', formData)

    if (!formData.topic.trim()) {
      console.log('❌ DEBUG: Topic is empty')
      addNotification('Please enter a topic for the worksheet', 'error')
      return
    }

    if (formData.gradeLevel.length === 0) {
      console.log('❌ DEBUG: No grade levels selected')
      addNotification('Please select at least one grade level', 'error')
      return
    }

    if (formData.difficultyLevels.length === 0) {
      console.log('❌ DEBUG: No difficulty levels selected')
      addNotification('Please select at least one difficulty level', 'error')
      return
    }

    console.log('✅ DEBUG: Validation passed, starting generation...')
    setLoading(true)
    setStep('generating')

    try {
      // Prepare request data
      const requestData = {
        topic: formData.topic,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        difficultyLevels: formData.difficultyLevels,
        questionTypes: formData.questionTypes,
        questionCount: formData.questionCount,
        timeLimit: formData.timeLimit,
        extractedContent: formData.extractedContent
      }

      console.log('🔧 DEBUG: Sending request to backend...')
      console.log('🔧 DEBUG: Request data:', requestData)

      // Call actual API endpoint
      const response = await fetch('http://localhost:5000/api/worksheet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('🔧 DEBUG: Response status:', response.status)
      console.log('🔧 DEBUG: Response ok:', response.ok)

      const result = await response.json()
      console.log('🔧 DEBUG: Response data:', result)

      if (result.status === 'success') {
        console.log('✅ DEBUG: Worksheet generation successful')
        console.log('🔧 DEBUG: Generated worksheets:', Object.keys(result.data))

        // Set the generated worksheets with actual PDF data
        const worksheetData = {
          worksheets: result.data,
          title: `${formData.topic} Worksheet`,
          subject: formData.subject,
          createdBy: user?.name || 'Teacher',
          createdAt: new Date().toISOString()
        }

        console.log('🔧 DEBUG: Setting worksheet data:', worksheetData)
        setGeneratedWorksheet(worksheetData)

        // Set first grade as selected by default
        const firstGrade = Object.keys(result.data)[0]
        console.log('🔧 DEBUG: Setting selected grade:', firstGrade)
        setSelectedGrade(firstGrade)

        setStep('result')

        if (!isOnline) {
          console.log('🔧 DEBUG: Adding to sync queue (offline)')
          addToSyncQueue({
            type: 'worksheet',
            data: { formData, result: result.data },
            timestamp: Date.now()
          })
        }

        console.log('✅ DEBUG: Worksheet generation completed successfully')
        addNotification('Worksheet generated successfully!', 'success')
      } else {
        console.log('❌ DEBUG: Worksheet generation failed:', result.message)
        throw new Error(result.message || 'Failed to generate worksheet')
      }
    } catch (error) {
      console.error('❌ DEBUG: Error generating worksheet:', error)
      console.error('❌ DEBUG: Error stack:', error.stack)

      // Try to get more details from the response
      if (error.response) {
        console.error('❌ DEBUG: Response status:', error.response.status)
        console.error('❌ DEBUG: Response data:', error.response.data)
      }

      addNotification(error.message || 'Failed to generate worksheet. Please try again.', 'error')
      setStep('input')
    } finally {
      console.log('🔧 DEBUG: Worksheet generation process completed')
      setLoading(false)
    }
  }



  const handleDownloadPDF = (grade) => {
    console.log('🔧 DEBUG: Starting PDF download for grade', grade)

    if (generatedWorksheet?.worksheets?.[grade]?.pdf_data) {
      try {
        console.log('🔧 DEBUG: PDF data found, creating download...')

        const pdfData = generatedWorksheet.worksheets[grade].pdf_data
        console.log('🔧 DEBUG: Base64 data length:', pdfData.length)

        // Convert base64 to blob for better browser compatibility
        // Remove any data URL prefix if present
        const cleanBase64 = pdfData.replace(/^data:application\/pdf;base64,/, '')

        const byteCharacters = atob(cleanBase64)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })

        console.log('🔧 DEBUG: Blob created, size:', blob.size)

        // Create download using blob URL (more reliable than data URL)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${formData.topic.replace(/\s+/g, '_')}_Grade_${grade}_Worksheet.pdf`
        link.style.display = 'none'

        // Add to DOM, click, and clean up
        document.body.appendChild(link)
        link.click()

        // Clean up after a short delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link)
          }
          URL.revokeObjectURL(url)
        }, 100)

        console.log('✅ DEBUG: PDF download initiated successfully')
        addNotification(`Worksheet for Grade ${grade} downloaded!`, 'success')
      } catch (error) {
        console.error('❌ DEBUG: Error downloading PDF:', error)
        addNotification('Failed to download PDF. Please try again.', 'error')
      }
    } else {
      console.log('❌ DEBUG: No PDF data available for grade', grade)
      addNotification('No PDF data available for this grade.', 'error')
    }
  }

  const toggleDifficulty = (difficulty) => {
    setFormData(prev => ({
      ...prev,
      difficultyLevels: prev.difficultyLevels.includes(difficulty)
        ? prev.difficultyLevels.filter(d => d !== difficulty)
        : [...prev.difficultyLevels, difficulty]
    }))
  }

  const toggleQuestionType = (type) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }))
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
              Worksheet Generator
            </h1>
            <p className="text-sahayak-gray-600">
              Create differentiated worksheets for your students
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-sahayak-blue rounded-lg flex items-center justify-center">
          <FileText size={24} className="text-white" />
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-sahayak-blue rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  Basic Information
                </h3>
                <p className="text-sm text-sahayak-gray-600">
                  Set up the fundamental details for your worksheet
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Topic Input - Full Width */}
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Topic or Chapter *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Fractions, Photosynthesis, Indian History"
                  className="input-field"
                  required
                />
              </div>

              {/* Two Column Layout for Subject and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input-field"
                    required
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Time Limit *
                  </label>
                  <select
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              {/* Grade Level Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Grade Level * (Select 1-3 grades)
                </label>
                <div className="relative">
                  <div className="min-h-[44px] border border-sahayak-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-sahayak-blue focus-within:border-sahayak-blue">
                    {formData.gradeLevel.length === 0 ? (
                      <span className="text-sahayak-gray-500">Select grade levels...</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.gradeLevel.map(grade => (
                          <span
                            key={grade}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-sahayak-blue text-white"
                          >
                            Grade {grade}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  gradeLevel: formData.gradeLevel.filter(g => g !== grade)
                                })
                              }}
                              className="ml-2 hover:bg-sahayak-blue-dark rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grade Selection Dropdown */}
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gradeLevels.map(grade => (
                      <button
                        key={grade.value}
                        type="button"
                        onClick={() => {
                          if (formData.gradeLevel.includes(grade.value)) {
                            setFormData({
                              ...formData,
                              gradeLevel: formData.gradeLevel.filter(g => g !== grade.value)
                            })
                          } else if (formData.gradeLevel.length < 3) {
                            setFormData({
                              ...formData,
                              gradeLevel: [...formData.gradeLevel, grade.value]
                            })
                          } else {
                            addNotification('You can select maximum 3 grades', 'warning')
                          }
                        }}
                        className={`p-3 text-sm rounded-lg border-2 transition-all ${
                          formData.gradeLevel.includes(grade.value)
                            ? 'border-sahayak-blue bg-sahayak-blue text-white'
                            : 'border-sahayak-gray-200 bg-white text-sahayak-gray-700 hover:border-sahayak-blue hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-medium">{grade.label}</div>
                        <div className="text-xs opacity-75">{grade.ageRange}</div>
                      </button>
                    ))}
                  </div>

                  {formData.gradeLevel.length > 0 && (
                    <p className="text-xs text-sahayak-gray-600 mt-2">
                      {formData.gradeLevel.length} grade{formData.gradeLevel.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Settings Section */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-sahayak-green rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  Content Settings
                </h3>
                <p className="text-sm text-sahayak-gray-600">
                  Upload files or customize question generation preferences
                </p>
              </div>
            </div>
          </div>

            {/* File Upload Subsection */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-sahayak-gray-800 mb-3 flex items-center">
                <Upload size={18} className="mr-2" />
                Upload Content (Optional)
              </h4>
              <p className="text-sm text-sahayak-gray-600 mb-4">
                Upload PDF files or images to automatically generate questions based on the content
              </p>

            <div className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-sahayak-gray-300 rounded-lg p-6 text-center hover:border-sahayak-blue transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload size={32} className="text-sahayak-gray-400 mb-2" />
                    <p className="text-sahayak-gray-600 font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-sahayak-gray-500 mt-1">
                      PDF files and images (JPG, PNG) up to 10MB each
                    </p>
                  </div>
                </label>

                {/* Camera Capture Button */}
                <div className="mt-4 pt-4 border-t border-sahayak-gray-200">
                  <button
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center mx-auto px-4 py-2 bg-sahayak-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Camera size={16} className="mr-2" />
                    Capture Photo
                  </button>
                  <p className="text-xs text-sahayak-gray-500 mt-1">
                    Use your camera to capture documents directly
                  </p>
                </div>
              </div>

              {/* Camera Modal */}
              {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Capture Photo</h3>
                      <button
                        onClick={() => setShowCamera(false)}
                        className="text-sahayak-gray-500 hover:text-sahayak-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="text-center">
                      <Camera size={48} className="mx-auto text-sahayak-gray-400 mb-4" />
                      <p className="text-sahayak-gray-600 mb-4">
                        Click the button below to access your camera and capture a photo of your document.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={capturePhoto}
                          className="flex-1 bg-sahayak-green text-white py-2 px-4 rounded-lg hover:bg-green-600"
                        >
                          Start Camera
                        </button>
                        <button
                          onClick={() => setShowCamera(false)}
                          className="flex-1 bg-sahayak-gray-200 text-sahayak-gray-700 py-2 px-4 rounded-lg hover:bg-sahayak-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Files List */}
              {formData.uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sahayak-gray-800">Uploaded Files:</h4>
                  {formData.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-sahayak-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {file.type === 'application/pdf' ? (
                          <File size={16} className="text-red-500 mr-2" />
                        ) : (
                          <FileImage size={16} className="text-blue-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-sahayak-gray-800">
                          {file.name}
                        </span>
                        <span className="text-xs text-sahayak-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Content Preview */}
              {formData.extractedContent && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Extracted Content Preview:</h4>
                  <p className="text-sm text-blue-700 line-clamp-3">
                    {formData.extractedContent}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Format Options Section */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-sahayak-orange rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  Format Options
                </h3>
                <p className="text-sm text-sahayak-gray-600">
                  Customize difficulty levels, question types, and format settings
                </p>
              </div>
            </div>

            {/* Difficulty Levels */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-sahayak-gray-800 mb-4">
                Difficulty Levels * (Select Multiple)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {difficultyOptions.map(option => (
                  <label key={option.value} className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.difficultyLevels.includes(option.value)
                      ? 'border-sahayak-blue bg-blue-50'
                      : 'border-sahayak-gray-200 hover:border-sahayak-blue hover:bg-blue-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.difficultyLevels.includes(option.value)}
                      onChange={() => toggleDifficulty(option.value)}
                      className="absolute top-3 right-3"
                    />
                    <div className="pr-8">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-sahayak-gray-800">{option.label}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${option.color}`}>
                          {option.label}
                        </span>
                      </div>
                      <p className="text-sm text-sahayak-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-sahayak-gray-800 mb-4">
                Question Types * (Select Multiple)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questionTypeOptions.map(type => (
                  <label key={type.value} className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.questionTypes.includes(type.value)
                      ? 'border-sahayak-blue bg-blue-50'
                      : 'border-sahayak-gray-200 hover:border-sahayak-blue hover:bg-blue-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.questionTypes.includes(type.value)}
                      onChange={() => toggleQuestionType(type.value)}
                      className="absolute top-3 right-3"
                    />
                    <div className="pr-8">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">{type.icon}</span>
                        <span className="font-medium text-sahayak-gray-800">{type.label}</span>
                      </div>
                      <p className="text-sm text-sahayak-gray-600">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h4 className="text-md font-medium text-sahayak-gray-800 mb-4">
                Additional Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Number of Questions *
                  </label>
                  <select
                    value={formData.questionCount}
                    onChange={(e) => setFormData({...formData, questionCount: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="5">5 questions</option>
                    <option value="10">10 questions</option>
                    <option value="15">15 questions</option>
                    <option value="20">20 questions</option>
                    <option value="25">25 questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Format Style
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({...formData, format: e.target.value})}
                    className="input-field"
                  >
                    <option value="mixed">Mixed Question Types</option>
                    <option value="grouped">Grouped by Type</option>
                    <option value="progressive">Progressive Difficulty</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-3 bg-sahayak-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.includeInstructions}
                    onChange={(e) => setFormData({...formData, includeInstructions: e.target.checked})}
                    className="mr-3 rounded border-sahayak-gray-300"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include instructions for students</span>
                </label>

                <label className="flex items-center p-3 bg-sahayak-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.includeAnswerKey}
                    onChange={(e) => setFormData({...formData, includeAnswerKey: e.target.checked})}
                    className="mr-3 rounded border-sahayak-gray-300"
                  />
                  <span className="text-sm text-sahayak-gray-700">Generate answer key</span>
                </label>

                <label className="flex items-center p-3 bg-sahayak-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.includeLocalExamples}
                    onChange={(e) => setFormData({...formData, includeLocalExamples: e.target.checked})}
                    className="mr-3 rounded border-sahayak-gray-300"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include local context examples</span>
                </label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-6">
            <button
              onClick={handleGenerate}
              disabled={loading || !formData.topic.trim() || formData.gradeLevel.length === 0 || formData.difficultyLevels.length === 0}
              className="btn-primary w-full flex items-center justify-center"
            >
              <Sparkles size={20} className="mr-2" />
              Generate Worksheet
            </button>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-sahayak-blue mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Creating Your Worksheet...
          </h3>
          <p className="text-sahayak-gray-600">
            Generating {formData.questionCount} questions about {formData.topic}
          </p>
        </div>
      )}

      {step === 'result' && generatedWorksheet && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-sahayak-gray-800">{generatedWorksheet.title}</h2>
              <p className="text-sahayak-gray-600">Created by {generatedWorksheet.createdBy}</p>
            </div>
            <button
              onClick={() => setStep('input')}
              className="flex items-center text-sahayak-blue hover:bg-blue-50 px-3 py-2 rounded-lg"
            >
              <ArrowLeft size={16} className="mr-1" />
              Create Another
            </button>
          </div>

          {/* Grade Tabs */}
          {generatedWorksheet.worksheets && Object.keys(generatedWorksheet.worksheets).length > 1 && (
            <div className="card">
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(generatedWorksheet.worksheets).map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedGrade === grade
                        ? 'bg-sahayak-green text-white'
                        : 'bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200'
                    }`}
                  >
                    Grade {grade}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {selectedGrade && generatedWorksheet.worksheets?.[selectedGrade] && (
            <div className="card">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-sahayak-gray-800 flex items-center">
                  <Eye size={20} className="mr-2 text-sahayak-green" />
                  Worksheet Preview - Grade {selectedGrade}
                </h3>
              </div>

              {/* PDF Display */}
              <div className="bg-gray-100 rounded-lg p-4 min-h-96">
                {generatedWorksheet.worksheets?.[selectedGrade]?.pdf_data ? (
                  <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <div className="text-center">
                      <FileText size={48} className="mx-auto text-sahayak-blue mb-4" />
                      <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
                        PDF Generated Successfully!
                      </h3>
                      <p className="text-sahayak-gray-600 mb-4">
                        Your worksheet for Grade {selectedGrade} is ready to download.
                      </p>

                      {/* Browser compatibility notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                        <p className="text-blue-800">
                          💡 <strong>Having trouble viewing PDFs?</strong> If you see "blocked by Chrome" errors:
                        </p>
                        <ul className="text-blue-700 mt-2 ml-4 space-y-1">
                          <li>• Disable ad blockers temporarily</li>
                          <li>• Use the "Download PDF" button instead</li>
                          <li>• Try opening in an incognito window</li>
                        </ul>
                      </div>
                      <div className="space-y-2 text-sm text-sahayak-gray-500">
                        <p>📄 Topic: {formData.topic}</p>
                        <p>🎯 Grade: {selectedGrade}</p>
                        <p>📊 Questions: {generatedWorksheet.worksheets?.[selectedGrade]?.questions?.length || 0}</p>
                        <p>🎲 Types: {formData.questionTypes.join(', ')}</p>
                        <p>⚡ Difficulty: {formData.difficultyLevels.join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownloadPDF(selectedGrade)}
                        className="flex items-center bg-sahayak-green hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                      >
                        <Download size={20} className="mr-2" />
                        Download PDF
                      </button>

                      <button
                        onClick={() => {
                          try {
                            // Method 1: Try blob URL (works in most cases)
                            const pdfData = generatedWorksheet.worksheets[selectedGrade].pdf_data
                            const cleanBase64 = pdfData.replace(/^data:application\/pdf;base64,/, '')

                            const byteCharacters = atob(cleanBase64)
                            const byteNumbers = new Array(byteCharacters.length)

                            for (let i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i)
                            }

                            const byteArray = new Uint8Array(byteNumbers)
                            const blob = new Blob([byteArray], { type: 'application/pdf' })

                            // Try to open in new window
                            const url = URL.createObjectURL(blob)
                            const newWindow = window.open('', '_blank')

                            if (newWindow) {
                              newWindow.location.href = url
                              setTimeout(() => URL.revokeObjectURL(url), 2000)
                            } else {
                              // Fallback: Force download if popup blocked
                              throw new Error('Popup blocked')
                            }

                          } catch (error) {
                            console.error('Error opening PDF:', error)
                            // Fallback: Just download the PDF
                            handleDownloadPDF(selectedGrade)
                            addNotification('PDF opened as download due to browser restrictions.', 'info')
                          }
                        }}
                        className="flex items-center bg-sahayak-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                      >
                        <Eye size={20} className="mr-2" />
                        View PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <div className="text-center">
                      <FileText size={48} className="mx-auto text-sahayak-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-sahayak-gray-600 mb-2">
                        PDF Not Available
                      </h3>
                      <p className="text-sahayak-gray-500 mb-4">
                        The PDF for Grade {selectedGrade} could not be generated.
                      </p>
                      <button
                        onClick={() => setStep('input')}
                        className="flex items-center bg-sahayak-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        <ArrowLeft size={16} className="mr-2" />
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      )}
    </div>
  )
}

export default CreateWorksheet;

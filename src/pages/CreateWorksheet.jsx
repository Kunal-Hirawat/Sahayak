import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import jsPDF from 'jspdf'
import {
  FileText,
  ArrowLeft,
  Loader,
  Users,
  BookOpen,
  Target,
  Clock,
  Sparkles,
  Copy,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Star,
  Upload,
  File,
  Image as ImageIcon,
  X,
  FileImage
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

  // File handling functions
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' ||
                         file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      addNotification('Some files were skipped. Only PDF and image files under 10MB are allowed.', 'warning')
    }

    // Extract content from files (mock implementation)
    let extractedText = ''
    for (const file of validFiles) {
      if (file.type === 'application/pdf') {
        extractedText += `[PDF Content from ${file.name}] Sample text content extracted from PDF file. `
      } else if (file.type.startsWith('image/')) {
        extractedText += `[Image Content from ${file.name}] Sample text content extracted from image using OCR. `
      }
    }

    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...validFiles],
      extractedContent: prev.extractedContent + extractedText
    }))

    addNotification(`${validFiles.length} file(s) uploaded successfully`, 'success')
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
  }

  // PDF Export function
  const exportToPDF = (worksheet, gradeLevel = null) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = margin

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const title = gradeLevel ? `${worksheet.title} - Grade ${gradeLevel}` : worksheet.title
    doc.text(title, margin, yPosition)
    yPosition += 10

    // Teacher info
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Prepared by: ${user?.name || 'Teacher'}`, margin, yPosition)
    yPosition += 8
    doc.text(`Subject: ${worksheet.subject} | Time: ${worksheet.timeLimit}`, margin, yPosition)
    yPosition += 15

    // Instructions
    if (worksheet.instructions && worksheet.instructions.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Instructions:', margin, yPosition)
      yPosition += 8
      doc.setFont('helvetica', 'normal')
      worksheet.instructions.forEach((instruction, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${instruction}`, pageWidth - 2 * margin)
        lines.forEach(line => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += 6
        })
      })
      yPosition += 10
    }

    // Questions
    const questionsToShow = gradeLevel ?
      worksheet.questions.filter(q => q.gradeLevel === gradeLevel) :
      worksheet.questions

    questionsToShow.forEach((question, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = margin
      }

      // Question number and text
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}.`, margin, yPosition)
      doc.setFont('helvetica', 'normal')

      const questionLines = doc.splitTextToSize(question.question, pageWidth - 2 * margin - 15)
      questionLines.forEach((line, lineIndex) => {
        doc.text(line, margin + (lineIndex === 0 ? 15 : 0), yPosition)
        yPosition += 6
      })

      // Options for multiple choice
      if (question.options) {
        question.options.forEach((option, optIndex) => {
          const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`
          const optionLines = doc.splitTextToSize(optionText, pageWidth - 2 * margin - 10)
          optionLines.forEach(line => {
            doc.text(line, margin + 10, yPosition)
            yPosition += 6
          })
        })
      }

      yPosition += 8
    })

    // Save the PDF
    const fileName = gradeLevel ?
      `${worksheet.title.replace(/\s+/g, '_')}_Grade_${gradeLevel}.pdf` :
      `${worksheet.title.replace(/\s+/g, '_')}.pdf`

    doc.save(fileName)
    addNotification(`PDF exported: ${fileName}`, 'success')
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
    if (!formData.topic.trim()) {
      addNotification('Please enter a topic for the worksheet', 'error')
      return
    }

    if (formData.gradeLevel.length === 0) {
      addNotification('Please select at least one grade level', 'error')
      return
    }

    if (formData.difficultyLevels.length === 0) {
      addNotification('Please select at least one difficulty level', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockWorksheet = generateMockWorksheet()
      setGeneratedWorksheet(mockWorksheet)
      setStep('result')

      if (!isOnline) {
        addToSyncQueue({
          type: 'worksheet',
          data: { formData, result: mockWorksheet },
          timestamp: Date.now()
        })
      }

      addNotification('Worksheet generated successfully!', 'success')
    } catch (error) {
      addNotification('Failed to generate worksheet. Please try again.', 'error')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const generateMockWorksheet = () => {
    const worksheets = {}
    const questionCount = parseInt(formData.questionCount)

    // Generate worksheets for each selected grade
    formData.gradeLevel.forEach(grade => {
      const questions = []

      for (let i = 0; i < questionCount; i++) {
        const difficulty = formData.difficultyLevels[i % formData.difficultyLevels.length]
        const questionType = formData.questionTypes[i % formData.questionTypes.length]

        // Adjust question complexity based on grade level
        const gradeComplexity = parseInt(grade) <= 3 ? 'simple' : parseInt(grade) <= 6 ? 'moderate' : 'advanced'

        questions.push({
          id: i + 1,
          type: questionType,
          difficulty,
          gradeLevel: grade,
          question: `Question ${i + 1}: This is a ${difficulty} level ${questionType} question about ${formData.topic} for Grade ${grade}.${formData.extractedContent ? ' Based on uploaded content.' : ''}`,
          options: questionType === 'multiple-choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : null,
          correctAnswer: questionType === 'multiple-choice' ? 'A' : `Sample answer for ${formData.topic}`,
          points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
          complexity: gradeComplexity
        })
      }

      worksheets[grade] = {
        title: `${formData.topic} Worksheet - Grade ${grade}`,
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: grade,
        timeLimit: `${formData.timeLimit} minutes`,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        teacherName: user?.name || 'Teacher',
        instructions: formData.includeInstructions ? [
          'Read all questions carefully before answering',
          'Choose the best answer for multiple choice questions',
          'Write clearly for short answer questions',
          'Manage your time wisely',
          'Review your answers before submitting'
        ] : [],
        questions,
        answerKey: formData.includeAnswerKey ? questions.map(q => ({
          question: q.id,
          answer: q.correctAnswer,
          explanation: `This is the correct answer because it demonstrates understanding of ${formData.topic}.`
        })) : null,
        difficultyBreakdown: {
          easy: questions.filter(q => q.difficulty === 'easy').length,
          medium: questions.filter(q => q.difficulty === 'medium').length,
          hard: questions.filter(q => q.difficulty === 'hard').length
        },
        uploadedFiles: formData.uploadedFiles,
        extractedContent: formData.extractedContent
      }
    })

    // If only one grade selected, return single worksheet, otherwise return object with multiple worksheets
    return formData.gradeLevel.length === 1 ? worksheets[formData.gradeLevel[0]] : worksheets
  }

  const handleCopy = () => {
    const worksheetText = `${generatedWorksheet.title}\n\n${generatedWorksheet.instructions.join('\n')}\n\nQuestions:\n${generatedWorksheet.questions.map(q => `${q.id}. ${q.question}`).join('\n')}`
    navigator.clipboard.writeText(worksheetText)
    addNotification('Worksheet copied to clipboard!', 'success')
  }

  const handleShare = () => {
    addNotification('Sharing worksheet to community...', 'info')
  }

  const handleSave = () => {
    addNotification('Worksheet saved to your library!', 'success')
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
              </div>

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

              {/* PDF Export Buttons */}
              {typeof generatedWorksheet === 'object' && !generatedWorksheet.title ? (
                // Multiple worksheets
                <div className="flex items-center space-x-2">
                  {Object.keys(generatedWorksheet).map(grade => (
                    <button
                      key={grade}
                      onClick={() => exportToPDF(generatedWorksheet[grade], grade)}
                      className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                    >
                      <FileText size={16} className="mr-1" />
                      PDF Grade {grade}
                    </button>
                  ))}
                </div>
              ) : (
                // Single worksheet
                <button
                  onClick={() => exportToPDF(generatedWorksheet)}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                >
                  <FileText size={16} className="mr-1" />
                  Export PDF
                </button>
              )}
            </div>
          </div>

          {/* Worksheet Preview */}
          {typeof generatedWorksheet === 'object' && !generatedWorksheet.title ? (
            // Multiple worksheets display
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
                  Generated Worksheets for Multiple Grades
                </h3>
                <p className="text-sahayak-gray-600 mb-4">
                  Created by: {user?.name || 'Teacher'} | Topic: {formData.topic}
                </p>

                {formData.uploadedFiles.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      📁 Based on {formData.uploadedFiles.length} uploaded file(s)
                    </p>
                  </div>
                )}
              </div>

              {Object.entries(generatedWorksheet).map(([grade, worksheet]) => (
                <div key={grade} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText size={20} className="text-sahayak-blue mr-2" />
                      <h4 className="text-lg font-semibold text-sahayak-gray-800">
                        Grade {grade} Worksheet
                      </h4>
                    </div>
                    <button
                      onClick={() => exportToPDF(worksheet, grade)}
                      className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      <FileText size={14} className="mr-1" />
                      Export PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sahayak-gray-800">Questions</div>
                      <div className="text-sahayak-gray-600">{worksheet.questions.length}</div>
                    </div>
                    <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sahayak-gray-800">Time Limit</div>
                      <div className="text-sahayak-gray-600">{worksheet.timeLimit}</div>
                    </div>
                    <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sahayak-gray-800">Total Points</div>
                      <div className="text-sahayak-gray-600">{worksheet.totalPoints}</div>
                    </div>
                  </div>

                  {/* Sample Questions Preview */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sahayak-gray-800">Sample Questions:</h5>
                    {worksheet.questions.slice(0, 2).map((question, index) => (
                      <div key={question.id} className="border-l-4 border-sahayak-blue pl-4">
                        <p className="font-medium text-sahayak-gray-800">
                          {question.id}. {question.question}
                        </p>
                        {question.options && (
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="bg-sahayak-gray-50 p-2 rounded">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {worksheet.questions.length > 2 && (
                      <p className="text-sm text-sahayak-gray-600">
                        ... and {worksheet.questions.length - 2} more questions
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Single worksheet display
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText size={20} className="text-sahayak-blue mr-2" />
                    <h3 className="text-lg font-semibold text-sahayak-gray-800">
                      {generatedWorksheet.title}
                    </h3>
                  </div>
                  <p className="text-sm text-sahayak-gray-600">
                    Created by: {generatedWorksheet.teacherName}
                  </p>
                </div>

                {formData.uploadedFiles.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      📁 Based on {formData.uploadedFiles.length} uploaded file(s)
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-sahayak-gray-800">Questions</div>
                    <div className="text-sahayak-gray-600">{generatedWorksheet.questions.length}</div>
                  </div>
                  <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-sahayak-gray-800">Time Limit</div>
                    <div className="text-sahayak-gray-600">{generatedWorksheet.timeLimit}</div>
                  </div>
                  <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-sahayak-gray-800">Total Points</div>
                    <div className="text-sahayak-gray-600">{generatedWorksheet.totalPoints}</div>
                  </div>
                </div>

                {/* Sample Questions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sahayak-gray-800">Sample Questions:</h4>
                  {generatedWorksheet.questions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="border-l-4 border-sahayak-blue pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Q{question.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-sahayak-gray-700">{question.question}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Key for Single Worksheet */}
              {generatedWorksheet.answerKey && (
                <div className="card">
                  <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                    <CheckCircle size={18} className="mr-2 text-sahayak-green" />
                    Answer Key
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      {generatedWorksheet.answerKey.slice(0, 8).map((answer, index) => (
                        <div key={index}>
                          <span className="font-medium">{answer.question}.</span> {answer.answer}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateWorksheet;

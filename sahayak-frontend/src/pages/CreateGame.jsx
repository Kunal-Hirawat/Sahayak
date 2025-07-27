import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  Gamepad2,
  ArrowLeft,
  Loader,
  Clock,
  Target,
  Sparkles,
  Download,
  Play,
  Upload,
  File,
  X,
  Eye
} from 'lucide-react'

const CreateGame = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()
  
  const [step, setStep] = useState('input') // 'input', 'generating', 'result'
  const [formData, setFormData] = useState({
    subject: 'Math',
    topic: '',
    gradeLevel: '3',
    theme: 'colorful',
    difficulty: 'medium',
    duration: 'medium',
    extractedContent: '',
    uploadedFiles: []
  })
  const [generatedGame, setGeneratedGame] = useState(null)
  const [loading, setLoading] = useState(false)

  const subjects = [
    'Math', 'Science', 'English', 'Hindi', 'Social Studies', 
    'Environmental Studies', 'Geography', 'History'
  ]

  const themes = [
    { value: 'colorful', label: 'Colorful & Bright', description: 'Vibrant colors and fun elements', icon: '🌈' },
    { value: 'nature', label: 'Nature Adventure', description: 'Trees, animals, and outdoor themes', icon: '🌳' },
    { value: 'space', label: 'Space Explorer', description: 'Planets, stars, and cosmic adventures', icon: '🚀' },
    { value: 'underwater', label: 'Ocean World', description: 'Sea creatures and underwater scenes', icon: '🌊' },
    { value: 'fairy-tale', label: 'Fairy Tale Magic', description: 'Castles, princesses, and magical elements', icon: '🏰' },
    { value: 'superhero', label: 'Superhero Academy', description: 'Heroes, powers, and saving the day', icon: '🦸' },
    { value: 'animals', label: 'Animal Kingdom', description: 'Cute animals and wildlife', icon: '🐾' },
    { value: 'pirates', label: 'Pirate Adventure', description: 'Ships, treasure, and high seas', icon: '🏴‍☠️' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Simple concepts and basic interactions', icon: '😊' },
    { value: 'medium', label: 'Medium', description: 'Moderate challenge with guided help', icon: '🤔' },
    { value: 'hard', label: 'Hard', description: 'Complex problems requiring critical thinking', icon: '🧠' }
  ]

  const durations = [
    { value: 'short', label: 'Short (5-10 min)', description: 'Quick games for short attention spans', icon: '⚡' },
    { value: 'medium', label: 'Medium (10-20 min)', description: 'Balanced gameplay experience', icon: '⏱️' },
    { value: 'long', label: 'Long (20+ min)', description: 'Extended learning sessions', icon: '🕐' }
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1-2 (Ages 6-8)' },
    { value: '3', label: 'Grade 3-4 (Ages 8-10)' },
    { value: '5', label: 'Grade 5-6 (Ages 10-12)' },
    { value: '7', label: 'Grade 7-8 (Ages 12-14)' }
  ]

  const handleGenerate = async () => {
    console.log('🎮 DEBUG: Starting game generation...')
    console.log('🎮 DEBUG: Current form data:', formData)

    if (!formData.topic.trim()) {
      console.log('❌ DEBUG: Topic is empty')
      addNotification('Please enter a topic for the game', 'error')
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
        theme: formData.theme,
        difficulty: formData.difficulty,
        duration: formData.duration,
        extractedContent: formData.extractedContent
      }

      console.log('🎮 DEBUG: Sending request to backend...')
      console.log('🎮 DEBUG: Request data:', requestData)

      // Call actual API endpoint
      const response = await fetch('http://localhost:5000/api/game/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('🎮 DEBUG: Response status:', response.status)
      console.log('🎮 DEBUG: Response ok:', response.ok)

      const result = await response.json()
      console.log('🎮 DEBUG: Response data:', result)

      if (result.status === 'success') {
        console.log('✅ DEBUG: Game generation successful')

        // Set the generated game
        const gameData = {
          ...result.data,
          title: `${formData.topic} Game`,
          subject: formData.subject,
          createdBy: user?.name || 'Teacher',
          createdAt: new Date().toISOString()
        }

        console.log('🎮 DEBUG: Setting game data:', gameData)
        console.log('🎮 DEBUG: Game data keys:', Object.keys(gameData))
        console.log('🎮 DEBUG: HTML code available:', !!gameData.html_code)
        console.log('🎮 DEBUG: HTML code length:', gameData.html_code?.length || 0)

        setGeneratedGame(gameData)

        setStep('result')

        if (!isOnline) {
          console.log('🎮 DEBUG: Adding to sync queue (offline)')
          addToSyncQueue({
            type: 'game',
            data: { formData, result: result.data },
            timestamp: Date.now()
          })
        }

        console.log('✅ DEBUG: Game generation completed successfully')
        addNotification('Educational game generated successfully!', 'success')
      } else {
        console.log('❌ DEBUG: Game generation failed:', result.message)
        throw new Error(result.message || 'Failed to generate game')
      }
    } catch (error) {
      console.error('❌ DEBUG: Error generating game:', error)
      console.error('❌ DEBUG: Error stack:', error.stack)

      addNotification(error.message || 'Failed to generate game. Please try again.', 'error')
      setStep('input')
    } finally {
      console.log('🎮 DEBUG: Game generation process completed')
      setLoading(false)
    }
  }

  const handlePlayGame = () => {
    if (generatedGame?.html_code) {
      // Create a blob URL for the HTML content
      const blob = new Blob([generatedGame.html_code], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      // Open in new window
      const gameWindow = window.open(url, '_blank')

      if (gameWindow) {
        addNotification('Game opened in new window!', 'success')

        // Clean up the blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      } else {
        addNotification('Please allow popups to open the game in a new window', 'warning')
      }
    }
  }

  const handleDownloadGame = () => {
    if (generatedGame?.html_code) {
      const blob = new Blob([generatedGame.html_code], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData.topic.replace(/\s+/g, '_')}_Game.html`
      link.click()
      URL.revokeObjectURL(url)
      addNotification('Game downloaded successfully!', 'success')
    }
  }

  // File handling functions
  const handleFileUpload = async (event) => {
    console.log('🎮 DEBUG: File upload started...')
    const files = Array.from(event.target.files)
    console.log('🎮 DEBUG: Files selected:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))

    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' ||
                         file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      console.log(`🎮 DEBUG: File ${file.name} - Valid type: ${isValidType}, Valid size: ${isValidSize}`)
      return isValidType && isValidSize
    })

    console.log(`🎮 DEBUG: Valid files: ${validFiles.length}/${files.length}`)

    if (validFiles.length !== files.length) {
      console.log('⚠️ DEBUG: Some files were filtered out')
      addNotification('Some files were skipped. Only PDF and image files under 10MB are allowed.', 'warning')
    }

    // Extract content from files (mock implementation)
    let extractedText = ''
    for (const file of validFiles) {
      console.log(`🎮 DEBUG: Extracting content from ${file.name} (${file.type})`)
      if (file.type === 'application/pdf') {
        extractedText += `[PDF Content from ${file.name}] Sample text content extracted from PDF file. `
      } else if (file.type.startsWith('image/')) {
        extractedText += `[Image Content from ${file.name}] Sample text content extracted from image using OCR. `
      }
    }

    console.log(`🎮 DEBUG: Extracted text length: ${extractedText.length} characters`)

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





  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
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
              Educational Game Generator
            </h1>
            <p className="text-sahayak-gray-600">
              Create engaging learning games for your students
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
          <Gamepad2 size={24} className="text-white" />
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Game Topic & Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Topic or Concept
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Multiplication Tables, Solar System, Indian History"
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
            </div>
          </div>

          {/* Theme Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Choose Game Theme
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {themes.map(theme => (
                <label key={theme.value} className={`flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors ${formData.theme === theme.value ? 'border-sahayak-blue bg-blue-50' : 'border-sahayak-gray-200'}`}>
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={formData.theme === theme.value}
                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">{theme.icon}</span>
                      <span className="font-medium text-sahayak-gray-800">{theme.label}</span>
                    </div>
                    <p className="text-sm text-sahayak-gray-600">{theme.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Choose Difficulty Level
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {difficulties.map(diff => (
                <label key={diff.value} className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors ${formData.difficulty === diff.value ? 'border-sahayak-blue bg-blue-50' : 'border-sahayak-gray-200'}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff.value}
                    checked={formData.difficulty === diff.value}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">{diff.icon}</span>
                  <span className="font-medium text-sahayak-gray-800 mb-1">{diff.label}</span>
                  <p className="text-xs text-sahayak-gray-600 text-center">{diff.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Choose Game Duration
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {durations.map(dur => (
                <label key={dur.value} className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors ${formData.duration === dur.value ? 'border-sahayak-blue bg-blue-50' : 'border-sahayak-gray-200'}`}>
                  <input
                    type="radio"
                    name="duration"
                    value={dur.value}
                    checked={formData.duration === dur.value}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">{dur.icon}</span>
                  <span className="font-medium text-sahayak-gray-800 mb-1">{dur.label}</span>
                  <p className="text-xs text-sahayak-gray-600 text-center">{dur.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Upload Reference Materials (Optional)
            </h3>
            <p className="text-sm text-sahayak-gray-600 mb-4">
              Upload PDFs or images to provide additional context for your game
            </p>

            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-sahayak-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-sahayak-gray-400 mb-4" />
                  <p className="text-sahayak-gray-600 mb-2">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-sm text-sahayak-gray-500">
                    PDF, PNG, JPG up to 10MB each
                  </p>
                </label>
              </div>



              {/* Uploaded Files */}
              {formData.uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sahayak-gray-800">Uploaded Files:</h4>
                  {formData.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-sahayak-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <File size={16} className="text-sahayak-gray-500 mr-2" />
                        <span className="text-sm text-sahayak-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            <Sparkles size={20} className="mr-2" />
            Create Educational Game
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Creating Your Game...
          </h3>
          <p className="text-sahayak-gray-600">
            Designing a fun {formData.gameType} game about {formData.topic}
          </p>
        </div>
      )}

      {step === 'result' && generatedGame && (
        <div className="space-y-6 w-full max-w-full overflow-hidden">
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
                onClick={handlePlayGame}
                className="flex items-center bg-sahayak-green hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                <Play size={16} className="mr-1" />
                Play Game
              </button>
              <button
                onClick={handleDownloadGame}
                className="flex items-center bg-sahayak-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <Download size={16} className="mr-1" />
                Download
              </button>
            </div>
          </div>

          {/* Game Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Gamepad2 size={20} className="text-sahayak-blue mr-2" />
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  {generatedGame.title}
                </h3>
              </div>
              <div className="text-sm text-sahayak-gray-500">
                Created by: {generatedGame.createdBy}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <Sparkles size={16} className="text-green-600 mr-2" />
                <span className="font-medium text-green-800">Game Generated Successfully!</span>
              </div>
              <p className="text-green-700 text-sm">
                Your interactive educational game is ready to play. Click "Play Game" to open it in a new window.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="bg-sahayak-gray-50 p-3 rounded-lg min-w-0">
                <div className="font-medium text-sahayak-gray-800 truncate">Subject</div>
                <div className="text-sahayak-gray-600 truncate">{generatedGame.metadata?.subject || formData.subject}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg min-w-0">
                <div className="font-medium text-sahayak-gray-800 truncate">Grade Level</div>
                <div className="text-sahayak-gray-600 truncate">Grade {generatedGame.metadata?.grade || formData.gradeLevel}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg min-w-0">
                <div className="font-medium text-sahayak-gray-800 truncate">Theme</div>
                <div className="text-sahayak-gray-600 truncate">{themes.find(t => t.value === formData.theme)?.label || formData.theme}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg min-w-0">
                <div className="font-medium text-sahayak-gray-800 truncate">Difficulty</div>
                <div className="text-sahayak-gray-600 truncate">{difficulties.find(d => d.value === formData.difficulty)?.label || formData.difficulty}</div>
              </div>
            </div>
          </div>



          {/* Game Preview */}
          <div className="card w-full max-w-full">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4 flex items-center">
              <Eye size={20} className="mr-2 text-sahayak-blue" />
              Play Game
            </h3>

            {generatedGame.html_code ? (
              <div className="space-y-4 w-full max-w-full">
                {/* Game Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-blue-800 mb-1 truncate">🎮 {formData.topic} Game</h4>
                      <div className="text-sm text-blue-600 flex flex-wrap gap-2">
                        <span className="whitespace-nowrap">🎨 {themes.find(t => t.value === formData.theme)?.label}</span>
                        <span className="whitespace-nowrap">⚡ {difficulties.find(d => d.value === formData.difficulty)?.label}</span>
                        <span className="whitespace-nowrap">⏱️ {durations.find(d => d.value === formData.duration)?.label}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button
                        onClick={handlePlayGame}
                        className="flex items-center justify-center bg-sahayak-green hover:bg-green-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                      >
                        <Play size={14} className="mr-1" />
                        New Window
                      </button>
                      <button
                        onClick={handleDownloadGame}
                        className="flex items-center justify-center bg-sahayak-blue hover:bg-blue-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                      >
                        <Download size={14} className="mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Game Iframe */}
                <div className="border-2 border-sahayak-gray-200 rounded-lg overflow-hidden w-full">
                  <iframe
                    srcDoc={generatedGame.html_code}
                    className="w-full h-96 md:h-[500px] lg:h-[600px] border-0 block"
                    title={`${formData.topic} Educational Game`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    style={{ minHeight: '400px', maxWidth: '100%' }}
                  />
                </div>

                {/* Game Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-3 mt-1">💡</div>
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-1">How to Play:</h5>
                      <p className="text-yellow-700 text-sm">
                        The game is now loaded above. You can interact with it directly, or click "New Window" to open it in a separate tab for fullscreen play.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <Gamepad2 size={48} className="mx-auto text-sahayak-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-sahayak-gray-600 mb-2">
                  Game Not Available
                </h4>
                <p className="text-sahayak-gray-500 mb-4">
                  The game could not be loaded. Please try generating again.
                </p>
                <button
                  onClick={() => setStep('input')}
                  className="flex items-center bg-sahayak-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg mx-auto"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Play size={18} className="mr-2 text-sahayak-green" />
              How to Play
            </h4>
            <ol className="space-y-2">
              {(generatedGame.instructions || [
                "Read the instructions in the game",
                "Click or tap to interact with elements",
                "Answer questions correctly to score points",
                "Have fun while learning!"
              ]).map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-sahayak-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sahayak-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Materials Needed */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Target size={18} className="mr-2 text-orange-500" />
              Materials Needed
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {(generatedGame.materials || [
                "Computer or tablet",
                "Internet connection",
                "Web browser"
              ]).map((material, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-sahayak-gray-700">{material}</span>
                </li>
              ))}
            </ul>
          </div>


        </div>
      )}
    </div>
  )
}

export default CreateGame

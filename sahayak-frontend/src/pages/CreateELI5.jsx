import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { 
  Lightbulb, 
  ArrowLeft, 
  Loader, 
  BookOpen,
  MapPin,
  Users,
  Sparkles,
  Copy,
  Download,
  Share2,
  AlertTriangle
} from 'lucide-react'

const CreateELI5 = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()
  
  const [step, setStep] = useState('input') // 'input', 'generating', 'result'
  const [formData, setFormData] = useState({
    topic: '',
    gradeLevel: '3',
    subject: 'Science',
    localContext: user?.location || '',
    complexity: 'simple',
    includeAnalogy: true,
    includeExample: true,
    language: 'english'
  })
  const [generatedContent, setGeneratedContent] = useState(null)
  const [loading, setLoading] = useState(false)

  const languages = [
    { value: 'english', label: 'English', native: 'English', script: 'Latin' },
    { value: 'hindi', label: 'Hindi', native: 'हिंदी', script: 'Devanagari' },
    { value: 'bengali', label: 'Bengali', native: 'বাংলা', script: 'Bengali' },
    { value: 'tamil', label: 'Tamil', native: 'தமিழ்', script: 'Tamil' },
    { value: 'telugu', label: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
    { value: 'marathi', label: 'Marathi', native: 'मराठी', script: 'Devanagari' },
    { value: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
    { value: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
    { value: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
    { value: 'odia', label: 'Odia', native: 'ଓଡ଼ିଆ', script: 'Odia' },
    { value: 'assamese', label: 'Assamese', native: 'অসমীয়া', script: 'Bengali' }
  ]

  // Get language-specific CSS class
  const getLanguageClass = (language) => {
    return `story-${language || 'english'}`
  }

  // Get language display name
  const getLanguageDisplayName = (languageCode) => {
    const lang = languages.find(l => l.value === languageCode)
    return lang ? `${lang.label} (${lang.native})` : 'English'
  }

  const subjects = [
    'Science', 'Math', 'Social Studies', 'English', 'Hindi', 
    'Environmental Studies', 'History', 'Geography'
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1 (Age 6-7)' },
    { value: '2', label: 'Grade 2 (Age 7-8)' },
    { value: '3', label: 'Grade 3 (Age 8-9)' },
    { value: '4', label: 'Grade 4 (Age 9-10)' },
    { value: '5', label: 'Grade 5 (Age 10-11)' }
  ]

  const complexityLevels = [
    { value: 'simple', label: 'Very Simple', description: 'Basic concepts with everyday examples' },
    { value: 'moderate', label: 'Moderate', description: 'Some details with relatable analogies' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive but age-appropriate' }
  ]

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      addNotification('Please enter a topic to explain', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Call backend API
      const response = await fetch('http://localhost:5000/api/eli5/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.status === 'success') {
        // Use AI response format: explanation, metaphor, example, recap
        const aiResponse = {
          topic: formData.topic,
          explanation: data.data.explanation,
          metaphor: data.data.metaphor,
          example: data.data.example,
          recap: data.data.recap,
          language: data.data.language,
          languageFallback: data.data.languageFallback,
          fallbackMessage: data.data.fallbackMessage
        }

        setGeneratedContent(aiResponse)
        setStep('result')

        if (!isOnline) {
          addToSyncQueue({
            type: 'eli5_explanation',
            data: { formData, result: aiResponse },
            timestamp: Date.now()
          })
        }

        addNotification('ELI5 explanation generated successfully!', 'success')
      } else {
        throw new Error(data.message || 'Failed to generate explanation')
      }
    } catch (error) {
      console.error('API Error:', error)
      addNotification(
        error.message || 'Failed to generate explanation. Please try again.',
        'error'
      )
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const getLocalAnalogy = () => {
    const analogies = ['water pump', 'bicycle', 'cooking pot', 'fan', 'bullock cart']
    return analogies[Math.floor(Math.random() * analogies.length)]
  }

  const getLocalExample = () => {
    const examples = ['farming', 'cooking', 'festivals', 'daily life', 'local traditions']
    return examples[Math.floor(Math.random() * examples.length)]
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent.explanation)
    addNotification('Explanation copied to clipboard!', 'success')
  }

  const handleShare = () => {
    addNotification('Sharing to community...', 'info')
    // Implement sharing logic
  }

  const handleSave = () => {
    addNotification('Explanation saved to your library!', 'success')
    // Implement save logic
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
              Explain Like I'm 5
            </h1>
            <p className="text-sahayak-gray-600">
              Simplify complex topics for young minds
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
          <Lightbulb size={24} className="text-white" />
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Topic Input */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              What topic would you like to explain?
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
                  placeholder="e.g., Photosynthesis, Gravity, Democracy, Fractions"
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
                  <MapPin size={16} className="inline mr-1" />
                  Local Context
                </label>
                <input
                  type="text"
                  value={formData.localContext}
                  onChange={(e) => setFormData({...formData, localContext: e.target.value})}
                  placeholder="Your village/city name for local examples"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Complexity Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Explanation Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-3">
                  Complexity Level
                </label>
                <div className="space-y-2">
                  {complexityLevels.map(level => (
                    <label key={level.value} className="flex items-start">
                      <input
                        type="radio"
                        name="complexity"
                        value={level.value}
                        checked={formData.complexity === level.value}
                        onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-sahayak-gray-800">{level.label}</div>
                        <div className="text-sm text-sahayak-gray-600">{level.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeAnalogy}
                    onChange={(e) => setFormData({...formData, includeAnalogy: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include local analogies</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeExample}
                    onChange={(e) => setFormData({...formData, includeExample: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include story examples</span>
                </label>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="card w-full overflow-hidden">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4 flex items-center">
              <BookOpen size={20} className="mr-2 text-sahayak-blue" />
              Explanation Language
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-sahayak-gray-700">
                Select language for explanation
              </label>

              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full p-3 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label} ({lang.native})
                  </option>
                ))}
              </select>

              <p className="text-xs text-sahayak-gray-500">
                Explanations will be generated in the selected language. If the AI cannot explain in the chosen language, it will fallback to English.
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            <Sparkles size={20} className="mr-2" />
            Generate ELI5 Explanation
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Creating Simple Explanation...
          </h3>
          <p className="text-sahayak-gray-600">
            Making {formData.topic} easy to understand for Grade {formData.gradeLevel} students
          </p>
        </div>
      )}

      {step === 'result' && generatedContent && (
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

          {/* Simple Explanation */}
          <div className="card w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Lightbulb size={20} className="text-yellow-500 mr-2" />
                <h3 className={`text-lg font-semibold text-sahayak-gray-800 ${getLanguageClass(generatedContent.language)}`}>
                  {generatedContent.topic} - Simple Explanation
                </h3>
              </div>
              {generatedContent.language && (
                <span className="text-xs text-sahayak-gray-500 bg-sahayak-gray-100 px-2 py-1 rounded">
                  {getLanguageDisplayName(generatedContent.language)}
                </span>
              )}
            </div>

            {/* Language Fallback Warning */}
            {generatedContent.languageFallback && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle size={16} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">Language Fallback Notice</p>
                    <p className="text-yellow-700 mt-1">{generatedContent.fallbackMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <div className={`whitespace-pre-line text-sahayak-gray-700 leading-relaxed break-words ${getLanguageClass(generatedContent.language)}`}>
                {generatedContent.explanation}
              </div>
            </div>
          </div>

          {/* Metaphor/Analogy */}
          {generatedContent.metaphor && (
            <div className="card w-full overflow-hidden">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <Users size={18} className="mr-2 text-sahayak-green" />
                Think of it Like This
              </h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className={`text-sahayak-gray-700 leading-relaxed break-words ${getLanguageClass(generatedContent.language)}`}>
                  {generatedContent.metaphor}
                </p>
              </div>
            </div>
          )}

          {/* Real Example */}
          {generatedContent.example && (
            <div className="card w-full overflow-hidden">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <BookOpen size={18} className="mr-2 text-sahayak-orange" />
                Real Example
              </h4>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className={`text-sahayak-gray-700 leading-relaxed break-words ${getLanguageClass(generatedContent.language)}`}>
                  {generatedContent.example}
                </p>
              </div>
            </div>
          )}

          {/* Key Points to Remember */}
          {generatedContent.recap && generatedContent.recap.length > 0 && (
            <div className="card w-full overflow-hidden">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <BookOpen size={18} className="mr-2 text-sahayak-blue" />
                Key Points to Remember
              </h4>
              <ul className="space-y-3">
                {generatedContent.recap.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-sahayak-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className={`text-sahayak-gray-700 break-words ${getLanguageClass(generatedContent.language)}`}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateELI5

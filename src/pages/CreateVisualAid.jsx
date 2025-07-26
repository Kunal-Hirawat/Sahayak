import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  Image,
  ArrowLeft,
  Loader,
  Palette,
  BookOpen,
  Layers,
  Sparkles,
  Copy,
  Download,
  Share2,
  Pencil,
  Eraser,
  Undo,
  Redo,
  Maximize,
  Minimize
} from 'lucide-react'

const CreateVisualAid = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()

  const [step, setStep] = useState('input') // 'input', 'generating', 'result'
  const [formData, setFormData] = useState({
    subject: 'Science',
    topic: '',
    gradeLevel: '3',
    visualType: 'diagram',
    complexity: 'medium',
    colorScheme: 'colorful',
    includeLabels: true,
    includeExplanation: true,
    size: 'medium',
    style: 'simple'
  })
  const [generatedVisual, setGeneratedVisual] = useState(null)
  const [loading, setLoading] = useState(false)

  const subjects = [
    'Science', 'Math', 'Social Studies', 'Geography', 'History',
    'Environmental Studies', 'Biology', 'Physics', 'Chemistry'
  ]

  const visualTypes = [
    { value: 'diagram', label: 'Diagram', description: 'Labeled illustration of a concept or process', icon: '📊' },
    { value: 'chart', label: 'Chart/Graph', description: 'Visual representation of data or relationships', icon: '📈' },
    { value: 'map', label: 'Map', description: 'Geographical or conceptual map', icon: '🗺️' },
    { value: 'flowchart', label: 'Flowchart', description: 'Step-by-step process visualization', icon: '⏩' },
    { value: 'infographic', label: 'Infographic', description: 'Information-rich visual summary', icon: '📋' },
    { value: 'illustration', label: 'Illustration', description: 'Detailed drawing of a concept', icon: '🖼️' }
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1-2 (Ages 6-8)' },
    { value: '3', label: 'Grade 3-4 (Ages 8-10)' },
    { value: '5', label: 'Grade 5-6 (Ages 10-12)' },
    { value: '7', label: 'Grade 7-8 (Ages 12-14)' }
  ]

  const colorSchemes = [
    { value: 'colorful', label: 'Colorful', description: 'Bright, engaging colors for younger students' },
    { value: 'muted', label: 'Muted Colors', description: 'Softer, less distracting colors' },
    { value: 'blackboard', label: 'Blackboard Style', description: 'White/yellow on dark background like a blackboard' },
    { value: 'monochrome', label: 'Monochrome', description: 'Single color with different shades' }
  ]

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      addNotification('Please enter a topic for the visual aid', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockVisual = generateMockVisual()
      setGeneratedVisual(mockVisual)
      setStep('result')

      if (!isOnline) {
        addToSyncQueue({
          type: 'visual_aid',
          data: { formData, result: mockVisual },
          timestamp: Date.now()
        })
      }

      addNotification('Visual aid generated successfully!', 'success')
    } catch (error) {
      addNotification('Failed to generate visual aid. Please try again.', 'error')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const generateMockVisual = () => {
    return {
      title: `${formData.topic} - ${formData.visualType}`,
      description: `A ${formData.complexity} level ${formData.visualType} showing ${formData.topic} for Grade ${formData.gradeLevel} students`,
      visualType: formData.visualType,
      subject: formData.subject,
      createdBy: user?.name || 'Teacher',
      gradeLevel: formData.gradeLevel,

      // Mock visual representation (in real app, this would be an actual image/SVG)
      visualData: {
        type: formData.visualType,
        elements: [
          { type: 'title', text: formData.topic, position: 'top-center' },
          { type: 'main-element', text: `Main ${formData.topic} Component`, position: 'center' },
          { type: 'label', text: 'Key Feature 1', position: 'left' },
          { type: 'label', text: 'Key Feature 2', position: 'right' },
          { type: 'arrow', from: 'center', to: 'left' },
          { type: 'arrow', from: 'center', to: 'right' }
        ],
        colorScheme: formData.colorScheme,
        style: formData.style
      },

      drawingInstructions: [
        `Draw the main ${formData.topic} in the center of the blackboard`,
        `Add clear labels for each important part`,
        `Use arrows to show relationships between components`,
        `Include a title at the top`,
        `Add explanatory notes around the diagram`
      ],

      materials: [
        'Blackboard or large paper',
        'Colored chalk or markers',
        'Ruler for straight lines',
        'Eraser for corrections'
      ],

      teachingTips: [
        `Start by drawing the outline before adding details`,
        `Use different colors to highlight different concepts`,
        `Ask students to identify parts as you draw`,
        `Leave space for student questions and additions`,
        `Take a photo to save for future classes`
      ],

      explanation: formData.includeExplanation ?
        `This ${formData.visualType} helps students understand ${formData.topic} by showing the key components and their relationships. The visual representation makes abstract concepts more concrete and easier to remember. Students can refer to this diagram throughout the lesson and use it as a reference for their own work.` : null,

      labels: formData.includeLabels ? [
        `Main ${formData.topic}`,
        'Component A',
        'Component B',
        'Connection Point',
        'Key Feature'
      ] : [],

      extensions: [
        `Have students create their own version of this ${formData.visualType}`,
        `Add local examples relevant to your community`,
        `Create a simplified version for younger students`,
        `Use this as a template for related topics`
      ]
    }
  }

  const handleCopy = () => {
    const instructions = generatedVisual.drawingInstructions.join('\n')
    navigator.clipboard.writeText(instructions)
    addNotification('Drawing instructions copied to clipboard!', 'success')
  }

  const handleShare = () => {
    addNotification('Sharing visual aid to community...', 'info')
  }

  const handleSave = () => {
    addNotification('Visual aid saved to your library!', 'success')
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
              Visual Aid Generator
            </h1>
            <p className="text-sahayak-gray-600">
              Create blackboard diagrams and visual aids
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-sahayak-green rounded-lg flex items-center justify-center">
          <Image size={24} className="text-white" />
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Visual Aid Details
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
                  placeholder="e.g., Plant Cell, Water Cycle, Solar System, Fractions"
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

          {/* Visual Type Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Choose Visual Type
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {visualTypes.map(type => (
                <label key={type.value} className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="visualType"
                    value={type.value}
                    checked={formData.visualType === type.value}
                    onChange={(e) => setFormData({...formData, visualType: e.target.value})}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">{type.icon}</span>
                      <span className="font-medium text-sahayak-gray-800">{type.label}</span>
                    </div>
                    <p className="text-sm text-sahayak-gray-600">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Style & Appearance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Style & Appearance
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-3">
                  <Palette size={16} className="inline mr-1" />
                  Color Scheme
                </label>
                <div className="space-y-2">
                  {colorSchemes.map(scheme => (
                    <label key={scheme.value} className="flex items-start">
                      <input
                        type="radio"
                        name="colorScheme"
                        value={scheme.value}
                        checked={formData.colorScheme === scheme.value}
                        onChange={(e) => setFormData({...formData, colorScheme: e.target.value})}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-sahayak-gray-800">{scheme.label}</div>
                        <div className="text-sm text-sahayak-gray-600">{scheme.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Complexity Level
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                    className="input-field"
                  >
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="input-field"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeLabels}
                    onChange={(e) => setFormData({...formData, includeLabels: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include labels and annotations</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeExplanation}
                    onChange={(e) => setFormData({...formData, includeExplanation: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include explanation text</span>
                </label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            <Sparkles size={20} className="mr-2" />
            Generate Visual Aid
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-sahayak-green mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Creating Your Visual Aid...
          </h3>
          <p className="text-sahayak-gray-600">
            Designing a {formData.visualType} about {formData.topic} for Grade {formData.gradeLevel}
          </p>
        </div>
      )}

      {step === 'result' && generatedVisual && (
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

          {/* Visual Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Image size={20} className="text-sahayak-green mr-2" />
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  {generatedVisual.title}
                </h3>
              </div>
              <p className="text-sm text-sahayak-gray-600">
                Created by: {generatedVisual.createdBy}
              </p>
            </div>

            <p className="text-sahayak-gray-600 mb-6">{generatedVisual.description}</p>

            {/* Mock Visual Representation */}
            <div className="bg-sahayak-gray-800 rounded-lg p-8 mb-6 text-center min-h-64 flex items-center justify-center">
              <div className="text-white">
                <div className="text-2xl font-bold mb-4">{formData.topic}</div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="bg-sahayak-green p-3 rounded">Component A</div>
                  <div className="text-4xl">→</div>
                  <div className="bg-sahayak-blue p-3 rounded">Component B</div>
                </div>
                <div className="mt-4 text-sm opacity-75">
                  {formData.visualType.charAt(0).toUpperCase() + formData.visualType.slice(1)} Preview
                </div>
              </div>
            </div>

            {generatedVisual.explanation && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-sahayak-gray-800 mb-2">Explanation</h4>
                <p className="text-sahayak-gray-700">{generatedVisual.explanation}</p>
              </div>
            )}
          </div>

          {/* Drawing Instructions */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Pencil size={18} className="mr-2 text-sahayak-orange" />
              Drawing Instructions
            </h4>
            <ol className="space-y-2">
              {generatedVisual.drawingInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-sahayak-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sahayak-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Materials & Teaching Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Materials */}
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <Layers size={18} className="mr-2 text-purple-500" />
                Materials Needed
              </h4>
              <ul className="space-y-1">
                {generatedVisual.materials.map((material, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-purple-500 mr-2">•</span>
                    <span className="text-sahayak-gray-700">{material}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Teaching Tips */}
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <BookOpen size={18} className="mr-2 text-sahayak-blue" />
                Teaching Tips
              </h4>
              <ul className="space-y-1">
                {generatedVisual.teachingTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-sahayak-blue mr-2 mt-1">•</span>
                    <span className="text-sahayak-gray-700 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Labels */}
          {generatedVisual.labels.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3">Key Labels</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {generatedVisual.labels.map((label, index) => (
                  <div key={index} className="bg-sahayak-gray-100 p-2 rounded text-center text-sm">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extensions */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Sparkles size={18} className="mr-2 text-sahayak-green" />
              Extension Activities
            </h4>
            <ul className="space-y-2">
              {generatedVisual.extensions.map((extension, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-sahayak-green mr-2">•</span>
                  <span className="text-sahayak-gray-700">{extension}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateVisualAid

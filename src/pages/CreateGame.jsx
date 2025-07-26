import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { 
  Gamepad2, 
  ArrowLeft, 
  Loader, 
  Users,
  Clock,
  Target,
  Sparkles,
  Copy,
  Download,
  Share2,
  Play
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
    gameType: 'quiz',
    duration: '15',
    playerCount: 'individual',
    difficulty: 'medium',
    includeLocal: true
  })
  const [generatedGame, setGeneratedGame] = useState(null)
  const [loading, setLoading] = useState(false)

  const subjects = [
    'Math', 'Science', 'English', 'Hindi', 'Social Studies', 
    'Environmental Studies', 'Geography', 'History'
  ]

  const gameTypes = [
    { 
      value: 'quiz', 
      label: 'Quiz Game', 
      description: 'Question and answer format with scoring',
      icon: '🧠'
    },
    { 
      value: 'memory', 
      label: 'Memory Game', 
      description: 'Match pairs and remember sequences',
      icon: '🧩'
    },
    { 
      value: 'word', 
      label: 'Word Game', 
      description: 'Word building, spelling, and vocabulary',
      icon: '📝'
    },
    { 
      value: 'puzzle', 
      label: 'Puzzle Game', 
      description: 'Problem-solving and logical thinking',
      icon: '🧩'
    },
    { 
      value: 'role-play', 
      label: 'Role Play', 
      description: 'Acting and interactive scenarios',
      icon: '🎭'
    },
    { 
      value: 'treasure-hunt', 
      label: 'Treasure Hunt', 
      description: 'Find clues and solve mysteries',
      icon: '🗺️'
    }
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1-2 (Ages 6-8)' },
    { value: '3', label: 'Grade 3-4 (Ages 8-10)' },
    { value: '5', label: 'Grade 5-6 (Ages 10-12)' },
    { value: '7', label: 'Grade 7-8 (Ages 12-14)' }
  ]

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      addNotification('Please enter a topic for the game', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockGame = generateMockGame()
      setGeneratedGame(mockGame)
      setStep('result')
      
      if (!isOnline) {
        addToSyncQueue({
          type: 'educational_game',
          data: { formData, result: mockGame },
          timestamp: Date.now()
        })
      }
      
      addNotification('Educational game created successfully!', 'success')
    } catch (error) {
      addNotification('Failed to create game. Please try again.', 'error')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const generateMockGame = () => {
    const gameTemplates = {
      quiz: {
        title: `${formData.topic} Quiz Challenge`,
        description: `Test your knowledge about ${formData.topic} with this fun quiz game!`,
        instructions: [
          'Read each question carefully',
          'Choose the best answer from the options',
          'Get points for correct answers',
          'Try to beat your high score!'
        ],
        content: {
          questions: [
            {
              question: `What is the most important thing about ${formData.topic}?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct: 0,
              explanation: `This is correct because ${formData.topic} works this way...`
            },
            {
              question: `How does ${formData.topic} help us in daily life?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct: 1,
              explanation: `Great job! ${formData.topic} is very useful for...`
            }
          ]
        }
      },
      memory: {
        title: `${formData.topic} Memory Match`,
        description: `Match pairs related to ${formData.topic} and improve your memory!`,
        instructions: [
          'Flip cards to reveal content',
          'Find matching pairs',
          'Remember card positions',
          'Complete all pairs to win!'
        ],
        content: {
          pairs: [
            { card1: `${formData.topic} Term 1`, card2: 'Definition 1' },
            { card1: `${formData.topic} Term 2`, card2: 'Definition 2' },
            { card1: `${formData.topic} Term 3`, card2: 'Definition 3' }
          ]
        }
      },
      'role-play': {
        title: `${formData.topic} Adventure`,
        description: `Act out scenarios related to ${formData.topic}!`,
        instructions: [
          'Read your character role',
          'Act out the scenario',
          'Work with your team',
          'Learn through doing!'
        ],
        content: {
          scenarios: [
            {
              title: `The ${formData.topic} Mystery`,
              roles: ['Detective', 'Scientist', 'Student', 'Teacher'],
              scenario: `You must solve a problem related to ${formData.topic}...`
            }
          ]
        }
      }
    }

    const template = gameTemplates[formData.gameType] || gameTemplates.quiz
    
    return {
      ...template,
      gameType: formData.gameType,
      subject: formData.subject,
      gradeLevel: formData.gradeLevel,
      duration: `${formData.duration} minutes`,
      playerCount: formData.playerCount,
      difficulty: formData.difficulty,
      materials: [
        'Blackboard/Whiteboard',
        'Chalk/Markers',
        'Paper for scoring',
        'Timer (optional)'
      ],
      localContext: formData.includeLocal ? user?.location : null
    }
  }

  const handleCopy = () => {
    const gameText = `${generatedGame.title}\n\n${generatedGame.description}\n\nInstructions:\n${generatedGame.instructions.join('\n')}`
    navigator.clipboard.writeText(gameText)
    addNotification('Game copied to clipboard!', 'success')
  }

  const handleShare = () => {
    addNotification('Sharing game to community...', 'info')
  }

  const handleSave = () => {
    addNotification('Game saved to your library!', 'success')
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

          {/* Game Type Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Choose Game Type
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {gameTypes.map(type => (
                <label key={type.value} className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="gameType"
                    value={type.value}
                    checked={formData.gameType === type.value}
                    onChange={(e) => setFormData({...formData, gameType: e.target.value})}
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

          {/* Game Configuration */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Game Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="input-field"
                >
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Player Mode
                </label>
                <select
                  value={formData.playerCount}
                  onChange={(e) => setFormData({...formData, playerCount: e.target.value})}
                  className="input-field"
                >
                  <option value="individual">Individual</option>
                  <option value="pairs">Pairs (2 players)</option>
                  <option value="small-group">Small Groups (3-5)</option>
                  <option value="whole-class">Whole Class</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <Target size={16} className="inline mr-1" />
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

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeLocal}
                    onChange={(e) => setFormData({...formData, includeLocal: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-sahayak-gray-700">Include local context</span>
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

          {/* Game Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Gamepad2 size={20} className="text-pink-500 mr-2" />
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  {generatedGame.title}
                </h3>
              </div>
              <button className="btn-secondary flex items-center">
                <Play size={16} className="mr-1" />
                Start Game
              </button>
            </div>
            
            <p className="text-sahayak-gray-700 mb-4">{generatedGame.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Duration</div>
                <div className="text-sahayak-gray-600">{generatedGame.duration}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Players</div>
                <div className="text-sahayak-gray-600 capitalize">{generatedGame.playerCount}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Difficulty</div>
                <div className="text-sahayak-gray-600 capitalize">{generatedGame.difficulty}</div>
              </div>
              <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sahayak-gray-800">Grade</div>
                <div className="text-sahayak-gray-600">Grade {generatedGame.gradeLevel}</div>
              </div>
            </div>
          </div>

          {/* Game Instructions */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Play size={18} className="mr-2 text-sahayak-green" />
              How to Play
            </h4>
            <ol className="space-y-2">
              {generatedGame.instructions.map((instruction, index) => (
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
              <Target size={18} className="mr-2 text-sahayak-orange" />
              Materials Needed
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {generatedGame.materials.map((material, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-sahayak-orange mr-2">•</span>
                  <span className="text-sahayak-gray-700">{material}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Game Content Preview */}
          {generatedGame.gameType === 'quiz' && generatedGame.content.questions && (
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3">
                Sample Questions
              </h4>
              <div className="space-y-4">
                {generatedGame.content.questions.slice(0, 2).map((q, index) => (
                  <div key={index} className="border-l-4 border-pink-500 pl-4">
                    <div className="font-medium text-sahayak-gray-800 mb-2">
                      Q{index + 1}: {q.question}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {q.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`p-2 rounded ${optIndex === q.correct ? 'bg-green-100 text-green-800' : 'bg-sahayak-gray-50'}`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateGame

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  BookOpen,
  ArrowLeft,
  Loader,
  MapPin,
  Users,
  User,
  Clock,
  Heart,
  Sparkles,
  Copy,
  Download,
  Share2,
  Volume2,
  Eye
} from 'lucide-react'

const CreateStory = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification, isOnline, addToSyncQueue } = useApp()

  const [step, setStep] = useState('input') // 'input', 'generating', 'result'
  const [formData, setFormData] = useState({
    topic: '',
    gradeLevel: '3',
    storyLength: 'medium',
    storyType: 'moral',
    characters: 'children',
    setting: 'village',
    localContext: user?.location || '',
    moralLesson: '',
    includeDialogue: true,
    includeQuestions: true,
    language: 'english'
  })
  const [generatedStory, setGeneratedStory] = useState(null)
  const [loading, setLoading] = useState(false)

  const storyTypes = [
    { value: 'moral', label: 'Moral Story', description: 'Stories with life lessons and values', icon: '❤️' },
    { value: 'adventure', label: 'Adventure', description: 'Exciting journeys and discoveries', icon: '🗺️' },
    { value: 'educational', label: 'Educational', description: 'Stories that teach concepts', icon: '📚' },
    { value: 'folktale', label: 'Folk Tale', description: 'Traditional stories with cultural wisdom', icon: '🏛️' },
    { value: 'friendship', label: 'Friendship', description: 'Stories about relationships and bonding', icon: '🤝' },
    { value: 'problem-solving', label: 'Problem Solving', description: 'Stories about overcoming challenges', icon: '🧩' }
  ]

  const characterTypes = [
    { value: 'children', label: 'Children', description: 'Young protagonists like students' },
    { value: 'animals', label: 'Animals', description: 'Animal characters with human qualities' },
    { value: 'family', label: 'Family', description: 'Parents, grandparents, siblings' },
    { value: 'community', label: 'Community', description: 'Teachers, farmers, shopkeepers' },
    { value: 'mythical', label: 'Mythical', description: 'Magical creatures and fantasy beings' }
  ]

  const settings = [
    { value: 'village', label: 'Village', description: 'Rural setting with farms and nature' },
    { value: 'city', label: 'City', description: 'Urban environment with buildings and traffic' },
    { value: 'school', label: 'School', description: 'Classroom and playground settings' },
    { value: 'forest', label: 'Forest', description: 'Natural wilderness with trees and animals' },
    { value: 'home', label: 'Home', description: 'Family house and neighborhood' },
    { value: 'market', label: 'Market', description: 'Busy marketplace with vendors' }
  ]

  const gradeLevels = [
    { value: '1', label: 'Grade 1-2 (Ages 6-8)', words: '100-200 words' },
    { value: '3', label: 'Grade 3-4 (Ages 8-10)', words: '200-400 words' },
    { value: '5', label: 'Grade 5-6 (Ages 10-12)', words: '400-600 words' },
    { value: '7', label: 'Grade 7-8 (Ages 12-14)', words: '600-800 words' }
  ]

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      addNotification('Please enter a topic for the story', 'error')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockStory = generateMockStory()
      setGeneratedStory(mockStory)
      setStep('result')

      if (!isOnline) {
        addToSyncQueue({
          type: 'story',
          data: { formData, result: mockStory },
          timestamp: Date.now()
        })
      }

      addNotification('Story generated successfully!', 'success')
    } catch (error) {
      addNotification('Failed to generate story. Please try again.', 'error')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const generateMockStory = () => {
    const characterNames = {
      children: ['Ravi', 'Priya', 'Arjun', 'Meera', 'Kiran'],
      animals: ['Golu the Elephant', 'Chiku the Monkey', 'Sheru the Tiger', 'Moti the Dog'],
      family: ['Dadi Ma', 'Papa', 'Mama', 'Nani'],
      community: ['Master Ji', 'Kisan Uncle', 'Shopkeeper Aunty']
    }

    const selectedCharacter = characterNames[formData.characters] ?
      characterNames[formData.characters][Math.floor(Math.random() * characterNames[formData.characters].length)] :
      'Ravi'

    const storyContent = `Once upon a time, in the beautiful ${formData.setting} of ${formData.localContext}, there lived a ${formData.characters === 'children' ? 'young boy' : 'character'} named ${selectedCharacter}.

${selectedCharacter} was known throughout ${formData.localContext} for being curious about ${formData.topic}. Every day, ${selectedCharacter} would wonder about this important topic and how it affected everyone in the community.

One sunny morning, ${selectedCharacter} decided to learn more about ${formData.topic}. ${formData.characters === 'children' ? 'He' : 'They'} set out on an adventure that would teach ${formData.characters === 'children' ? 'him' : 'them'} valuable lessons.

As ${selectedCharacter} explored the ${formData.setting}, ${formData.characters === 'children' ? 'he' : 'they'} met various people who shared their wisdom about ${formData.topic}. An old farmer explained how ${formData.topic} was important in daily life, while a wise teacher showed how it connected to everything around them.

${formData.includeDialogue ? `"${selectedCharacter}," said the wise teacher, "understanding ${formData.topic} is like planting a seed. With care and attention, it grows into something beautiful that benefits everyone."

"I understand now!" replied ${selectedCharacter} with excitement. "${formData.topic} is not just a concept, but a way to make our community better!"` : ''}

Through this journey, ${selectedCharacter} learned that ${formData.topic} was more than just an idea - it was a way to help others and make the world a better place. ${formData.characters === 'children' ? 'He' : 'They'} returned home with new knowledge and a heart full of joy.

From that day forward, ${selectedCharacter} shared this wisdom with friends and family in ${formData.localContext}, spreading the importance of ${formData.topic} throughout the community.

${formData.moralLesson ? `The moral of the story: ${formData.moralLesson}` : `The moral of the story: Understanding and practicing ${formData.topic} makes us better people and helps our community grow stronger.`}`

    return {
      title: `${selectedCharacter} and the ${formData.topic} Adventure`,
      content: storyContent,
      characters: [selectedCharacter, 'Wise Teacher', 'Kind Farmer', 'Community Members'],
      setting: `${formData.setting} in ${formData.localContext}`,
      moralLesson: formData.moralLesson || `Understanding and practicing ${formData.topic} makes us better people`,
      readingTime: formData.storyLength === 'short' ? '2-3 minutes' : formData.storyLength === 'medium' ? '5-7 minutes' : '10-12 minutes',
      gradeLevel: formData.gradeLevel,
      wordCount: formData.storyLength === 'short' ? '150-250' : formData.storyLength === 'medium' ? '300-500' : '600-800',
      createdBy: user?.name || 'Teacher',
      discussionQuestions: formData.includeQuestions ? [
        `What did ${selectedCharacter} learn about ${formData.topic}?`,
        `How can we apply this lesson in our own lives?`,
        `What would you do if you were in ${selectedCharacter}'s place?`,
        `How does ${formData.topic} help our community?`,
        `What other examples of ${formData.topic} can you think of?`
      ] : [],
      activities: [
        `Draw your favorite scene from ${selectedCharacter}'s adventure`,
        `Act out the story with your classmates`,
        `Write about a time when you experienced ${formData.topic}`,
        `Create your own story about ${formData.topic} in your neighborhood`
      ],
      vocabulary: [
        { word: formData.topic, meaning: `The main theme of our story` },
        { word: 'Community', meaning: 'People living together in the same area' },
        { word: 'Wisdom', meaning: 'Knowledge gained through experience' },
        { word: 'Adventure', meaning: 'An exciting journey or experience' }
      ]
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedStory.content)
    addNotification('Story copied to clipboard!', 'success')
  }

  const handleShare = () => {
    addNotification('Sharing story to community...', 'info')
  }

  const handleSave = () => {
    addNotification('Story saved to your library!', 'success')
  }

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(generatedStory.content)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
      addNotification('Reading story aloud...', 'info')
    } else {
      addNotification('Text-to-speech not supported in this browser', 'error')
    }
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
              Story Generator
            </h1>
            <p className="text-sahayak-gray-600">
              Create engaging stories with local context
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-sahayak-orange rounded-lg flex items-center justify-center">
          <BookOpen size={24} className="text-white" />
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Story Topic */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Story Topic & Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Story Topic or Theme
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Honesty, Friendship, Hard Work, Sharing, Kindness"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <option key={grade.value} value={grade.value}>
                        {grade.label} - {grade.words}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Story Length
                  </label>
                  <select
                    value={formData.storyLength}
                    onChange={(e) => setFormData({...formData, storyLength: e.target.value})}
                    className="input-field"
                  >
                    <option value="short">Short (2-3 minutes)</option>
                    <option value="medium">Medium (5-7 minutes)</option>
                    <option value="long">Long (10-12 minutes)</option>
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

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  Moral Lesson (Optional)
                </label>
                <input
                  type="text"
                  value={formData.moralLesson}
                  onChange={(e) => setFormData({...formData, moralLesson: e.target.value})}
                  placeholder="What should students learn from this story?"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Story Type */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Story Type
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {storyTypes.map(type => (
                <label key={type.value} className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-sahayak-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="storyType"
                    value={type.value}
                    checked={formData.storyType === type.value}
                    onChange={(e) => setFormData({...formData, storyType: e.target.value})}
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

          {/* Characters & Setting */}
          <div className="card">
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-4">
              Characters & Setting
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Main Characters
                </label>
                <select
                  value={formData.characters}
                  onChange={(e) => setFormData({...formData, characters: e.target.value})}
                  className="input-field"
                >
                  {characterTypes.map(char => (
                    <option key={char.value} value={char.value}>{char.label}</option>
                  ))}
                </select>
                <p className="text-xs text-sahayak-gray-500 mt-1">
                  {characterTypes.find(c => c.value === formData.characters)?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Story Setting
                </label>
                <select
                  value={formData.setting}
                  onChange={(e) => setFormData({...formData, setting: e.target.value})}
                  className="input-field"
                >
                  {settings.map(setting => (
                    <option key={setting.value} value={setting.value}>{setting.label}</option>
                  ))}
                </select>
                <p className="text-xs text-sahayak-gray-500 mt-1">
                  {settings.find(s => s.value === formData.setting)?.description}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeDialogue}
                  onChange={(e) => setFormData({...formData, includeDialogue: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-sahayak-gray-700">Include character dialogue</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeQuestions}
                  onChange={(e) => setFormData({...formData, includeQuestions: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-sahayak-gray-700">Include discussion questions</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="btn-primary w-full flex items-center justify-center"
          >
            <Sparkles size={20} className="mr-2" />
            Generate Story
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div className="card text-center py-12">
          <Loader size={48} className="animate-spin text-sahayak-orange mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
            Creating Your Story...
          </h3>
          <p className="text-sahayak-gray-600">
            Crafting a {formData.storyType} story about {formData.topic} for Grade {formData.gradeLevel}
          </p>
        </div>
      )}

      {step === 'result' && generatedStory && (
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
                onClick={handleReadAloud}
                className="flex items-center text-sahayak-gray-600 hover:bg-sahayak-gray-100 px-3 py-2 rounded-lg"
              >
                <Volume2 size={16} className="mr-1" />
                Read Aloud
              </button>
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

          {/* Story Content */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpen size={20} className="text-sahayak-orange mr-2" />
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  {generatedStory.title}
                </h3>
              </div>
              <div className="flex items-center space-x-4 text-sm text-sahayak-gray-600">
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {generatedStory.readingTime}
                </span>
                <span className="flex items-center">
                  <Eye size={14} className="mr-1" />
                  {generatedStory.wordCount} words
                </span>
                <span className="flex items-center">
                  <User size={14} className="mr-1" />
                  {generatedStory.createdBy}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-sahayak-gray-700 leading-relaxed text-base">
                {generatedStory.content}
              </div>
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-sahayak-gray-800 mb-2 flex items-center">
                <Heart size={16} className="mr-2 text-sahayak-orange" />
                Moral Lesson
              </h4>
              <p className="text-sahayak-gray-700">{generatedStory.moralLesson}</p>
            </div>
          </div>

          {/* Story Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Characters & Setting */}
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <Users size={18} className="mr-2 text-sahayak-green" />
                Story Details
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Characters:</span>
                  <span className="text-sahayak-gray-600 ml-2">
                    {generatedStory.characters.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Setting:</span>
                  <span className="text-sahayak-gray-600 ml-2">
                    {generatedStory.setting}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Grade Level:</span>
                  <span className="text-sahayak-gray-600 ml-2">
                    Grade {generatedStory.gradeLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Vocabulary */}
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <BookOpen size={18} className="mr-2 text-purple-500" />
                Key Vocabulary
              </h4>
              <div className="space-y-2">
                {generatedStory.vocabulary.map((item, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-sahayak-gray-800">{item.word}:</span>
                    <span className="text-sahayak-gray-600 ml-2">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discussion Questions */}
          {generatedStory.discussionQuestions.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
                <BookOpen size={18} className="mr-2 text-sahayak-blue" />
                Discussion Questions
              </h4>
              <ul className="space-y-2">
                {generatedStory.discussionQuestions.map((question, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-sahayak-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sahayak-gray-700">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Activities */}
          <div className="card">
            <h4 className="font-semibold text-sahayak-gray-800 mb-3 flex items-center">
              <Sparkles size={18} className="mr-2 text-sahayak-orange" />
              Follow-up Activities
            </h4>
            <ul className="space-y-2">
              {generatedStory.activities.map((activity, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-sahayak-orange mr-2">•</span>
                  <span className="text-sahayak-gray-700">{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateStory

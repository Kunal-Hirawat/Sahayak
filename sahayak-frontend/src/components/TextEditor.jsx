import { useState, useEffect } from 'react'
import { 
  FileText, 
  Upload, 
  Type, 
  Eye, 
  RotateCcw,
  BookOpen,
  Clock,
  BarChart3,
  AlertCircle
} from 'lucide-react'

const TextEditor = ({ 
  value, 
  onChange, 
  gradeLevel = '1',
  placeholder = "Enter text for students to read...",
  showAnalysis = true,
  className = ""
}) => {
  const [textStats, setTextStats] = useState({
    wordCount: 0,
    sentenceCount: 0,
    avgWordsPerSentence: 0,
    readingLevel: 'Unknown',
    estimatedTime: 0
  })
  
  const [showPreview, setShowPreview] = useState(false)

  // Grade-level text suggestions
  const gradeSuggestions = {
    '1': {
      maxWords: 50,
      maxSentenceLength: 8,
      suggestions: [
        "The cat sat on the mat. The cat has a red hat. The hat is big.",
        "I see a dog. The dog is brown. The dog likes to run and play.",
        "The sun is bright. Birds fly in the sky. Flowers grow in the garden."
      ]
    },
    '2': {
      maxWords: 100,
      maxSentenceLength: 12,
      suggestions: [
        "My pet dog named Max likes to play fetch in the park. Every morning, Max wakes me up with his tail wagging.",
        "The school library has many colorful books. Students love to read stories about adventures and animals.",
        "In our garden, we plant flowers and vegetables. The tomatoes are red and the sunflowers grow very tall."
      ]
    },
    '3': {
      maxWords: 150,
      maxSentenceLength: 15,
      suggestions: [
        "Our school has a beautiful garden where students learn about plants. We water the flowers every day and watch them grow. The butterflies visit our garden in the spring.",
        "The ocean is home to many wonderful sea creatures. Dolphins swim gracefully through the waves while colorful fish live in coral reefs beneath the surface.",
        "During science class, we conducted an exciting experiment with magnets. We discovered that opposite poles attract each other while similar poles push away."
      ]
    },
    '4': {
      maxWords: 200,
      maxSentenceLength: 18,
      suggestions: [
        "Space exploration has always fascinated humans throughout history. Astronauts travel to the International Space Station to conduct important scientific experiments that help us understand our universe better.",
        "The Amazon rainforest is often called the lungs of our planet because it produces oxygen and absorbs carbon dioxide. Many unique animals and plants live in this incredible ecosystem.",
        "Ancient civilizations built magnificent structures that still amaze us today. The pyramids of Egypt and the Great Wall of China demonstrate the remarkable engineering skills of our ancestors."
      ]
    },
    '5': {
      maxWords: 250,
      maxSentenceLength: 20,
      suggestions: [
        "Climate change represents one of the most significant challenges facing our planet today. Scientists around the world are working together to develop innovative solutions that can help reduce greenhouse gas emissions and protect our environment for future generations.",
        "The human brain contains approximately 86 billion neurons that work together to process information, store memories, and control our body functions. This remarkable organ continues to fascinate researchers who study its complex mechanisms and capabilities.",
        "Renewable energy sources such as solar, wind, and hydroelectric power offer sustainable alternatives to fossil fuels. These technologies are becoming increasingly efficient and affordable, making them viable options for communities worldwide."
      ]
    }
  }

  // Calculate text statistics
  const analyzeText = (text) => {
    if (!text.trim()) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        readingLevel: 'Unknown',
        estimatedTime: 0
      }
    }

    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
    
    const wordCount = words.length
    const sentenceCount = sentences.length
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0
    
    // Simple reading level estimation based on word and sentence length
    let readingLevel = 'Unknown'
    if (avgWordsPerSentence <= 8 && wordCount <= 50) {
      readingLevel = 'Grade 1-2'
    } else if (avgWordsPerSentence <= 12 && wordCount <= 100) {
      readingLevel = 'Grade 2-3'
    } else if (avgWordsPerSentence <= 15 && wordCount <= 150) {
      readingLevel = 'Grade 3-4'
    } else if (avgWordsPerSentence <= 18 && wordCount <= 200) {
      readingLevel = 'Grade 4-5'
    } else {
      readingLevel = 'Grade 5+'
    }
    
    // Estimate reading time (average 100-150 words per minute for elementary students)
    const estimatedTime = Math.ceil(wordCount / 120) // 120 WPM average
    
    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      readingLevel,
      estimatedTime
    }
  }

  // Update stats when text changes
  useEffect(() => {
    const stats = analyzeText(value)
    setTextStats(stats)
  }, [value])

  // Get grade-level recommendations
  const getGradeRecommendations = () => {
    const grade = gradeSuggestions[gradeLevel] || gradeSuggestions['1']
    const isAppropriate = textStats.wordCount <= grade.maxWords && 
                         textStats.avgWordsPerSentence <= grade.maxSentenceLength
    
    return {
      ...grade,
      isAppropriate,
      currentGrade: gradeLevel
    }
  }

  const recommendations = getGradeRecommendations()

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        onChange(text)
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a text file (.txt)')
    }
  }

  // Use suggestion
  const useSuggestion = (suggestion) => {
    onChange(suggestion)
  }

  return (
    <div className={`text-editor ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText size={20} className="text-sahayak-blue" />
          <h4 className="font-medium text-sahayak-gray-800">
            Reading Text for Grade {gradeLevel}
          </h4>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center px-3 py-1 rounded text-sm ${
              showPreview 
                ? 'bg-sahayak-blue text-white' 
                : 'bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200'
            }`}
          >
            <Eye size={14} className="mr-1" />
            Preview
          </button>
          
          <label className="flex items-center px-3 py-1 bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200 rounded text-sm cursor-pointer">
            <Upload size={14} className="mr-1" />
            Upload
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => onChange('')}
            className="flex items-center px-3 py-1 bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200 rounded text-sm"
          >
            <RotateCcw size={14} className="mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Text input area */}
      <div className="space-y-4">
        {showPreview ? (
          // Preview mode
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h5 className="font-medium text-blue-800 mb-4 text-center">
              Student Reading View
            </h5>
            <div className="text-lg text-blue-900 leading-relaxed">
              {value || (
                <span className="text-blue-400 italic">
                  Enter text above to see preview...
                </span>
              )}
            </div>
          </div>
        ) : (
          // Edit mode
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-40 p-4 border border-sahayak-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-sahayak-blue focus:border-transparent"
          />
        )}

        {/* Text analysis */}
        {showAnalysis && value.trim() && (
          <div className="bg-sahayak-gray-50 border border-sahayak-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BarChart3 size={16} className="text-sahayak-gray-600 mr-2" />
              <h5 className="font-medium text-sahayak-gray-800">Text Analysis</h5>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-sahayak-gray-800">
                  {textStats.wordCount}
                </div>
                <div className="text-sahayak-gray-600">Words</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-sahayak-gray-800">
                  {textStats.sentenceCount}
                </div>
                <div className="text-sahayak-gray-600">Sentences</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-sahayak-gray-800">
                  {textStats.avgWordsPerSentence}
                </div>
                <div className="text-sahayak-gray-600">Avg Words/Sentence</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-sahayak-gray-800 flex items-center justify-center">
                  <Clock size={14} className="mr-1" />
                  {textStats.estimatedTime}m
                </div>
                <div className="text-sahayak-gray-600">Est. Reading Time</div>
              </div>
            </div>
            
            {/* Grade level appropriateness */}
            <div className="mt-4 pt-4 border-t border-sahayak-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-sahayak-gray-600 mr-2">
                    Reading Level:
                  </span>
                  <span className={`text-sm font-medium ${
                    recommendations.isAppropriate 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {textStats.readingLevel}
                  </span>
                </div>
                
                {!recommendations.isAppropriate && (
                  <div className="flex items-center text-orange-600 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    May be challenging for Grade {gradeLevel}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grade-level suggestions */}
        {!value.trim() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BookOpen size={16} className="text-blue-600 mr-2" />
              <h5 className="font-medium text-blue-800">
                Grade {gradeLevel} Text Suggestions
              </h5>
            </div>
            
            <div className="space-y-3">
              {recommendations.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white border border-blue-200 rounded p-3">
                  <p className="text-sm text-sahayak-gray-700 mb-2">
                    {suggestion}
                  </p>
                  <button
                    onClick={() => useSuggestion(suggestion)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Use this text
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-blue-600">
              💡 Recommended for Grade {gradeLevel}: 
              Max {recommendations.maxWords} words, 
              {recommendations.maxSentenceLength} words per sentence
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextEditor

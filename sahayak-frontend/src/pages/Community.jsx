import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import {
  Search,
  Filter,
  BookOpen,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Download,
  Star,
  StarHalf,
  User,
  School,
  Calendar,
  ChevronDown,
  Loader,
  X
} from 'lucide-react'

const Community = () => {
  const { user } = useAuth()
  const { addNotification } = useApp()

  // State management
  const [contentFeed, setContentFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    contentType: 'story', // 'story' or 'visual_aid'
    grades: [],
    subjects: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [expandedStories, setExpandedStories] = useState({}) // Track expanded stories
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [newComment, setNewComment] = useState('')

  // Enhanced Mock data for development
  const mockContent = [
    // Stories
    {
      id: 'story-1',
      type: 'story',
      title: 'The Honest Farmer and the Magic Seeds',
      content: 'Once upon a time in a small village near Pune, there lived a farmer named Ravi who always told the truth. One day, he found some magical seeds that could grow into anything he wished for. But Ravi had to make a choice between using them for himself or helping his village. When the village faced drought, Ravi planted the seeds to create a well that would provide water for everyone. The moral of the story teaches us that sharing and helping others brings more joy than keeping everything for ourselves.',
      author: 'Priya Sharma',
      school: 'Govt Primary School, Hadapsar',
      grade: 3,
      subject: 'English',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 24,
      comments: 8,
      rating: 4.5,
      saves: 15,
      isLiked: false,
      isSaved: false,
      readingTime: '5-7 minutes',
      moralLesson: 'Honesty and helping others brings true happiness'
    },
    {
      id: 'story-2',
      type: 'story',
      title: 'Meera and the Counting Competition',
      content: 'In the bustling market of Jaipur, young Meera loved to count everything she saw. When her school announced a math competition, she was excited but nervous. With help from her grandmother who sold vegetables in the market, Meera learned that math is everywhere around us. She counted mangoes, calculated change, and measured rice. On the day of the competition, Meera felt confident because she had practiced math in real life, not just in books.',
      author: 'Sunita Devi',
      school: 'Govt Girls School, Jaipur',
      grade: 2,
      subject: 'Math',
      createdAt: '2024-01-13T09:15:00Z',
      likes: 31,
      comments: 12,
      rating: 4.8,
      saves: 19,
      isLiked: false,
      isSaved: true,
      readingTime: '3-4 minutes',
      moralLesson: 'Practice and perseverance lead to success'
    },
    {
      id: 'story-3',
      type: 'story',
      title: 'The Little Sparrow Who Saved the Forest',
      content: 'In the dense forests of Kerala, there lived a tiny sparrow named Chiku. When a big fire started spreading through the forest, all the big animals ran away in fear. But little Chiku had an idea. She flew to the nearby river, filled her tiny beak with water, and flew back to drop it on the fire. Other animals laughed at her small effort, but soon other birds joined her. Together, they put out the fire and saved their home.',
      author: 'Ramesh Nair',
      school: 'Govt Higher Primary School, Kochi',
      grade: 4,
      subject: 'English',
      createdAt: '2024-01-11T16:45:00Z',
      likes: 42,
      comments: 15,
      rating: 4.7,
      saves: 33,
      isLiked: true,
      isSaved: false,
      readingTime: '4-5 minutes',
      moralLesson: 'Small efforts can make a big difference when we work together'
    },
    {
      id: 'story-4',
      type: 'story',
      title: 'Arjun and the Magic of Sharing',
      content: 'Arjun had the most delicious lunch in his class - his mother packed parathas, pickle, and sweets. But he noticed his friend Kiran only had dry bread. At first, Arjun hesitated to share, thinking he would go hungry. But when he shared half his lunch with Kiran, something magical happened. Kiran shared his fruit, another friend shared her yogurt, and soon the whole class was sharing and everyone had a feast!',
      author: 'Kavita Singh',
      school: 'Govt Primary School, Lucknow',
      grade: 1,
      subject: 'Hindi',
      createdAt: '2024-01-10T12:20:00Z',
      likes: 28,
      comments: 9,
      rating: 4.4,
      saves: 21,
      isLiked: false,
      isSaved: false,
      readingTime: '2-3 minutes',
      moralLesson: 'Sharing multiplies happiness and creates friendship'
    },
    {
      id: 'story-5',
      type: 'story',
      title: 'The Clever Crow and the Water Pot',
      content: 'On a hot summer day in Rajasthan, a thirsty crow found a pot with very little water at the bottom. The crow tried to drink but could not reach the water. Instead of giving up, the clever crow started dropping pebbles into the pot one by one. Slowly, the water level rose until the crow could drink. This story teaches us that patience and smart thinking can solve any problem.',
      author: 'Mohan Lal',
      school: 'Govt Middle School, Jodhpur',
      grade: 5,
      subject: 'English',
      createdAt: '2024-01-09T08:30:00Z',
      likes: 35,
      comments: 11,
      rating: 4.6,
      saves: 27,
      isLiked: false,
      isSaved: true,
      readingTime: '3-4 minutes',
      moralLesson: 'Intelligence and persistence overcome obstacles'
    },

    // Visual Aids
    {
      id: 'visual-1',
      type: 'visual_aid',
      title: 'Water Cycle Diagram - Simple Version',
      description: 'A clear and simple diagram showing the water cycle process with evaporation, condensation, and precipitation. Perfect for explaining to young students with local examples from Indian geography like the Ganges river and monsoon rains.',
      imageUrl: '/api/placeholder/400/300',
      author: 'Rajesh Kumar',
      school: 'Govt Middle School, Bhopal',
      grade: 4,
      subject: 'Science',
      createdAt: '2024-01-14T14:20:00Z',
      likes: 18,
      comments: 5,
      rating: 4.2,
      saves: 22,
      isLiked: true,
      isSaved: false,
      materials: ['Blackboard', 'Colored chalk', 'Water container', 'Small mirror']
    },
    {
      id: 'visual-2',
      type: 'visual_aid',
      title: 'Parts of a Plant - Interactive Drawing',
      description: 'Step-by-step blackboard drawing showing roots, stem, leaves, flowers, and fruits. Includes local examples like mango tree, tulsi plant, and wheat crop that students can relate to from their daily life.',
      imageUrl: '/api/placeholder/400/250',
      author: 'Amit Patel',
      school: 'Govt Primary School, Surat',
      grade: 3,
      subject: 'Science',
      createdAt: '2024-01-12T11:45:00Z',
      likes: 15,
      comments: 7,
      rating: 4.3,
      saves: 28,
      isLiked: false,
      isSaved: false,
      materials: ['Blackboard', 'Colored chalk', 'Real plant sample', 'Magnifying glass']
    },
    {
      id: 'visual-3',
      type: 'visual_aid',
      title: 'Indian Map with States and Capitals',
      description: 'Colorful map of India showing all states and union territories with their capitals. Includes major rivers, mountain ranges, and important cities. Great for geography lessons with emphasis on our diverse country.',
      imageUrl: '/api/placeholder/500/400',
      author: 'Deepika Rao',
      school: 'Govt High School, Bangalore',
      grade: 6,
      subject: 'Social Studies',
      createdAt: '2024-01-08T15:10:00Z',
      likes: 45,
      comments: 18,
      rating: 4.8,
      saves: 52,
      isLiked: false,
      isSaved: true,
      materials: ['Large chart paper', 'Colored markers', 'Scale', 'Atlas for reference']
    },
    {
      id: 'visual-4',
      type: 'visual_aid',
      title: 'Addition and Subtraction Number Line',
      description: 'Interactive number line from 0 to 100 with movable markers. Helps students visualize addition and subtraction operations. Includes examples with everyday objects like fruits, toys, and coins.',
      imageUrl: '/api/placeholder/600/200',
      author: 'Neha Gupta',
      school: 'Govt Primary School, Delhi',
      grade: 2,
      subject: 'Math',
      createdAt: '2024-01-07T10:25:00Z',
      likes: 29,
      comments: 8,
      rating: 4.5,
      saves: 34,
      isLiked: true,
      isSaved: false,
      materials: ['Long strip of paper', 'Markers', 'Small objects for counting', 'Tape']
    },
    {
      id: 'visual-5',
      type: 'visual_aid',
      title: 'Solar System Model - Easy to Draw',
      description: 'Simple diagram of our solar system with the Sun at center and all planets in order. Includes interesting facts about each planet and their relative sizes. Perfect for sparking curiosity about space.',
      imageUrl: '/api/placeholder/450/350',
      author: 'Dr. Suresh Reddy',
      school: 'Govt Middle School, Hyderabad',
      grade: 5,
      subject: 'Science',
      createdAt: '2024-01-06T13:40:00Z',
      likes: 38,
      comments: 14,
      rating: 4.7,
      saves: 41,
      isLiked: false,
      isSaved: false,
      materials: ['Blackboard', 'Colored chalk', 'Compass for circles', 'Reference book']
    },
    {
      id: 'visual-6',
      type: 'visual_aid',
      title: 'Hindi Varnamala Chart with Pictures',
      description: 'Beautiful Hindi alphabet chart with each letter paired with familiar objects. Includes क for कमल (lotus), ख for खरगोश (rabbit), etc. Helps children learn Hindi letters through visual association.',
      imageUrl: '/api/placeholder/400/500',
      author: 'Sushma Sharma',
      school: 'Govt Girls School, Indore',
      grade: 1,
      subject: 'Hindi',
      createdAt: '2024-01-05T09:15:00Z',
      likes: 33,
      comments: 10,
      rating: 4.6,
      saves: 39,
      isLiked: true,
      isSaved: true,
      materials: ['Chart paper', 'Colored pencils', 'Pictures/stickers', 'Glue']
    }
  ]

  const subjects = [
    { value: '', label: 'All Subjects' },
    { value: 'Math', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Science', label: 'Science' },
    { value: 'Social Studies', label: 'Social Studies' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'EVS', label: 'Environmental Studies' }
  ]

  const grades = [
    { value: '', label: 'All Grades' },
    { value: 1, label: 'Grade 1' },
    { value: 2, label: 'Grade 2' },
    { value: 3, label: 'Grade 3' },
    { value: 4, label: 'Grade 4' },
    { value: 5, label: 'Grade 5' },
    { value: 6, label: 'Grade 6' },
    { value: 7, label: 'Grade 7' },
    { value: 8, label: 'Grade 8' }
  ]

  // Load content on component mount
  useEffect(() => {
    loadContent()
  }, [filters, searchQuery])

  const loadContent = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Filter mock content based on current filters
      let filteredContent = mockContent.filter(item => {
        // Content type filter
        if (item.type !== filters.contentType) return false

        // Grade filter
        if (filters.grades.length > 0 && !filters.grades.includes(item.grade)) return false

        // Subject filter
        if (filters.subjects.length > 0 && !filters.subjects.includes(item.subject)) return false

        // Search query filter
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.author.toLowerCase().includes(searchQuery.toLowerCase())) return false

        return true
      })

      setContentFeed(filteredContent)
    } catch (error) {
      addNotification('Failed to load community content', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Interaction handlers
  const handleLike = async (contentId) => {
    try {
      setContentFeed(prev => prev.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          }
        }
        return item
      }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      addNotification('Content liked!', 'success')
    } catch (error) {
      addNotification('Failed to like content', 'error')
    }
  }

  const handleSave = async (contentId) => {
    try {
      setContentFeed(prev => prev.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            isSaved: !item.isSaved,
            saves: item.isSaved ? item.saves - 1 : item.saves + 1
          }
        }
        return item
      }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      addNotification('Content saved to your library!', 'success')
    } catch (error) {
      addNotification('Failed to save content', 'error')
    }
  }

  const handleComment = (contentId) => {
    const content = contentFeed.find(item => item.id === contentId)
    setSelectedContent(content)
    setShowCommentModal(true)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      // Update the content feed with new comment count
      setContentFeed(prev => prev.map(item => {
        if (item.id === selectedContent.id) {
          return {
            ...item,
            comments: item.comments + 1
          }
        }
        return item
      }))

      setNewComment('')
      setShowCommentModal(false)
      addNotification('Comment added successfully!', 'success')
    } catch (error) {
      addNotification('Failed to add comment', 'error')
    }
  }

  const toggleStoryExpansion = (storyId) => {
    setExpandedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }))
  }

  const handleRate = async (contentId, rating) => {
    try {
      setContentFeed(prev => prev.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            rating: rating
          }
        }
        return item
      }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      addNotification(`Rated ${rating} stars!`, 'success')
    } catch (error) {
      addNotification('Failed to rate content', 'error')
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const toggleContentType = (type) => {
    setFilters(prev => ({
      ...prev,
      contentType: type
    }))
  }

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN')
  }

  const renderStars = (rating, interactive = false, onRate = null) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            size={16}
            className={`${interactive ? 'cursor-pointer hover:text-yellow-500' : ''} text-yellow-500 fill-current`}
            onClick={() => interactive && onRate && onRate(i)}
          />
        )
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            size={16}
            className={`${interactive ? 'cursor-pointer hover:text-yellow-500' : ''} text-yellow-500 fill-current`}
            onClick={() => interactive && onRate && onRate(i)}
          />
        )
      } else {
        stars.push(
          <Star
            key={i}
            size={16}
            className={`${interactive ? 'cursor-pointer hover:text-yellow-500' : ''} text-sahayak-gray-300`}
            onClick={() => interactive && onRate && onRate(i)}
          />
        )
      }
    }

    return <div className="flex items-center space-x-1">{stars}</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sahayak-gray-800">
            Community
          </h1>
          <p className="text-sahayak-gray-600">
            Discover and share teaching content with fellow educators
          </p>
        </div>
        <div className="w-12 h-12 bg-sahayak-green rounded-lg flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sahayak-gray-400" />
          <input
            type="text"
            placeholder="Search stories, visual aids, or teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-sahayak-gray-300 rounded-lg focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
          />
        </div>
      </div>

      {/* Content Type Toggle */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-sahayak-gray-800">Content Type</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sahayak-blue hover:bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Filter size={16} className="mr-1" />
            Filters
            <ChevronDown size={16} className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => toggleContentType('story')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.contentType === 'story'
                ? 'bg-sahayak-orange text-white'
                : 'bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200'
            }`}
          >
            <BookOpen size={16} className="mr-2" />
            Stories
          </button>
          <button
            onClick={() => toggleContentType('visual_aid')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.contentType === 'visual_aid'
                ? 'bg-sahayak-green text-white'
                : 'bg-sahayak-gray-100 text-sahayak-gray-700 hover:bg-sahayak-gray-200'
            }`}
          >
            <ImageIcon size={16} className="mr-2" />
            Visual Aids
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                Grade Level
              </label>
              <select
                value={filters.grades[0] || ''}
                onChange={(e) => handleFilterChange('grades', e.target.value ? [parseInt(e.target.value)] : [])}
                className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
              >
                {grades.map(grade => (
                  <option key={grade.value} value={grade.value}>{grade.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sahayak-gray-700 mb-2">
                Subject
              </label>
              <select
                value={filters.subjects[0] || ''}
                onChange={(e) => handleFilterChange('subjects', e.target.value ? [e.target.value] : [])}
                className="w-full border border-sahayak-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
              >
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>{subject.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <Loader size={48} className="animate-spin text-sahayak-blue mx-auto mb-4" />
            <p className="text-sahayak-gray-600">Loading community content...</p>
          </div>
        ) : contentFeed.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
              No content found
            </h3>
            <p className="text-sahayak-gray-600">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          contentFeed.map(item => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              {/* Content Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'story'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.type === 'story' ? 'Story' : 'Visual Aid'}
                    </span>
                    <span className="px-2 py-1 bg-sahayak-blue text-white rounded-full text-xs font-medium">
                      Grade {item.grade}
                    </span>
                    <span className="px-2 py-1 bg-sahayak-gray-100 text-sahayak-gray-700 rounded-full text-xs">
                      {item.subject}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-sahayak-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-sm text-sahayak-gray-600 space-x-4">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      {item.author}
                    </div>
                    <div className="flex items-center">
                      <School size={14} className="mr-1" />
                      {item.school}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(item.rating)}
                  <span className="text-sm text-sahayak-gray-600">({item.rating})</span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                {item.type === 'story' ? (
                  <div>
                    <div className="text-sahayak-gray-700 mb-2">
                      {expandedStories[item.id] ? (
                        <p className="whitespace-pre-line">{item.content}</p>
                      ) : (
                        <p className="line-clamp-3">{item.content}</p>
                      )}
                      {item.content.length > 200 && (
                        <button
                          onClick={() => toggleStoryExpansion(item.id)}
                          className="text-sahayak-blue hover:text-sahayak-blue-dark font-medium text-sm mt-1 inline-block"
                        >
                          {expandedStories[item.id] ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-sahayak-gray-600 gap-2">
                      <span className="flex items-center">📖 {item.readingTime}</span>
                      <span className="flex items-center">💡 {item.moralLesson}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-sahayak-gray-100 rounded-lg p-4 mb-2 flex items-center justify-center h-32">
                      <ImageIcon size={48} className="text-sahayak-gray-400" />
                    </div>
                    <p className="text-sahayak-gray-700 mb-2 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-sm text-sahayak-gray-600">
                      <span className="flex items-center flex-wrap">
                        🛠️ <span className="ml-1">Materials: {item.materials?.join(', ')}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement Actions */}
              <div className="pt-4 border-t border-sahayak-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                        item.isLiked
                          ? 'bg-red-50 text-red-600'
                          : 'text-sahayak-gray-600 hover:bg-sahayak-gray-100'
                      }`}
                    >
                      <Heart size={16} className={item.isLiked ? 'fill-current' : ''} />
                      <span>{item.likes}</span>
                    </button>
                    <button
                      onClick={() => handleComment(item.id)}
                      className="flex items-center space-x-1 text-sahayak-gray-600 hover:bg-sahayak-gray-100 px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <MessageCircle size={16} />
                      <span>{item.comments}</span>
                    </button>
                    <button
                      onClick={() => handleSave(item.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                        item.isSaved
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-sahayak-gray-600 hover:bg-sahayak-gray-100'
                      }`}
                    >
                      <Download size={16} />
                      <span>{item.saves}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-sahayak-gray-600">Rate:</span>
                    {renderStars(item.rating, true, (rating) => handleRate(item.id, rating))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-sahayak-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sahayak-gray-800">
                  Comments
                </h3>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="text-sahayak-gray-400 hover:text-sahayak-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-sahayak-gray-600 mt-1">
                {selectedContent.title}
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Mock Comments */}
              <div className="space-y-3">
                <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-sahayak-blue rounded-full flex items-center justify-center">
                      <User size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-sahayak-gray-800">Ravi Kumar</span>
                    <span className="text-xs text-sahayak-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-sahayak-gray-700">
                    This is really helpful! My students loved this content. Thank you for sharing.
                  </p>
                </div>

                <div className="bg-sahayak-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-sahayak-green rounded-full flex items-center justify-center">
                      <User size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-sahayak-gray-800">Meera Sharma</span>
                    <span className="text-xs text-sahayak-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-sahayak-gray-700">
                    Great work! Can you share more content like this for Grade 3?
                  </p>
                </div>
              </div>

              {/* Add Comment */}
              <div className="border-t pt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-sahayak-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-sahayak-blue focus:border-sahayak-blue"
                  rows="3"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-sahayak-blue text-white rounded-lg hover:bg-sahayak-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community

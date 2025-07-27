import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Volume2 } from 'lucide-react'

const AudioRecorder = ({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop,
  maxDuration = 300, // 5 minutes default
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  // Initialize recording
  const initializeRecording = async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      })
      
      streamRef.current = stream
      
      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '' // Let browser choose
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mimeType || 'audio/webm' 
        })
        setAudioBlob(blob)
        
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // Callback with the audio blob
        if (onRecordingComplete) {
          onRecordingComplete(blob, url)
        }
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        setError('Recording failed: ' + event.error.message)
      }
      
      return true
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setError('Could not access microphone. Please check permissions.')
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
    setError(null)
    
    mediaRecorderRef.current.start(100) // Collect data every 100ms
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1
        
        // Auto-stop at max duration
        if (newTime >= maxDuration) {
          stopRecording()
          return maxDuration
        }
        
        return newTime
      })
    }, 1000)
    
    if (onRecordingStart) {
      onRecordingStart()
    }
  }

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return
    
    if (isPaused) {
      mediaRecorderRef.current.resume()
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)
      setIsPaused(false)
    } else {
      mediaRecorderRef.current.pause()
      clearInterval(timerRef.current)
      setIsPaused(true)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    
    mediaRecorderRef.current.stop()
    clearInterval(timerRef.current)
    setIsRecording(false)
    setIsPaused(false)
    
    if (onRecordingStop) {
      onRecordingStop()
    }
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

  // Reset recording
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setError(null)
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [audioUrl])

  // Audio playback event handlers
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      
      const handleEnded = () => setIsPlaying(false)
      const handlePause = () => setIsPlaying(false)
      const handleError = (e) => {
        console.error('Audio playback error:', e)
        setIsPlaying(false)
      }
      
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('error', handleError)
      
      return () => {
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('pause', handlePause)
        audio.removeEventListener('error', handleError)
      }
    }
  }, [audioUrl])

  return (
    <div className={`audio-recorder ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Recording Status */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center px-4 py-2 rounded-full ${
          isRecording 
            ? isPaused 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isRecording 
              ? isPaused 
                ? 'bg-yellow-500' 
                : 'bg-red-500 animate-pulse'
              : 'bg-gray-400'
          }`} />
          <span className="font-medium">
            {isRecording 
              ? isPaused 
                ? 'Paused' 
                : 'Recording'
              : 'Ready'
            }
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <span className="font-mono text-lg">
            {formatTime(recordingTime)}
          </span>
          <span className="text-sm ml-1">
            / {formatTime(maxDuration)}
          </span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!!error}
            className="flex items-center bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-medium"
          >
            <Mic size={20} className="mr-2" />
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={togglePauseRecording}
              className={`flex items-center px-4 py-2 rounded-full text-white font-medium ${
                isPaused 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {isPaused ? (
                <>
                  <Play size={16} className="mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={16} className="mr-2" />
                  Pause
                </>
              )}
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full font-medium"
            >
              <Square size={16} className="mr-2" />
              Stop
            </button>
          </>
        )}
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-800 mb-4 text-center">
            Review Recording
          </h4>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={togglePlayback}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
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
            
            <Volume2 size={20} className="text-gray-500" />
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            className="hidden"
          />
          
          <div className="flex justify-center">
            <button
              onClick={resetRecording}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Record Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder

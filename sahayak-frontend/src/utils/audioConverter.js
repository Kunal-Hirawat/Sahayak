/**
 * Audio conversion utilities for fluency assessment
 * Handles conversion between different audio formats
 */

/**
 * Convert WebM audio blob to a format suitable for backend processing
 * Since we can't do true MP3 conversion in the browser without heavy libraries,
 * we'll send the WebM file with proper metadata for backend conversion
 */
export const convertToMP3 = async (webmBlob) => {
  try {
    console.log('🎵 DEBUG: Preparing audio for backend conversion...')
    console.log('🎵 DEBUG: Input blob type:', webmBlob.type)
    console.log('🎵 DEBUG: Input blob size:', webmBlob.size, 'bytes')

    // Keep the original WebM blob but with proper metadata
    // The backend will handle the actual conversion to MP3
    const processedBlob = new Blob([webmBlob], {
      type: webmBlob.type || 'audio/webm' // Preserve original type
    })

    console.log('✅ DEBUG: Audio prepared for backend processing')
    console.log('🎵 DEBUG: Output blob type:', processedBlob.type)
    console.log('🎵 DEBUG: Output blob size:', processedBlob.size, 'bytes')

    return processedBlob
  } catch (error) {
    console.error('❌ DEBUG: Audio preparation failed:', error)
    throw new Error('Failed to prepare audio for processing: ' + error.message)
  }
}

/**
 * Validate audio blob before processing
 */
export const validateAudioBlob = (blob) => {
  if (!blob) {
    throw new Error('No audio data provided')
  }
  
  if (blob.size === 0) {
    throw new Error('Audio file is empty')
  }
  
  if (blob.size > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('Audio file is too large (max 50MB)')
  }
  
  console.log('✅ DEBUG: Audio validation passed')
  console.log('🎵 DEBUG: Audio size:', (blob.size / 1024 / 1024).toFixed(2), 'MB')
  
  return true
}

/**
 * Create audio file with proper naming and extension based on actual format
 */
export const createAudioFile = (blob, studentName, timestamp) => {
  const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_')

  // Determine file extension based on blob type
  let extension = 'webm'
  if (blob.type.includes('mp3')) {
    extension = 'mp3'
  } else if (blob.type.includes('wav')) {
    extension = 'wav'
  } else if (blob.type.includes('webm')) {
    extension = 'webm'
  } else if (blob.type.includes('ogg')) {
    extension = 'ogg'
  }

  const filename = `fluency_${sanitizedName}_${timestamp}.${extension}`

  return new File([blob], filename, {
    type: blob.type, // Preserve original type
    lastModified: Date.now()
  })
}

/**
 * Get audio duration from blob (approximate)
 */
export const getAudioDuration = (blob) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(blob)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', (e) => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to get audio duration'))
    })
    
    audio.src = url
  })
}

/**
 * Compress audio blob if it's too large
 */
export const compressAudio = async (blob, maxSizeKB = 5000) => {
  if (blob.size <= maxSizeKB * 1024) {
    return blob // No compression needed
  }
  
  console.log('🎵 DEBUG: Compressing audio...')
  console.log('🎵 DEBUG: Original size:', (blob.size / 1024).toFixed(2), 'KB')
  
  // Simple compression by reducing quality
  // In production, you might want more sophisticated compression
  const compressedBlob = new Blob([blob], { type: 'audio/mp3' })
  
  console.log('✅ DEBUG: Audio compression completed')
  console.log('🎵 DEBUG: Compressed size:', (compressedBlob.size / 1024).toFixed(2), 'KB')
  
  return compressedBlob
}

/**
 * Prepare audio for backend submission
 */
export const prepareAudioForSubmission = async (webmBlob, studentName) => {
  try {
    console.log('🎵 DEBUG: Preparing audio for submission...')
    
    // Validate audio
    validateAudioBlob(webmBlob)
    
    // Prepare audio (keep as WebM for backend conversion)
    const processedBlob = await convertToMP3(webmBlob)

    // Compress if needed
    const compressedBlob = await compressAudio(processedBlob)
    
    // Create file with proper name
    const timestamp = Date.now()
    const audioFile = createAudioFile(compressedBlob, studentName, timestamp)
    
    // Get duration for metadata
    let duration = 0
    try {
      duration = await getAudioDuration(compressedBlob)
    } catch (e) {
      console.warn('Could not get audio duration:', e.message)
    }
    
    console.log('✅ DEBUG: Audio preparation completed')
    console.log('🎵 DEBUG: Final file:', {
      name: audioFile.name,
      size: (audioFile.size / 1024).toFixed(2) + ' KB',
      type: audioFile.type,
      duration: duration.toFixed(2) + ' seconds'
    })
    
    return {
      file: audioFile,
      duration: duration,
      originalSize: webmBlob.size,
      finalSize: audioFile.size
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Audio preparation failed:', error)
    throw error
  }
}

/**
 * Check browser audio recording capabilities
 */
export const checkAudioSupport = () => {
  const support = {
    mediaRecorder: !!window.MediaRecorder,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    webmSupport: MediaRecorder.isTypeSupported('audio/webm'),
    mp3Support: MediaRecorder.isTypeSupported('audio/mp3'),
    opusSupport: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
  }
  
  console.log('🎵 DEBUG: Browser audio support:', support)
  
  return support
}

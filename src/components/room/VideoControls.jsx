import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { setVolume } from '../../store/playerSlice'
import { setMuted, toggleMute } from '../../store/uiSlice'

// Format time in MM:SS format
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00'
  
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = date.getUTCSeconds().toString().padStart(2, '0')
  
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
  }
  
  return `${mm}:${ss}`
}

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  isHost,
  playbackRate,
  onPlayPause,
  onSeek,
  onToggleFullscreen,
  onPlaybackRateChange
}) => {
  const dispatch = useDispatch()
  const progressRef = useRef(null)
  const volumeRef = useRef(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  const progress = duration ? (currentTime / duration) * 100 : 0
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!isHost) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width
    onSeek(percent * duration)
  }

  // Handle volume change
  const handleVolumeChange = (e) => {
    const rect = volumeRef.current.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width
    
    dispatch(setVolume(percent))
    
    if (percent === 0) {
      dispatch(setMuted(true))
    } else if (isMuted) {
      dispatch(setMuted(false))
    }
  }

  // Close speed options when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSpeedOptions && !e.target.closest('.speed-options')) {
        setShowSpeedOptions(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSpeedOptions])

  // Display buffer time remaining
  const calculateTimeRemaining = () => {
    if (!duration || !currentTime) return '';
    
    const remaining = duration - currentTime;
    if (remaining <= 0) return '';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } 
    
    return `${minutes}m remaining`;
  }

  return (
    <div 
      className="w-full px-4 py-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Progress bar */}
      <div className="relative mb-3">
        <div
          ref={progressRef}
          className={`w-full h-1.5 bg-gray-700/70 rounded-full cursor-pointer group ${!isHost && 'opacity-70 cursor-not-allowed'}`}
          onClick={handleProgressClick}
          onMouseOver={() => setIsHovering(true)}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full relative"
            style={{ width: `${progress}%` }}
            animate={{ opacity: isHovering ? 1 : 0.8 }}
          >
            {isHost && (
              <motion.div 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border border-primary-500"
                initial={{ scale: 0 }}
                animate={{ scale: isHovering ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
          
          {/* Preview time tooltip */}
          {isHost && isHovering && (
            <div className="absolute -top-7 text-xs text-white py-0.5 px-2 bg-black/80 rounded transform -translate-x-1/2 pointer-events-none">
              {formatTime(currentTime)}
            </div>
          )}
        </div>
        
        {/* Buffer indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden rounded-full">
          <div className="h-full bg-gray-500/30 rounded-full" style={{ width: `${Math.min((duration ? currentTime / duration : 0) * 100 + 7, 100)}%` }}></div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className={`text-white focus:outline-none ${!isHost && 'opacity-70 cursor-not-allowed'}`}
            disabled={!isHost}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </motion.button>
          
          {/* Time display */}
          <div className="text-white text-sm flex items-center bg-black/40 rounded-full px-2.5 py-0.5">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-300">{formatTime(duration)}</span>
          </div>
          
          {/* Time remaining (mobile hidden) */}
          <div className="hidden sm:block text-gray-400 text-xs">
            {calculateTimeRemaining()}
          </div>
          
          {/* Volume control */}
          <div className="relative flex items-center" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleMute())}
              className="text-white focus:outline-none"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              )}
            </motion.button>
            
            {showVolumeSlider && (
              <div className="absolute left-7 w-24 flex items-center">
                <div 
                  ref={volumeRef}
                  className="w-full h-1 bg-gray-700/80 rounded-full cursor-pointer"
                  onClick={handleVolumeChange}
                >
                  <div 
                    className="h-full bg-primary-500 rounded-full relative"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Host indicator */}
          {isHost && (
            <div className="hidden sm:flex items-center bg-primary-600/30 text-primary-300 text-xs px-2 py-0.5 rounded-full border border-primary-500/30">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-1"></span>
              Host
            </div>
          )}
          
          {/* Playback Speed */}
          <div className="relative speed-options">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isHost && setShowSpeedOptions(!showSpeedOptions)}
              className={`text-white text-xs focus:outline-none px-2 py-1 rounded-md ${
                showSpeedOptions ? 'bg-gray-700' : 'bg-black/40'
              } ${!isHost && 'opacity-60 cursor-not-allowed'}`}
              disabled={!isHost}
              title="Playback speed"
            >
              {playbackRate}x
            </motion.button>
            
            {showSpeedOptions && isHost && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-full mb-2 right-0 bg-gray-900/95 rounded-md shadow-lg overflow-hidden border border-gray-700/50 backdrop-blur-sm"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      onPlaybackRateChange(rate)
                      setShowSpeedOptions(false)
                    }}
                    className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-gray-700/80 transition-colors ${
                      playbackRate === rate ? 'bg-primary-500/30 text-primary-100' : 'text-gray-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Fullscreen button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFullscreen}
            className="text-white focus:outline-none"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15v4.5M15 15H4.5M15 15h4.5M9 15H4.5M9 15v4.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default VideoControls
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactPlayer from 'react-player'
import { motion } from 'framer-motion'
import { convertDriveLink } from '../../utils/driveUtils'
import {
  setPlayer,
  setPlaying,
  setCurrentTime,
  setDuration,
  setBuffered,
  addSyncEvent
} from '../../store/playerSlice'
import { setShowControls } from '../../store/uiSlice'
import VideoControls from './VideoControls'

const VideoPlayer = ({ videoUrl, driveFileId }) => {
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const dispatch = useDispatch()
  
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isHost,
    isSyncing
  } = useSelector(state => state.player)
  
  const { showControls, isMuted } = useSelector(state => state.ui)
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [effectiveUrl, setEffectiveUrl] = useState('')
  const [fallbackUrl, setFallbackUrl] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [loadError, setLoadError] = useState(false)
  const [useEmbedPlayer, setUseEmbedPlayer] = useState(false)
  const [proxyAttempts, setProxyAttempts] = useState(0)
  
  // Determine the effective URL to play (proxy URL or alternative)
  useEffect(() => {
    if (!videoUrl) {
      setEffectiveUrl('');
      setFallbackUrl('');
      setEmbedUrl('');
      return;
    }
    
    // Check if we have a Drive link
    if (driveFileId) {
      const urls = convertDriveLink(videoUrl);
      
      if (urls) {
        // Reset error state when URL changes
        setLoadError(false);
        setUseEmbedPlayer(false);
        
        // Set our main and fallback URLs
        setEffectiveUrl(urls.proxyUrl);
        setFallbackUrl(urls.alternateProxyUrl);
        setEmbedUrl(urls.embedUrl);
      } else {
        setEffectiveUrl(videoUrl);
      }
    } else {
      // Use the original URL if not a Drive link
      setEffectiveUrl(videoUrl);
    }
    
    // Reset error state when URL changes
    setLoadError(false);
    setProxyAttempts(0);
  }, [videoUrl, driveFileId]);

  // Initialize player reference
  useEffect(() => {
    if (playerRef.current) {
      dispatch(setPlayer(playerRef.current))
    }
  }, [dispatch])

  // Handle manual play/pause
  const handlePlayPause = () => {
    if (isHost) {
      dispatch(setPlaying(!isPlaying))
      
      // Emit play/pause event to sync with other users
      dispatch(addSyncEvent({
        type: 'playPause',
        isPlaying: !isPlaying,
        time: playerRef.current?.getCurrentTime() || 0
      }))
    }
  }

  // Handle seeking
  const handleSeek = (newTime) => {
    if (isHost) {
      setSeeking(true)
      
      if (playerRef.current) {
        playerRef.current.seekTo(newTime, 'seconds')
      }
      
      dispatch(setCurrentTime(newTime))
      
      // Emit seek event to sync with other users
      dispatch(addSyncEvent({
        type: 'seek',
        time: newTime
      }))
      
      setSeeking(false)
    }
  }

  // Handle progress updates
  const handleProgress = ({ playedSeconds, loadedSeconds }) => {
    if (!seeking) {
      dispatch(setCurrentTime(playedSeconds))
      dispatch(setBuffered(loadedSeconds))
    }
  }

  // Handle video duration change
  const handleDuration = (duration) => {
    dispatch(setDuration(duration))
  }

  // Handle video load error
  const handleError = (error) => {
    console.error('Error loading video:', error);
    
    // Try fallback if we have less than 2 attempts
    if (proxyAttempts < 2 && !useEmbedPlayer) {
      setProxyAttempts(prev => prev + 1);
      
      // First try alternate proxy
      if (proxyAttempts === 0 && fallbackUrl) {
        console.log('Trying alternate proxy URL...');
        setEffectiveUrl(fallbackUrl);
      } 
      // Then try direct URL
      else if (proxyAttempts === 1) {
        console.log('Trying direct URL...');
        const urls = convertDriveLink(videoUrl);
        if (urls) {
          setEffectiveUrl(urls.directUrl);
        }
      }
    } else {
      // If we've tried both proxies and direct URL, switch to embed player
      if (!useEmbedPlayer && embedUrl) {
        console.log('Switching to embed player...');
        setUseEmbedPlayer(true);
      } else {
        // All methods failed, show error
        setLoadError(true);
      }
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Update fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Show/hide controls on mouse movement
  const handleMouseMove = () => {
    dispatch(setShowControls(true))
    
    clearTimeout(controlsTimeoutRef.current)
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        dispatch(setShowControls(false))
      }
    }, 3000)
  }

  useEffect(() => {
    return () => {
      clearTimeout(controlsTimeoutRef.current)
    }
  }, [])

  // Handle playback rate change
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate)
  }

  // Forward the received sync events to the player
  useEffect(() => {
    if (!isHost && isSyncing && playerRef.current) {
      // Apply the sync event
      // This would be handled in useSocketSetup.js
    }
  }, [isHost, isSyncing])

  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full h-full bg-black overflow-hidden group"
      onMouseMove={handleMouseMove}
      onClick={() => isPlaying ? handlePlayPause() : null}
    >
      {/* Video gradient overlay for better controls visibility */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
      
      {useEmbedPlayer && embedUrl ? (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; encrypted-media; fullscreen"
          className="absolute top-0 left-0 w-full h-full"
        />
      ) : effectiveUrl ? (
        <ReactPlayer
          ref={playerRef}
          url={effectiveUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          playbackRate={playbackRate}
          onPlay={() => dispatch(setPlaying(true))}
          onPause={() => dispatch(setPlaying(false))}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onError={handleError}
          progressInterval={500}
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload', // Attempt to prevent download option
                disablePictureInPicture: true, // Disable picture-in-picture
              },
              forceVideo: true,
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-lg">No video source available</p>
        </div>
      )}
      
      {/* Error message */}
      {loadError && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
          <div className="rounded-full bg-error-500/20 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
          <p className="text-gray-300 mb-4 max-w-md">
            We couldn't play this video. It might be due to connection issues, unsupported format, or the video is no longer available.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg"
          >
            Reload Player
          </button>
        </div>
      )}
      
      {/* Play/pause overlay button */}
      {!isPlaying && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={handlePlayPause}
            className="w-20 h-20 bg-primary-500/80 hover:bg-primary-600/90 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-200 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
        </div>
      )}

      {/* Video quality indicator */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
        HD
      </div>

      {!useEmbedPlayer && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showControls ? 1 : 0,
            y: showControls ? 0 : 20
          }}
          transition={{ duration: 0.2 }}
        >
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            isHost={isHost}
            playbackRate={playbackRate}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onToggleFullscreen={toggleFullscreen}
            onPlaybackRateChange={handlePlaybackRateChange}
          />
        </motion.div>
      )}
    </div>
  )
}

export default VideoPlayer
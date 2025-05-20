import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getRoomById, leaveRoom, resetRoom } from '../store/roomSlice'
import { setIsHost, resetPlayer } from '../store/playerSlice'
import { toggleMobileChat, toggleMobileInfo } from '../store/uiSlice'
import VideoPlayer from '../components/room/VideoPlayer'
import ChatBox from '../components/room/ChatBox'
import RoomInfo from '../components/room/RoomInfo'
import useSocketSetup from '../hooks/useSocketSetup'
import { toast } from 'react-hot-toast'

const Room = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentRoom, loading, error } = useSelector(state => state.room)
  const { user } = useSelector(state => state.auth)
  const { isMobileChatOpen, isMobileInfoOpen } = useSelector(state => state.ui)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [showReaction, setShowReaction] = useState(false)
  const [currentReaction, setCurrentReaction] = useState(null)
  const [lightMode, setLightMode] = useState('dim') // 'dim', 'dark', 'off'

  // Initialize socket connection and event listeners
  const socketConnected = useSocketSetup(currentRoom?.id, user?.id)

  useEffect(() => {
    dispatch(getRoomById(roomId))
    
    return () => {
      dispatch(resetRoom())
      dispatch(resetPlayer())
    }
  }, [dispatch, roomId])

  useEffect(() => {
    if (currentRoom && user) {
      const isUserHost = currentRoom.hostId === user.id
      dispatch(setIsHost(isUserHost))
    }
  }, [currentRoom, user, dispatch])

  const handleLeaveRoom = () => {
    if (confirmLeave) {
      dispatch(leaveRoom({ roomId, userId: user.id }))
        .unwrap()
        .then(() => {
          navigate('/dashboard')
        })
    } else {
      setConfirmLeave(true)
      setTimeout(() => setConfirmLeave(false), 3000)
    }
  }
  
  const handleReaction = (emoji) => {
    // Display the reaction temporarily
    setCurrentReaction(emoji)
    setShowReaction(false)
    
    // Show and hide animation
    setTimeout(() => {
      setCurrentReaction(null)
    }, 3000)
    
    // In a real app, you would broadcast this to other users
    toast(`You reacted with ${emoji}`, {
      icon: emoji,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  const toggleLightMode = () => {
    const modes = ['dim', 'dark', 'off']
    const currentIndex = modes.indexOf(lightMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setLightMode(modes[nextIndex])
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-t-2 border-primary-500 border-opacity-80"></div>
          <p className="mt-6 text-xl font-medium text-white">Loading your movie room...</p>
          <p className="text-gray-400 mt-2">Preparing your synchronized viewing experience</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center glass-effect p-8 rounded-xl border border-gray-800/50"
        >
          <div className="p-3 rounded-full bg-error-500/20 mx-auto w-20 h-20 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Room Not Found</h2>
          <p className="text-gray-300 mb-8">
            The room you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary w-full py-3"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  if (!currentRoom) return null
  
  // Movie poster backdrop effect (simulated)
  const movieBackdrop = currentRoom.moviePoster || 'https://image.tmdb.org/t/p/w1280/backdrop-placeholder.jpg'

  return (
    <div className={`h-screen relative overflow-hidden flex flex-col ${
      lightMode === 'dim' ? 'bg-gradient-to-b from-gray-950 to-gray-900/90' :
      lightMode === 'dark' ? 'bg-black' : 'bg-gray-950'
    }`}>
      {/* Cinematic backdrop and atmospheric elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {lightMode !== 'off' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-gray-900/80 to-black"></div>
            <div 
              className="absolute inset-0 opacity-20 bg-center bg-cover blur-md"
              style={{backgroundImage: `url(${movieBackdrop})`}}
            ></div>
            {/* Theater light effects */}
            <div className="absolute top-0 left-1/4 w-96 h-10 bg-primary-500/10 blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-10 bg-accent-500/10 blur-3xl"></div>
          </div>
        )}
      </div>
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex justify-between items-center px-4 py-3 bg-gray-900/95 border-b border-gray-800/70 backdrop-blur-sm z-10">
        <button
          onClick={() => dispatch(toggleMobileInfo())}
          className={`btn p-2 ${isMobileInfoOpen ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:bg-gray-800'} rounded-lg transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white truncate max-w-[200px] flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          {currentRoom.name}
        </h2>
        <button
          onClick={() => dispatch(toggleMobileChat())}
          className={`btn p-2 ${isMobileChatOpen ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:bg-gray-800'} rounded-lg transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden pt-0 z-10 relative">
        {/* Room Info Sidebar - Desktop */}
        <div className="hidden md:block w-72 border-r border-gray-800/70 bg-gray-900/90 backdrop-blur-sm">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <RoomInfo room={currentRoom} onLeave={handleLeaveRoom} confirmLeave={confirmLeave} />
          </div>
        </div>

        {/* Mobile Room Info - Conditional */}
        {isMobileInfoOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-16 bottom-0 left-0 w-full z-20 bg-gray-900/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="h-full overflow-y-auto">
              <RoomInfo room={currentRoom} onLeave={handleLeaveRoom} confirmLeave={confirmLeave} />
            </div>
          </motion.div>
        )}

        {/* Video Player Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="w-full h-full p-0">
            <div className="h-full flex flex-col">
              {/* Video player heading */}
              <div className="px-5 py-3 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/40 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Now Playing
                </h2>
                
                <div className="flex items-center space-x-3">
                  {/* Room viewers count */}
                  <div className="text-sm text-white bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700/30 flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    <span>{currentRoom.participants.length} watching</span>
                  </div>
                  
                  {/* Theater mode toggle button */}
                  <button 
                    onClick={toggleLightMode}
                    className="p-2 rounded-full bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/30 transition"
                    title="Toggle theater mode"
                  >
                    {lightMode === 'dim' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {lightMode === 'dark' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                    {lightMode === 'off' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Video player wrapper with enhanced border effects */}
              <div className="flex-1 border border-gray-800/40 bg-black/70 rounded-md m-2 overflow-hidden relative shadow-lg">
                <VideoPlayer videoUrl={currentRoom.movieUrl} driveFileId={currentRoom.driveFileId} />
              </div>
            </div>
          </div>
          
          {/* Reactions and controls panel */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center items-center z-20 space-x-3">
            {/* Reaction button - moved to the center bottom */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReaction(!showReaction)}
                className="bg-gray-900/80 hover:bg-gray-800 backdrop-blur-md text-white rounded-full p-3 shadow-xl border border-primary-500/30 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">React</span>
              </motion.button>
              
              {/* Enhanced reaction menu */}
              <AnimatePresence>
                {showReaction && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900/95 border border-gray-700/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {["👍", "👎", "😂", "😮", "😍", "👏", "🔥", "❤️", "🎬", "🍿", "🤔", "👀"].map(emoji => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReaction(emoji)}
                          className="w-12 h-12 text-2xl flex items-center justify-center hover:bg-gray-800 rounded-full transition-all duration-150"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Big reaction animation */}
          <AnimatePresence>
            {currentReaction && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 4 }}
                exit={{ opacity: 0, scale: 6 }}
                transition={{ duration: 1 }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-4xl"
              >
                {currentReaction}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Sidebar - Desktop with enhanced design */}
        <div className="hidden md:block w-80 border-l border-gray-800/70 bg-gray-900/90 backdrop-blur-sm">
          <ChatBox room={currentRoom} user={user} />
        </div>

        {/* Mobile Chat - Conditional */}
        {isMobileChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-16 bottom-0 right-0 w-full z-20 bg-gray-900/95 backdrop-blur-sm overflow-hidden"
          >
            <ChatBox room={currentRoom} user={user} />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Room
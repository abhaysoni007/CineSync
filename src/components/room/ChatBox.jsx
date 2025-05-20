import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { sendMessage } from '../../store/roomSlice'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

const ChatBox = ({ room, user }) => {
  const [message, setMessage] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const dispatch = useDispatch()

  const emojis = ['😀', '😂', '😍', '🎬', '👍', '👎', '😮', '🤔', '🍿', '❤️', '👏', '🔥']

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (message.trim() && !isSending) {
      setIsSending(true)
      
      try {
        await dispatch(sendMessage({
          roomId: room.id,
          message: message.trim(),
          userId: user.id,
          userName: user.name
        })).unwrap()
        
        setMessage('')
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojis(false)
  }

  // Track chat visibility to update unread count
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setUnreadCount(0);
        }
      },
      { threshold: 0.1 }
    );
    
    if (chatContainerRef.current) {
      observer.observe(chatContainerRef.current);
    }
    
    return () => {
      if (chatContainerRef.current) {
        observer.unobserve(chatContainerRef.current);
      }
    };
  }, [chatContainerRef]);
  
  // Update unread count when new messages arrive
  useEffect(() => {
    if (room.messages && room.messages.length > 0) {
      const lastMessage = room.messages[room.messages.length - 1];
      if (lastMessage && lastMessage.userId !== user.id && lastMessage.userId !== 'system') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [room.messages?.length, user.id]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [room.messages])

  // Get unique messages by ID to prevent duplicates
  const uniqueMessages = room.messages ? [...new Map(
    room.messages.map(msg => [msg.id, msg])
  ).values()] : []

  // Get active users for the "who's typing" feature
  const activeUsers = room.participants?.filter(p => p.id !== user.id) || [];

  return (
    <div className="flex flex-col h-full" ref={chatContainerRef}>
      <div className="p-4 border-b border-gray-800/70 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Watch Party Chat
            {unreadCount > 0 && (
              <span className="ml-2 bg-primary-500 text-xs text-white font-semibold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center text-sm">
          <div className="flex -space-x-2 mr-2">
            {room.participants.slice(0, 3).map((participant, i) => (
              <div 
                key={participant.id || i} 
                className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center"
                title={participant.name}
              >
                {participant.avatarUrl ? (
                  <img 
                    src={participant.avatarUrl} 
                    alt={participant.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-white font-medium">
                    {participant.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
            ))}
            {room.participants.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                <span className="text-xs text-white">+{room.participants.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-gray-400">
            {room.participants.length} {room.participants.length === 1 ? 'viewer' : 'viewers'}
          </span>
        </div>
      </div>
      
      <SimpleBar className="flex-1 overflow-y-auto px-4 pt-4 pb-2" autoHide={false}>
        <div className="space-y-4">
          {uniqueMessages.length > 0 ? (
            uniqueMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                  msg.userId === 'system' 
                    ? 'bg-gray-800/60 text-gray-300 mx-auto text-center text-sm border border-gray-700/30'
                    : msg.userId === user.id
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-800/80 text-gray-100 border border-gray-700/30'
                }`}>
                  {msg.userId !== 'system' && (
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-medium text-sm ${msg.userId === user.id ? 'text-primary-100' : 'text-primary-300'}`}>
                        {msg.userId === user.id ? 'You' : msg.userName}
                      </span>
                      <span className="text-xs opacity-70 ml-2">
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  )}
                  <p className={`${msg.userId === 'system' ? '' : 'text-sm'} break-words`}>{msg.text}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gray-800/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Be the first to start the conversation!</p>
            </div>
          )}
          {activeUsers.length > 0 && (
            <div className="text-xs text-gray-500 italic px-2 py-1">
              {activeUsers.length === 1 
                ? `${activeUsers[0].name} is here` 
                : `${activeUsers.length} viewers are watching with you`}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </SimpleBar>
      
      <div className="p-4 border-t border-gray-800/70 bg-gray-900/60">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              className="input w-full pr-10 bg-gray-800/80 border-gray-700/60 focus:ring-primary-500 text-white placeholder:text-gray-500"
              disabled={isSending}
            />
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Emoji Picker with improved design */}
            <AnimatePresence>
              {showEmojis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-full mb-2 left-0 bg-gray-900/95 rounded-lg shadow-xl border border-gray-700/60 p-3 z-10"
                >
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-9 h-9 text-xl flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            type="submit"
            whileTap={{ scale: 0.9 }}
            className={`btn btn-primary p-2.5 rounded-full flex items-center justify-center ${isSending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-600 shadow-md'}`}
            disabled={!message.trim() || isSending}
            title="Send message"
          >
            {isSending ? (
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}

export default ChatBox
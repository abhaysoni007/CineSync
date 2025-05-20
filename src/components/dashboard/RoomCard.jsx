import { motion } from 'framer-motion'
import { format } from 'date-fns'

const RoomCard = ({ room, onJoin, onDelete, currentUserId }) => {
  const participantCount = room.participants ? room.participants.length : 0
  const formattedDate = room.createdAt ? format(new Date(room.createdAt), 'MMM d, h:mm a') : ''
  const isHost = currentUserId === room.hostId

  // Determine gradient based on room name (just for visual variety)
  const getGradient = () => {
    const hash = room.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
    const gradients = [
      'from-primary-600/40 to-primary-900/80',
      'from-accent-600/40 to-accent-900/80',
      'from-success-600/40 to-success-900/80',
      'from-primary-600/40 to-accent-900/80',
      'from-accent-600/40 to-primary-900/80',
      'from-success-600/40 to-primary-900/80'
    ]
    return gradients[hash % gradients.length]
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) onDelete(room.id)
  }

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
      transition={{ duration: 0.2 }}
      className="glass-effect overflow-hidden rounded-xl border border-gray-800/30 hover:border-gray-700/50 transition-colors relative"
    >
      {/* Room header with gradient */}
      <div className={`h-36 bg-gradient-to-br ${getGradient()} flex items-center justify-center relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute w-20 h-20 rounded-full bg-white/10 blur-md -top-10 -left-10"></div>
        <div className="absolute w-16 h-16 rounded-full bg-white/5 blur-md bottom-4 right-4"></div>
        
        {/* Movie icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        
        {/* Room status badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-gray-900/60 backdrop-blur-sm rounded-md text-xs font-medium flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
          Live
        </div>
        
        {/* Host badge if user is host */}
        {isHost && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-primary-500/30 backdrop-blur-sm rounded-md text-xs font-medium text-primary-200 border border-primary-500/40">
            You're the Host
          </div>
        )}
        
        {/* Date badge - move down if user is host */}
        <div className={`absolute ${isHost ? 'top-10' : 'top-3'} right-3 px-2 py-1 bg-gray-900/60 backdrop-blur-sm rounded-md text-xs font-medium text-gray-300`}>
          {formattedDate}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-3 truncate">{room.name}</h3>
        
        <div className="flex items-center gap-2 mb-4">
          {/* Host avatar */}
          <div className="w-8 h-8 rounded-full bg-accent-500/30 flex items-center justify-center text-xs font-medium text-accent-300">
            {getInitials(room.hostName)}
          </div>
          <div>
            <p className="text-gray-400 text-sm">Hosted by</p>
            <p className="text-gray-300 text-sm font-medium">{room.hostName}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-medium text-gray-300">{participantCount}</span> {participantCount === 1 ? 'viewer' : 'viewers'}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="px-3 py-1.5 bg-gray-800/60 rounded-lg text-sm font-mono">
            <span className="text-gray-500 mr-1">Code:</span> 
            <span className="text-primary-300">{room.code}</span>
          </div>
          <div className="flex space-x-2">
            {isHost && (
              <button
                onClick={handleDelete}
                className="btn bg-red-600/80 hover:bg-red-600 py-1.5 px-3 rounded-lg text-white"
                title="Delete Room"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button
              onClick={onJoin}
              className="btn btn-primary py-1.5 px-4 rounded-lg"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RoomCard
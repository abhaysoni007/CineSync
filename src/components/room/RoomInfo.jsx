import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

const RoomInfo = ({ room, onLeave, confirmLeave }) => {
  const [copyClicked, setCopyClicked] = useState(false)
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code)
    setCopyClicked(true)
    toast.success('Room code copied to clipboard!')
    setTimeout(() => setCopyClicked(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800/70 bg-gray-900/50">
        <h3 className="text-lg font-semibold text-white">Room Info</h3>
      </div>
      
      <div className="p-4 flex-1">
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Room Name</h4>
          <p className="text-white text-lg font-semibold">{room.name}</p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Room Code</h4>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-800/80 text-white font-mono px-3 py-1.5 rounded-md text-lg tracking-wide border border-gray-700/30">
              {room.code}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode}
              className={`${
                copyClicked 
                  ? 'bg-success-600/20 text-success-400' 
                  : 'text-primary-500 hover:text-primary-400 hover:bg-gray-800/70'
              } p-1.5 rounded-md transition-colors`}
              title="Copy to clipboard"
            >
              {copyClicked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
        
        <div className="mb-6 glass-effect p-3 rounded-lg border border-gray-800/30">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Host</h4>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-700/60 flex items-center justify-center mr-2">
              {room.hostName.charAt(0).toUpperCase()}
            </div>
            <p className="text-white font-medium">{room.hostName}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Created</h4>
          <p className="text-white">{formatDate(room.createdAt)}</p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Participants ({room.participants.length})</h4>
          <div className="glass-effect rounded-lg border border-gray-800/30">
            <ul className="space-y-2 py-2 max-h-48 overflow-y-auto">
              {room.participants.map((participant) => (
                <li key={participant.id} className="flex items-center px-3 py-1.5 hover:bg-gray-800/40">
                  <div className={`w-8 h-8 rounded-full ${participant.isHost ? 'bg-primary-700/80' : 'bg-gray-700/80'} flex items-center justify-center mr-2`}>
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white">{participant.name}</span>
                  {participant.isHost && (
                    <span className="ml-2 text-xs bg-primary-700/80 text-primary-100 px-2 py-0.5 rounded-full">Host</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800/70">
        <motion.button
          onClick={onLeave}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
            confirmLeave
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
          }`}
        >
          {confirmLeave ? 'Confirm Leave Room' : 'Leave Room'}
        </motion.button>
      </div>
    </div>
  )
}

export default RoomInfo
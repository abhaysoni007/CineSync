import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

const JoinRoomModal = ({ isOpen, onClose, onSubmit }) => {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setRoomCode(e.target.value.toUpperCase())
    setError('')
  }

  const validateForm = () => {
    if (!roomCode.trim()) {
      setError('Room code is required')
      return false
    }
    
    // Simple validation for code format (6 alphanumeric characters)
    if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
      setError('Invalid room code format (must be 6 characters)')
      return false
    }
    
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(roomCode)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="w-full max-w-md glass-effect p-6 rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Join a Room</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300 mb-1">
                    Room Code
                  </label>
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit room code"
                    maxLength={6}
                    className={`input w-full text-center text-lg tracking-widest uppercase ${error ? 'border-red-500' : ''}`}
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">Enter the 6-character code shared with you</p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Join Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default JoinRoomModal
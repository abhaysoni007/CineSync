import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { createRoom, joinRoom, getRooms, deleteRoom } from '../store/roomSlice'
import RoomCard from '../components/dashboard/RoomCard'
import CreateRoomModal from '../components/dashboard/CreateRoomModal'
import JoinRoomModal from '../components/dashboard/JoinRoomModal'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)
  const { user } = useSelector(state => state.auth)
  const { publicRooms, loading, error } = useSelector(state => state.room)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(getRooms())
  }, [dispatch])

  const handleCreateRoom = (roomData) => {
    dispatch(createRoom({
      ...roomData,
      userId: user.id,
      userName: user.name
    })).unwrap()
      .then((room) => {
        setIsCreateModalOpen(false)
        navigate(`/room/${room.id}`)
      })
      .catch((err) => {
        console.error('Failed to create room:', err)
      })
  }

  const handleJoinRoom = (roomCode) => {
    dispatch(joinRoom({
      roomCode,
      userId: user.id,
      userName: user.name
    })).unwrap()
      .then((room) => {
        setIsJoinModalOpen(false)
        navigate(`/room/${room.id}`)
      })
      .catch((err) => {
        console.error('Failed to join room:', err)
        toast.error(err || 'Failed to join room. Please check the room code and try again.')
      })
  }

  const handleJoinExistingRoom = (roomId) => {
    navigate(`/room/${roomId}`)
  }

  const handleDeleteRoom = (roomId) => {
    setRoomToDelete(roomId)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return

    dispatch(deleteRoom({
      roomId: roomToDelete,
      userId: user.id
    })).unwrap()
      .then(() => {
        setIsDeleteConfirmOpen(false)
        setRoomToDelete(null)
        toast.success('Room deleted successfully')
      })
      .catch((err) => {
        toast.error(err || 'Failed to delete room')
        console.error('Failed to delete room:', err)
      })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-600/10 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-success-600/5 blur-2xl"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Welcome Section with animated elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-4 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-3"
          >
            YOUR MOVIE HUB
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-3 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome, <span className="text-gradient bg-gradient-to-r from-primary-500 to-accent-500">{user?.name}!</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto md:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Ready to start a movie night? Create a new room or join an existing one.
          </motion.p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="glass-effect p-6 rounded-xl border border-gray-800/50">
            <div className="flex items-start">
              <div className="p-3 rounded-lg bg-primary-500/20 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Create a Room</h3>
                <p className="text-gray-400 text-sm mb-3">Host your own movie night with friends</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center"
                >
                  Create Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="glass-effect p-6 rounded-xl border border-gray-800/50">
            <div className="flex items-start">
              <div className="p-3 rounded-lg bg-accent-500/20 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Join a Room</h3>
                <p className="text-gray-400 text-sm mb-3">Enter a room code to join friends</p>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="text-accent-400 hover:text-accent-300 text-sm font-medium flex items-center"
                >
                  Join Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="glass-effect p-6 rounded-xl border border-gray-800/50">
            <div className="flex items-start">
              <div className="p-3 rounded-lg bg-success-500/20 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Public Rooms</h3>
                <p className="text-gray-400 text-sm mb-3">Browse available public rooms</p>
                <button
                  onClick={() => dispatch(getRooms())}
                  className="text-success-400 hover:text-success-300 text-sm font-medium flex items-center"
                >
                  Refresh List
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805v2.202a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13.5v-2.5a1 1 0 012 0v2.5a7.002 7.002 0 01-11.601 5.306 1 1 0 01-.61-1.276 1 1 0 011.277-.61z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-4 mb-10 justify-center md:justify-start"
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary px-8 py-3 rounded-xl flex items-center text-lg shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Room
          </button>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="btn btn-secondary px-8 py-3 rounded-xl flex items-center text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Join Room
          </button>
        </motion.div>

        {/* Public Rooms Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-white">Public Rooms</h2>
              <div className="ml-3 px-3 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400">
                {publicRooms.length} Available
              </div>
            </div>
            <button
              onClick={() => dispatch(getRooms())}
              className="text-primary-500 hover:text-primary-400 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805v2.202a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13.5v-2.5a1 1 0 012 0v2.5a7.002 7.002 0 01-11.601 5.306 1 1 0 01-.61-1.276 1 1 0 011.277-.61z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
                <p className="mt-4 text-gray-400">Loading available rooms...</p>
              </div>
            </div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect p-6 text-center text-red-400 rounded-xl border border-red-900/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Failed to load rooms. Please try again.</p>
              <button 
                onClick={() => dispatch(getRooms())}
                className="mt-4 btn btn-secondary px-6"
              >
                Retry
              </button>
            </motion.div>
          ) : publicRooms.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect p-8 text-center rounded-xl border border-gray-800/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Public Rooms Available</h3>
              <p className="text-gray-400 mb-6">Be the first to create a room and invite friends to join you!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary px-8 py-3 relative overflow-hidden group"
              >
                <span className="relative z-10">Create a Room</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <RoomCard
                    room={room}
                    onJoin={() => handleJoinExistingRoom(room.id)}
                    onDelete={handleDeleteRoom}
                    currentUserId={user.id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
      />

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinRoom}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div 
              className="w-full max-w-md glass-effect p-6 rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">Delete Room</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this room? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="btn btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteRoom}
                    className="btn bg-red-600 hover:bg-red-700 px-6 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
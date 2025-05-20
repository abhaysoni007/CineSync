import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isGoogleDriveLink, extractDriveFileId } from '../../utils/driveUtils'

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

const CreateRoomModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    movieUrl: '',
    driveFileId: '',
    isPrivate: false,
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    
    if (name === 'movieUrl') {
      const fileId = extractDriveFileId(value);
      setFormData(prev => ({
        ...prev,
        movieUrl: value,
        driveFileId: fileId || ''
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required'
    }
    
    if (!formData.movieUrl.trim()) {
      newErrors.movieUrl = 'Google Drive link is required'
    } else if (!isGoogleDriveLink(formData.movieUrl) && !formData.driveFileId) {
      newErrors.movieUrl = 'Please enter a valid Google Drive link'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        name: formData.name,
        movieUrl: formData.movieUrl,
        driveFileId: formData.driveFileId,
        isPrivate: formData.isPrivate
      })
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
                <h3 className="text-xl font-semibold text-white">Create a New Room</h3>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter a room name"
                    className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="movieUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Google Drive Link
                  </label>
                  <input
                    type="url"
                    id="movieUrl"
                    name="movieUrl"
                    value={formData.movieUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                    className={`input w-full ${errors.movieUrl ? 'border-red-500' : ''}`}
                  />
                  {errors.movieUrl ? (
                    <p className="mt-1 text-sm text-red-500">{errors.movieUrl}</p>
                  ) : (
                    <div className="mt-1 text-sm">
                      <p className="text-gray-400">Enter a Google Drive link to your movie file</p>
                      {formData.driveFileId && (
                        <p className="text-green-500 mt-1">Valid Google Drive file ID detected: {formData.driveFileId.slice(0, 10)}...</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 bg-gray-800 border-gray-700 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-300">
                    Make this room private
                  </label>
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
                    Create Room
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

export default CreateRoomModal
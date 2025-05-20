import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const HeroSection = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          filter: "brightness(0.3)"
        }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 z-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-accent-500 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-success-500 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-primary-300 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/2 w-2 h-2 bg-accent-300 rounded-full animate-pulse delay-1000"></div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 to-gray-900/90 z-10" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-3">
              NEW: Google Drive Integration — Stream in Original Quality
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Movie Night, <span className="text-gradient bg-gradient-to-r from-primary-500 to-accent-500">Reimagined</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Share the magic of cinema with friends and family—no matter the distance.
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Perfect HD synchronization, real-time reactions, and the feeling of <span className="text-primary-400">being together</span>, even when you're miles apart.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="btn btn-primary text-lg px-10 py-4 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="btn btn-primary text-lg px-10 py-4 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">Start Watching Together</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <div className="flex items-center">
                  <Link 
                    to="/login" 
                    className="btn-text text-lg text-gray-300 hover:text-primary-400 transition flex items-center"
                  >
                    Already a member? <span className="ml-2 underline">Sign In</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 flex flex-col items-center space-y-3"
          >
            <p className="text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No downloads required</span>
            </p>
            <p className="text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Works with Google Drive movies</span>
            </p>
            <p className="text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free for up to 5 friends per room</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-600/20 blur-3xl z-0 animate-pulse-slow"></div>
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent-500/20 blur-3xl z-0 animate-pulse-slow"></div>
      <div className="absolute bottom-32 right-32 w-32 h-32 rounded-full bg-success-500/10 blur-2xl z-0 animate-pulse-slow"></div>
    </div>
  )
}

export default HeroSection
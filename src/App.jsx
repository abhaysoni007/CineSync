import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth, listenToAuthChanges } from './store/authSlice'
import { initDatabase } from './utils/supabase'
import { toast } from 'react-hot-toast'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import NotFound from './pages/NotFound'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

const App = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
    const unsubscribe = dispatch(listenToAuthChanges())
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [dispatch])

  // Initialize Supabase database connection
  useEffect(() => {
    const initApp = async () => {
      try {
        const { success, error } = await initDatabase()
        if (!success) {
          console.error('Failed to initialize database:', error)
          toast.error('Failed to connect to database. Some features may not work properly.')
        }
      } catch (error) {
        console.error('Error during app initialization:', error)
      }
    }
    
    initApp()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-200">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
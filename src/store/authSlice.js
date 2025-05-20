import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// Removed axios and jwt-decode as they are not directly used by Supabase auth here
import { supabase } from '../supabaseClient' // Import Supabase client

// Removed API_URL, delay, getStoredUsers, storeUser as Supabase handles this

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Supabase returns user data in data.user
      // name might be in user.user_metadata.name if set during signup
      return { user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || data.user.email } }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { // Store additional user data like name here
            name: name,
          },
        },
      })
      if (error) throw error
      // Supabase returns user data in data.user. User is also logged in.
      // Note: Email confirmation might be required depending on your Supabase project settings.
      return { user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || data.user.email } }
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return null
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed')
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (!session) {
        return rejectWithValue('No active session') // Or handle as not authenticated
      }
      
      // Session exists, user is authenticated
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email // Access name from user_metadata
        }
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Authentication check failed')
    }
  }
)

// Optional: Listen to auth state changes to keep Redux store in sync
// This should be dispatched from your App.jsx or similar entry point
export const listenToAuthChanges = () => (dispatch) => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      dispatch(login.fulfilled({ 
        user: { 
          id: session.user.id, 
          email: session.user.email, 
          name: session.user.user_metadata?.name || session.user.email 
        }
      }))
    } else if (event === 'SIGNED_OUT') {
      dispatch(logout.fulfilled(null))
    } else if (event === 'USER_UPDATED') {
      // Handle user updates if needed, e.g., if name changes
      dispatch(checkAuth.fulfilled({ // Or a new action like updateUser
         user: { 
          id: session.user.id, 
          email: session.user.email, 
          name: session.user.user_metadata?.name || session.user.email 
        }
      }))
    }
  })
  // Return a dummy unsubscribe function or Supabase's actual unsubscribe if needed for cleanup
  // For this example, we're not returning the specific unsubscriber from onAuthStateChange
  return () => {}; 
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Set to true initially, checkAuth will set it to false
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // Potentially add a setLoading action if needed for more granular control
    // setLoading: (state, action) => {
    //   state.loading = action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.error = null // Clear any previous errors
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.error = null // Clear any previous errors
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true // Optional: show loading state during logout
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        // state.isAuthenticated might still be true if logout failed, or set to false
        // depending on desired behavior on failed logout
        state.error = action.payload
      })
      
      // CheckAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        // Don't necessarily set an error message for a failed checkAuth unless it's a real error
        // If it's just "No active session", that's normal for a logged-out user.
        // state.error = action.payload; 
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer
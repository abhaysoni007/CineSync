import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import roomReducer from './roomSlice'
import playerReducer from './playerSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    player: playerReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['player/setPlayer'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.player'],
        // Ignore these paths in the state
        ignoredPaths: ['player.playerRef'],
      },
    }),
})
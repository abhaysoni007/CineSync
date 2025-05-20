import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playerRef: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  buffered: 0,
  isHost: false,
  isSyncing: false,
  syncEvents: [],
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayer: (state, action) => {
      state.playerRef = action.payload
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload
    },
    setDuration: (state, action) => {
      state.duration = action.payload
    },
    setVolume: (state, action) => {
      state.volume = action.payload
    },
    setBuffered: (state, action) => {
      state.buffered = action.payload
    },
    setIsHost: (state, action) => {
      state.isHost = action.payload
    },
    setSyncing: (state, action) => {
      state.isSyncing = action.payload
    },
    addSyncEvent: (state, action) => {
      state.syncEvents.push(action.payload)
      // Keep only the last 20 events
      if (state.syncEvents.length > 20) {
        state.syncEvents.shift()
      }
    },
    clearSyncEvents: (state) => {
      state.syncEvents = []
    },
    resetPlayer: () => initialState,
  },
})

export const {
  setPlayer,
  setPlaying,
  setCurrentTime,
  setDuration,
  setVolume,
  setBuffered,
  setIsHost,
  setSyncing,
  addSyncEvent,
  clearSyncEvents,
  resetPlayer,
} = playerSlice.actions

export default playerSlice.reducer
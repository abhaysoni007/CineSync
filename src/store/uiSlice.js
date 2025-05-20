import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isMobileChatOpen: false,
  isMobileInfoOpen: false,
  isDarkMode: true,
  chatPosition: 'right', // 'right', 'left', or 'bottom'
  showControls: true,
  isMuted: false,
  volume: 0.8,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileChat: state => {
      state.isMobileChatOpen = !state.isMobileChatOpen
      state.isMobileInfoOpen = false
    },
    toggleMobileInfo: state => {
      state.isMobileInfoOpen = !state.isMobileInfoOpen
      state.isMobileChatOpen = false
    },
    toggleDarkMode: state => {
      state.isDarkMode = !state.isDarkMode
    },
    setChatPosition: (state, action) => {
      state.chatPosition = action.payload
    },
    toggleControls: state => {
      state.showControls = !state.showControls
    },
    setShowControls: (state, action) => {
      state.showControls = action.payload
    },
    toggleMute: state => {
      state.isMuted = !state.isMuted
    },
    setMuted: (state, action) => {
      state.isMuted = action.payload
    },
    setVolume: (state, action) => {
      state.volume = action.payload
    },
    resetUI: () => initialState,
  },
})

export const {
  toggleMobileChat,
  toggleMobileInfo,
  toggleDarkMode,
  setChatPosition,
  toggleControls,
  setShowControls,
  toggleMute,
  setMuted,
  setVolume,
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer
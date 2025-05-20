import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../utils/supabase'
import { delay } from '../utils/helpers'

// Generate a random 6-character room code
const generateRoomCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const createRoom = createAsyncThunk(
  'room/create',
  async ({ name, movieUrl, driveFileId, isPrivate, userId, userName }, { rejectWithValue }) => {
    try {
      // Generate a unique room code
      const roomCode = generateRoomCode()
      
      // Create the room in Supabase
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert([{
          code: roomCode,
          name,
          movie_url: movieUrl,
          drive_file_id: driveFileId || '',
          is_private: isPrivate,
          host_id: userId,
          host_name: userName
        }])
        .select()
        .single()
      
      if (roomError) throw new Error(roomError.message || 'Failed to create room')
      
      // Add the host as first participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert([{
          room_id: room.id,
          user_id: userId,
          user_name: userName,
          is_host: true
        }])
      
      if (participantError) throw new Error(participantError.message || 'Failed to add host as participant')
      
      // Add a welcome message
      await supabase
        .from('messages')
        .insert([{
          room_id: room.id,
          user_id: 'system',
          user_name: 'System',
          text: `Welcome to ${name}! This room was created by ${userName}.`
        }])
      
      // Format the room data for the frontend
      return {
        id: room.id,
        code: room.code,
        name: room.name,
        movieUrl: room.movie_url,
        driveFileId: room.drive_file_id,
        isPrivate: room.is_private,
        hostId: room.host_id,
        hostName: room.host_name,
        createdAt: room.created_at,
        participants: [{
          id: userId,
          name: userName,
          isHost: true,
          joinedAt: new Date().toISOString()
        }],
        messages: []
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create room')
    }
  }
)

export const deleteRoom = createAsyncThunk(
  'room/delete',
  async ({ roomId, userId }, { rejectWithValue }) => {
    try {
      // Check if user is the host
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('host_id')
        .eq('id', roomId)
        .single()
      
      if (roomError) throw new Error(roomError.message || 'Room not found')
      
      // Verify that the user is the host
      if (room.host_id !== userId) {
        throw new Error('Only the host can delete a room')
      }
      
      // Delete the room (cascade will delete participants and messages)
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
      
      if (deleteError) throw new Error(deleteError.message || 'Failed to delete room')
      
      return { roomId }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete room')
    }
  }
)

export const joinRoom = createAsyncThunk(
  'room/join',
  async ({ roomCode, userId, userName }, { rejectWithValue }) => {
    try {
      if (!roomCode || roomCode.length !== 6) {
        throw new Error('Invalid room code format')
      }
      
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single()
      
      if (roomError || !room) {
        console.error('Room lookup error:', roomError)
        throw new Error(`Room with code ${roomCode} not found`)
      }
      
      // Check if user is already in the room
      const { data: existingParticipant, error: participantError } = await supabase
        .from('participants')
        .select('id, is_host')
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .maybeSingle()
      
      let isHost = false
      
      // If user is not already a participant, add them
      if (!existingParticipant) {
        const { data: newParticipant, error: addError } = await supabase
          .from('participants')
          .insert([{
            room_id: room.id,
            user_id: userId,
            user_name: userName,
            is_host: false
          }])
          .select()
          .single()
        
        if (addError) throw new Error(addError.message || 'Failed to join room')
      } else {
        isHost = existingParticipant.is_host
      }
      
      // Get all participants in the room
      const { data: participants, error: allParticipantsError } = await supabase
        .from('participants')
        .select('user_id, user_name, is_host, joined_at')
        .eq('room_id', room.id)
      
      if (allParticipantsError) throw new Error(allParticipantsError.message || 'Failed to get participants')
      
      // Get room messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, user_id, user_name, text, timestamp')
        .eq('room_id', room.id)
        .order('timestamp', { ascending: true })
      
      if (messagesError) throw new Error(messagesError.message || 'Failed to get messages')
      
      // If the user is joining for the first time, add a system message
      if (!existingParticipant) {
        await supabase
          .from('messages')
          .insert([{
            room_id: room.id,
            user_id: 'system',
            user_name: 'System',
            text: `${userName} has joined the room.`
          }])
      }
      
      // Format the room data for the frontend
      return {
        id: room.id,
        code: room.code,
        name: room.name,
        movieUrl: room.movie_url,
        driveFileId: room.drive_file_id,
        isPrivate: room.is_private,
        hostId: room.host_id,
        hostName: room.host_name,
        createdAt: room.created_at,
        participants: participants.map(p => ({
          id: p.user_id,
          name: p.user_name,
          isHost: p.is_host,
          joinedAt: p.joined_at
        })),
        messages: messages.map(m => ({
          id: m.id,
          text: m.text,
          userId: m.user_id,
          userName: m.user_name,
          timestamp: m.timestamp
        }))
      }
    } catch (error) {
      console.error('Join room error:', error.message)
      return rejectWithValue(error.message || 'Failed to join room')
    }
  }
)

export const leaveRoom = createAsyncThunk(
  'room/leave',
  async ({ roomId, userId }, { rejectWithValue }) => {
    try {
      // Check if user is the host
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('is_host')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single()
      
      if (participantError) throw new Error(participantError.message || 'Not found in room')
      
      // Remove user from participants
      const { error: removeError } = await supabase
        .from('participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId)
      
      if (removeError) throw new Error(removeError.message || 'Failed to leave room')
      
      // If user was host, assign new host
      if (participant.is_host) {
        // Get remaining participants
        const { data: remainingParticipants, error: remainingError } = await supabase
          .from('participants')
          .select('user_id, user_name')
          .eq('room_id', roomId)
          .limit(1)
        
        if (remainingError) throw new Error(remainingError.message || 'Failed to check remaining participants')
        
        // If participants remain, assign new host
        if (remainingParticipants.length > 0) {
          const newHost = remainingParticipants[0]
          
          // Update the room with new host
          await supabase
            .from('rooms')
            .update({
              host_id: newHost.user_id,
              host_name: newHost.user_name
            })
            .eq('id', roomId)
          
          // Make the participant a host
          await supabase
            .from('participants')
            .update({ is_host: true })
            .eq('room_id', roomId)
            .eq('user_id', newHost.user_id)
            
          // Add system message
          await supabase
            .from('messages')
            .insert([{
              room_id: roomId,
              user_id: 'system',
              user_name: 'System',
              text: `${newHost.user_name} is now the host.`
            }])
        } else {
          // If no participants left, delete the room
          await supabase
            .from('rooms')
            .delete()
            .eq('id', roomId)
        }
      }
      
      return { roomId }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to leave room')
    }
  }
)

export const getRoomById = createAsyncThunk(
  'room/getById',
  async (roomId, { rejectWithValue }) => {
    try {
      // Get room details
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()
      
      if (roomError) throw new Error(roomError.message || 'Room not found')
      
      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('user_id, user_name, is_host, joined_at')
        .eq('room_id', roomId)
      
      if (participantsError) throw new Error(participantsError.message || 'Failed to get participants')
      
      // Get messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, user_id, user_name, text, timestamp')
        .eq('room_id', roomId)
        .order('timestamp', { ascending: true })
      
      if (messagesError) throw new Error(messagesError.message || 'Failed to get messages')
      
      // Format the room data for the frontend
      return {
        id: room.id,
        code: room.code,
        name: room.name,
        movieUrl: room.movie_url,
        driveFileId: room.drive_file_id,
        isPrivate: room.is_private,
        hostId: room.host_id,
        hostName: room.host_name,
        createdAt: room.created_at,
        participants: participants.map(p => ({
          id: p.user_id,
          name: p.user_name,
          isHost: p.is_host,
          joinedAt: p.joined_at
        })),
        messages: messages.map(m => ({
          id: m.id,
          text: m.text,
          userId: m.user_id,
          userName: m.user_name,
          timestamp: m.timestamp
        }))
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get room')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'room/sendMessage',
  async ({ roomId, message, userId, userName }, { rejectWithValue }) => {
    try {
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          room_id: roomId,
          user_id: userId,
          user_name: userName,
          text: message
        }])
        .select()
        .single()
      
      if (error) throw new Error(error.message || 'Failed to send message')
      
      // Return the message with the format expected by the frontend
      return { 
        roomId, 
        message: {
          id: data.id,
          text: data.text,
          userId: data.user_id,
          userName: data.user_name,
          timestamp: data.timestamp
        } 
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send message')
    }
  }
)

export const getRooms = createAsyncThunk(
  'room/getAll',
  async (_, { rejectWithValue }) => {
    try {
      // Get all public rooms
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(error.message || 'Failed to get rooms')
      
      // Format the rooms data for the frontend
      return data.map(room => ({
        id: room.id,
        code: room.code,
        name: room.name,
        movieUrl: room.movie_url,
        driveFileId: room.drive_file_id,
        isPrivate: room.is_private,
        hostId: room.host_id,
        hostName: room.host_name,
        createdAt: room.created_at
      }))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get rooms')
    }
  }
)

const initialState = {
  currentRoom: null,
  publicRooms: [],
  loading: false,
  error: null,
}

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null
    },
    resetRoom: (state) => {
      state.currentRoom = null
    },
    addParticipant: (state, action) => {
      if (state.currentRoom) {
        const exists = state.currentRoom.participants.some(p => p.id === action.payload.id)
        if (!exists) {
          state.currentRoom.participants.push(action.payload)
        }
      }
    },
    removeParticipant: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.participants = state.currentRoom.participants.filter(
          p => p.id !== action.payload.id
        )
      }
    },
    addMessage: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.messages = [...(state.currentRoom.messages || []), action.payload]
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Room
      .addCase(createRoom.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false
        state.currentRoom = action.payload
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Join Room
      .addCase(joinRoom.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = false
        state.currentRoom = action.payload
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Leave Room
      .addCase(leaveRoom.fulfilled, (state) => {
        state.currentRoom = null
      })
      
      // Get Room By Id
      .addCase(getRoomById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.loading = false
        state.currentRoom = action.payload
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentRoom && state.currentRoom.id === action.payload.roomId) {
          state.currentRoom.messages = [...(state.currentRoom.messages || []), action.payload.message]
        }
      })
      
      // Get Rooms
      .addCase(getRooms.pending, (state) => {
        state.loading = true
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.loading = false
        state.publicRooms = action.payload
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete Room
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentRoom && state.currentRoom.id === action.payload.roomId) {
          state.currentRoom = null
        }
        state.publicRooms = state.publicRooms.filter(room => room.id !== action.payload.roomId)
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { 
  clearRoomError, 
  resetRoom, 
  addParticipant, 
  removeParticipant, 
  addMessage 
} = roomSlice.actions

export default roomSlice.reducer
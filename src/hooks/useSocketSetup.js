import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addParticipant, removeParticipant, addMessage } from '../store/roomSlice'
import { setPlaying, setCurrentTime, addSyncEvent, setSyncing } from '../store/playerSlice'
import { supabase } from '../utils/supabase'

const useSocketSetup = (roomId, userId) => {
  const dispatch = useDispatch()
  const playerState = useSelector(state => state.player)
  const { isHost } = playerState
  const subscriptionsRef = useRef([])
  
  // Set up real-time subscriptions for participants, messages, and player events
  useEffect(() => {
    if (!roomId || !userId) return

    console.log(`Setting up Supabase real-time connection for room ${roomId} and user ${userId}`)
    
    // Subscribe to participants changes
    const participantsChannel = supabase
      .channel(`room:${roomId}:participants`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const participant = payload.new
          if (participant.user_id !== userId) {
            dispatch(addParticipant({
              id: participant.user_id,
              name: participant.user_name,
              isHost: participant.is_host,
              joinedAt: participant.joined_at
            }))
          }
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.old.user_id !== userId) {
            dispatch(removeParticipant({ id: payload.old.user_id }))
          }
        }
      )
      .subscribe()
      
    subscriptionsRef.current.push(participantsChannel)
    
    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`room:${roomId}:messages`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const message = payload.new
          dispatch(addMessage({
            id: message.id,
            text: message.text,
            userId: message.user_id,
            userName: message.user_name,
            timestamp: message.timestamp
          }))
        }
      )
      .subscribe()
      
    subscriptionsRef.current.push(messagesChannel)
    
    // Subscribe to room events for player sync
    const eventsChannel = supabase
      .channel(`room:${roomId}:events`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'room_events', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const event = payload.new
          
          // Ignore events from ourselves
          if (event.user_id === userId) return
          
          // Process player sync events
          if (event.event_type === 'sync' && !isHost) {
            dispatch(setSyncing(true))
            
            const eventData = event.event_data || {}
            
            if (typeof eventData.isPlaying === 'boolean') {
              dispatch(setPlaying(eventData.isPlaying))
            }
            
            if (typeof eventData.currentTime === 'number' && 
                Math.abs(eventData.currentTime - playerState.currentTime) > 2) {
              dispatch(setCurrentTime(eventData.currentTime))
              dispatch(addSyncEvent({
                type: 'seek',
                time: eventData.currentTime
              }))
            }
            
            dispatch(setSyncing(false))
          }
        }
      )
      .subscribe()
      
    subscriptionsRef.current.push(eventsChannel)
    
    // If user is host, set up sync broadcasting
    let syncInterval
    if (isHost) {
      syncInterval = setInterval(async () => {
        // Send player state to all clients via room_events
        try {
          await supabase
            .from('room_events')
            .insert([{
              room_id: roomId,
              user_id: userId,
              event_type: 'sync',
              event_data: {
                isPlaying: playerState.isPlaying,
                currentTime: playerState.currentTime
              }
            }])
            
          console.log('Host syncing player state:', {
            isPlaying: playerState.isPlaying,
            currentTime: playerState.currentTime
          })
        } catch (error) {
          console.error('Error syncing player state:', error)
        }
      }, 5000)
    }
    
    // Clean up subscriptions
    return () => {
      console.log('Cleaning up Supabase real-time connection')
      subscriptionsRef.current.forEach(subscription => {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe()
        }
      })
      clearInterval(syncInterval)
    }
  }, [roomId, userId, dispatch, isHost, playerState])

  // Return a boolean indicating whether the socket is connected
  return true
}

export default useSocketSetup
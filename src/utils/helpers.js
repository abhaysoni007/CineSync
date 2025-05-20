/**
 * Utility function to create a delay using Promises
 * @param {number} ms - The delay time in milliseconds
 * @returns {Promise} A promise that resolves after the specified time
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)) 

/**
 * Debug function to create a test room in localStorage
 * Use this in browser console to create a test room for joining:
 * import { createTestRoom } from './utils/helpers'
 * createTestRoom()
 */
export const createTestRoom = () => {
  const testRoom = {
    id: `room-${Date.now()}`,
    code: 'TEST123',
    name: 'Test Room',
    movieUrl: 'https://example.com/test-movie.mp4',
    driveFileId: '',
    isPrivate: false,
    hostId: 'test-host',
    hostName: 'Test Host',
    createdAt: new Date().toISOString(),
    participants: [
      {
        id: 'test-host',
        name: 'Test Host',
        isHost: true,
        joinedAt: new Date().toISOString()
      }
    ],
    messages: []
  }
  
  const rooms = localStorage.getItem('cinesync_rooms')
  const existingRooms = rooms ? JSON.parse(rooms) : []
  existingRooms.push(testRoom)
  localStorage.setItem('cinesync_rooms', JSON.stringify(existingRooms))
  
  console.log('Test room created with code:', testRoom.code)
  return testRoom
} 
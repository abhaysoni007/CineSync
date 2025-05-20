import { useEffect, useRef, useState, useCallback } from 'react';
import { PeerConnection } from '../utils/webrtc/PeerConnection';

export const useWebRTC = (isHost, roomId, socket) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const peerConnectionRef = useRef(null);
  const videoSourceRef = useRef(null);

  const handleStatusChange = useCallback((status) => {
    switch (status.type) {
      case 'ice-candidate':
        socket.emit('relay-ice', {
          candidate: status.candidate,
          peerId: status.peerId,
          roomId
        });
        break;
      
      case 'connection-ready':
        setIsReady(true);
        break;
      
      case 'source-ready':
        videoSourceRef.current = URL.createObjectURL(status.mediaSource);
        break;
      
      default:
        console.log('Unhandled status:', status);
    }
  }, [socket, roomId]);

  useEffect(() => {
    peerConnectionRef.current = new PeerConnection(isHost, roomId, handleStatusChange);

    socket.on('user-joined', async (peerId) => {
      try {
        const pc = await peerConnectionRef.current.createPeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.emit('relay-sdp', {
          sdp: offer,
          peerId,
          roomId
        });
      } catch (err) {
        setError('Failed to establish peer connection');
        console.error(err);
      }
    });

    socket.on('sdp', async ({ sdp, peerId }) => {
      try {
        const pc = peerConnectionRef.current.peerConnections.get(peerId) ||
                   await peerConnectionRef.current.createPeerConnection(peerId);
        
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        
        if (sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          socket.emit('relay-sdp', {
            sdp: answer,
            peerId,
            roomId
          });
        }
      } catch (err) {
        setError('Failed to handle SDP');
        console.error(err);
      }
    });

    socket.on('ice-candidate', async ({ candidate, peerId }) => {
      try {
        const pc = peerConnectionRef.current.peerConnections.get(peerId);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        setError('Failed to add ICE candidate');
        console.error(err);
      }
    });

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.cleanup();
      }
      socket.off('user-joined');
      socket.off('sdp');
      socket.off('ice-candidate');
    };
  }, [isHost, roomId, socket, handleStatusChange]);

  const startStreaming = useCallback(async (file) => {
    if (!isHost || !peerConnectionRef.current) return;
    
    try {
      await peerConnectionRef.current.startStreaming(file);
    } catch (err) {
      setError('Failed to start streaming');
      console.error(err);
    }
  }, [isHost]);

  const syncPlaybackState = useCallback((currentTime, isPlaying) => {
    if (!isHost || !peerConnectionRef.current) return;
    peerConnectionRef.current.syncPlaybackState(currentTime, isPlaying);
  }, [isHost]);

  return {
    isReady,
    error,
    videoSource: videoSourceRef.current,
    startStreaming,
    syncPlaybackState
  };
};
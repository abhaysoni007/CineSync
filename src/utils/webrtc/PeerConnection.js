import 'webrtc-adapter';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

export class PeerConnection {
  constructor(isHost, roomId, onStatusChange) {
    this.isHost = isHost;
    this.roomId = roomId;
    this.onStatusChange = onStatusChange;
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    this.mediaSource = null;
    this.sourceBuffer = null;
    this.pendingChunks = [];
    this.isBuffering = false;
    
    // MediaSource configuration
    if (!this.isHost) {
      this.mediaSource = new MediaSource();
      this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen);
    }
  }

  // Initialize a new peer connection
  async createPeerConnection(peerId) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);
    this.peerConnections.set(peerId, pc);

    // Set up data channel
    if (this.isHost) {
      const dataChannel = pc.createDataChannel('video', {
        ordered: true,
        maxRetransmits: 3
      });
      dataChannel.binaryType = 'arraybuffer';
      this.setupDataChannel(dataChannel, peerId);
    } else {
      pc.ondatachannel = (event) => {
        this.setupDataChannel(event.channel, peerId);
      };
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onStatusChange({
          type: 'ice-candidate',
          candidate: event.candidate,
          peerId
        });
      }
    };

    return pc;
  }

  // Set up data channel handlers
  setupDataChannel(channel, peerId) {
    this.dataChannels.set(peerId, channel);

    channel.onopen = () => {
      console.log(`Data channel with peer ${peerId} opened`);
      this.onStatusChange({
        type: 'connection-ready',
        peerId
      });
    };

    channel.onclose = () => {
      console.log(`Data channel with peer ${peerId} closed`);
      this.dataChannels.delete(peerId);
      this.peerConnections.delete(peerId);
    };

    if (!this.isHost) {
      channel.onmessage = this.handleIncomingData.bind(this);
    }
  }

  // Handle incoming video data (Client side)
  handleIncomingData(event) {
    const data = event.data;
    
    if (typeof data === 'string') {
      const message = JSON.parse(data);
      
      if (message.type === 'metadata') {
        this.initializeSourceBuffer(message.mimeType);
      } else if (message.type === 'playback-state') {
        this.syncPlaybackState(message);
      }
    } else {
      this.appendChunkToSourceBuffer(data);
    }
  }

  // Initialize source buffer with correct mime type
  initializeSourceBuffer(mimeType) {
    if (!MediaSource.isTypeSupported(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    if (this.mediaSource.readyState === 'open') {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);
      this.sourceBuffer.mode = 'sequence';
      this.sourceBuffer.onupdateend = this.handleSourceBufferUpdate.bind(this);
    }
  }

  // Handle source buffer updates
  handleSourceBufferUpdate() {
    if (this.pendingChunks.length > 0 && !this.sourceBuffer.updating) {
      const chunk = this.pendingChunks.shift();
      this.sourceBuffer.appendBuffer(chunk);
    }
    this.isBuffering = this.pendingChunks.length > 0;
  }

  // Append video chunk to source buffer
  appendChunkToSourceBuffer(chunk) {
    if (!this.sourceBuffer || this.sourceBuffer.updating) {
      this.pendingChunks.push(chunk);
      return;
    }
    
    try {
      this.sourceBuffer.appendBuffer(chunk);
    } catch (error) {
      console.error('Error appending buffer:', error);
      this.pendingChunks.push(chunk);
    }
  }

  // Start streaming a file (Host side)
  async startStreaming(file) {
    if (!this.isHost) return;

    const mimeType = file.type || 'video/mp4';
    const metadata = {
      type: 'metadata',
      mimeType,
      fileSize: file.size,
      timestamp: Date.now()
    };

    // Send metadata to all peers
    this.dataChannels.forEach(channel => {
      channel.send(JSON.stringify(metadata));
    });

    // Start reading and sending file chunks
    const reader = new FileReader();
    let offset = 0;

    const readNextChunk = () => {
      if (offset >= file.size) return;

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(chunk);
      offset += CHUNK_SIZE;
    };

    reader.onload = (e) => {
      const chunk = e.target.result;
      this.dataChannels.forEach(channel => {
        if (channel.readyState === 'open') {
          channel.send(chunk);
        }
      });
      readNextChunk();
    };

    readNextChunk();
  }

  // Sync playback state from host to clients
  syncPlaybackState(currentTime, isPlaying) {
    if (!this.isHost) return;

    const state = {
      type: 'playback-state',
      currentTime,
      isPlaying,
      timestamp: performance.now()
    };

    this.dataChannels.forEach(channel => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify(state));
      }
    });
  }

  // Handle source open event
  handleSourceOpen = () => {
    this.onStatusChange({
      type: 'source-ready',
      mediaSource: this.mediaSource
    });
  };

  // Clean up resources
  cleanup() {
    this.dataChannels.forEach(channel => channel.close());
    this.peerConnections.forEach(pc => pc.close());
    this.dataChannels.clear();
    this.peerConnections.clear();
    
    if (this.sourceBuffer && this.mediaSource.readyState === 'open') {
      try {
        this.mediaSource.removeSourceBuffer(this.sourceBuffer);
      } catch (error) {
        console.error('Error removing source buffer:', error);
      }
    }
  }
}
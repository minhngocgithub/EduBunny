import { io, Socket } from 'socket.io-client';

interface SocketState {
  connected: boolean;
  socket: Socket | null;
}

let socketInstance: Socket | null = null;
let isConnecting = false;

const state: SocketState = reactive({
  connected: false,
  socket: null,
});

export const useSocket = () => {
  const config = useRuntimeConfig();
  
  // Initialize socket connection
  const connect = () => {
    // If socket is already connected, return it
    if (socketInstance && socketInstance.connected) {
      console.log('🔄 Reusing existing socket connection:', socketInstance.id);
      return socketInstance;
    }

    // If already connecting, wait and return
    if (isConnecting) {
      console.log('⏳ Socket connection already in progress...');
      return socketInstance;
    }

    // If socket exists but disconnected, clean it up first
    if (socketInstance && !socketInstance.connected) {
      console.log('🧹 Cleaning up disconnected socket');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    }

    isConnecting = true;
    const socketUrl = config.public.apiBaseUrl.replace('/api', '');
    
    console.log('🔌 Creating new socket connection to:', socketUrl);
    socketInstance = io(socketUrl, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance?.id);
      state.connected = true;
      state.socket = socketInstance;
      isConnecting = false;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      state.connected = false;
      isConnecting = false;
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      state.connected = false;
      isConnecting = false;
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔁 Socket reconnected after', attemptNumber, 'attempts');
      state.connected = true;
      isConnecting = false;
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    return socketInstance;
  };

  // Disconnect socket
  const disconnect = () => {
    if (socketInstance) {
      console.log('🔌 Disconnecting socket');
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
      state.connected = false;
      state.socket = null;
      isConnecting = false;
    }
  };

  // Subscribe to course updates
  const subscribeToCourseUpdates = (callback: (data: any) => void) => {
    // Get or create socket
    const socket = connect();
    
    if (!socket) {
      console.warn('⚠️ Socket not available for subscription');
      return () => {};
    }
    
    console.log('📡 Subscribing to course updates');
    
    // Remove existing listeners first to avoid duplicates
    socket.off('course:created');
    socket.off('course:updated');
    socket.off('course:deleted');
    
    // Add new listeners
    socket.on('course:created', callback);
    socket.on('course:updated', callback);
    socket.on('course:deleted', callback);
    
    return () => {
      console.log('📡 Unsubscribing from course updates');
      if (socket) {
        socket.off('course:created', callback);
        socket.off('course:updated', callback);
        socket.off('course:deleted', callback);
      }
    };
  };

  // Get socket instance
  const getSocket = () => {
    if (!socketInstance || !socketInstance.connected) {
      return connect();
    }
    return socketInstance;
  };

  return {
    state: readonly(state),
    connect,
    disconnect,
    subscribeToCourseUpdates,
    getSocket,
  };
};

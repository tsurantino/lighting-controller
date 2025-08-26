// src/hooks/useSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Laser, LaserData, LaserOrientation, ControlsState } from '../types';
import { socketService } from '../services/socketService';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  lasers: Laser[];
  error: string | null;
  reconnect: () => void;
}

export const useSocket = (serverUrl: string = 'http://localhost:5000'): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const reconnect = useCallback(() => {
    if (socket) {
      console.log('🔄 Reconnecting to socket...');
      socket.connect();
    }
  }, [socket]);

  useEffect(() => {
    console.log('🚀 Initializing socket connection to:', serverUrl);
    
    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      setError(null);
      
      // Clear any reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      
      // Auto-reconnect after 3 seconds for certain disconnect reasons
      if (reason === 'io server disconnect') {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnect();
        }, 3000);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    // Laser data updates
    socketInstance.on('state_update', (serverState: { lasers: any[] }) => {
      try {
        if (serverState.lasers) {
          const laserData: LaserData[] = serverState.lasers.map((laser: any) => ({
            id: laser.id,
            orientation: laser.orientation === 'top' ? LaserOrientation.Top : LaserOrientation.Side,
            brightness: laser.brightness,
            dmxAddress: laser.dmx_address || 0,
          }));
          
          setLasers(serverState.lasers);
        }
      } catch (error) {
        console.error('❌ Error processing state update:', error);
        setError('Failed to process laser data');
      }
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('state_update');
      socketInstance.disconnect();
    };
  }, [serverUrl, reconnect]);

  return {
    socket,
    isConnected,
    lasers,
    error,
    reconnect,
  };
};
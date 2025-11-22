import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Laser, LaserData, LaserOrientation } from '../types';

export interface UseSocketReturn {
  socket: Socket;
  isConnected: boolean;
  lasers: Laser[];
}

export const useSocket = (): UseSocketReturn => {
  const [socket] = useState(() => io('http://localhost:5000'));
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lasers, setLasers] = useState<Laser[]>([]);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleStateUpdate = (serverState: { lasers: any[] }) => {
      setLasers(serverState.lasers);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('state_update', handleStateUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('state_update', handleStateUpdate);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    lasers
  };
};
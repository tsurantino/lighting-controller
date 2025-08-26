// src/stores/ControlsContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useControls } from '../hooks/useControls';
import { ControlsState } from '../types';
import { Socket } from 'socket.io-client';

interface ControlsContextValue {
  // Controls state
  controls: ControlsState;
  setControls: (newControls: React.SetStateAction<ControlsState>) => void;
  isLoading: boolean;
  
  // Socket state
  socket: Socket | null;
  isConnected: boolean;
  lasers: any[];
  socketError: string | null;
  reconnect: () => void;
}

const ControlsContext = createContext<ControlsContextValue | undefined>(undefined);

interface ControlsProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

export const ControlsProvider: React.FC<ControlsProviderProps> = ({ 
  children, 
  serverUrl = 'http://localhost:5000' 
}) => {
  // Socket connection and laser data
  const { 
    socket, 
    isConnected, 
    lasers, 
    error: socketError, 
    reconnect 
  } = useSocket(serverUrl);

  // Controls state management
  const { 
    controls, 
    setControls, 
    isLoading 
  } = useControls({ 
    socket,
    laserData: lasers.map((laser: any) => ({
      id: laser.id,
      orientation: laser.orientation,
      brightness: laser.brightness,
      dmxAddress: laser.dmx_address || 0,
    }))
  });

  const contextValue: ControlsContextValue = {
    // Controls
    controls,
    setControls,
    isLoading,
    
    // Socket
    socket,
    isConnected,
    lasers,
    socketError,
    reconnect,
  };

  return (
    <ControlsContext.Provider value={contextValue}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControlsContext = (): ControlsContextValue => {
  const context = useContext(ControlsContext);
  if (context === undefined) {
    throw new Error('useControlsContext must be used within a ControlsProvider');
  }
  return context;
};
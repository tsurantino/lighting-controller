// src/hooks/useControls.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { ControlsState, LaserData } from '../types';
import { INITIAL_CONTROLS_STATE } from '../constants';
import { controlsMapper } from '../services/controlsMapper';
import { updateFixtureDmxValues } from '../utils/dmxHelpers';

interface UseControlsProps {
  socket: Socket | null;
  laserData?: LaserData[];
}

interface UseControlsReturn {
  controls: ControlsState;
  setControls: (newControls: React.SetStateAction<ControlsState>) => void;
  isLoading: boolean;
}

export const useControls = ({ socket, laserData }: UseControlsProps): UseControlsReturn => {
  const [controls, setControlsInternal] = useState<ControlsState>(INITIAL_CONTROLS_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const controlsRef = useRef<ControlsState>(controls);
  const previousControlsRef = useRef<ControlsState>(controls);

  // Keep refs in sync
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  // Update laser data when received from server
  useEffect(() => {
    if (laserData) {
      setControlsInternal(prev => ({
        ...prev,
        lasers: laserData
      }));
    }
  }, [laserData]);

  // Handle strobe/pulse combined control
  useEffect(() => {
    if (!socket) return;

    const { strobeOrPulse, strobePulseRate } = controls;
    
    if (strobeOrPulse === 'strobe') {
      socket.emit('control_change', { control: 'strobe', value: strobePulseRate });
      socket.emit('control_change', { control: 'pulse', value: 0 });
    } else {
      socket.emit('control_change', { control: 'strobe', value: 0 });
      socket.emit('control_change', { control: 'pulse', value: strobePulseRate });
    }
  }, [socket, controls.strobeOrPulse, controls.strobePulseRate]);

  // Handle fixture updates when dimmer or mhSpeed changes
  useEffect(() => {
    const { dimmer, mhSpeed, fixtures } = controls;
    
    setControlsInternal(prev => {
      const updatedFixtures = { ...prev.fixtures };
      
      Object.keys(updatedFixtures).forEach(fixtureId => {
        const fixture = updatedFixtures[fixtureId as keyof typeof updatedFixtures];
        
        if (fixture.type === 'MovingHead') {
          const updatedFixture = {
            ...fixture,
            speed: mhSpeed,
          };
          updatedFixtures[fixtureId as keyof typeof updatedFixtures] = 
            updateFixtureDmxValues(updatedFixture, dimmer);
        } else {
          updatedFixtures[fixtureId as keyof typeof updatedFixtures] = 
            updateFixtureDmxValues(fixture, dimmer);
        }
      });
      
      return {
        ...prev,
        fixtures: updatedFixtures
      };
    });
  }, [controls.dimmer, controls.mhSpeed]);

  // Main controls update handler
  const setControls = useCallback((newControls: React.SetStateAction<ControlsState>) => {
    if (!socket) {
      console.warn('⚠️ Socket not available, controls not sent to server');
      setControlsInternal(newControls);
      return;
    }

    setIsLoading(true);

    const updatedControls = typeof newControls === 'function' 
      ? newControls(controlsRef.current) 
      : newControls;
    
    // Update internal state
    setControlsInternal(updatedControls);
    
    // Map and send changes to backend
    try {
      const backendControls = controlsMapper.mapFrontendToBackend(
        updatedControls, 
        previousControlsRef.current
      );

      // Send each changed control to backend
      Object.entries(backendControls).forEach(([control, value]) => {
        console.log('🔧 Sending to backend:', control, '=', value, typeof value);
        socket.emit('control_change', { control, value });
      });

      // Update previous controls reference
      previousControlsRef.current = updatedControls;
    } catch (error) {
      console.error('❌ Error mapping controls:', error);
    } finally {
      setIsLoading(false);
    }
  }, [socket]);

  return {
    controls,
    setControls,
    isLoading,
  };
};
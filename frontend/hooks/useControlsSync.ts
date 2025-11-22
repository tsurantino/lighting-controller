import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ControlsState, LaserData, LaserOrientation } from '../types';

export const useControlsSync = (
  socket: Socket,
  controls: ControlsState,
  setControls: React.Dispatch<React.SetStateAction<ControlsState>>
) => {
  const controlsRef = useRef(controls);

  useEffect(() => {
    controlsRef.current = controls;
  });

  // Handle server state updates to sync laser data
  useEffect(() => {
    const handleStateUpdate = (serverState: { lasers: any[] }) => {
      if (serverState.lasers) {
        const laserData: LaserData[] = serverState.lasers.map((laser: any) => ({
          id: laser.id,
          orientation: laser.orientation === 'top' ? LaserOrientation.Top : LaserOrientation.Side,
          brightness: laser.brightness,
          dmxAddress: laser.dmx_address || 0,
        }));
        
        setControls(prev => ({
          ...prev,
          lasers: laserData
        }));
      }
    };

    socket.on('state_update', handleStateUpdate);

    return () => {
      socket.off('state_update', handleStateUpdate);
    };
  }, [socket, setControls]);

  // Send separate strobe/pulse values when the toggle or rate changes
  useEffect(() => {
    if (controls.strobeOrPulse === 'strobe') {
      socket.emit('control_change', { control: 'strobe', value: controls.strobePulseRate });
      socket.emit('control_change', { control: 'pulse', value: 0 });
    } else {
      socket.emit('control_change', { control: 'strobe', value: 0 });
      socket.emit('control_change', { control: 'pulse', value: controls.strobePulseRate });
    }
  }, [controls.strobeOrPulse, controls.strobePulseRate, socket]);

  const sendControlsToBackend = (newControls: ControlsState, previousControls: ControlsState) => {
    const backendControls: any = {};
    
    for (const key in newControls) {
      const typedKey = key as keyof ControlsState;
      const currentValue = newControls[typedKey];
      const previousValue = previousControls[typedKey];
      
      if (typedKey === 'scrollDirection') {
        console.log("🚀 APP: Processing scrollDirection");
        console.log("🚀 APP: currentValue:", currentValue, typeof currentValue);
        console.log("🚀 APP: previousValue:", previousValue, typeof previousValue);
        console.log("🚀 APP: currentValue !== previousValue?", currentValue !== previousValue);
      }
      
      if (currentValue !== previousValue) {
        console.log("🚀 APP: Value changed for key:", typedKey, "from", previousValue, "to", currentValue);
        
        if (typedKey === 'strobePulseRate' || typedKey === 'strobeOrPulse') {
          continue; // Handled by useEffect above
        } else if (typedKey === 'fixtures') {
          socket.emit('control_change', {
            control: 'fixtures',
            value: currentValue,
          });
          continue;
        } else if (typedKey === 'lasers') {
          continue; // Don't send laser data back to server - it's read-only
        } else {
          backendControls[typedKey] = currentValue;
        }
      }
    }

    // Send each changed control to the backend
    for (const [control, value] of Object.entries(backendControls)) {
      console.log("🔧 Sending to backend:", control, "=", value, typeof value);
      
      socket.emit('control_change', {
        control: control,
        value: value,
      });
    }
  };

  return {
    sendControlsToBackend,
    controlsRef
  };
};
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LaserSimulator from './components/LaserSimulator';
import Controls from './components/Controls';
import { Laser, LaserData, LaserOrientation, ControlsState, ViewMode } from './types';
import { INITIAL_CONTROLS_STATE, updateFixtureDmxValues } from './constants';

const socket = io('http://localhost:5000');

function App() {
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [controls, setControls] = useState<ControlsState>(INITIAL_CONTROLS_STATE);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [viewMode, setViewMode] = useState<ViewMode>('landscape'); // Default to landscape
  const [showConfig, setShowConfig] = useState(false);
  const [showSimulator, setShowSimulator] = useState(true);

  const controlsRef = useRef(controls);

  useEffect(() => {
    controlsRef.current = controls;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('state_update', (serverState: { lasers: any[] }) => {
      setLasers(serverState.lasers); // Keep existing functionality
      
      if (serverState.lasers) {
        const laserData: LaserData[] = serverState.lasers.map((laser: any) => ({
          id: laser.id,                    // "top-0", "side-5", etc.
          orientation: laser.orientation === 'top' ? LaserOrientation.Top : LaserOrientation.Side,
          brightness: laser.brightness,    // 0-255
          dmxAddress: laser.dmx_address || 0,
        }));
        
        // Update the controls state with the laser data
        setControls(prev => ({
          ...prev,
          lasers: laserData
        }));
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('state_update');
    };
  }, []);

  // Send separate strobe/pulse values when the toggle or rate changes
  useEffect(() => {
    if (controls.strobeOrPulse === 'strobe') {
      socket.emit('control_change', { control: 'strobe', value: controls.strobePulseRate });
      socket.emit('control_change', { control: 'pulse', value: 0 });
    } else {
      socket.emit('control_change', { control: 'strobe', value: 0 });
      socket.emit('control_change', { control: 'pulse', value: controls.strobePulseRate });
    }
  }, [controls.strobeOrPulse, controls.strobePulseRate]);

  useEffect(() => {
    // Update all fixture DMX values when dimmer or mhSpeed changes
    setControls(prev => {
      const updatedFixtures = { ...prev.fixtures };
      
      // Update each fixture with recalculated DMX values
      Object.keys(updatedFixtures).forEach(fixtureId => {
        const fixture = updatedFixtures[fixtureId as keyof typeof updatedFixtures];
        
        // For MovingHead fixtures, also update the speed property from mhSpeed
        if (fixture.type === 'MovingHead') {
          const updatedFixture = {
            ...fixture,
            speed: prev.mhSpeed, // Update speed property from mhSpeed slider
          };
          updatedFixtures[fixtureId as keyof typeof updatedFixtures] = updateFixtureDmxValues(updatedFixture, prev.dimmer);
        } else {
          updatedFixtures[fixtureId as keyof typeof updatedFixtures] = updateFixtureDmxValues(fixture, prev.dimmer);
        }
      });
      
      return {
        ...prev,
        fixtures: updatedFixtures
      };
    });
  }, [controls.dimmer, controls.mhSpeed]); // Watch for changes to dimmer and mhSpeed

  const handleSetControls = (newControls: React.SetStateAction<ControlsState>) => {
    const updatedControls = typeof newControls === 'function' ? newControls(controls) : newControls;
    setControls(updatedControls);

    // Convert frontend controls to backend format
    const backendControls: any = {};
    
    for (const key in updatedControls) {
      const typedKey = key as keyof ControlsState;
      const currentValue = updatedControls[typedKey];
      const previousValue = controlsRef.current[typedKey];
      
      if (currentValue !== previousValue) {
        // Handle the combined strobe/pulse control
        if (typedKey === 'strobePulseRate' || typedKey === 'strobeOrPulse') {
          // These are handled by the useEffect above
          continue;
        } else if (typedKey === 'fixtures') {
          // Handle fixture configuration updates separately
          socket.emit('control_change', {
            control: 'fixtures',
            value: currentValue,
          });
          continue;
        } else if (typedKey === 'lasers') {
          // Don't send laser data back to server - it's read-only
          continue;
        } else {
          // Map other controls directly
          backendControls[typedKey] = currentValue;
        }
      }
    }

    // Send each changed control to the backend
    for (const [control, value] of Object.entries(backendControls)) {
      socket.emit('control_change', {
        control: control,
        value: value,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      {/* Header */}
      <header className="flex items-center justify-center gap-6 mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-red-500 tracking-wider">red.it.be l1ghts</h1>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
          isConnected ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'landscape' ? 'pane' : 'landscape')}
            className="px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            {viewMode === 'landscape' ? 'Landscape' : 'Pane'}
          </button>
          
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              showSimulator 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Simulator
          </button>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              showConfig 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showConfig ? 'Hide Config' : 'Show Config'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {viewMode === 'pane' ? (
          /* PANE LAYOUT - Simple side-by-side */
          <div className="flex gap-6 h-full">
             {showSimulator && (
               <div className="w-1/3 flex-shrink-0">
                   <LaserSimulator 
                      lasers={lasers} 
                      showLaserOrigins={controls.showLaserOrigins} 
                      hazeDensity={controls.hazeDensity} 
                      linearGradient={controls.linearGradient}
                      fixtures={controls.fixtures}
                   />
               </div>
             )}
             <div className={showSimulator ? "flex-grow" : "w-full"}>
                 <Controls controls={controls} setControls={handleSetControls} />
             </div>
          </div>
        ) : (
          /* LANDSCAPE LAYOUT - Row-based layout */
          <div className="flex flex-col gap-6 h-full">
            {/* Row 1: Simulator - Full Width */}
            {showSimulator && (
              <div className="w-full">
                <LaserSimulator
                  lasers={lasers}
                  showLaserOrigins={controls.showLaserOrigins}
                  hazeDensity={controls.hazeDensity}
                  linearGradient={controls.linearGradient}
                  fixtures={controls.fixtures}
                />
              </div>
            )}
            
            {/* Row 2: Sliders/Beat Modifiers - Full Width */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <Controls 
                controls={controls} 
                setControls={handleSetControls} 
                section="global" 
                verticalSliders={true} 
              />
            </div>
            
            {/* Row 3: Visual Presets and Movement Controls */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <Controls 
                  controls={controls} 
                  setControls={handleSetControls} 
                  section="visual" 
                />
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <Controls 
                  controls={controls} 
                  setControls={handleSetControls} 
                  section="movement"
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Config Modal - Made Much Wider */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Configuration</h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Controls 
              controls={controls} 
              setControls={handleSetControls} 
              section="config" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
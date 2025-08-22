import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LaserSimulator from './components/LaserSimulator';
import Controls from './components/Controls';
import { Laser, ControlsState, ViewMode } from './types';
import { INITIAL_CONTROLS_STATE } from './constants';

const socket = io('http://localhost:5000');

function App() {
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [controls, setControls] = useState<ControlsState>(INITIAL_CONTROLS_STATE);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [viewMode, setViewMode] = useState<ViewMode>('landscape'); // Default to landscape
  const [showConfig, setShowConfig] = useState(false);

  const controlsRef = useRef(controls);

  useEffect(() => {
    controlsRef.current = controls;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('state_update', (serverState: { lasers: Laser[] }) => {
      setLasers(serverState.lasers);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('state_update');
    };
  }, [controls]);

  const handleSetControls = (newControls: React.SetStateAction<ControlsState>) => {
    const updatedControls = typeof newControls === 'function' ? newControls(controls) : newControls;
    setControls(updatedControls);

    for (const key in updatedControls) {
      const typedKey = key as keyof ControlsState;
      if (updatedControls[typedKey] !== controlsRef.current[typedKey]) {
        socket.emit('control_change', {
          control: typedKey,
          value: updatedControls[typedKey],
        });
      }
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 font-sans flex flex-col">
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
            onClick={() => setViewMode(prev => prev === 'landscape' ? 'pane' : 'landscape')}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              viewMode === 'pane' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {viewMode === 'landscape' ? 'Pane View' : 'Landscape View'}
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
          /* PANE LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-2">
              <LaserSimulator
                lasers={lasers}
                showLaserOrigins={controls.showLaserOrigins}
                hazeDensity={controls.hazeDensity}
                linearGradient={controls.linearGradient}
              />
            </div>
            <div className="lg:col-span-1">
              <Controls controls={controls} setControls={handleSetControls} />
            </div>
          </div>
        ) : (
          /* LANDSCAPE LAYOUT */
          <div className="flex gap-6 h-full">
             <div className="w-1/3 flex-shrink-0">
                 <LaserSimulator 
                    lasers={lasers} 
                    showLaserOrigins={controls.showLaserOrigins} 
                    hazeDensity={controls.hazeDensity} 
                    linearGradient={controls.linearGradient} 
                 />
             </div>
             <div className={`flex-grow grid gap-6 ${showConfig ? 'grid-cols-4' : 'grid-cols-3'}`}>
                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 col-span-1">
                     <Controls 
                        controls={controls} 
                        setControls={handleSetControls} 
                        section="global" 
                        verticalSliders={true} 
                     />
                 </div>
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
                 {showConfig && (
                     <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                         <Controls 
                            controls={controls} 
                            setControls={handleSetControls} 
                            section="config" 
                         />
                     </div>
                 )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
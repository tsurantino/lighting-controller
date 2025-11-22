import React, { useState, useEffect } from 'react';
import LaserSimulator from './components/LaserSimulator';
import Controls from './components/Controls';
import { ControlsState } from './types';
import { INITIAL_CONTROLS_STATE, updateFixtureDmxValues } from './constants';
import { useSocket, useControlsSync } from './hooks';

function App() {
  const { socket, isConnected, lasers } = useSocket();
  const [controls, setControls] = useState<ControlsState>(INITIAL_CONTROLS_STATE);
  const [showConfig, setShowConfig] = useState(false);
  const [showSimulator, setShowSimulator] = useState(true);

  const { sendControlsToBackend } = useControlsSync(socket, controls, setControls);

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
            speed: prev.mhSpeed,
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
  }, [controls.dimmer, controls.mhSpeed]);

  const handleSetControls = (newControls: React.SetStateAction<ControlsState>) => {
    const updatedControls = typeof newControls === 'function' ? newControls(controls) : newControls;
    console.log("🚀 APP: handleSetControls called");
    console.log("🚀 APP: updatedControls.scrollDirection:", updatedControls.scrollDirection);
    console.log("🚀 APP: controls.scrollDirection:", controls.scrollDirection);
    
    setControls(updatedControls);
    sendControlsToBackend(updatedControls, controls);
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

      {/* Main Content - Side-by-side Layout */}
      <main className="flex-grow">
        <div className="flex gap-6 h-full">
          {/* Left Side: Simulator - 1/5 of width when visible */}
          {showSimulator && (
            <div className="w-1/5 flex-shrink-0">
              <LaserSimulator
                lasers={lasers}
                showLaserOrigins={controls.showLaserOrigins}
                hazeDensity={controls.hazeDensity}
                linearGradient={controls.linearGradient}
                fixtures={controls.fixtures}
                masterDimmer={controls.dimmer}
                strobeRate={controls.strobePulseRate}
                pulseRate={controls.strobePulseRate}
                strobeOrPulse={controls.strobeOrPulse}
              />
            </div>
          )}
          
          {/* Right Side: Controls - 4/5 of width, or full width when simulator hidden */}
          <div className={`flex flex-col gap-6 ${showSimulator ? 'flex-grow' : 'w-full'}`}>
            {/* Row 1: Sliders/Beat Modifiers - Full Available Width */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <Controls 
                controls={controls} 
                setControls={handleSetControls} 
                section="global" 
                verticalSliders={true} 
              />
            </div>
            
            {/* Row 2: Visual Presets and Movement Controls */}
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
        </div>
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
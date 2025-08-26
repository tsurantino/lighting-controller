// src/components/controls/ConfigControls.tsx
import React from 'react';
import { useControlsContext } from '../../stores/ControlsContext';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';

const ConfigControls: React.FC = () => {
  const { controls, setControls, isLoading } = useControlsContext();

  const handleSliderChange = (key: keyof typeof controls) => (value: number) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof typeof controls) => () => {
    setControls(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Configuration</h3>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Haze Density */}
      <div>
        <Slider
          label="Haze Density"
          value={controls.hazeDensity}
          onChange={handleSliderChange('hazeDensity')}
          min={0}
          max={100}
          suffix="%"
          color="blue"
        />
        <p className="text-xs text-gray-400 mt-1">
          Controls atmospheric haze effect and beam glow
        </p>
      </div>

      {/* Linear Gradient */}
      <div>
        <Slider
          label="Linear Gradient"
          value={controls.linearGradient}
          onChange={handleSliderChange('linearGradient')}
          min={0}
          max={100}
          suffix="%"
          color="yellow"
        />
        <p className="text-xs text-gray-400 mt-1">
          Adjusts the perceived length of laser beams
        </p>
      </div>

      {/* Show Laser Origins */}
      <div>
        <Toggle
          checked={controls.showLaserOrigins}
          onChange={handleToggle('showLaserOrigins')}
          checkedColor="blue"
          label="Show Laser Origins"
        />
        <p className="text-xs text-gray-400 mt-1">
          Display laser emitter positions on the grid
        </p>
      </div>

      {/* Additional Configuration Options */}
      <div className="border-t border-gray-700 pt-4 space-y-4">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Display Settings
        </h4>
        
        {/* Future config options can go here */}
        <div className="text-xs text-gray-500 italic">
          Additional display options coming soon...
        </div>
      </div>
    </div>
  );
};

export default ConfigControls;
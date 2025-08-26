// src/components/controls/GlobalControls.tsx
import React from 'react';
import { useControlsContext } from '../../stores/ControlsContext';
import { EffectApplication } from '../../types';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';

const GlobalControls: React.FC = () => {
  const { controls, setControls, isLoading } = useControlsContext();

  const handleSliderChange = (key: keyof typeof controls) => (value: number) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof typeof controls) => () => {
    setControls(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleStrobePulseToggle = () => {
    setControls(prev => ({
      ...prev,
      strobeOrPulse: prev.strobeOrPulse === 'strobe' ? 'pulse' : 'strobe',
    }));
  };

  const handleEffectApplicationToggle = () => {
    setControls(prev => ({
      ...prev,
      effectApplication: prev.effectApplication === EffectApplication.All 
        ? EffectApplication.Alternate 
        : EffectApplication.All,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Global Controls</h3>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {/* Master Dimmer */}
      <div>
        <Slider
          label="Master Dimmer"
          value={controls.dimmer}
          onChange={handleSliderChange('dimmer')}
          min={0}
          max={100}
          suffix="%"
          color="blue"
        />
      </div>

      {/* Strobe/Pulse Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">
            {controls.strobeOrPulse === 'strobe' ? 'Strobe' : 'Pulse'}
          </span>
          <Toggle
            checked={controls.strobeOrPulse === 'strobe'}
            onChange={handleStrobePulseToggle}
            checkedColor="red"
          />
        </div>
        
        <Slider
          label={`${controls.strobeOrPulse === 'strobe' ? 'Strobe' : 'Pulse'} Rate`}
          value={controls.strobePulseRate}
          onChange={handleSliderChange('strobePulseRate')}
          min={0}
          max={100}
          color={controls.strobeOrPulse === 'strobe' ? 'red' : 'purple'}
          disabled={controls.beatSyncStrobe && controls.strobeOrPulse === 'strobe'}
        />
      </div>

      {/* Effect Application */}
      <div className="flex items-center justify-between">
        <span className="text-white font-medium">Effect Application</span>
        <Button
          onClick={handleEffectApplicationToggle}
          variant={controls.effectApplication === EffectApplication.All ? 'active' : 'inactive'}
          size="sm"
        >
          {controls.effectApplication === EffectApplication.All ? 'All' : 'Alternate'}
        </Button>
      </div>

      {/* Beat Sync Controls */}
      <div className="space-y-3 border-t border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Beat Sync</h4>
        
        <div className="flex items-center justify-between">
          <span className="text-white">Strobe Beat Sync</span>
          <Toggle
            checked={controls.beatSyncStrobe}
            onChange={handleToggle('beatSyncStrobe')}
            checkedColor="green"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white">Pulse Beat Sync</span>
          <Toggle
            checked={controls.beatSyncPulse}
            onChange={handleToggle('beatSyncPulse')}
            checkedColor="green"
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;
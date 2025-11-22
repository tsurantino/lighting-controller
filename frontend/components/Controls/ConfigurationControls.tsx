import React from 'react';
import { ControlsState, Fixture } from '../../types';
import { ControlSlider, ToggleButton } from '../ui';
import { FixtureConfiguration } from './FixtureConfiguration';

export interface ConfigurationControlsProps {
  controls: ControlsState;
  onSliderChange: (key: keyof ControlsState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (key: keyof ControlsState) => () => void;
  onFixtureUpdate: (fixtureId: keyof ControlsState['fixtures'], fixture: Fixture) => void;
}

export const ConfigurationControls: React.FC<ConfigurationControlsProps> = ({
  controls,
  onSliderChange,
  onToggle,
  onFixtureUpdate
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <ControlSlider label="Haze Density" value={controls.hazeDensity} onChange={onSliderChange('hazeDensity')} />
      <ControlSlider label="Linear Gradient" value={controls.linearGradient} onChange={onSliderChange('linearGradient')} />
      <ToggleButton 
        label="Show Laser Origins"
        enabled={controls.showLaserOrigins} 
        onToggle={onToggle('showLaserOrigins')} 
      />
    </div>
    
    <div className="border-t border-gray-700 pt-6">
      <FixtureConfiguration
        fixtures={controls.fixtures}
        lasers={controls.lasers}
        onFixtureUpdate={onFixtureUpdate}
      />
    </div>
  </div>
);
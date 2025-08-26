// src/components/controls/ModifierButtons.tsx
import React from 'react';
import { ModifierIcons } from '../common/icons';

interface ModifierButtonProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const BuildToggleButton: React.FC<ModifierButtonProps> = ({ 
  enabled, 
  onToggle, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
        ${enabled ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Build Effect Toggle"
      title="Build Effect"
    >
      {ModifierIcons.Build}
      <span className="text-xs font-medium mt-1">Build</span>
    </button>
  );
};

export const PhaseToggleButton: React.FC<ModifierButtonProps> = ({ 
  enabled, 
  onToggle, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
        ${enabled ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Phase Effect Toggle"
      title="Phase Effect"
    >
      {ModifierIcons.Phase}
      <span className="text-xs font-medium mt-1">Phase</span>
    </button>
  );
};

export const LoopToggleButton: React.FC<ModifierButtonProps> = ({ 
  enabled, 
  onToggle, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
        ${enabled ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Loop Effect Toggle"
      title="Loop Effect"
    >
      {ModifierIcons.Loop}
      <span className="text-xs font-medium mt-1">Loop</span>
    </button>
  );
};

export const FadeToggleButton: React.FC<ModifierButtonProps> = ({ 
  enabled, 
  onToggle, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
        ${enabled ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Fade Effect Toggle"
      title="Fade Effect"
    >
      {ModifierIcons.Fade}
      <span className="text-xs font-medium mt-1">Fade</span>
    </button>
  );
};

interface ModifierControlsProps {
  buildEnabled: boolean;
  onBuildToggle: () => void;
  phaseEnabled: boolean;
  onPhaseToggle: () => void;
  loopEnabled: boolean;
  onLoopToggle: () => void;
  fadeEnabled: boolean;
  onFadeToggle: () => void;
  disabled?: boolean;
}

export const ModifierControls: React.FC<ModifierControlsProps> = ({
  buildEnabled,
  onBuildToggle,
  phaseEnabled,
  onPhaseToggle,
  loopEnabled,
  onLoopToggle,
  fadeEnabled,
  onFadeToggle,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      <FadeToggleButton 
        enabled={fadeEnabled} 
        onToggle={onFadeToggle} 
        disabled={disabled} 
      />
      <LoopToggleButton 
        enabled={loopEnabled} 
        onToggle={onLoopToggle} 
        disabled={disabled} 
      />
      <PhaseToggleButton 
        enabled={phaseEnabled} 
        onToggle={onPhaseToggle} 
        disabled={disabled} 
      />
      <BuildToggleButton 
        enabled={buildEnabled} 
        onToggle={onBuildToggle} 
        disabled={disabled} 
      />
    </div>
  );
};
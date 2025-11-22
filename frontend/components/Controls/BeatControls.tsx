import React from 'react';
import { BeatRate, EffectApplication } from '../../types';
import { EffectToggle } from '../ui';

export interface BeatButtonsProps {
  options: BeatRate[];
  selectedValue: BeatRate;
  onSelect: (value: BeatRate) => void;
  disabled?: boolean;
}

export const BeatButtons: React.FC<BeatButtonsProps> = ({ 
  options, 
  selectedValue, 
  onSelect, 
  disabled = false 
}) => (
  <div className={`flex flex-col space-y-2 w-full transition-opacity ${disabled ? 'opacity-50' : ''}`}>
    {options.map(option => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        disabled={disabled}
        className={`px-2 py-1.5 text-sm rounded-md transition-colors duration-200
          ${selectedValue === option ? 'bg-red-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        {option}
      </button>
    ))}
  </div>
);

export interface BeatSyncControlsProps {
  enabled: boolean;
  onToggle: () => void;
  bpm: number;
  onBpmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  effectApplication: EffectApplication;
  onEffectApplicationToggle: () => void;
  strobeOrPulse: 'strobe' | 'pulse';
  onStrobePulseToggle: () => void;
}

export const BeatSyncControls: React.FC<BeatSyncControlsProps> = ({ 
  enabled, 
  onToggle, 
  bpm, 
  onBpmChange, 
  effectApplication, 
  onEffectApplicationToggle, 
  strobeOrPulse, 
  onStrobePulseToggle 
}) => (
  <div className="grid grid-cols-6 gap-2 pt-4 items-center">
    <button
      onClick={onToggle}
      className={`col-span-2 p-2 rounded-md font-semibold transition-colors ${
        enabled ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      Beat Sync {enabled ? 'On' : 'Off'}
    </button>
    <div className="relative">
      <input
        type="number"
        value={bpm}
        onChange={onBpmChange}
        disabled={!enabled}
        className={`w-full text-center bg-gray-700 rounded-md p-2 font-semibold transition-opacity ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">BPM</span>
    </div>
    <EffectToggle
      options={['Strobe', 'Pulse']}
      value={strobeOrPulse === 'strobe' ? 'Strobe' : 'Pulse'}
      onToggle={onStrobePulseToggle}
      compact={true}
    />
    <EffectToggle
      options={['All', 'Alternate']}
      value={effectApplication === EffectApplication.All ? 'All' : 'Alternate'}
      onToggle={onEffectApplicationToggle}
      compact={true}
    />
  </div>
);
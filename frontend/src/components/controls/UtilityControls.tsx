// src/components/controls/UtilityControls.tsx
import React from 'react';
import { BeatRate } from '../../types';

interface LaserCountButtonsProps {
  count: number;
  setCount: (value: number) => void;
  disabled: boolean;
}

export const LaserCountButtons: React.FC<LaserCountButtonsProps> = ({ 
  count, 
  setCount, 
  disabled 
}) => {
  const options = [1, 2, 4, 8];
  
  return (
    <div className={`transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-4 gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => setCount(option)}
            disabled={disabled}
            className={`px-2 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200
              ${count === option ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

interface BeatButtonsProps {
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

interface NumberSelectorProps {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
        {label}
      </label>
      <div className={`grid gap-2 transition-opacity ${disabled ? 'opacity-50' : ''}`}
           style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
        {options.map(option => (
          <button
            key={option}
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`px-2 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200
              ${value === option ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

interface VerticalSliderWithBeatProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  beatOptions?: BeatRate[];
  selectedBeatRate?: BeatRate;
  onValueChange: (value: number) => void;
  onBeatRateChange?: (beatRate: BeatRate) => void;
  beatSyncEnabled?: boolean;
  disabled?: boolean;
  color?: 'blue' | 'red' | 'green' | 'purple' | 'yellow';
}

export const VerticalSliderWithBeat: React.FC<VerticalSliderWithBeatProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  beatOptions = [],
  selectedBeatRate,
  onValueChange,
  onBeatRateChange,
  beatSyncEnabled = false,
  disabled = false,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'accent-blue-500',
    red: 'accent-red-500',
    green: 'accent-green-500',
    purple: 'accent-purple-500',
    yellow: 'accent-yellow-500',
  };

  return (
    <div className="flex space-x-4">
      {/* Vertical Slider */}
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <label className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {label}
          </label>
          <span className={`text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>
            {value}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          disabled={disabled || beatSyncEnabled}
          className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${
            colorClasses[color]
          } ${disabled || beatSyncEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Beat Rate Buttons */}
      {beatOptions.length > 0 && onBeatRateChange && selectedBeatRate && (
        <div className="w-20">
          <BeatButtons
            options={beatOptions}
            selectedValue={selectedBeatRate}
            onSelect={onBeatRateChange}
            disabled={disabled || !beatSyncEnabled}
          />
        </div>
      )}
    </div>
  );
};
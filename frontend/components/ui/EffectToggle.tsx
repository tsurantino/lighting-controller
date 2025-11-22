import React from 'react';

export interface EffectToggleProps {
  options: [string, string];
  value: string;
  onToggle: () => void;
  compact?: boolean;
}

export const EffectToggle: React.FC<EffectToggleProps> = ({ 
  options, 
  value, 
  onToggle, 
  compact = false 
}) => (
  <div className={compact ? "flex" : "flex flex-col items-center space-y-2"}>
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-md font-semibold text-white transition-colors ${
        compact ? 'text-sm' : ''
      } bg-gray-700 hover:bg-gray-600`}
    >
      {value === options[0] ? options[0] : options[1]}
    </button>
  </div>
);
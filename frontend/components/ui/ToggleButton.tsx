import React from 'react';

export interface ToggleButtonProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm text-gray-300" id={`label-for-${label.replace(/\s+/g, '-')}`}>{label}</label>
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-labelledby={`label-for-${label.replace(/\s+/g, '-')}`}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
        enabled ? 'bg-red-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);
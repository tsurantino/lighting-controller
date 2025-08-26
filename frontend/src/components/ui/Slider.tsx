// src/components/ui/Slider.tsx
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  color?: 'blue' | 'red' | 'green' | 'purple' | 'yellow';
  suffix?: string;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  color = 'blue',
  suffix = '',
  className = '',
}) => {
  const colorClasses = {
    blue: 'accent-blue-500',
    red: 'accent-red-500',
    green: 'accent-green-500',
    purple: 'accent-purple-500',
    yellow: 'accent-yellow-500',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
          {label}
        </label>
        <span className={`text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${
          colorClasses[color]
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};
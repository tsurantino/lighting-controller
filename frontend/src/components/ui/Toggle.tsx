// src/components/ui/Toggle.tsx
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  checkedColor?: 'red' | 'green' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  checkedColor = 'red',
  size = 'md',
  label,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-10 h-6',
    lg: 'w-12 h-7',
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const translateClasses = {
    sm: checked ? 'translate-x-3' : 'translate-x-1',
    md: checked ? 'translate-x-4' : 'translate-x-1',
    lg: checked ? 'translate-x-5' : 'translate-x-1',
  };

  const colorClasses = {
    red: 'bg-red-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
  };

  const component = (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`${sizeClasses[size]} rounded-full p-1 transition-colors duration-200 ${
        checked ? colorClasses[checkedColor] : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`${thumbSizeClasses[size]} inline-block transform bg-white rounded-full transition-transform duration-200 ${translateClasses[size]}`}
      />
    </button>
  );

  if (label) {
    return (
      <div className="flex items-center justify-between">
        <span className={`text-white font-medium ${disabled ? 'text-gray-500' : ''}`}>
          {label}
        </span>
        {component}
      </div>
    );
  }

  return component;
};

export default Toggle;
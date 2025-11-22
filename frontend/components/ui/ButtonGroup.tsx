import React from 'react';

export interface ButtonGroupProps<T extends string> {
  label?: string;
  options: T[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export const ButtonGroup = <T extends string>({ 
  label, 
  options, 
  selectedValue, 
  onSelect 
}: ButtonGroupProps<T>) => (
  <div className="flex flex-col space-y-2">
    {label && <label className="text-sm text-gray-300">{label}</label>}
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-2 py-1.5 text-sm rounded-md transition-colors duration-200
            ${selectedValue === option ? 'bg-red-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);
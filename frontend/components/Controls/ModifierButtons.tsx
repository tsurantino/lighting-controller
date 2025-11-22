import React from 'react';

const scrollIconBaseClass = "w-8 h-8 mx-auto";

export interface ModifierButtonProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const BuildToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${scrollIconBaseClass}`}><title>Build</title><circle cx="12" cy="12" r="6"/></svg>
      <span className="text-xs font-medium mt-1">Build</span>
    </button>
  );
};

export const PhaseToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={scrollIconBaseClass}>
        <title>Phase</title>
        <path d="M3 12q2-5 4-5t4 5 4-5 4 5" opacity="0.5" />
        <path d="M3 12q2 5 4 5t4-5 4 5 4-5" />
      </svg>
      <span className="text-xs font-medium mt-1">Phase</span>
    </button>
  );
};

export const LoopToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Loop Center</title><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
      <span className="text-xs font-medium mt-1">Loop</span>
    </button>
  );
};

export const FadeToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Fade</title><path d="M3 10h2v4H3z"/><path d="M7 10h2v4H7z" opacity="0.7"/><path d="M11 10h2v4h-2z" opacity="0.4"/><path d="M15 10h2v4h-2z" opacity="0.2"/><path d="M19 10h2v4h-2z" opacity="0.1"/></svg>
      <span className="text-xs font-medium mt-1">Fade</span>
    </button>
  );
};

export interface LaserCountButtonsProps {
  count: number;
  setCount: (value: number) => void;
  disabled: boolean;
}

export const LaserCountButtons: React.FC<LaserCountButtonsProps> = ({ count, setCount, disabled }) => {
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
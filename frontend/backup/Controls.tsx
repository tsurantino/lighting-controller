import React, { useState } from 'react';
import { ControlsState, VisualPreset, ScrollDirection, EffectApplication, BeatRate, Fixture, FixtureType, MovingHeadFixture, SaberBeamFixture, JoltFixture, ShockerFixture, LaserOrientation, LaserData } from '../types';

interface ControlsProps {
  controls: ControlsState;
  setControls: React.Dispatch<React.SetStateAction<ControlsState>>;
  section?: 'global' | 'beat' | 'visual' | 'movement' | 'config';
  verticalSliders?: boolean;
}

interface ControlSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  vertical?: boolean;
}

interface EffectToggleProps {
  options: [string, string];
  value: string;
  onToggle: () => void;
  compact?: boolean;
}

const EffectToggle: React.FC<EffectToggleProps> = ({ options, value, onToggle, compact = false }) => (
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


const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, min = 0, max = 100, step = 1, onChange, disabled = false, vertical = false }) => {
  const percentage = Math.round(((value - min) / (max - min)) * 100);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  
  if (vertical) {
    const calculateValueFromPosition = (clientY: number, rect: DOMRect) => {
      const relativeY = rect.bottom - clientY;
      const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    };

    const updateValue = (newValue: number) => {
      const syntheticEvent = {
        target: { value: newValue.toString() },
        currentTarget: { value: newValue.toString() }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    };

    const handleStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      isDraggingRef.current = true;
      const rect = sliderRef.current!.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newValue = calculateValueFromPosition(clientY, rect);
      updateValue(newValue);
    };

    const handleMove = React.useCallback((e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || disabled || !sliderRef.current) return;
      e.preventDefault();
      const rect = sliderRef.current.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newValue = calculateValueFromPosition(clientY, rect);
      updateValue(newValue);
    }, [disabled, min, max, step, onChange]);

    const handleEnd = React.useCallback(() => {
      isDraggingRef.current = false;
    }, []);

    React.useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleTouchMove = (e: TouchEvent) => handleMove(e);
      const handleMouseUp = () => handleEnd();
      const handleTouchEnd = () => handleEnd();

      if (isDraggingRef.current) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleTouchEnd);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }, [handleMove, handleEnd]);

    return (
      <div className={`flex flex-col items-center space-y-3 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
        <label className="text-sm text-gray-300 text-center font-medium">{label}</label>
        <div 
          ref={sliderRef}
          className="slider-vertical-wrapper"
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{ 
            cursor: disabled ? 'not-allowed' : 'pointer',
            touchAction: 'none'
          }}
        >
          <div className="slider-vertical-track"></div>
          <div 
            className={`slider-vertical-fill ${percentage === 100 ? 'full' : ''}`}
            style={{ height: `${percentage}%` }}
          ></div>
          <div className="slider-vertical-percentage">
            {percentage}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-1 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <label className="flex justify-between text-sm text-gray-300">
        <span>{label}</span>
        <span>{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none accent-red-500 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
    </div>
  );
};

interface ButtonGroupProps<T extends string> {
  label?: string;
  options: T[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

const ButtonGroup = <T extends string>({ label, options, selectedValue, onSelect }: ButtonGroupProps<T>) => (
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

interface ToggleButtonProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, enabled, onToggle }) => (
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

const scrollIconBaseClass = "w-8 h-8 mx-auto";

const SCROLL_ICONS: Record<ScrollDirection, { label: string, icon: React.ReactNode }> = {
  [ScrollDirection.None]: { label: 'None', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>None</title><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> },
  [ScrollDirection.Spot]: { label: 'Spot', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Spot</title><circle cx="6" cy="6" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="8" cy="17" r="2"/><circle cx="18" cy="15" r="2"/><circle cx="18" cy="5" r="2"/></svg>},
  [ScrollDirection.RightToLeft]: { label: 'Left', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Left</title><path d="M6 12l5-5v4h8v2h-8v5z" /></svg> },
  [ScrollDirection.LeftToRight]: { label: 'Right', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Right</title><path d="M18 12l-5 5v-4H5v-2h8V7z" /></svg> },
  [ScrollDirection.BottomToTop]: { label: 'Up', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Up</title><path d="M12 6L7 11h4v7h2v-7h4z" /></svg> },
  [ScrollDirection.TopToBottom]: { label: 'Down', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Down</title><path d="M12 18l5-5h-4V6h-2v7H7z" /></svg> },
  [ScrollDirection.ToTL]: { label: 'To TL', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>To Top Left</title><path transform="rotate(-45 12 12)" d="M12 6L7 11h4v7h2v-7h4z" /></svg> },
  [ScrollDirection.ToTR]: { label: 'To TR', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>To Top Right</title><path transform="rotate(45 12 12)" d="M12 6L7 11h4v7h2v-7h4z" /></svg> },
  [ScrollDirection.ToBL]: { label: 'To BL', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>To Bottom Left</title><path transform="rotate(-135 12 12)" d="M12 6L7 11h4v7h2v-7h4z" /></svg> },
  [ScrollDirection.ToBR]: { label: 'To BR', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>To Bottom Right</title><path transform="rotate(135 12 12)" d="M12 6L7 11h4v7h2v-7h4z" /></svg> },
  [ScrollDirection.OutFromCenter]: { label: 'Out', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Out from Center</title><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg> },
  [ScrollDirection.TowardsCenter]: { label: 'In', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Towards Center</title><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg> },
  [ScrollDirection.Pinwheel]: { label: 'Pinwheel', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={scrollIconBaseClass}><title>Pinwheel</title><path d="M12 12L22 10v4L12 12zm0 0l-10 2V8l10 2zm0 0l-2 10h4l-2-10zm0 0l2-10H10l2 10z"/></svg> },
};

const ScrollButton: React.FC<{
  direction: ScrollDirection,
  selectedDirection: ScrollDirection,
  onSelect: (direction: ScrollDirection) => void
}> = ({ direction, selectedDirection, onSelect }) => {
  const iconInfo = SCROLL_ICONS[direction];
  return (
    <button
      onClick={() => {
        // Add debugging here
        console.log("🎯 FRONTEND: ScrollButton clicked for direction:", direction);
        console.log("🎯 FRONTEND: Is this the None button?", direction === ScrollDirection.None);
        console.log("🎯 FRONTEND: About to call onSelect with:", direction);
        onSelect(direction);
      }}
      className={`px-2 py-4 rounded-md transition-colors duration-200 flex items-center justify-center
        ${selectedDirection === direction ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
      aria-label={iconInfo.label}
      title={iconInfo.label}
    >
      {iconInfo.icon}
    </button>
  );
}

const MovementPresetButton: React.FC<{
  preset: ScrollDirection;
  selectedPreset: ScrollDirection;
  onSelect: (preset: ScrollDirection) => void;
}> = ({ preset, selectedPreset, onSelect }) => {
  const iconInfo = SCROLL_ICONS[preset];
  return (
    <button
      onClick={() => onSelect(preset)}
      className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
        ${selectedPreset === preset ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
      {iconInfo.icon}
      <span className="text-xs font-medium mt-1">{iconInfo.label}</span>
    </button>
  );
};

interface ModifierButtonProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const BuildToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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

const PhaseToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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

const LoopToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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

const FadeToggleButton: React.FC<ModifierButtonProps> = ({ enabled, onToggle, disabled = false }) => {
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

const visualIconBase = "w-8 h-8 mx-auto mb-1";
const VISUAL_ICONS: Record<VisualPreset, React.ReactNode> = {
  [VisualPreset.Grid]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>,
  [VisualPreset.Bracket]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><path d="M8 3H5a2 2 0 0 0-2 2v3m14-5h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3m14 5h3a2 2 0 0 0 2-2v-3"/></svg>,
  [VisualPreset.LBracket]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><path d="M14 3h7v7M3 10V3h7m11 4v7h-7M10 21v-7H3"/></svg>,
  [VisualPreset.SCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>,
  [VisualPreset.Cross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/></svg>,
  [VisualPreset.LCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>,
  [VisualPreset.SDblCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M11 5h2v14h-2V5zM5 8h14v2H5V8zm0 6h14v2H5v-2z" /></svg>,
  [VisualPreset.DblCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M10 4h4v16h-4V4zM4 7h16v2H4V7zm0 8h16v2H4v-2z"/></svg>,
  [VisualPreset.LDblCross]: <svg viewBox="0 0 24 24" fill="currentColor" className={visualIconBase}><path d="M9 3h6v18H9V3zM3 6h18v2H3V6zm0 10h18v2H3v-2z"/></svg>,
  [VisualPreset.Cube]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><rect x="4" y="4" width="16" height="16" rx="1"/></svg>,
  [VisualPreset.FourCubes]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={visualIconBase}><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>,
  [VisualPreset.NineCubes]: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={visualIconBase}><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
};

interface VisualButtonProps {
  preset: VisualPreset;
  selectedPreset: VisualPreset;
  onSelect: (preset: VisualPreset) => void;
}

const VisualButton: React.FC<VisualButtonProps> = ({ preset, selectedPreset, onSelect }) => (
  <button
    onClick={() => onSelect(preset)}
    className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
      ${selectedPreset === preset ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
  >
    {VISUAL_ICONS[preset]}
    <span className="text-xs font-medium">{preset}</span>
  </button>
);

const LaserCountButtons: React.FC<{
  count: number;
  setCount: (value: number) => void;
  disabled: boolean;
}> = ({ count, setCount, disabled }) => {
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

const BeatButtons: React.FC<{
  options: BeatRate[];
  selectedValue: BeatRate;
  onSelect: (value: BeatRate) => void;
  disabled?: boolean;
}> = ({ options, selectedValue, onSelect, disabled = false }) => (
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

interface VerticalSliderWithBeatProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sliderDisabled?: boolean;
  beatRate: BeatRate;
  onBeatRateChange: (rate: BeatRate) => void;
  beatDisabled?: boolean;
  beatRateOptions: BeatRate[];
  isStrobePulse?: boolean;
  strobeOrPulse?: 'strobe' | 'pulse';
  onStrobePulseToggle?: () => void;
  effectApplication?: EffectApplication;
  onEffectApplicationToggle?: () => void;
}

const VerticalSliderWithBeat: React.FC<VerticalSliderWithBeatProps> = ({
  label, value, min, max, onChange, sliderDisabled,
  beatRate, onBeatRateChange, beatDisabled, beatRateOptions,
  isStrobePulse, strobeOrPulse, onStrobePulseToggle,
  effectApplication, onEffectApplicationToggle
}) => (
  <div className="flex flex-col items-center space-y-3">
    <ControlSlider
      label={label}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      disabled={sliderDisabled}
      vertical={true}
    />
    <BeatButtons
      options={beatRateOptions}
      selectedValue={beatRate}
      onSelect={onBeatRateChange}
      disabled={beatDisabled}
    />
  </div>
);

const BeatSyncControls: React.FC<{
  enabled: boolean;
  onToggle: () => void;
  bpm: number;
  onBpmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  effectApplication: EffectApplication;
  onEffectApplicationToggle: () => void;
  strobeOrPulse: 'strobe' | 'pulse';
  onStrobePulseToggle: () => void;
}> = ({ enabled, onToggle, bpm, onBpmChange, effectApplication, onEffectApplicationToggle, strobeOrPulse, onStrobePulseToggle }) => (
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

const LaserConfigTab: React.FC<{
  lasers?: LaserData[];
}> = ({ lasers }) => {
  if (!lasers || lasers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>Laser data not available</p>
        <p className="text-sm mt-2">Connect to laser simulator to view DMX status</p>
      </div>
    );
  }

  const topLasers = lasers.filter(l => l.orientation === LaserOrientation.Top);
  const sideLasers = lasers.filter(l => l.orientation === LaserOrientation.Side);

  const LaserTable: React.FC<{ title: string; lasers: LaserData[] }> = ({ title, lasers }) => (
    <div className="mb-6">
      <h5 className="text-sm font-medium text-gray-300 mb-3">{title}</h5>
      <div className="grid grid-cols-7 gap-2 text-xs">
        {/* Header */}
        <div className="font-medium text-gray-400">ID</div>
        <div className="font-medium text-gray-400">DMX</div>
        <div className="font-medium text-gray-400">Value</div>
        <div className="font-medium text-gray-400">ID</div>
        <div className="font-medium text-gray-400">DMX</div>
        <div className="font-medium text-gray-400">Value</div>
        <div></div> {/* Spacer */}
        
        {/* Data rows - 2 lasers per row */}
        {Array.from({ length: Math.ceil(lasers.length / 2) }).map((_, rowIndex) => {
          const leftLaser = lasers[rowIndex * 2];
          const rightLaser = lasers[rowIndex * 2 + 1];
          
          return (
            <React.Fragment key={rowIndex}>
              {/* Left laser */}
              <div className="text-white">{leftLaser.id}</div>
              <div className="text-blue-400 font-mono">{leftLaser.dmxAddress}</div>
              <div className={`font-mono ${leftLaser.brightness > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {leftLaser.brightness}
              </div>
              
              {/* Right laser */}
              {rightLaser ? (
                <>
                  <div className="text-white">{rightLaser.id}</div>
                  <div className="text-blue-400 font-mono">{rightLaser.dmxAddress}</div>
                  <div className={`font-mono ${rightLaser.brightness > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {rightLaser.brightness}
                  </div>
                </>
              ) : (
                <>
                  <div></div>
                  <div></div>
                  <div></div>
                </>
              )}
              <div></div> {/* Spacer */}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-400 mb-4">
        <div>Total Lasers: {lasers.length}</div>
        <div>Active: {lasers.filter(l => l.brightness > 0).length}</div>
      </div>
      
      <LaserTable title="Top Lasers (Left to Right)" lasers={topLasers} />
      <LaserTable title="Side Lasers (Top to Bottom)" lasers={sideLasers} />
      
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-blue-400">DMX:</span> DMX Address
          </div>
          <div>
            <span className="text-red-400">Value:</span> Current Output (0-255)
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixture Configuration Components
const FixtureConfigTab: React.FC<{
  fixture: Fixture | 'LAS';  // Update this type
  lasers?: LaserData[];      // Add this prop
  onUpdate: (fixture: Fixture) => void;
}> = ({ fixture, lasers, onUpdate }) => {
  if (fixture === 'LAS') {
    return <LaserConfigTab lasers={lasers} />;
  }

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      ...fixture,
      position: {
        ...fixture.position,
        [axis]: value
      }
    });
  };

  const handleStartDmxChange = (value: number) => {
    onUpdate({
      ...fixture,
      startDmxAddress: value
    });
  };

  const renderFixtureSpecificConfig = () => {
    switch (fixture.type) {
      case FixtureType.MovingHead:
        const mhFixture = fixture as MovingHeadFixture;
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">DMX Channels (Read-only)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div>DMX_1_PANMOVE: {mhFixture.dmxChannels.DMX_1_PANMOVE}</div>
                <div>DMX_2_TILTMOVE: {mhFixture.dmxChannels.DMX_2_TILTMOVE}</div>
                <div>DMX_3_COLORS: {mhFixture.dmxChannels.DMX_3_COLORS}</div>
                <div>DMX_4_GOBO: {mhFixture.dmxChannels.DMX_4_GOBO}</div>
                <div>DMX_5_SHUTTERSTROBE: {mhFixture.dmxChannels.DMX_5_SHUTTERSTROBE}</div>
                <div>DMX_6_DIMMER: {mhFixture.dmxChannels.DMX_6_DIMMER}</div>
              </div>
              <div className="space-y-1">
                <div>DMX_7_MACRO: {mhFixture.dmxChannels.DMX_7_MACRO}</div>
                <div>DMX_8_PanTiltMacroSpeed: {mhFixture.dmxChannels.DMX_8_PanTiltMacroSpeed}</div>
                <div>DMX_9_DIMMERCURVE: {mhFixture.dmxChannels.DMX_9_DIMMERCURVE}</div>
                <div>DMX_10_PANTILTMOVEMENTSPEED: {mhFixture.dmxChannels.DMX_10_PANTILTMOVEMENTSPEED}</div>
                <div>DMX_11_SPECIALFUNC: {mhFixture.dmxChannels.DMX_11_SPECIALFUNC}</div>
              </div>
            </div>
          </div>
        );
      
      case FixtureType.SaberBeam:
        const saFixture = fixture as SaberBeamFixture;
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">DMX Channels (Read-only)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>DMX_1_RED: {saFixture.dmxChannels.DMX_1_RED}</div>
              <div>DMX_2_GREEN: {saFixture.dmxChannels.DMX_2_GREEN}</div>
              <div>DMX_3_BLUE: {saFixture.dmxChannels.DMX_3_BLUE}</div>
              <div>DMX_4_WHITE: {saFixture.dmxChannels.DMX_4_WHITE}</div>
            </div>
          </div>
        );
      
      case FixtureType.Jolt:
        const jFixture = fixture as JoltFixture;
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">DMX Channels (Read-only)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div>DMX_1_RED_Z1: {jFixture.dmxChannels.DMX_1_RED_Z1}</div>
                <div>DMX_2_GREEN_Z1: {jFixture.dmxChannels.DMX_2_GREEN_Z1}</div>
                <div>DMX_3_BLUE_Z1: {jFixture.dmxChannels.DMX_3_BLUE_Z1}</div>
                <div>DMX_4_WHITE_Z1: {jFixture.dmxChannels.DMX_4_WHITE_Z1}</div>
                <div>DMX_5_RED_Z2: {jFixture.dmxChannels.DMX_5_RED_Z2}</div>
                <div>DMX_6_GREEN_Z2: {jFixture.dmxChannels.DMX_6_GREEN_Z2}</div>
              </div>
              <div className="space-y-1">
                <div>DMX_7_BLUE_Z2: {jFixture.dmxChannels.DMX_7_BLUE_Z2}</div>
                <div>DMX_8_WHITE_Z2: {jFixture.dmxChannels.DMX_8_WHITE_Z2}</div>
                <div>DMX_9_RED_Z3: {jFixture.dmxChannels.DMX_9_RED_Z3}</div>
                <div>DMX_10_GREEN_Z3: {jFixture.dmxChannels.DMX_10_GREEN_Z3}</div>
                <div>DMX_11_BLUE_Z3: {jFixture.dmxChannels.DMX_11_BLUE_Z3}</div>
                <div>DMX_12_WHITE_Z3: {jFixture.dmxChannels.DMX_12_WHITE_Z3}</div>
              </div>
            </div>
          </div>
        );
      
      case FixtureType.Shocker:
        const shFixture = fixture as ShockerFixture;
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">DMX Channels (Read-only)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div>DMX_1_Z1: {shFixture.dmxChannels.DMX_1_Z1}</div>
                <div>DMX_2_Z2: {shFixture.dmxChannels.DMX_2_Z2}</div>
                <div>DMX_3_Z3: {shFixture.dmxChannels.DMX_3_Z3}</div>
                <div>DMX_4_Z4: {shFixture.dmxChannels.DMX_4_Z4}</div>
              </div>
              <div className="space-y-1">
                <div>DMX_5_PROGRAM: {shFixture.dmxChannels.DMX_5_PROGRAM}</div>
                <div>DMX_6_AUTOSPEED: {shFixture.dmxChannels.DMX_6_AUTOSPEED}</div>
                <div>DMX_7_DIMMER: {shFixture.dmxChannels.DMX_7_DIMMER}</div>
                <div>DMX_8_STROBEALL: {shFixture.dmxChannels.DMX_8_STROBEALL}</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Position X (0-13)</label>
          <input
            type="number"
            min={0}
            max={13}
            value={fixture.position.x}
            onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Position Y (0-13)</label>
          <input
            type="number"
            min={0}
            max={13}
            value={fixture.position.y}
            onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-300 mb-1">Start DMX Address</label>
        <input
          type="number"
          min={1}
          max={512}
          value={fixture.startDmxAddress}
          onChange={(e) => handleStartDmxChange(parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>
      
      {renderFixtureSpecificConfig()}
    </div>
  );
};

const FixtureConfiguration: React.FC<{
  fixtures: ControlsState['fixtures'];
  lasers?: LaserData[];
  onFixtureUpdate: (fixtureId: keyof ControlsState['fixtures'], fixture: Fixture) => void;
}> = ({ fixtures, lasers, onFixtureUpdate }) => {
  const [activeTab, setActiveTab] = useState<keyof ControlsState['fixtures'] | 'LAS'>('MH1');
  
  const fixtureIds = Object.keys(fixtures) as (keyof ControlsState['fixtures'])[];
  const allTabs = [...fixtureIds, 'LAS' as const];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Fixture Configuration</h3>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {allTabs.map((tabId) => ( // CHANGE from fixtureIds to allTabs
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tabId
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tabId}
          </button>
        ))}
      </div>
      
      {/* Active Tab Content */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-md font-medium text-white mb-4">
          {activeTab === 'LAS' ? 'Laser DMX Status' : `${activeTab} Configuration`}
        </h4>
        <FixtureConfigTab
          fixture={activeTab === 'LAS' ? 'LAS' : fixtures[activeTab]}
          lasers={lasers} 
          onUpdate={(fixture) => {
            if (activeTab !== 'LAS') {
              onFixtureUpdate(activeTab, fixture);
            }
          }}
        />
      </div>
    </div>
  );
};


const Controls: React.FC<ControlsProps> = ({ controls, setControls, section, verticalSliders = false }) => {
  const handleVisualSelect = (preset: VisualPreset) => {
    setControls(prev => ({...prev, visualPreset: preset}));
  }

  const handleSliderChange = (key: keyof ControlsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setControls(prev => ({ ...prev, [key]: value }));
  };
  
  const handleScrollSelect = (direction: ScrollDirection) => {
    // Add debugging to see if this function is being called
    console.log("🎯 FRONTEND: handleScrollSelect called with:", direction);
    console.log("🎯 FRONTEND: Direction type:", typeof direction);
    console.log("🎯 FRONTEND: Direction value:", direction);
    console.log("🎯 FRONTEND: Direction === ScrollDirection.None?", direction === ScrollDirection.None);
    
    setControls(prev => {
      const newState = {...prev, scrollDirection: direction};
      console.log("🎯 FRONTEND: Previous scrollDirection:", prev.scrollDirection);
      console.log("🎯 FRONTEND: New scrollDirection:", newState.scrollDirection);
      console.log("🎯 FRONTEND: Values are different?", prev.scrollDirection !== direction);
      return newState;
    });
  }

  const handleToggle = (key: keyof ControlsState) => () => {
    setControls(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleBuildToggle = () => {
    setControls(prev => {
      const isTurningOn = !prev.scrollBuildEffect;
      
      if (isTurningOn) {
        const isDirectionless = prev.scrollDirection === ScrollDirection.None || prev.scrollDirection === ScrollDirection.Spot;
        const newControls: Partial<ControlsState> = {
          scrollBuildEffect: true,
          loopEffect: false,
          scrollPhase: 0,
          scrollFade: 90,
        };

        if (isDirectionless) {
          newControls.scrollDirection = ScrollDirection.LeftToRight;
        }
        
        return { ...prev, ...newControls };
      } else {
        return { ...prev, scrollBuildEffect: false };
      }
    });
  };

  const handlePhaseToggle = () => {
    setControls(prev => ({
      ...prev,
      scrollPhase: prev.scrollPhase > 0 ? 0 : 35,
    }));
  };
  
  const handleFadeToggle = () => {
    setControls(prev => ({
      ...prev,
      scrollFade: prev.scrollFade === 20 ? 90 : 20,
    }))
  }

  const handleLaserCountChange = (value: number) => {
    setControls(prev => ({...prev, scrollLaserCount: value}));
  };

  const handleStrobePulseToggle = () => {
    setControls(prev => ({
      ...prev,
      strobeOrPulse: prev.strobeOrPulse === 'strobe' ? 'pulse' : 'strobe',
    }));
  };

  const handleEffectApplicationToggle = () => {
    setControls(prev => ({
      ...prev,
      effectApplication: prev.effectApplication === EffectApplication.All ? EffectApplication.Alternate : EffectApplication.All
    }));
  };

  const handleFixtureUpdate = (fixtureId: keyof ControlsState['fixtures'], fixture: Fixture) => {
    setControls(prev => ({
      ...prev,
      fixtures: {
        ...prev.fixtures,
        [fixtureId]: fixture
      }
    }));
  };

  const handleBeatModifierChange = (
    modifier: 'beatStrobeRate' | 'beatPulseRate' | 'beatLaserMoveSpeedRate' | 'beatShockerSpeedRate' | 'beatSaberSpeedRate' | 'beatMhSpeedRate'  // Add beatMhSpeedRate
  ) => (rate: BeatRate) => {
    setControls(prev => ({ ...prev, [modifier]: rate }));
  };


  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setControls(prev => ({ ...prev, bpm: value }));
    }
  };

  const isScrollActive = controls.scrollDirection !== ScrollDirection.None;
  const isStandardScrollActive = isScrollActive && controls.scrollDirection !== ScrollDirection.Spot;
  const isBeatStrobeActive = controls.beatSyncEnabled && controls.beatStrobeRate !== 'Off';
  const isBeatPulseActive = controls.beatSyncEnabled && controls.beatPulseRate !== 'Off';
  const isBeatStrobePulseActive = controls.strobeOrPulse === 'strobe' ? isBeatStrobeActive : isBeatPulseActive;
  const isBeatLaserMoveSpeedActive = controls.beatSyncEnabled && controls.beatLaserMoveSpeedRate !== 'Off';
  const isBeatShockerSpeedActive = controls.beatSyncEnabled && controls.beatShockerSpeedRate !== 'Off';
  const isBeatSaberSpeedActive = controls.beatSyncEnabled && controls.beatSaberSpeedRate !== 'Off';
  const isBeatMhSpeedActive = controls.beatSyncEnabled && controls.beatMhSpeedRate !== 'Off';

  const beatRateOptions: BeatRate[] = ['Off', '1/3', '1/2', '1', '3', '4'];

  const renderGlobalControls = () => {
    if (verticalSliders) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-x-4">
            <ControlSlider 
              label="Dimmer" 
              value={controls.dimmer} 
              onChange={handleSliderChange('dimmer')} 
              vertical={true}
            />
            <VerticalSliderWithBeat
              label="Strobe/Pulse"
              value={controls.strobePulseRate}
              onChange={handleSliderChange('strobePulseRate')}
              sliderDisabled={isBeatStrobePulseActive}
              beatRate={controls.strobeOrPulse === 'strobe' ? controls.beatStrobeRate : controls.beatPulseRate}
              onBeatRateChange={handleBeatModifierChange(controls.strobeOrPulse === 'strobe' ? 'beatStrobeRate' : 'beatPulseRate')}
              beatDisabled={!controls.beatSyncEnabled}
              beatRateOptions={beatRateOptions}
            />
            <VerticalSliderWithBeat
              label="Laser Move Speed"
              value={controls.laserMoveSpeed}
              min={1}
              onChange={handleSliderChange('laserMoveSpeed')}
              sliderDisabled={isBeatLaserMoveSpeedActive}
              beatRate={controls.beatLaserMoveSpeedRate}
              onBeatRateChange={handleBeatModifierChange('beatLaserMoveSpeedRate')}
              beatDisabled={!controls.beatSyncEnabled}
              beatRateOptions={beatRateOptions}
            />
            <VerticalSliderWithBeat
              label="Shocker Move Speed"
              value={controls.shockerSpeed}
              min={1}
              onChange={handleSliderChange('shockerSpeed')}
              sliderDisabled={isBeatShockerSpeedActive}
              beatRate={controls.beatShockerSpeedRate}
              onBeatRateChange={handleBeatModifierChange('beatShockerSpeedRate')}
              beatDisabled={!controls.beatSyncEnabled}
              beatRateOptions={beatRateOptions}
            />
            <VerticalSliderWithBeat
              label="Saber Move Speed"
              value={controls.saberSpeed}
              min={1}
              onChange={handleSliderChange('saberSpeed')}
              sliderDisabled={isBeatSaberSpeedActive}
              beatRate={controls.beatSaberSpeedRate}
              onBeatRateChange={handleBeatModifierChange('beatSaberSpeedRate')}
              beatDisabled={!controls.beatSyncEnabled}
              beatRateOptions={beatRateOptions}
            />
            <VerticalSliderWithBeat
              label="MH Move Speed"
              value={controls.mhSpeed}
              min={1}
              onChange={handleSliderChange('mhSpeed')}
              sliderDisabled={isBeatMhSpeedActive}
              beatRate={controls.beatMhSpeedRate}
              onBeatRateChange={handleBeatModifierChange('beatMhSpeedRate')}
              beatDisabled={!controls.beatSyncEnabled}
              beatRateOptions={beatRateOptions}
            />
          </div>
          <BeatSyncControls
            enabled={controls.beatSyncEnabled}
            onToggle={handleToggle('beatSyncEnabled')}
            bpm={controls.bpm}
            onBpmChange={handleBpmChange}
            effectApplication={controls.effectApplication}
            onEffectApplicationToggle={handleEffectApplicationToggle}
            strobeOrPulse={controls.strobeOrPulse}
            onStrobePulseToggle={handleStrobePulseToggle}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <ControlSlider label="Dimmer" value={controls.dimmer} onChange={handleSliderChange('dimmer')} />
        <ControlSlider label="Laser Move Speed" min={1} value={controls.laserMoveSpeed} onChange={handleSliderChange('laserMoveSpeed')} disabled={isBeatLaserMoveSpeedActive} />
        <ControlSlider label="Strobe/Pulse" value={controls.strobePulseRate} onChange={handleSliderChange('strobePulseRate')} disabled={isBeatStrobePulseActive} />
      </div>
    );
  };
  
  const renderVisualControls = () => (
    <div className="grid grid-cols-3 gap-2">
      <VisualButton preset={VisualPreset.Grid} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.Bracket} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.LBracket} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      
      <VisualButton preset={VisualPreset.SCross} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.Cross} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.LCross} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      
      <VisualButton preset={VisualPreset.SDblCross} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.DblCross} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.LDblCross} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      
      <VisualButton preset={VisualPreset.Cube} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.FourCubes} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
      <VisualButton preset={VisualPreset.NineCubes} selectedPreset={controls.visualPreset} onSelect={handleVisualSelect} />
    </div>
  );

  const renderMovementControls = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          <ScrollButton direction={ScrollDirection.ToTL} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.BottomToTop} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.ToTR} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.RightToLeft} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.None} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.LeftToRight} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.ToBL} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.TopToBottom} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
          <ScrollButton direction={ScrollDirection.ToBR} selectedDirection={controls.scrollDirection} onSelect={handleScrollSelect} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <MovementPresetButton preset={ScrollDirection.OutFromCenter} selectedPreset={controls.scrollDirection} onSelect={handleScrollSelect} />
          <MovementPresetButton preset={ScrollDirection.TowardsCenter} selectedPreset={controls.scrollDirection} onSelect={handleScrollSelect} />
          <MovementPresetButton preset={ScrollDirection.Pinwheel} selectedPreset={controls.scrollDirection} onSelect={handleScrollSelect} />
          <MovementPresetButton preset={ScrollDirection.Spot} selectedPreset={controls.scrollDirection} onSelect={handleScrollSelect} />
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-4 gap-2">
          <FadeToggleButton enabled={controls.scrollFade === 20} onToggle={handleFadeToggle} disabled={!isStandardScrollActive} />
          <LoopToggleButton enabled={controls.loopEffect} onToggle={handleToggle('loopEffect')} disabled={!isStandardScrollActive} />
          <PhaseToggleButton enabled={controls.scrollPhase > 0} onToggle={handlePhaseToggle} disabled={!isStandardScrollActive} />
          <BuildToggleButton enabled={controls.scrollBuildEffect} onToggle={handleBuildToggle} disabled={!isStandardScrollActive} />
        </div>
        <LaserCountButtons 
            count={controls.scrollLaserCount}
            setCount={handleLaserCountChange}
            disabled={!isScrollActive}
        />
      </div>
    </div>
  );

  const renderConfigControls = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <ControlSlider label="Haze Density" value={controls.hazeDensity} onChange={handleSliderChange('hazeDensity')} />
        <ControlSlider label="Linear Gradient" value={controls.linearGradient} onChange={handleSliderChange('linearGradient')} />
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">Show Laser Origins</label>
          <button
            onClick={handleToggle('showLaserOrigins')}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              controls.showLaserOrigins ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                controls.showLaserOrigins ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6">
        <FixtureConfiguration
          fixtures={controls.fixtures}
          lasers={controls.lasers}  // ADD THIS LINE
          onFixtureUpdate={handleFixtureUpdate}
        />
      </div>
    </div>
  );

  if (section === 'global') return renderGlobalControls();
  if (section === 'visual') return renderVisualControls();
  if (section === 'movement') return renderMovementControls();
  if (section === 'config') return renderConfigControls();

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-6">
      
      <section>
        {renderGlobalControls()}
      </section>

      <section>
        <div className="border-b border-gray-700 pb-2 mb-4" />
        {renderVisualControls()}
      </section>

      <section>
        <div className="border-b border-gray-700 pb-2 mb-4" />
        {renderMovementControls()}
      </section>
      
      <section>
        <div className="border-b border-gray-700 pb-2 mb-4" />
        {renderConfigControls()}
      </section>
    </div>
  );
};

export default Controls;
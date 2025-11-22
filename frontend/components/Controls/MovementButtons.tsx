import React from 'react';
import { ScrollDirection } from '../../types';

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

export interface ScrollButtonProps {
  direction: ScrollDirection;
  selectedDirection: ScrollDirection;
  onSelect: (direction: ScrollDirection) => void;
}

export const ScrollButton: React.FC<ScrollButtonProps> = ({ direction, selectedDirection, onSelect }) => {
  const iconInfo = SCROLL_ICONS[direction];
  return (
    <button
      onClick={() => {
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

export interface MovementPresetButtonProps {
  preset: ScrollDirection;
  selectedPreset: ScrollDirection;
  onSelect: (preset: ScrollDirection) => void;
}

export const MovementPresetButton: React.FC<MovementPresetButtonProps> = ({ preset, selectedPreset, onSelect }) => {
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
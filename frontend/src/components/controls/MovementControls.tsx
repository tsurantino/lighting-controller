// src/components/controls/MovementControls.tsx
import React from 'react';
import { ScrollDirection } from '../../types';
import { SCROLL_ICONS } from '../common/icons';

interface ScrollButtonProps {
  direction: ScrollDirection;
  selectedDirection: ScrollDirection;
  onSelect: (direction: ScrollDirection) => void;
}

export const ScrollButton: React.FC<ScrollButtonProps> = ({ 
  direction, 
  selectedDirection, 
  onSelect 
}) => {
  const iconInfo = SCROLL_ICONS[direction];
  
  return (
    <button
      onClick={() => {
        console.log("🎯 ScrollButton clicked for direction:", direction);
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
};

interface MovementPresetButtonProps {
  preset: ScrollDirection;
  selectedPreset: ScrollDirection;
  onSelect: (preset: ScrollDirection) => void;
}

export const MovementPresetButton: React.FC<MovementPresetButtonProps> = ({ 
  preset, 
  selectedPreset, 
  onSelect 
}) => {
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

interface MovementGridProps {
  selectedDirection: ScrollDirection;
  onDirectionSelect: (direction: ScrollDirection) => void;
}

export const MovementGrid: React.FC<MovementGridProps> = ({
  selectedDirection,
  onDirectionSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {/* 3x3 Directional Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          <ScrollButton 
            direction={ScrollDirection.ToTL} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.BottomToTop} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.ToTR} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.RightToLeft} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.None} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.LeftToRight} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.ToBL} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.TopToBottom} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <ScrollButton 
            direction={ScrollDirection.ToBR} 
            selectedDirection={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
        </div>

        {/* Movement Presets */}
        <div className="grid grid-cols-4 gap-2">
          <MovementPresetButton 
            preset={ScrollDirection.Out} 
            selectedPreset={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <MovementPresetButton 
            preset={ScrollDirection.In} 
            selectedPreset={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <MovementPresetButton 
            preset={ScrollDirection.Pinwheel} 
            selectedPreset={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
          <MovementPresetButton 
            preset={ScrollDirection.Spot} 
            selectedPreset={selectedDirection} 
            onSelect={onDirectionSelect} 
          />
        </div>
      </div>
    </div>
  );
};
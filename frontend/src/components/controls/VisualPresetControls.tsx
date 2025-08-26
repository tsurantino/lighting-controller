// src/components/controls/VisualPresetControls.tsx
import React from 'react';
import { VisualPreset } from '../../types';
import { VISUAL_ICONS } from '../common/icons';

interface VisualButtonProps {
  preset: VisualPreset;
  selectedPreset: VisualPreset;
  onSelect: (preset: VisualPreset) => void;
}

export const VisualButton: React.FC<VisualButtonProps> = ({ 
  preset, 
  selectedPreset, 
  onSelect 
}) => (
  <button
    onClick={() => onSelect(preset)}
    className={`p-2 rounded-md transition-colors duration-200 flex flex-col items-center justify-center text-center
      ${selectedPreset === preset ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
  >
    {VISUAL_ICONS[preset]}
    <span className="text-xs font-medium">{preset}</span>
  </button>
);

interface VisualPresetGridProps {
  selectedPreset: VisualPreset;
  onPresetSelect: (preset: VisualPreset) => void;
}

export const VisualPresetGrid: React.FC<VisualPresetGridProps> = ({
  selectedPreset,
  onPresetSelect,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Row 1 */}
      <VisualButton 
        preset={VisualPreset.Grid} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.Bracket} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.LBracket} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />

      {/* Row 2 */}
      <VisualButton 
        preset={VisualPreset.SCross} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.Cross} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.LCross} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />

      {/* Row 3 */}
      <VisualButton 
        preset={VisualPreset.SDblCross} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.DblCross} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.LDblCross} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />

      {/* Row 4 */}
      <VisualButton 
        preset={VisualPreset.Cube} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.FourCubes} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
      <VisualButton 
        preset={VisualPreset.NineCubes} 
        selectedPreset={selectedPreset} 
        onSelect={onPresetSelect} 
      />
    </div>
  );
};
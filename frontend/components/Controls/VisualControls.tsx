import React from 'react';
import { VisualPreset } from '../../types';
import { VisualButton } from './VisualPresetButtons';

export interface VisualControlsProps {
  selectedPreset: VisualPreset;
  onPresetSelect: (preset: VisualPreset) => void;
}

export const VisualControls: React.FC<VisualControlsProps> = ({ 
  selectedPreset, 
  onPresetSelect 
}) => (
  <div className="grid grid-cols-3 gap-2">
    <VisualButton preset={VisualPreset.Grid} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.Bracket} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.LBracket} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    
    <VisualButton preset={VisualPreset.SCross} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.Cross} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.LCross} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    
    <VisualButton preset={VisualPreset.SDblCross} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.DblCross} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.LDblCross} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    
    <VisualButton preset={VisualPreset.Cube} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.FourCubes} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
    <VisualButton preset={VisualPreset.NineCubes} selectedPreset={selectedPreset} onSelect={onPresetSelect} />
  </div>
);
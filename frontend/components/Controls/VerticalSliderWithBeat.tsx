import React from 'react';
import { BeatRate } from '../../types';
import { ControlSlider } from '../ui';
import { BeatButtons } from './BeatControls';

export interface VerticalSliderWithBeatProps {
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
}

export const VerticalSliderWithBeat: React.FC<VerticalSliderWithBeatProps> = ({
  label, value, min, max, onChange, sliderDisabled,
  beatRate, onBeatRateChange, beatDisabled, beatRateOptions
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
import React from 'react';
import { ControlsState, BeatRate, EffectApplication } from '../../types';
import { ControlSlider } from '../ui';
import { VerticalSliderWithBeat } from './VerticalSliderWithBeat';
import { BeatSyncControls } from './BeatControls';

export interface GlobalControlsProps {
  controls: ControlsState;
  onSliderChange: (key: keyof ControlsState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBeatModifierChange: (
    modifier: 'beatStrobeRate' | 'beatPulseRate' | 'beatLaserMoveSpeedRate' | 'beatShockerSpeedRate' | 'beatSaberSpeedRate' | 'beatMhSpeedRate'
  ) => (rate: BeatRate) => void;
  onBpmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (key: keyof ControlsState) => () => void;
  onEffectApplicationToggle: () => void;
  onStrobePulseToggle: () => void;
  verticalSliders?: boolean;
}

export const GlobalControls: React.FC<GlobalControlsProps> = ({
  controls,
  onSliderChange,
  onBeatModifierChange,
  onBpmChange,
  onToggle,
  onEffectApplicationToggle,
  onStrobePulseToggle,
  verticalSliders = false
}) => {
  const isBeatStrobeActive = controls.beatSyncEnabled && controls.beatStrobeRate !== 'Off';
  const isBeatPulseActive = controls.beatSyncEnabled && controls.beatPulseRate !== 'Off';
  const isBeatStrobePulseActive = controls.strobeOrPulse === 'strobe' ? isBeatStrobeActive : isBeatPulseActive;
  const isBeatLaserMoveSpeedActive = controls.beatSyncEnabled && controls.beatLaserMoveSpeedRate !== 'Off';
  const isBeatShockerSpeedActive = controls.beatSyncEnabled && controls.beatShockerSpeedRate !== 'Off';
  const isBeatSaberSpeedActive = controls.beatSyncEnabled && controls.beatSaberSpeedRate !== 'Off';
  const isBeatMhSpeedActive = controls.beatSyncEnabled && controls.beatMhSpeedRate !== 'Off';

  const beatRateOptions: BeatRate[] = ['Off', '1/3', '1/2', '1', '3', '4'];

  if (verticalSliders) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-x-4">
          <ControlSlider 
            label="Dimmer" 
            value={controls.dimmer} 
            onChange={onSliderChange('dimmer')} 
            vertical={true}
          />
          <VerticalSliderWithBeat
            label="Strobe/Pulse"
            value={controls.strobePulseRate}
            onChange={onSliderChange('strobePulseRate')}
            sliderDisabled={isBeatStrobePulseActive}
            beatRate={controls.strobeOrPulse === 'strobe' ? controls.beatStrobeRate : controls.beatPulseRate}
            onBeatRateChange={onBeatModifierChange(controls.strobeOrPulse === 'strobe' ? 'beatStrobeRate' : 'beatPulseRate')}
            beatDisabled={!controls.beatSyncEnabled}
            beatRateOptions={beatRateOptions}
          />
          <VerticalSliderWithBeat
            label="Laser Move Speed"
            value={controls.laserMoveSpeed}
            min={1}
            onChange={onSliderChange('laserMoveSpeed')}
            sliderDisabled={isBeatLaserMoveSpeedActive}
            beatRate={controls.beatLaserMoveSpeedRate}
            onBeatRateChange={onBeatModifierChange('beatLaserMoveSpeedRate')}
            beatDisabled={!controls.beatSyncEnabled}
            beatRateOptions={beatRateOptions}
          />
          <VerticalSliderWithBeat
            label="Shocker Move Speed"
            value={controls.shockerSpeed}
            min={1}
            onChange={onSliderChange('shockerSpeed')}
            sliderDisabled={isBeatShockerSpeedActive}
            beatRate={controls.beatShockerSpeedRate}
            onBeatRateChange={onBeatModifierChange('beatShockerSpeedRate')}
            beatDisabled={!controls.beatSyncEnabled}
            beatRateOptions={beatRateOptions}
          />
          <VerticalSliderWithBeat
            label="Saber Move Speed"
            value={controls.saberSpeed}
            min={1}
            onChange={onSliderChange('saberSpeed')}
            sliderDisabled={isBeatSaberSpeedActive}
            beatRate={controls.beatSaberSpeedRate}
            onBeatRateChange={onBeatModifierChange('beatSaberSpeedRate')}
            beatDisabled={!controls.beatSyncEnabled}
            beatRateOptions={beatRateOptions}
          />
          <VerticalSliderWithBeat
            label="MH Move Speed"
            value={controls.mhSpeed}
            min={1}
            onChange={onSliderChange('mhSpeed')}
            sliderDisabled={isBeatMhSpeedActive}
            beatRate={controls.beatMhSpeedRate}
            onBeatRateChange={onBeatModifierChange('beatMhSpeedRate')}
            beatDisabled={!controls.beatSyncEnabled}
            beatRateOptions={beatRateOptions}
          />
        </div>
        <BeatSyncControls
          enabled={controls.beatSyncEnabled}
          onToggle={onToggle('beatSyncEnabled')}
          bpm={controls.bpm}
          onBpmChange={onBpmChange}
          effectApplication={controls.effectApplication}
          onEffectApplicationToggle={onEffectApplicationToggle}
          strobeOrPulse={controls.strobeOrPulse}
          onStrobePulseToggle={onStrobePulseToggle}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ControlSlider label="Dimmer" value={controls.dimmer} onChange={onSliderChange('dimmer')} />
      <ControlSlider label="Laser Move Speed" min={1} value={controls.laserMoveSpeed} onChange={onSliderChange('laserMoveSpeed')} disabled={isBeatLaserMoveSpeedActive} />
      <ControlSlider label="Strobe/Pulse" value={controls.strobePulseRate} onChange={onSliderChange('strobePulseRate')} disabled={isBeatStrobePulseActive} />
    </div>
  );
};
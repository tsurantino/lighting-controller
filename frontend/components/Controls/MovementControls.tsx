import React from 'react';
import { ScrollDirection } from '../../types';
import { ScrollButton, MovementPresetButton } from './MovementButtons';
import { FadeToggleButton, LoopToggleButton, PhaseToggleButton, BuildToggleButton, LaserCountButtons } from './ModifierButtons';

export interface MovementControlsProps {
  scrollDirection: ScrollDirection;
  onScrollSelect: (direction: ScrollDirection) => void;
  scrollFade: number;
  onFadeToggle: () => void;
  loopEffect: boolean;
  onLoopToggle: () => void;
  scrollPhase: number;
  onPhaseToggle: () => void;
  scrollBuildEffect: boolean;
  onBuildToggle: () => void;
  scrollLaserCount: number;
  onLaserCountChange: (count: number) => void;
}

export const MovementControls: React.FC<MovementControlsProps> = ({
  scrollDirection,
  onScrollSelect,
  scrollFade,
  onFadeToggle,
  loopEffect,
  onLoopToggle,
  scrollPhase,
  onPhaseToggle,
  scrollBuildEffect,
  onBuildToggle,
  scrollLaserCount,
  onLaserCountChange
}) => {
  const isScrollActive = scrollDirection !== ScrollDirection.None;
  const isStandardScrollActive = isScrollActive && scrollDirection !== ScrollDirection.Spot;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          <ScrollButton direction={ScrollDirection.ToTL} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.BottomToTop} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.ToTR} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.RightToLeft} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.None} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.LeftToRight} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.ToBL} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.TopToBottom} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
          <ScrollButton direction={ScrollDirection.ToBR} selectedDirection={scrollDirection} onSelect={onScrollSelect} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <MovementPresetButton preset={ScrollDirection.OutFromCenter} selectedPreset={scrollDirection} onSelect={onScrollSelect} />
          <MovementPresetButton preset={ScrollDirection.TowardsCenter} selectedPreset={scrollDirection} onSelect={onScrollSelect} />
          <MovementPresetButton preset={ScrollDirection.Pinwheel} selectedPreset={scrollDirection} onSelect={onScrollSelect} />
          <MovementPresetButton preset={ScrollDirection.Spot} selectedPreset={scrollDirection} onSelect={onScrollSelect} />
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-4 gap-2">
          <FadeToggleButton enabled={scrollFade === 20} onToggle={onFadeToggle} disabled={!isStandardScrollActive} />
          <LoopToggleButton enabled={loopEffect} onToggle={onLoopToggle} disabled={!isStandardScrollActive} />
          <PhaseToggleButton enabled={scrollPhase > 0} onToggle={onPhaseToggle} disabled={!isStandardScrollActive} />
          <BuildToggleButton enabled={scrollBuildEffect} onToggle={onBuildToggle} disabled={!isStandardScrollActive} />
        </div>
        <LaserCountButtons 
          count={scrollLaserCount}
          setCount={onLaserCountChange}
          disabled={!isScrollActive}
        />
      </div>
    </div>
  );
};
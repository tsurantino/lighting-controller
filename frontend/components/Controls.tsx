import React from 'react';
import { ControlsState, VisualPreset, ScrollDirection, EffectApplication, BeatRate, Fixture } from '../types';
import { GlobalControls } from './Controls/GlobalControls';
import { VisualControls } from './Controls/VisualControls';
import { MovementControls } from './Controls/MovementControls';
import { ConfigurationControls } from './Controls/ConfigurationControls';

interface ControlsProps {
  controls: ControlsState;
  setControls: React.Dispatch<React.SetStateAction<ControlsState>>;
  section?: 'global' | 'beat' | 'visual' | 'movement' | 'config';
  verticalSliders?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ controls, setControls, section, verticalSliders = false }) => {
  const handleVisualSelect = (preset: VisualPreset) => {
    setControls(prev => ({...prev, visualPreset: preset}));
  }

  const handleSliderChange = (key: keyof ControlsState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setControls(prev => ({ ...prev, [key]: value }));
  };
  
  const handleScrollSelect = (direction: ScrollDirection) => {
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
    modifier: 'beatStrobeRate' | 'beatPulseRate' | 'beatLaserMoveSpeedRate' | 'beatShockerSpeedRate' | 'beatSaberSpeedRate' | 'beatMhSpeedRate'
  ) => (rate: BeatRate) => {
    setControls(prev => ({ ...prev, [modifier]: rate }));
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setControls(prev => ({ ...prev, bpm: value }));
    }
  };

  if (section === 'global') {
    return (
      <GlobalControls
        controls={controls}
        onSliderChange={handleSliderChange}
        onBeatModifierChange={handleBeatModifierChange}
        onBpmChange={handleBpmChange}
        onToggle={handleToggle}
        onEffectApplicationToggle={handleEffectApplicationToggle}
        onStrobePulseToggle={handleStrobePulseToggle}
        verticalSliders={verticalSliders}
      />
    );
  }
  
  if (section === 'visual') {
    return (
      <VisualControls
        selectedPreset={controls.visualPreset}
        onPresetSelect={handleVisualSelect}
      />
    );
  }

  if (section === 'movement') {
    return (
      <MovementControls
        scrollDirection={controls.scrollDirection}
        onScrollSelect={handleScrollSelect}
        scrollFade={controls.scrollFade}
        onFadeToggle={handleFadeToggle}
        loopEffect={controls.loopEffect}
        onLoopToggle={handleToggle('loopEffect')}
        scrollPhase={controls.scrollPhase}
        onPhaseToggle={handlePhaseToggle}
        scrollBuildEffect={controls.scrollBuildEffect}
        onBuildToggle={handleBuildToggle}
        scrollLaserCount={controls.scrollLaserCount}
        onLaserCountChange={handleLaserCountChange}
      />
    );
  }
  
  if (section === 'config') {
    return (
      <ConfigurationControls
        controls={controls}
        onSliderChange={handleSliderChange}
        onToggle={handleToggle}
        onFixtureUpdate={handleFixtureUpdate}
      />
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-6">
      
      <section>
        <GlobalControls
          controls={controls}
          onSliderChange={handleSliderChange}
          onBeatModifierChange={handleBeatModifierChange}
          onBpmChange={handleBpmChange}
          onToggle={handleToggle}
          onEffectApplicationToggle={handleEffectApplicationToggle}
          onStrobePulseToggle={handleStrobePulseToggle}
          verticalSliders={verticalSliders}
        />
      </section>

      <section>
        <div className="border-b border-gray-700 pb-2 mb-4" />
        <VisualControls
          selectedPreset={controls.visualPreset}
          onPresetSelect={handleVisualSelect}
        />
      </section>

      <section>
        <div className="border-b border-gray-700 pb-2 mb-4" />
        <MovementControls
          scrollDirection={controls.scrollDirection}
          onScrollSelect={handleScrollSelect}
          scrollFade={controls.scrollFade}
          onFadeToggle={handleFadeToggle}
          loopEffect={controls.loopEffect}
          onLoopToggle={handleToggle('loopEffect')}
          scrollPhase={controls.scrollPhase}
          onPhaseToggle={handlePhaseToggle}
          scrollBuildEffect={controls.scrollBuildEffect}
          onBuildToggle={handleBuildToggle}
          scrollLaserCount={controls.scrollLaserCount}
          onLaserCountChange={handleLaserCountChange}
        />
      </section>
      
      <section>
        <div className="border-b border-gray-700 pb-2 mb-4" />
        <ConfigurationControls
          controls={controls}
          onSliderChange={handleSliderChange}
          onToggle={handleToggle}
          onFixtureUpdate={handleFixtureUpdate}
        />
      </section>
    </div>
  );
};

export default Controls;
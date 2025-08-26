// src/components/controls/FixtureConfiguration.tsx
import React, { useState } from 'react';
import { useControlsContext } from '../../stores/ControlsContext';
import { 
  FixtureType, 
  MovingHeadFixture, 
  SaberBeamFixture, 
  JoltFixture, 
  ShockerFixture,
  Fixture
} from '../../types';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';

const MovingHeadConfig: React.FC<{ 
  fixture: MovingHeadFixture; 
  onUpdate: (updates: Partial<MovingHeadFixture>) => void 
}> = ({ fixture, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Brightness"
          value={fixture.brightness}
          onChange={(value) => onUpdate({ brightness: value })}
          min={0}
          max={100}
          suffix="%"
          color="red"
        />
        <Slider
          label="Movement Speed"
          value={fixture.speed}
          onChange={(value) => onUpdate({ speed: value })}
          min={0}
          max={100}
          suffix="%"
          color="purple"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Pan Position"
          value={fixture.panMove}
          onChange={(value) => onUpdate({ panMove: value })}
          min={0}
          max={255}
          color="blue"
        />
        <Slider
          label="Tilt Position"
          value={fixture.tiltMove}
          onChange={(value) => onUpdate({ tiltMove: value })}
          min={0}
          max={255}
          color="green"
        />
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Name:</strong> {fixture.name}</p>
        <p><strong>DMX Start Address:</strong> {fixture.startDmxAddress}</p>
        <p><strong>Position:</strong> ({fixture.position.x}, {fixture.position.y})</p>
      </div>
    </div>
  );
};

const SaberBeamConfig: React.FC<{ 
  fixture: SaberBeamFixture; 
  onUpdate: (updates: Partial<SaberBeamFixture>) => void 
}> = ({ fixture, onUpdate }) => {
  return (
    <div className="space-y-4">
      <Slider
        label="Brightness"
        value={fixture.brightness}
        onChange={(value) => onUpdate({ brightness: value })}
        min={0}
        max={100}
        suffix="%"
        color="red"
      />

      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Name:</strong> {fixture.name}</p>
        <p><strong>DMX Start Address:</strong> {fixture.startDmxAddress}</p>
        <p><strong>Position:</strong> ({fixture.position.x}, {fixture.position.y})</p>
        <p><strong>Color:</strong> Red only</p>
      </div>
    </div>
  );
};

const JoltConfig: React.FC<{ 
  fixture: JoltFixture; 
  onUpdate: (updates: Partial<JoltFixture>) => void 
}> = ({ fixture, onUpdate }) => {
  const updateZone = (zone: 'zone1' | 'zone2' | 'zone3', property: 'red' | 'white', value: number) => {
    onUpdate({
      zones: {
        ...fixture.zones,
        [zone]: {
          ...fixture.zones[zone],
          [property]: value
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <Slider
        label="Master Brightness"
        value={fixture.brightness}
        onChange={(value) => onUpdate({ brightness: value })}
        min={0}
        max={100}
        suffix="%"
        color="red"
      />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Zone Controls</h4>
        
        {(['zone1', 'zone2', 'zone3'] as const).map((zone, index) => (
          <div key={zone} className="border border-gray-600 rounded p-3">
            <h5 className="text-xs font-medium text-gray-400 mb-2">Zone {index + 1}</h5>
            <div className="grid grid-cols-2 gap-2">
              <Slider
                label="Red"
                value={fixture.zones[zone].red}
                onChange={(value) => updateZone(zone, 'red', value)}
                min={0}
                max={100}
                suffix="%"
                color="red"
              />
              <Slider
                label="White"
                value={fixture.zones[zone].white}
                onChange={(value) => updateZone(zone, 'white', value)}
                min={0}
                max={100}
                suffix="%"
                color="yellow"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Name:</strong> {fixture.name}</p>
        <p><strong>DMX Start Address:</strong> {fixture.startDmxAddress}</p>
        <p><strong>Position:</strong> ({fixture.position.x}, {fixture.position.y})</p>
      </div>
    </div>
  );
};

const ShockerConfig: React.FC<{ 
  fixture: ShockerFixture; 
  onUpdate: (updates: Partial<ShockerFixture>) => void 
}> = ({ fixture, onUpdate }) => {
  const updateZone = (zone: 'zone1' | 'zone2' | 'zone3' | 'zone4', enabled: boolean) => {
    onUpdate({
      zones: {
        ...fixture.zones,
        [zone]: enabled
      }
    });
  };

  return (
    <div className="space-y-4">
      <Slider
        label="Brightness"
        value={fixture.brightness}
        onChange={(value) => onUpdate({ brightness: value })}
        min={0}
        max={100}
        suffix="%"
        color="red"
      />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Zone Controls</h4>
        
        <div className="grid grid-cols-2 gap-2">
          {(['zone1', 'zone2', 'zone3', 'zone4'] as const).map((zone, index) => (
            <Toggle
              key={zone}
              checked={fixture.zones[zone]}
              onChange={() => updateZone(zone, !fixture.zones[zone])}
              checkedColor="red"
              label={`Zone ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Name:</strong> {fixture.name}</p>
        <p><strong>DMX Start Address:</strong> {fixture.startDmxAddress}</p>
        <p><strong>Position:</strong> ({fixture.position.x}, {fixture.position.y})</p>
        <p><strong>Active Zones:</strong> {Object.values(fixture.zones).filter(Boolean).length}/4</p>
      </div>
    </div>
  );
};

const FixtureCard: React.FC<{ 
  fixtureId: string; 
  fixture: Fixture; 
  onUpdate: (updates: any) => void 
}> = ({ fixtureId, fixture, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFixtureTypeLabel = (type: FixtureType) => {
    switch (type) {
      case FixtureType.MovingHead:
        return 'Moving Head';
      case FixtureType.SaberBeam:
        return 'Saber Beam';
      case FixtureType.Jolt:
        return 'Jolt';
      case FixtureType.Shocker:
        return 'Shocker';
      default:
        return 'Unknown';
    }
  };

  const renderFixtureConfig = () => {
    switch (fixture.type) {
      case FixtureType.MovingHead:
        return <MovingHeadConfig fixture={fixture as MovingHeadFixture} onUpdate={onUpdate} />;
      case FixtureType.SaberBeam:
        return <SaberBeamConfig fixture={fixture as SaberBeamFixture} onUpdate={onUpdate} />;
      case FixtureType.Jolt:
        return <JoltConfig fixture={fixture as JoltFixture} onUpdate={onUpdate} />;
      case FixtureType.Shocker:
        return <ShockerConfig fixture={fixture as ShockerFixture} onUpdate={onUpdate} />;
      default:
        return <div>Unknown fixture type</div>;
    }
  };

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">{fixtureId}</h3>
            <p className="text-sm text-gray-300">{getFixtureTypeLabel(fixture.type)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              Brightness: {fixture.brightness}%
            </div>
            <svg 
              className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-gray-800">
          {renderFixtureConfig()}
        </div>
      )}
    </div>
  );
};

const FixtureConfiguration: React.FC = () => {
  const { controls, setControls, isLoading } = useControlsContext();

  const updateFixture = (fixtureId: string) => (updates: any) => {
    setControls(prev => ({
      ...prev,
      fixtures: {
        ...prev.fixtures,
        [fixtureId]: {
          ...prev.fixtures[fixtureId],
          ...updates
        }
      }
    }));
  };

  if (!controls.fixtures || Object.keys(controls.fixtures).length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Fixture Configuration</h3>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        
        <div className="text-center py-8 text-gray-400">
          <p>No fixtures configured</p>
          <p className="text-sm mt-2">Fixtures will appear here when loaded from the server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Fixture Configuration</h3>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(controls.fixtures).map(([fixtureId, fixture]) => (
          <FixtureCard
            key={fixtureId}
            fixtureId={fixtureId}
            fixture={fixture}
            onUpdate={updateFixture(fixtureId)}
          />
        ))}
      </div>

      <div className="text-xs text-gray-400 p-3 bg-gray-700 rounded">
        <p><strong>Note:</strong> Changes to fixture configuration will update DMX output in real-time. 
        Make sure your DMX addresses don't conflict with other fixtures.</p>
      </div>
    </div>
  );
};

export default FixtureConfiguration;
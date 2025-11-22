import React, { useState } from 'react';
import { Fixture, FixtureType, MovingHeadFixture, SaberBeamFixture, JoltFixture, ShockerFixture, LaserData, LaserOrientation, ControlsState } from '../../types';

interface FixtureConfigTabProps {
  fixture: Fixture | 'LAS';
  lasers?: LaserData[];
  onUpdate: (fixture: Fixture) => void;
}

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
        <div className="font-medium text-gray-400">ID</div>
        <div className="font-medium text-gray-400">DMX</div>
        <div className="font-medium text-gray-400">Value</div>
        <div className="font-medium text-gray-400">ID</div>
        <div className="font-medium text-gray-400">DMX</div>
        <div className="font-medium text-gray-400">Value</div>
        <div></div>
        
        {Array.from({ length: Math.ceil(lasers.length / 2) }).map((_, rowIndex) => {
          const leftLaser = lasers[rowIndex * 2];
          const rightLaser = lasers[rowIndex * 2 + 1];
          
          return (
            <React.Fragment key={rowIndex}>
              <div className="text-white">{leftLaser.id}</div>
              <div className="text-blue-400 font-mono">{leftLaser.dmxAddress}</div>
              <div className={`font-mono ${leftLaser.brightness > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {leftLaser.brightness}
              </div>
              
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
              <div></div>
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

const FixtureConfigTab: React.FC<FixtureConfigTabProps> = ({ fixture, lasers, onUpdate }) => {
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

export interface FixtureConfigurationProps {
  fixtures: ControlsState['fixtures'];
  lasers?: LaserData[];
  onFixtureUpdate: (fixtureId: keyof ControlsState['fixtures'], fixture: Fixture) => void;
}

export const FixtureConfiguration: React.FC<FixtureConfigurationProps> = ({ 
  fixtures, 
  lasers, 
  onFixtureUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<keyof ControlsState['fixtures'] | 'LAS'>('MH1');
  
  const fixtureIds = Object.keys(fixtures) as (keyof ControlsState['fixtures'])[];
  const allTabs = [...fixtureIds, 'LAS' as const];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Fixture Configuration</h3>
      
      <div className="flex flex-wrap gap-2">
        {allTabs.map((tabId) => (
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
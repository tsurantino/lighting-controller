// src/components/visualization/FixtureComponents.tsx
import React from 'react';
import { MovingHeadFixture, SaberBeamFixture, JoltFixture, ShockerFixture } from '../../types';

interface BaseFixtureProps {
  x: number;
  y: number;
  masterDimmer: number;
}

interface MovingHeadProps extends BaseFixtureProps {
  fixture: MovingHeadFixture;
}

export const MovingHeadFixtureComponent: React.FC<MovingHeadProps> = ({ 
  fixture, 
  x, 
  y, 
  masterDimmer 
}) => {
  const effectiveBrightness = (fixture.brightness * masterDimmer) / 10000;
  const opacity = effectiveBrightness;
  
  if (effectiveBrightness === 0) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Moving head base */}
      <circle
        cx="0"
        cy="0"
        r="3"
        fill="#333"
        stroke="#666"
        strokeWidth="0.5"
      />
      
      {/* Beam effect */}
      <ellipse
        cx="0"
        cy="-15"
        rx="8"
        ry="15"
        fill="url(#movingHeadBeam)"
        opacity={opacity}
        transform={`rotate(${fixture.panMove * 360 / 255}) translate(0, ${fixture.tiltMove / 10})`}
      />
      
      {/* Head indicator */}
      <circle
        cx="0"
        cy="0"
        r="1.5"
        fill="#ff0000"
        opacity={opacity}
      />
      
      {/* Label */}
      <text
        x="0"
        y="6"
        textAnchor="middle"
        fontSize="2"
        fill="#ccc"
      >
        {fixture.id}
      </text>
    </g>
  );
};

interface SaberBeamProps extends BaseFixtureProps {
  fixture: SaberBeamFixture;
}

export const SaberBeamFixtureComponent: React.FC<SaberBeamProps> = ({ 
  fixture, 
  x, 
  y, 
  masterDimmer 
}) => {
  const effectiveBrightness = (fixture.brightness * masterDimmer) / 10000;
  const opacity = effectiveBrightness;
  
  if (effectiveBrightness === 0) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Saber beam base */}
      <rect
        x="-2"
        y="-1"
        width="4"
        height="2"
        fill="#333"
        stroke="#666"
        strokeWidth="0.3"
      />
      
      {/* Vertical beam */}
      <rect
        x="-0.5"
        y="-20"
        width="1"
        height="18"
        fill="url(#saberBeam)"
        opacity={opacity}
      />
      
      {/* Base indicator */}
      <circle
        cx="0"
        cy="0"
        r="0.8"
        fill="#ff0000"
        opacity={opacity}
      />
      
      {/* Label */}
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fontSize="2"
        fill="#ccc"
      >
        {fixture.id}
      </text>
    </g>
  );
};

interface JoltProps extends BaseFixtureProps {
  fixture: JoltFixture;
}

export const JoltFixtureComponent: React.FC<JoltProps> = ({ 
  fixture, 
  x, 
  y, 
  masterDimmer 
}) => {
  const effectiveBrightness = (fixture.brightness * masterDimmer) / 10000;
  const opacity = effectiveBrightness;
  
  if (effectiveBrightness === 0) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Jolt base */}
      <rect
        x="-3"
        y="-2"
        width="6"
        height="4"
        fill="#333"
        stroke="#666"
        strokeWidth="0.3"
        rx="1"
      />
      
      {/* Zone spotlights */}
      {(['zone1', 'zone2', 'zone3'] as const).map((zoneName, index) => {
        const zone = fixture.zones[zoneName];
        const zoneOpacity = ((zone.red + zone.white) / 200) * opacity;
        if (zoneOpacity === 0) return null;
        
        const angle = (index - 1) * 45; // -45, 0, 45 degrees
        return (
          <ellipse
            key={zoneName}
            cx="0"
            cy="-8"
            rx="3"
            ry="8"
            fill="url(#joltSpotlight)"
            opacity={zoneOpacity}
            transform={`rotate(${angle})`}
          />
        );
      })}
      
      {/* Base indicators for each zone */}
      {(['zone1', 'zone2', 'zone3'] as const).map((zoneName, index) => {
        const zone = fixture.zones[zoneName];
        const zoneOpacity = ((zone.red + zone.white) / 200) * opacity;
        const xOffset = (index - 1) * 2;
        return (
          <circle
            key={`${zoneName}-indicator`}
            cx={xOffset}
            cy="0"
            r="0.6"
            fill={zone.white > zone.red ? "#ffff88" : "#ff0000"}
            opacity={zoneOpacity}
          />
        );
      })}
      
      {/* Label */}
      <text
        x="0"
        y="6"
        textAnchor="middle"
        fontSize="2"
        fill="#ccc"
      >
        {fixture.id}
      </text>
    </g>
  );
};

interface ShockerProps extends BaseFixtureProps {
  fixture: ShockerFixture;
}

export const ShockerFixtureComponent: React.FC<ShockerProps> = ({ 
  fixture, 
  x, 
  y, 
  masterDimmer 
}) => {
  const effectiveBrightness = (fixture.brightness * masterDimmer) / 10000;
  const opacity = effectiveBrightness;
  
  if (effectiveBrightness === 0) return null;

  const activeZones = Object.values(fixture.zones).filter(Boolean).length;
  if (activeZones === 0) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Shocker base */}
      <rect
        x="-4"
        y="-2"
        width="8"
        height="4"
        fill="#333"
        stroke="#666"
        strokeWidth="0.3"
        rx="1"
      />
      
      {/* Zone flashes */}
      {(['zone1', 'zone2', 'zone3', 'zone4'] as const).map((zoneName, index) => {
        const isActive = fixture.zones[zoneName];
        if (!isActive) return null;
        
        const angle = index * 90; // 0, 90, 180, 270 degrees
        return (
          <g key={zoneName} transform={`rotate(${angle})`}>
            <circle
              cx="0"
              cy="-6"
              r="2"
              fill="#ff0000"
              opacity={opacity}
            >
              <animate
                attributeName="opacity"
                values={`0;${opacity};0`}
                dur="0.1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
      
      {/* Base indicator */}
      <circle
        cx="0"
        cy="0"
        r="1"
        fill="#ff0000"
        opacity={opacity}
      >
        <animate
          attributeName="opacity"
          values={`${opacity * 0.3};${opacity};${opacity * 0.3}`}
          dur="0.2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Label */}
      <text
        x="0"
        y="7"
        textAnchor="middle"
        fontSize="2"
        fill="#ccc"
      >
        {fixture.id}
      </text>
    </g>
  );
};
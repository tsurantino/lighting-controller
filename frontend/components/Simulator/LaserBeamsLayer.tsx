import React from 'react';
import { Laser, LaserOrientation } from '../../types';
import { TOP_LASER_COUNT, SIDE_LASER_COUNT } from '../../constants';
import LaserBeam from '../LaserBeam';

interface LaserBeamsLayerProps {
  lasers: Laser[];
  showLaserOrigins: boolean;
  hazeDensity: number;
  linearGradient: number;
}

export const LaserBeamsLayer: React.FC<LaserBeamsLayerProps> = ({
  lasers,
  showLaserOrigins,
  hazeDensity,
  linearGradient
}) => {
  const calculatePosition = (index: number, count: number): number => {
    if (count <= 1) {
      return 50;
    }
    return (index / (count - 1)) * 100;
  };

  const topLasers = lasers.filter(l => l.orientation === LaserOrientation.Top);
  const sideLasers = lasers.filter(l => l.orientation === LaserOrientation.Side);

  return (
    <>
      {/* Top laser beams */}
      {topLasers.map((laser, index) => (
        <LaserBeam
          key={laser.id}
          orientation={laser.orientation}
          brightness={laser.brightness}
          position={calculatePosition(index, TOP_LASER_COUNT)}
          showOrigin={showLaserOrigins}
          hazeDensity={hazeDensity}
          linearGradient={linearGradient}
        />
      ))}
      
      {/* Side laser beams */}
      {sideLasers.map((laser, index) => (
        <LaserBeam
          key={laser.id}
          orientation={laser.orientation}
          brightness={laser.brightness}
          position={calculatePosition(index, SIDE_LASER_COUNT)}
          showOrigin={showLaserOrigins}
          hazeDensity={hazeDensity}
          linearGradient={linearGradient}
        />
      ))}
    </>
  );
};
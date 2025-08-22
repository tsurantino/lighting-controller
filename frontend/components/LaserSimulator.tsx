import React from 'react';
import { Laser, LaserOrientation } from '../types';
import { TOP_LASER_COUNT, SIDE_LASER_COUNT } from '../constants';
import LaserBeam from './LaserBeam';

interface LaserSimulatorProps {
  lasers: Laser[];
  showLaserOrigins: boolean;
  hazeDensity: number;
  linearGradient: number;
}

const LaserSimulator: React.FC<LaserSimulatorProps> = ({ lasers, showLaserOrigins, hazeDensity, linearGradient }) => {
  const calculatePosition = (index: number, count: number): number => {
    if (count <= 1) {
      return 50;
    }
    return (index / (count - 1)) * 100;
  };

  const topLasers = lasers.filter(l => l.orientation === LaserOrientation.Top);
  const sideLasers = lasers.filter(l => l.orientation === LaserOrientation.Side);

  const containerStyle: React.CSSProperties = {
    boxShadow: `0 0 30px rgba(255,0,0,0.3), inset 0 0 ${hazeDensity * 1.5}px rgba(255,0,0,${hazeDensity / 400})`,
  };

  return (
    <div 
      className="relative w-full aspect-square max-w-2xl mx-auto bg-black border-2 border-[#ff0000]/30 rounded-lg overflow-hidden"
      style={containerStyle}
    >
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
    </div>
  );
};

export default LaserSimulator;

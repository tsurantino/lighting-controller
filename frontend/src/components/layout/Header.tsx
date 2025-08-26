// src/components/layout/Header.tsx
import React from 'react';
import { ViewMode } from '../../types';
import { ConnectionStatus } from '../common/ConnectionStatus';
import Button from '../ui/Button';

interface HeaderProps {
  isConnected: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showSimulator: boolean;
  onToggleSimulator: () => void;
  showConfig: boolean;
  onToggleConfig: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  viewMode,
  onViewModeChange,
  showSimulator,
  onToggleSimulator,
  showConfig,
  onToggleConfig,
}) => {
  return (
    <header className="flex items-center justify-center gap-6 mb-6 flex-shrink-0">
      {/* App Title */}
      <h1 className="text-3xl font-bold text-red-500 tracking-wider">
        red.it.be l1ghts
      </h1>
      
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
        isConnected ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>
      
      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => onViewModeChange(viewMode === 'landscape' ? 'pane' : 'landscape')}
          variant="secondary"
        >
          {viewMode === 'landscape' ? 'Landscape' : 'Pane'}
        </Button>
        
        <Button
          onClick={onToggleSimulator}
          variant={showSimulator ? 'active' : 'inactive'}
        >
          Simulator
        </Button>
        
        <Button
          onClick={onToggleConfig}
          variant={showConfig ? 'active' : 'inactive'}
        >
          {showConfig ? 'Hide Config' : 'Show Config'}
        </Button>
      </div>
    </header>
  );
};

export default Header;
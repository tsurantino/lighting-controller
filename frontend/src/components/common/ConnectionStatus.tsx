// src/components/common/ConnectionStatus.tsx
import React from 'react';
import { LoadingSpinner } from './Loading';

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: string | null;
  onReconnect?: () => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
  onReconnect,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const renderStatusIndicator = () => {
    if (!isConnected && !error) {
      return <LoadingSpinner size="sm" color="gray" />;
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full flex-shrink-0 ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } ${error ? 'animate-pulse' : ''}`} />
    );
  };

  const getStatusText = () => {
    if (error) return error;
    return isConnected ? 'Connected' : 'Connecting...';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-400';
    return isConnected ? 'text-green-400' : 'text-gray-400';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {renderStatusIndicator()}
      
      {showLabel && (
        <span className={`${textSizeClasses[size]} font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      )}
      
      {error && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

interface ServerConnectionBannerProps {
  isConnected: boolean;
  error?: string | null;
  onReconnect?: () => void;
  serverUrl?: string;
}

export const ServerConnectionBanner: React.FC<ServerConnectionBannerProps> = ({
  isConnected,
  error,
  onReconnect,
  serverUrl = 'localhost:5000',
}) => {
  if (isConnected) return null;

  return (
    <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          <div>
            <p className="font-medium">
              {error ? 'Connection Failed' : 'Connecting to Server...'}
            </p>
            <p className="text-sm text-red-200">
              {error || `Attempting to connect to ${serverUrl}`}
            </p>
          </div>
        </div>
        
        {error && onReconnect && (
          <button
            onClick={onReconnect}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};

interface ConnectionIndicatorProps {
  isConnected: boolean;
  label?: string;
  pulseOnDisconnect?: boolean;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  isConnected,
  label = 'Server',
  pulseOnDisconnect = true,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        isConnected 
          ? 'bg-green-500' 
          : `bg-red-500 ${pulseOnDisconnect ? 'animate-pulse' : ''}`
      }`} />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};
// src/components/common/Loading.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'blue' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'red',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    red: 'border-red-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}
    />
  );
};

interface LoadingOverlayProps {
  show: boolean;
  children?: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  children,
  message = 'Loading...',
}) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" color="white" />
        <span className="text-white text-sm">{message}</span>
        {children}
      </div>
    </div>
  );
};

interface InlineLoadingProps {
  show: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  show,
  message,
  size = 'sm',
}) => {
  if (!show) return null;

  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      {message && <span className="text-gray-300 text-sm">{message}</span>}
    </div>
  );
};
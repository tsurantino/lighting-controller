import React from 'react';

export interface ControlSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  vertical?: boolean;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onChange, 
  disabled = false, 
  vertical = false 
}) => {
  const percentage = Math.round(((value - min) / (max - min)) * 100);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  
  if (vertical) {
    const calculateValueFromPosition = (clientY: number, rect: DOMRect) => {
      const relativeY = rect.bottom - clientY;
      const percentage = Math.max(0, Math.min(1, relativeY / rect.height));
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    };

    const updateValue = (newValue: number) => {
      const syntheticEvent = {
        target: { value: newValue.toString() },
        currentTarget: { value: newValue.toString() }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    };

    const handleStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      isDraggingRef.current = true;
      const rect = sliderRef.current!.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newValue = calculateValueFromPosition(clientY, rect);
      updateValue(newValue);
    };

    const handleMove = React.useCallback((e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || disabled || !sliderRef.current) return;
      e.preventDefault();
      const rect = sliderRef.current.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newValue = calculateValueFromPosition(clientY, rect);
      updateValue(newValue);
    }, [disabled, min, max, step, onChange]);

    const handleEnd = React.useCallback(() => {
      isDraggingRef.current = false;
    }, []);

    React.useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleTouchMove = (e: TouchEvent) => handleMove(e);
      const handleMouseUp = () => handleEnd();
      const handleTouchEnd = () => handleEnd();

      if (isDraggingRef.current) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleTouchEnd);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }, [handleMove, handleEnd]);

    return (
      <div className={`flex flex-col items-center space-y-3 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
        <label className="text-sm text-gray-300 text-center font-medium">{label}</label>
        <div 
          ref={sliderRef}
          className="slider-vertical-wrapper"
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{ 
            cursor: disabled ? 'not-allowed' : 'pointer',
            touchAction: 'none'
          }}
        >
          <div className="slider-vertical-track"></div>
          <div 
            className={`slider-vertical-fill ${percentage === 100 ? 'full' : ''}`}
            style={{ height: `${percentage}%` }}
          ></div>
          <div className="slider-vertical-percentage">
            {percentage}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-1 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <label className="flex justify-between text-sm text-gray-300">
        <span>{label}</span>
        <span>{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none accent-red-500 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
    </div>
  );
};
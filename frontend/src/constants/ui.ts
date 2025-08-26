// src/constants/ui.ts
export const UI_CONSTANTS = {
  COLORS: {
    primary: 'red',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    info: 'blue',
  },
  
  SIZES: {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  },
  
  TRANSITIONS: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
  },
} as const;

// Animation constants
export const ANIMATION = {
  BOUNCE_EASE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SMOOTH_EASE: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  DEFAULT_DURATION: 200,
} as const;
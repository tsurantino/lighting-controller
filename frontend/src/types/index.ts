// src/types/index.ts
// Re-export existing types for backward compatibility
export * from './controls.ts';
export * from './laser.ts';
export * from './fixtures.ts';

// Common UI types
export type ViewMode = 'landscape' | 'pane';

export interface ComponentProps {
  className?: string;
  disabled?: boolean;
}
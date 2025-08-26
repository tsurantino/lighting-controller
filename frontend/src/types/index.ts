// src/types/index.ts
// Re-export existing types for backward compatibility
export * from './controls';
export * from './laser';
export * from './fixtures';

// Common UI types
export type ViewMode = 'landscape' | 'pane';

export interface ComponentProps {
  className?: string;
  disabled?: boolean;
}
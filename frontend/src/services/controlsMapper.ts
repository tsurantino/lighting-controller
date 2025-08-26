// src/services/controlsMapper.ts
import { ControlsState } from '../types';

/**
 * Service for mapping frontend controls to backend format
 */
export class ControlsMapper {
  /**
   * Maps frontend controls to backend format, only including changed values
   */
  mapFrontendToBackend(
    currentControls: ControlsState, 
    previousControls: ControlsState
  ): Record<string, any> {
    const backendControls: Record<string, any> = {};
    
    // Iterate through all control keys
    for (const key in currentControls) {
      const typedKey = key as keyof ControlsState;
      const currentValue = currentControls[typedKey];
      const previousValue = previousControls[typedKey];
      
      // Skip if value hasn't changed
      if (this.deepEqual(currentValue, previousValue)) {
        continue;
      }
      
      // Handle special mappings
      switch (typedKey) {
        case 'strobePulseRate':
        case 'strobeOrPulse':
          // These are handled separately in useControls hook
          break;
          
        case 'fixtures':
          // Handle fixture configuration updates
          backendControls['fixtures'] = currentValue;
          break;
          
        case 'lasers':
          // Don't send laser data back to server - it's read-only
          break;
          
        default:
          // Map other controls directly
          backendControls[typedKey] = currentValue;
      }
    }
    
    return backendControls;
  }

  /**
   * Deep equality check for control values
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Validates control values before sending to backend
   */
  validateControls(controls: Partial<ControlsState>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate numeric ranges
    if (controls.dimmer !== undefined && (controls.dimmer < 0 || controls.dimmer > 100)) {
      errors.push('Dimmer must be between 0 and 100');
    }
    
    if (controls.strobePulseRate !== undefined && (controls.strobePulseRate < 0 || controls.strobePulseRate > 100)) {
      errors.push('Strobe/Pulse rate must be between 0 and 100');
    }
    
    if (controls.scrollRate !== undefined && (controls.scrollRate < 0 || controls.scrollRate > 100)) {
      errors.push('Scroll rate must be between 0 and 100');
    }
    
    // Add more validations as needed
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const controlsMapper = new ControlsMapper();
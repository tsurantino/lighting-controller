"""
Main laser simulator class that orchestrates all components.
"""

import time
from typing import List, Dict, Any, Optional
from dataclasses import asdict

from .state import ControlsState
from ..models.laser import Laser
from ..models.enums import LaserOrientation, VisualPreset, ScrollDirection, EffectApplication, BeatRate
from ..models.config import DMXConfig, OSCConfig
from ..effects.base import EffectManager
from ..effects.visual_presets import VisualPresetEffect
from ..effects.pulse import PulseEffect
from ..effects.strobe import StrobeEffect
from ..effects.movement import MovementEffect
from ..controllers.dmx import DMXController
from ..controllers.osc import OSCController
from ..utils.helpers import Timer, apply_dimmer


class LaserSimulator:
    """
    Core laser simulator that orchestrates all lighting effects and controls.
    
    This is the main class that brings together all the modular components:
    - Effects management
    - DMX output
    - OSC control
    - State management
    """
    
    TOP_LASER_COUNT = 14
    SIDE_LASER_COUNT = 14
    DEFAULT_BRIGHTNESS = 255
    
    def __init__(self, dmx_config: Optional[DMXConfig] = None, 
                 osc_config: Optional[OSCConfig] = None):
        """
        Initialize the laser simulator.
        
        Args:
            dmx_config: DMX output configuration (optional)
            osc_config: OSC control configuration (optional)
        """
        # Core state
        self.lasers: List[Laser] = []
        self.controls = ControlsState()
        self.timer = Timer()
        
        # Configuration
        self.dmx_config = dmx_config or DMXConfig()
        self.osc_config = osc_config or OSCConfig()
        
        # Controllers
        self.dmx_controller: Optional[DMXController] = None
        self.osc_controller: Optional[OSCController] = None
        
        # Effects system
        self.effect_manager = EffectManager()
        self._setup_effects()
        
        # Initialize components
        self._initialize_lasers()
        self._setup_controllers()
        
        print(f"Laser Simulator initialized with {len(self.lasers)} lasers")
    
    def _initialize_lasers(self) -> None:
        """Initialize all laser objects with DMX addresses."""
        self.lasers = []
        dmx_addr = self.dmx_config.start_address
        
        # Top lasers (left to right)
        for i in range(self.TOP_LASER_COUNT):
            self.lasers.append(
                Laser(
                    id=f"top-{i}", 
                    orientation=LaserOrientation.TOP, 
                    brightness=0,
                    dmx_address=dmx_addr
                )
            )
            dmx_addr += 1
        
        # Side lasers (top to bottom)
        for i in range(self.SIDE_LASER_COUNT):
            self.lasers.append(
                Laser(
                    id=f"side-{i}", 
                    orientation=LaserOrientation.SIDE, 
                    brightness=0,
                    dmx_address=dmx_addr
                )
            )
            dmx_addr += 1
    
    def _setup_effects(self) -> None:
        """Initialize and register all effects."""
        # Add effects in the order they should be applied
        self.effect_manager.add_effect(VisualPresetEffect())
        self.effect_manager.add_effect(PulseEffect())
        self.effect_manager.add_effect(StrobeEffect())
        self.effect_manager.add_effect(MovementEffect())
    
    def _setup_controllers(self) -> None:
        """Setup external controllers."""
        # DMX Controller
        if self.dmx_config.enabled:
            self.dmx_controller = DMXController(self.dmx_config)
            if self.dmx_controller.connect():
                print("DMX controller connected")
            else:
                print("DMX controller failed to connect")
        
        # OSC Controller
        if self.osc_config.enabled:
            self.osc_controller = OSCController(self.osc_config, self._handle_osc_control)
            if self.osc_controller.is_running():
                print("OSC controller started")
            else:
                print("OSC controller failed to start")
    
    def _handle_osc_control(self, control_name: str, value: Any) -> None:
        """Handle OSC control messages."""
        try:
            if hasattr(self.controls, control_name):
                current_value = getattr(self.controls, control_name)
                
                # Handle enum conversions
                if hasattr(current_value, 'value'):  # It's an enum
                    enum_class = type(current_value)
                    try:
                        if control_name == "scroll_direction":
                            # Special handling for scroll direction
                            for direction in ScrollDirection:
                                if direction.value == value:
                                    setattr(self.controls, control_name, direction)
                                    return
                            # Fallback to NONE if not found
                            setattr(self.controls, control_name, ScrollDirection.NONE)
                        else:
                            setattr(self.controls, control_name, enum_class(value))
                    except ValueError:
                        # Keep current value if conversion fails
                        print(f"Failed to convert value '{value}' for enum {enum_class.__name__}")
                else:
                    setattr(self.controls, control_name, value)
                    
                print(f"Control updated: {control_name} = {value}")
            else:
                print(f"Unknown control: {control_name}")
                
        except Exception as e:
            print(f"Error handling OSC control {control_name}: {e}")
    
    def update(self, current_time: Optional[float] = None) -> None:
        """
        Update all laser brightnesses based on current controls and time.
        
        Args:
            current_time: Current time in seconds (uses internal timer if None)
        """
        if current_time is None:
            current_time = self.timer.elapsed()
        
        delta_time = self.timer.delta()
        
        # Reset all lasers to 0
        for laser in self.lasers:
            laser.brightness = 0
        
        # Apply all effects in sequence
        self.effect_manager.apply_all_effects(
            self.lasers, 
            self.controls, 
            current_time,
            delta_time=delta_time,
            base_brightness=self.DEFAULT_BRIGHTNESS
        )
        
        # Apply master dimmer as final step
        self._apply_dimmer()
        
        # Update external controllers
        self._update_controllers()
    
    def _apply_dimmer(self) -> None:
        """Apply master dimmer to all lasers."""
        for laser in self.lasers:
            laser.brightness = apply_dimmer(laser.brightness, self.controls.dimmer)
    
    def _update_controllers(self) -> None:
        """Update all external controllers."""
        if self.dmx_controller:
            self.dmx_controller.update_lasers(self.lasers)
            self.dmx_controller.send_dmx()
    
    # Public API methods
    def set_control(self, control_name: str, value: Any) -> bool:
        """
        Set a control value by name.
        
        Args:
            control_name: Name of the control to set
            value: Value to set
            
        Returns:
            True if control was set successfully
        """
        try:
            self._handle_osc_control(control_name, value)
            return True
        except Exception as e:
            print(f"Failed to set control {control_name}: {e}")
            return False
    
    def get_control(self, control_name: str) -> Any:
        """Get current value of a control."""
        if hasattr(self.controls, control_name):
            return getattr(self.controls, control_name)
        return None
    
    def get_state(self) -> Dict[str, Any]:
        """Get current simulator state for web interface."""
        # Convert lasers to dictionaries
        laser_dicts = []
        for laser in self.lasers:
            laser_dict = asdict(laser)
            laser_dict['orientation'] = laser.orientation.value
            laser_dicts.append(laser_dict)
            
        return {
            "controls": self.controls.to_dict(),
            "lasers": laser_dicts,
            "stats": self.get_stats()
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get simulator statistics."""
        active_lasers = [l for l in self.lasers if l.brightness > 0]
        
        return {
            "total_lasers": len(self.lasers),
            "active_lasers": len(active_lasers),
            "max_brightness": max((l.brightness for l in active_lasers), default=0),
            "avg_brightness": sum(l.brightness for l in active_lasers) / len(active_lasers) if active_lasers else 0,
            "dmx_connected": self.dmx_controller.is_connected() if self.dmx_controller else False,
            "osc_running": self.osc_controller.is_running() if self.osc_controller else False,
            "uptime": self.timer.elapsed()
        }
    
    def get_dmx_values(self) -> List[int]:
        """Get DMX values for all lasers."""
        return [laser.brightness for laser in self.lasers]
    
    def get_dmx_mapping(self) -> Dict[str, int]:
        """Get current DMX address mapping."""
        return {laser.id: laser.dmx_address for laser in self.lasers}
    
    def set_dmx_address(self, laser_id: str, address: int) -> bool:
        """Set DMX address for specific laser."""
        for laser in self.lasers:
            if laser.id == laser_id:
                if 1 <= address <= 512:
                    laser.dmx_address = address
                    return True
                break
        return False
    
    def reset(self) -> None:
        """Reset simulator to initial state."""
        self.controls = ControlsState()
        self.timer.reset()
        
        # Reset all laser brightnesses
        for laser in self.lasers:
            laser.brightness = 0
        
        # Reset effect states
        for effect in self.effect_manager.effects:
            if hasattr(effect, 'reset_state'):
                effect.reset_state()
        
        print("Simulator reset to initial state")
    
    def cleanup(self) -> None:
        """Cleanup resources and disconnect controllers."""
        print("Cleaning up laser simulator...")
        
        if self.dmx_controller:
            self.dmx_controller.disconnect()
        
        if self.osc_controller:
            self.osc_controller.stop()
        
        print("Cleanup complete")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.cleanup()
    
    def __repr__(self) -> str:
        """String representation of the simulator."""
        active_count = len([l for l in self.lasers if l.brightness > 0])
        return (f"LaserSimulator({len(self.lasers)} lasers, "
                f"{active_count} active, "
                f"preset={self.controls.visual_preset.value})")


# Backward compatibility function
def create_simulator(dmx_enabled: bool = False, osc_enabled: bool = False) -> LaserSimulator:
    """
    Create a laser simulator with simple configuration.
    
    Args:
        dmx_enabled: Enable DMX output
        osc_enabled: Enable OSC control
        
    Returns:
        Configured LaserSimulator instance
    """
    dmx_config = DMXConfig(enabled=dmx_enabled) if dmx_enabled else None
    osc_config = OSCConfig(enabled=osc_enabled) if osc_enabled else None
    
    return LaserSimulator(dmx_config=dmx_config, osc_config=osc_config)


# Example usage for testing
if __name__ == "__main__":
    # Simple test - create simulator and run for a few seconds
    simulator = create_simulator(dmx_enabled=False, osc_enabled=False)
    
    try:
        # Set some test values
        simulator.set_control("visual_preset", "Cross")
        simulator.set_control("dimmer", 80)
        simulator.set_control("scroll_direction", "L to R")
        simulator.set_control("laser_move_speed", 50)
        
        print("Running simulator test...")
        start_time = time.time()
        
        while time.time() - start_time < 5.0:  # Run for 5 seconds
            simulator.update()
            time.sleep(1/60)  # 60 FPS
            
        print("Test complete")
        print(f"Final state: {simulator.get_stats()}")
        
    except KeyboardInterrupt:
        print("Test interrupted")
    finally:
        simulator.cleanup()
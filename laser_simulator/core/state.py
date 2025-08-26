"""
State management for the laser simulator.
"""

from dataclasses import dataclass, asdict
from typing import Dict, Any
from ..models.enums import VisualPreset, ScrollDirection, EffectApplication, BeatRate


@dataclass
class ControlsState:
    """Current state of all simulator controls."""
    # Basic controls
    dimmer: int = 100
    strobe: int = 0
    pulse: int = 0
    effect_application: EffectApplication = EffectApplication.ALL
    visual_preset: VisualPreset = VisualPreset.GRID
    
    # Movement controls
    scroll_direction: ScrollDirection = ScrollDirection.NONE
    laser_move_speed: int = 60              # Renamed from scroll_rate
    shocker_speed: int = 50                 # Added for manual slider
    saber_speed: int = 50                   # Added for manual slider
    scroll_laser_count: int = 8
    scroll_fade: int = 90
    scroll_phase: int = 0
    loop_effect: bool = False
    scroll_build_effect: bool = False
    
    # Display controls
    show_laser_origins: bool = False
    
    # Beat sync controls
    beat_sync_enabled: bool = False
    bpm: int = 140
    beat_strobe_rate: BeatRate = BeatRate.OFF
    beat_pulse_rate: BeatRate = BeatRate.OFF
    beat_laser_move_speed_rate: BeatRate = BeatRate.OFF
    beat_shocker_speed_rate: BeatRate = BeatRate.OFF
    beat_saber_speed_rate: BeatRate = BeatRate.OFF
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {}
        for key, value in asdict(self).items():
            if hasattr(value, 'value'):  # Enum
                result[key] = value.value
            else:
                result[key] = value
        return result
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update state from dictionary."""
        for key, value in data.items():
            if hasattr(self, key):
                attr = getattr(self, key)
                if hasattr(attr, 'value'):  # Enum field
                    # Find the enum class and convert
                    enum_class = type(attr)
                    try:
                        setattr(self, key, enum_class(value))
                    except ValueError:
                        # Keep current value if conversion fails
                        continue
                else:
                    setattr(self, key, value)
    
    def validate(self) -> None:
        """Validate all control values."""
        if not (0 <= self.dimmer <= 100):
            raise ValueError(f"Dimmer must be 0-100, got {self.dimmer}")
        if not (0 <= self.strobe <= 100):
            raise ValueError(f"Strobe must be 0-100, got {self.strobe}")
        if not (0 <= self.pulse <= 100):
            raise ValueError(f"Pulse must be 0-100, got {self.pulse}")
        if not (1 <= self.laser_move_speed <= 100):
            raise ValueError(f"Laser move speed must be 1-100, got {self.laser_move_speed}")
        if not (1 <= self.bpm <= 300):
            raise ValueError(f"BPM must be 1-300, got {self.bpm}")
        # Add more validations as needed
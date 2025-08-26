"""
Strobe effects for laser flashing.
"""

import math
from typing import List
from .base import BaseEffect
from ..models.laser import Laser
from ..models.enums import LaserOrientation, EffectApplication
from ..core.state import ControlsState
from ..beat_sync.sync import BeatSync


class StrobeEffect(BaseEffect):
    """Applies strobe (flashing) effects to lasers."""
    
    def __init__(self):
        super().__init__("strobe")
    
    def is_active(self, controls: ControlsState) -> bool:
        """Check if strobe effect should be active."""
        return (self.enabled and 
                (controls.strobe > 0 or 
                 BeatSync.is_beat_effect_active(controls.beat_sync_enabled, 
                                              controls.bpm, 
                                              controls.beat_strobe_rate)))
    
    def apply(self, lasers: List[Laser], controls: ControlsState, 
              current_time: float, **kwargs) -> None:
        """Apply strobe effect to lasers."""
        # Check for beat-synced strobe first
        beat_interval = BeatSync.calculate_beat_interval(controls.bpm)
        use_beat_strobe = BeatSync.is_beat_effect_active(
            controls.beat_sync_enabled, controls.bpm, controls.beat_strobe_rate
        )
        
        strobe_is_on = True
        cycle_count = 0
        
        if use_beat_strobe:
            strobe_is_on, cycle_count = self._calculate_beat_strobe_state(
                current_time, beat_interval, controls.beat_strobe_rate
            )
        elif controls.strobe > 0:
            strobe_is_on, cycle_count = self._calculate_manual_strobe_state(
                current_time, controls.strobe
            )
        else:
            return  # No strobe active
        
        # Apply strobe effect
        self._apply_strobe_state(lasers, controls, strobe_is_on, cycle_count)
    
    def _calculate_beat_strobe_state(self, current_time: float, beat_interval: float,
                                   beat_strobe_rate) -> tuple[bool, int]:
        """Calculate strobe on/off state for beat-synced strobe."""
        phase, cycle_count = BeatSync.calculate_beat_phase(
            current_time, beat_interval, beat_strobe_rate
        )
        
        # 50% duty cycle - on for first half of beat
        strobe_is_on = phase < 0.5
        return strobe_is_on, cycle_count
    
    def _calculate_manual_strobe_state(self, current_time: float, 
                                     strobe_intensity: int) -> tuple[bool, int]:
        """Calculate strobe on/off state for manual strobe."""
        # Use square wave for reliable strobing
        strobe_frequency = (strobe_intensity / 100) * 20  # Max 20 Hz
        
        if strobe_frequency <= 0:
            return True, 0
        
        period = 1.0 / strobe_frequency
        phase = (current_time % period) / period  # 0 to 1
        strobe_is_on = phase < 0.5  # On for first half of cycle
        cycle_count = math.floor(current_time * strobe_frequency)
        
        return strobe_is_on, cycle_count
    
    def _apply_strobe_state(self, lasers: List[Laser], controls: ControlsState,
                           strobe_is_on: bool, cycle_count: int) -> None:
        """Apply the calculated strobe state to lasers."""
        if not strobe_is_on:
            # Turn off all lasers during strobe off phase
            for laser in lasers:
                laser.brightness = 0
        elif controls.effect_application == EffectApplication.ALTERNATE:
            # Alternate between top and side lasers
            is_top_active = (cycle_count % 2 == 0)
            for laser in lasers:
                if ((is_top_active and laser.orientation == LaserOrientation.SIDE) or 
                    (not is_top_active and laser.orientation == LaserOrientation.TOP)):
                    laser.brightness = 0
        # If strobe_is_on and not alternating, leave lasers as they are
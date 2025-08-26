"""
Pulse effects for laser brightness modulation.
"""

import math
from typing import List
from .base import BaseEffect
from ..models.laser import Laser
from ..models.enums import LaserOrientation, EffectApplication
from ..core.state import ControlsState
from ..beat_sync.sync import BeatSync


class PulseEffect(BaseEffect):
    """Applies pulsing brightness modulation to lasers."""
    
    def __init__(self):
        super().__init__("pulse")
    
    def is_active(self, controls: ControlsState) -> bool:
        """Check if pulse effect should be active."""
        return (self.enabled and 
                (controls.pulse > 0 or 
                 BeatSync.is_beat_effect_active(controls.beat_sync_enabled, 
                                              controls.bpm, 
                                              controls.beat_pulse_rate)))
    
    def apply(self, lasers: List[Laser], controls: ControlsState, 
              current_time: float, **kwargs) -> None:
        """Apply pulse effect to lasers."""
        # Check for beat-synced pulse first
        beat_interval = BeatSync.calculate_beat_interval(controls.bpm)
        use_beat_pulse = BeatSync.is_beat_effect_active(
            controls.beat_sync_enabled, controls.bpm, controls.beat_pulse_rate
        )
        
        if use_beat_pulse:
            self._apply_beat_synced_pulse(lasers, controls, current_time, beat_interval)
        elif controls.pulse > 0:
            self._apply_manual_pulse(lasers, controls, current_time)
    
    def _apply_beat_synced_pulse(self, lasers: List[Laser], controls: ControlsState,
                                current_time: float, beat_interval: float) -> None:
        """Apply beat-synchronized pulse effect."""
        phase, _ = BeatSync.calculate_beat_phase(
            current_time, beat_interval, controls.beat_pulse_rate
        )
        
        # Create smooth sine wave pulse
        pulse_value = (math.sin(phase * math.pi * 2 - math.pi / 2) + 1) / 2
        brightness_multiplier = 0.2 + pulse_value * 0.8
        
        # Beat-synced pulse applies to all lasers
        for laser in lasers:
            if laser.brightness > 0:
                laser.brightness = int(laser.brightness * brightness_multiplier)
    
    def _apply_manual_pulse(self, lasers: List[Laser], controls: ControlsState,
                           current_time: float) -> None:
        """Apply manual pulse effect."""
        pulse_frequency = (controls.pulse / 100) * 6  # Max 6 Hz
        time_phase = current_time * math.pi * 2 * pulse_frequency
        
        if controls.effect_application == EffectApplication.ALTERNATE:
            self._apply_alternate_pulse(lasers, time_phase)
        else:
            self._apply_all_pulse(lasers, time_phase)
    
    def _apply_alternate_pulse(self, lasers: List[Laser], time_phase: float) -> None:
        """Apply alternating pulse between top and side lasers."""
        overlap_opacity = 0.4
        phi = math.asin(overlap_opacity)
        single_pulse_duration = math.pi
        start_delay = single_pulse_duration - phi
        total_period = 2 * start_delay
        
        master_phase = time_phase % total_period
        
        # Calculate top laser brightness multiplier
        top_brightness_mult = 0
        if master_phase < single_pulse_duration:
            top_brightness_mult = math.sin(master_phase)
        
        # Calculate side laser brightness multiplier
        side_brightness_mult = 0
        side_phase = master_phase - start_delay
        if side_phase < 0:
            side_phase += total_period
        if side_phase < single_pulse_duration:
            side_brightness_mult = math.sin(side_phase)
        
        # Apply to lasers
        for laser in lasers:
            if laser.brightness > 0:
                if laser.orientation == LaserOrientation.TOP:
                    laser.brightness = int(laser.brightness * top_brightness_mult)
                else:
                    laser.brightness = int(laser.brightness * side_brightness_mult)
    
    def _apply_all_pulse(self, lasers: List[Laser], time_phase: float) -> None:
        """Apply pulse to all lasers simultaneously."""
        pulse_value = (math.sin(time_phase) + 1) / 2
        brightness_mult = 0.2 + pulse_value * 0.8
        
        for laser in lasers:
            if laser.brightness > 0:
                laser.brightness = int(laser.brightness * brightness_mult)
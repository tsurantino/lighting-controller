"""
Beat synchronization functionality for effects.
"""

import math
from typing import Optional, Tuple
from ..models.enums import BeatRate


class BeatSync:
    """Handles beat synchronization calculations for effects."""
    
    @staticmethod
    def get_beat_rate_multiplier(rate: BeatRate) -> float:
        """Convert a BeatRate enum to a frequency multiplier."""
        multipliers = {
            BeatRate.ONE_THIRD: 3.0,
            BeatRate.ONE_HALF: 2.0,
            BeatRate.ONE: 1.0,
            BeatRate.FOUR: 1.0 / 4.0,
            BeatRate.OFF: 0.0
        }
        return multipliers.get(rate, 0.0)
    
    @staticmethod
    def calculate_beat_interval(bpm: int) -> float:
        """Calculate beat interval from BPM."""
        if bpm <= 0:
            return 0.0
        return 60.0 / bpm
    
    @staticmethod
    def is_beat_effect_active(beat_sync_enabled: bool, bpm: int, beat_rate: BeatRate) -> bool:
        """Check if a beat-synced effect should be active."""
        return (beat_sync_enabled and 
                bpm > 0 and 
                beat_rate != BeatRate.OFF and 
                BeatSync.get_beat_rate_multiplier(beat_rate) > 0)
    
    @staticmethod
    def calculate_beat_phase(current_time: float, beat_interval: float, 
                           beat_rate: BeatRate) -> Tuple[float, int]:
        """
        Calculate beat phase and cycle count for an effect.
        
        Returns:
            Tuple of (phase, cycle_count) where phase is 0-1 within the beat cycle
        """
        rate_multiplier = BeatSync.get_beat_rate_multiplier(beat_rate)
        if rate_multiplier <= 0 or beat_interval <= 0:
            return 0.0, 0
        
        effect_duration = beat_interval / rate_multiplier
        phase = (current_time % effect_duration) / effect_duration
        cycle_count = math.floor(current_time / effect_duration)
        
        return phase, cycle_count
    
    @staticmethod
    def calculate_quantized_time(current_time: float, beat_interval: float, 
                               beat_rate: BeatRate) -> float:
        """
        Calculate quantized time for stepped beat-synced effects.
        
        Returns the start time of the current beat for stepped movement effects.
        """
        rate_multiplier = BeatSync.get_beat_rate_multiplier(beat_rate)
        if rate_multiplier <= 0 or beat_interval <= 0:
            return current_time
        
        beat_duration = beat_interval / rate_multiplier
        beat_count = math.floor(current_time / beat_duration)
        return beat_count * beat_duration
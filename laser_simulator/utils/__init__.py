# laser_simulator/utils/__init__.py
"""
Utility functions and helpers.
"""

from .helpers import (
    clamp, lerp, map_range, normalize_brightness, denormalize_brightness,
    apply_dimmer, Timer, FrameRateCounter, create_laser_grid_positions,
    calculate_distance, smooth_step, ease_in_out, validate_laser_data,
    format_time_duration, debug_print_laser_states, MovingAverage
)

__all__ = [
    'clamp', 'lerp', 'map_range', 'normalize_brightness', 'denormalize_brightness',
    'apply_dimmer', 'Timer', 'FrameRateCounter', 'create_laser_grid_positions',
    'calculate_distance', 'smooth_step', 'ease_in_out', 'validate_laser_data',
    'format_time_duration', 'debug_print_laser_states', 'MovingAverage'
]
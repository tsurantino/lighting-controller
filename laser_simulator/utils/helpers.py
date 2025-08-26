"""
Utility functions and helpers for the laser simulator.
"""

import time
import math
from typing import Dict, Any, List, Tuple
from ..models.enums import LaserOrientation


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a value between min and max bounds."""
    return max(min_val, min(max_val, value))


def lerp(start: float, end: float, t: float) -> float:
    """Linear interpolation between start and end."""
    return start + (end - start) * t


def map_range(value: float, in_min: float, in_max: float, 
              out_min: float, out_max: float) -> float:
    """Map a value from one range to another."""
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min


def normalize_brightness(brightness: int) -> float:
    """Normalize brightness from 0-255 to 0.0-1.0."""
    return clamp(brightness / 255.0, 0.0, 1.0)


def denormalize_brightness(normalized: float) -> int:
    """Convert normalized brightness (0.0-1.0) to 0-255."""
    return int(clamp(normalized * 255, 0, 255))


def apply_dimmer(brightness: int, dimmer_percent: int) -> int:
    """Apply dimmer percentage to brightness value."""
    if dimmer_percent <= 0:
        return 0
    if dimmer_percent >= 100:
        return brightness
    return int(brightness * (dimmer_percent / 100))


class Timer:
    """Simple timer utility for tracking elapsed time."""
    
    def __init__(self):
        self.start_time = time.time()
        self.last_time = self.start_time
    
    def reset(self) -> None:
        """Reset the timer to current time."""
        self.start_time = time.time()
        self.last_time = self.start_time
    
    def elapsed(self) -> float:
        """Get total elapsed time since timer creation/reset."""
        return time.time() - self.start_time
    
    def delta(self) -> float:
        """Get time since last delta() call."""
        current_time = time.time()
        delta_time = current_time - self.last_time
        self.last_time = current_time
        return delta_time


class FrameRateCounter:
    """Track and calculate frame rate."""
    
    def __init__(self, sample_size: int = 60):
        self.sample_size = sample_size
        self.frame_times: List[float] = []
        self.last_frame_time = time.time()
    
    def update(self) -> None:
        """Update with a new frame."""
        current_time = time.time()
        frame_time = current_time - self.last_frame_time
        self.last_frame_time = current_time
        
        self.frame_times.append(frame_time)
        if len(self.frame_times) > self.sample_size:
            self.frame_times.pop(0)
    
    def get_fps(self) -> float:
        """Get current frames per second."""
        if len(self.frame_times) < 2:
            return 0.0
        
        avg_frame_time = sum(self.frame_times) / len(self.frame_times)
        if avg_frame_time <= 0:
            return 0.0
        
        return 1.0 / avg_frame_time
    
    def get_frame_time_ms(self) -> float:
        """Get average frame time in milliseconds."""
        if not self.frame_times:
            return 0.0
        return (sum(self.frame_times) / len(self.frame_times)) * 1000


def create_laser_grid_positions(top_count: int, side_count: int) -> Dict[str, Tuple[float, float]]:
    """
    Create normalized grid positions for laser array.
    
    Returns:
        Dictionary mapping laser IDs to (x, y) positions in range 0.0-1.0
    """
    positions = {}
    
    # Top lasers (horizontal line)
    for i in range(top_count):
        x = i / (top_count - 1) if top_count > 1 else 0.5
        positions[f"top-{i}"] = (x, 0.0)
    
    # Side lasers (vertical line)
    for i in range(side_count):
        y = i / (side_count - 1) if side_count > 1 else 0.5
        positions[f"side-{i}"] = (1.0, y)
    
    return positions


def calculate_distance(pos1: Tuple[float, float], pos2: Tuple[float, float]) -> float:
    """Calculate Euclidean distance between two points."""
    dx = pos2[0] - pos1[0]
    dy = pos2[1] - pos1[1]
    return math.sqrt(dx * dx + dy * dy)


def smooth_step(edge0: float, edge1: float, x: float) -> float:
    """Smooth step function for smooth transitions."""
    if x <= edge0:
        return 0.0
    if x >= edge1:
        return 1.0
    
    t = (x - edge0) / (edge1 - edge0)
    return t * t * (3.0 - 2.0 * t)


def ease_in_out(t: float) -> float:
    """Ease in-out function for smooth animation curves."""
    return t * t * (3.0 - 2.0 * t)


def validate_laser_data(laser_data: Dict[str, Any]) -> bool:
    """Validate laser data dictionary."""
    required_fields = ['id', 'orientation', 'brightness', 'dmx_address']
    
    for field in required_fields:
        if field not in laser_data:
            return False
    
    # Validate brightness range
    brightness = laser_data.get('brightness', 0)
    if not isinstance(brightness, (int, float)) or not (0 <= brightness <= 255):
        return False
    
    # Validate DMX address range
    dmx_address = laser_data.get('dmx_address', 1)
    if not isinstance(dmx_address, int) or not (1 <= dmx_address <= 512):
        return False
    
    # Validate orientation
    orientation = laser_data.get('orientation', '')
    if orientation not in [LaserOrientation.TOP.value, LaserOrientation.SIDE.value]:
        return False
    
    return True


def format_time_duration(seconds: float) -> str:
    """Format time duration in a human-readable format."""
    if seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        secs = seconds % 60
        return f"{minutes}m {secs:.1f}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"


def debug_print_laser_states(lasers: List[Any], max_display: int = 10) -> None:
    """Print debug information about laser states."""
    active_lasers = [l for l in lasers if l.brightness > 0]
    
    print(f"Laser Status: {len(active_lasers)}/{len(lasers)} active")
    
    if active_lasers:
        print("Active lasers:")
        for i, laser in enumerate(active_lasers[:max_display]):
            print(f"  {laser.id}: {laser.brightness}")
        
        if len(active_lasers) > max_display:
            print(f"  ... and {len(active_lasers) - max_display} more")


class MovingAverage:
    """Calculate moving average over a window of values."""
    
    def __init__(self, window_size: int = 10):
        self.window_size = max(1, window_size)
        self.values: List[float] = []
        self.sum = 0.0
    
    def add_value(self, value: float) -> None:
        """Add a new value to the moving average."""
        self.values.append(value)
        self.sum += value
        
        if len(self.values) > self.window_size:
            removed_value = self.values.pop(0)
            self.sum -= removed_value
    
    def get_average(self) -> float:
        """Get the current moving average."""
        if not self.values:
            return 0.0
        return self.sum / len(self.values)
    
    def reset(self) -> None:
        """Reset the moving average."""
        self.values.clear()
        self.sum = 0.0
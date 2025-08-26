"""
Laser model definition.
"""

from dataclasses import dataclass
from .enums import LaserOrientation


@dataclass
class Laser:
    """Represents a single laser in the array."""
    id: str
    orientation: LaserOrientation
    brightness: int = 0  # 0-255
    dmx_address: int = 1  # DMX channel (1-512)
    
    def __post_init__(self):
        """Validate laser properties after initialization."""
        if not (0 <= self.brightness <= 255):
            raise ValueError(f"Brightness must be 0-255, got {self.brightness}")
        if not (1 <= self.dmx_address <= 512):
            raise ValueError(f"DMX address must be 1-512, got {self.dmx_address}")
    
    def set_brightness(self, brightness: int) -> None:
        """Set laser brightness with validation."""
        if not (0 <= brightness <= 255):
            raise ValueError(f"Brightness must be 0-255, got {brightness}")
        self.brightness = brightness
    
    def is_active(self) -> bool:
        """Check if laser is currently active (brightness > 0)."""
        return self.brightness > 0
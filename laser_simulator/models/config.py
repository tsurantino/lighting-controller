"""
Configuration models for external interfaces.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class DMXConfig:
    """Configuration for DMX output interface."""
    enabled: bool = False
    port: str = "COM3"  # Serial port for DMX interface
    universe: int = 1
    start_address: int = 1  # Starting DMX address
    baudrate: int = 115200
    timeout: float = 1.0
    
    def __post_init__(self):
        """Validate configuration values."""
        if not (1 <= self.universe <= 63999):
            raise ValueError(f"Universe must be 1-63999, got {self.universe}")
        if not (1 <= self.start_address <= 512):
            raise ValueError(f"Start address must be 1-512, got {self.start_address}")


@dataclass 
class OSCConfig:
    """Configuration for OSC control interface."""
    enabled: bool = False
    listen_port: int = 8000
    send_host: str = "127.0.0.1"
    send_port: int = 8001
    address_prefix: str = "/laser"
    
    def __post_init__(self):
        """Validate configuration values."""
        if not (1 <= self.listen_port <= 65535):
            raise ValueError(f"Listen port must be 1-65535, got {self.listen_port}")
        if not (1 <= self.send_port <= 65535):
            raise ValueError(f"Send port must be 1-65535, got {self.send_port}")
        if not self.address_prefix.startswith('/'):
            raise ValueError(f"Address prefix must start with '/', got {self.address_prefix}")
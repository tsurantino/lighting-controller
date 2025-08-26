"""
DMX controller for laser output.
"""

from typing import List, Optional
from ..models.config import DMXConfig
from ..models.laser import Laser

try:
    import serial
    DMX_AVAILABLE = True
except ImportError:
    DMX_AVAILABLE = False


class DMXController:
    """Handles DMX output for laser control."""
    
    def __init__(self, config: DMXConfig):
        self.config = config
        self.serial_port: Optional[serial.Serial] = None
        self.dmx_data = [0] * 512  # DMX universe data
        self.connected = False
        
    def connect(self) -> bool:
        """Connect to DMX interface."""
        if not DMX_AVAILABLE or not self.config.enabled:
            return False
            
        try:
            self.serial_port = serial.Serial(
                port=self.config.port,
                baudrate=self.config.baudrate,
                timeout=self.config.timeout
            )
            self.connected = True
            print(f"DMX connected on {self.config.port}")
            return True
        except Exception as e:
            print(f"DMX connection failed: {e}")
            self.connected = False
            return False
    
    def disconnect(self) -> None:
        """Disconnect from DMX interface."""
        if self.serial_port:
            try:
                self.serial_port.close()
                print("DMX disconnected")
            except Exception as e:
                print(f"DMX disconnect error: {e}")
            finally:
                self.serial_port = None
                self.connected = False
    
    def is_connected(self) -> bool:
        """Check if DMX interface is connected."""
        return self.connected and self.serial_port is not None
    
    def update_laser(self, laser: Laser) -> bool:
        """Update DMX data for a single laser."""
        if not self.config.enabled:
            return False
            
        if 1 <= laser.dmx_address <= 512:
            # DMX addresses are 1-based, array is 0-based
            self.dmx_data[laser.dmx_address - 1] = max(0, min(255, laser.brightness))
            return True
        return False
    
    def update_lasers(self, lasers: List[Laser]) -> int:
        """Update DMX data for multiple lasers."""
        updated_count = 0
        for laser in lasers:
            if self.update_laser(laser):
                updated_count += 1
        return updated_count
    
    def set_channel_value(self, channel: int, value: int) -> bool:
        """Set a specific DMX channel value."""
        if not self.config.enabled:
            return False
            
        if 1 <= channel <= 512 and 0 <= value <= 255:
            self.dmx_data[channel - 1] = value
            return True
        return False
    
    def get_channel_value(self, channel: int) -> Optional[int]:
        """Get a specific DMX channel value."""
        if 1 <= channel <= 512:
            return self.dmx_data[channel - 1]
        return None
    
    def clear_all_channels(self) -> None:
        """Clear all DMX channel values to 0."""
        self.dmx_data = [0] * 512
    
    def send_dmx(self) -> bool:
        """Send DMX data to interface."""
        if not self.is_connected() or not self.config.enabled:
            return False
            
        try:
            # Simple DMX protocol - adjust based on your interface
            # This is a basic example - you may need to modify for your specific DMX interface
            packet = self._build_dmx_packet()
            self.serial_port.write(packet)
            return True
        except Exception as e:
            print(f"DMX send error: {e}")
            self.connected = False
            return False
    
    def _build_dmx_packet(self) -> bytes:
        """Build DMX packet for transmission."""
        # Basic DMX packet structure - modify as needed for your interface
        # This is a simple example that may need adjustment
        header = [0x7E]  # Start byte
        footer = [0xE7]  # End byte
        
        packet = bytes(header + self.dmx_data + footer)
        return packet
    
    def get_universe_data(self) -> List[int]:
        """Get copy of current DMX universe data."""
        return self.dmx_data.copy()
    
    def get_active_channels(self) -> List[int]:
        """Get list of channels with non-zero values."""
        return [i + 1 for i, value in enumerate(self.dmx_data) if value > 0]
    
    def get_channel_summary(self) -> dict:
        """Get summary of DMX channel usage."""
        active_channels = self.get_active_channels()
        return {
            'total_channels': 512,
            'active_channels': len(active_channels),
            'active_channel_list': active_channels,
            'universe': self.config.universe,
            'start_address': self.config.start_address,
            'connected': self.is_connected()
        }
    
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
    
    def __repr__(self) -> str:
        """String representation of DMX controller."""
        status = "connected" if self.is_connected() else "disconnected"
        return f"DMXController(port={self.config.port}, universe={self.config.universe}, {status})"
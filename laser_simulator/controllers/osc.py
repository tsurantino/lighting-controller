"""
OSC controller for external control interface.
"""

from typing import Callable, Optional, Any
from threading import Thread
from ..models.config import OSCConfig

try:
    from pythonosc import dispatcher, udp_client
    from pythonosc.osc_server import BlockingOSCUDPServer
    OSC_AVAILABLE = True
except ImportError:
    OSC_AVAILABLE = False


class OSCController:
    """Handles OSC input/output for external control."""
    
    def __init__(self, config: OSCConfig, message_callback: Callable[[str, Any], None]):
        self.config = config
        self.message_callback = message_callback
        self.client: Optional[udp_client.SimpleUDPClient] = None
        self.server: Optional[BlockingOSCUDPServer] = None
        self.server_thread: Optional[Thread] = None
        self.running = False
        
        if OSC_AVAILABLE and config.enabled:
            self._setup_osc()
    
    def _setup_osc(self) -> bool:
        """Setup OSC client and server."""
        try:
            # OSC client for sending
            self.client = udp_client.SimpleUDPClient(
                self.config.send_host, 
                self.config.send_port
            )
            
            # OSC server for receiving
            disp = dispatcher.Dispatcher()
            self._register_handlers(disp)
            
            self.server = BlockingOSCUDPServer(
                ("0.0.0.0", self.config.listen_port), 
                disp
            )
            
            # Start server in separate thread
            self.server_thread = Thread(target=self._run_server, daemon=True)
            self.server_thread.start()
            self.running = True
            
            print(f"OSC server listening on port {self.config.listen_port}")
            return True
            
        except Exception as e:
            print(f"OSC setup failed: {e}")
            return False
    
    def _run_server(self) -> None:
        """Run the OSC server."""
        if self.server:
            try:
                self.server.serve_forever()
            except Exception as e:
                print(f"OSC server error: {e}")
    
    def _register_handlers(self, disp: dispatcher.Dispatcher) -> None:
        """Register OSC message handlers."""
        prefix = self.config.address_prefix
        
        # Basic control handlers
        disp.map(f"{prefix}/dimmer", self._handle_dimmer)
        disp.map(f"{prefix}/strobe", self._handle_strobe)
        disp.map(f"{prefix}/pulse", self._handle_pulse)
        disp.map(f"{prefix}/speed", self._handle_speed)
        
        # Toggle handlers
        disp.map(f"{prefix}/fade", self._handle_fade)
        disp.map(f"{prefix}/loop", self._handle_loop)
        disp.map(f"{prefix}/phase", self._handle_phase)
        disp.map(f"{prefix}/build", self._handle_build)
        
        # Preset handlers
        disp.map(f"{prefix}/preset", self._handle_preset)
        disp.map(f"{prefix}/direction", self._handle_direction)
        disp.map(f"{prefix}/effect_mode", self._handle_effect_mode)
        disp.map(f"{prefix}/laser_count", self._handle_laser_count)
        
        # Beat sync handlers
        disp.map(f"{prefix}/beat_sync", self._handle_beat_sync)
        disp.map(f"{prefix}/bpm", self._handle_bpm)
        
        # Catch-all handler for unknown messages
        disp.map(f"{prefix}/*", self._handle_generic)
    
    # Individual message handlers
    def _handle_dimmer(self, address: str, value: float) -> None:
        """Handle dimmer control message."""
        self.message_callback("dimmer", int(value * 100))
    
    def _handle_strobe(self, address: str, value: float) -> None:
        """Handle strobe control message."""
        self.message_callback("strobe", int(value * 100))
    
    def _handle_pulse(self, address: str, value: float) -> None:
        """Handle pulse control message."""
        self.message_callback("pulse", int(value * 100))
    
    def _handle_speed(self, address: str, value: float) -> None:
        """Handle speed control message."""
        self.message_callback("laser_move_speed", int(value * 100))
    
    def _handle_fade(self, address: str, value: float) -> None:
        """Handle fade toggle message."""
        # Convert to scroll_fade value (90 for on, 20 for off)
        fade_value = 90 if value > 0.5 else 20
        self.message_callback("scroll_fade", fade_value)
    
    def _handle_loop(self, address: str, value: float) -> None:
        """Handle loop toggle message."""
        self.message_callback("loop_effect", value > 0.5)
    
    def _handle_phase(self, address: str, value: float) -> None:
        """Handle phase toggle message."""
        # Convert to scroll_phase value (35 for on, 0 for off)
        phase_value = 35 if value > 0.5 else 0
        self.message_callback("scroll_phase", phase_value)
    
    def _handle_build(self, address: str, value: float) -> None:
        """Handle build toggle message."""
        self.message_callback("scroll_build_effect", value > 0.5)
    
    def _handle_preset(self, address: str, preset_name: str) -> None:
        """Handle visual preset message."""
        self.message_callback("visual_preset", preset_name)
    
    def _handle_direction(self, address: str, direction_name: str) -> None:
        """Handle movement direction message."""
        self.message_callback("scroll_direction", direction_name)
    
    def _handle_effect_mode(self, address: str, mode_name: str) -> None:
        """Handle effect application mode message."""
        self.message_callback("effect_application", mode_name)
    
    def _handle_laser_count(self, address: str, count: int) -> None:
        """Handle laser count message."""
        self.message_callback("scroll_laser_count", count)
    
    def _handle_beat_sync(self, address: str, value: float) -> None:
        """Handle beat sync toggle message."""
        self.message_callback("beat_sync_enabled", value > 0.5)
    
    def _handle_bpm(self, address: str, bpm: float) -> None:
        """Handle BPM message."""
        self.message_callback("bpm", int(bpm))
    
    def _handle_generic(self, address: str, *args) -> None:
        """Handle generic/unknown messages."""
        # Extract control name from address
        prefix_len = len(self.config.address_prefix) + 1  # +1 for the slash
        if len(address) > prefix_len:
            control_name = address[prefix_len:]
            value = args[0] if args else None
            self.message_callback(control_name, value)
    
    def send_message(self, address: str, value: Any) -> bool:
        """Send an OSC message."""
        if not self.client or not self.config.enabled:
            return False
            
        try:
            full_address = f"{self.config.address_prefix}/{address}"
            self.client.send_message(full_address, value)
            return True
        except Exception as e:
            print(f"OSC send error: {e}")
            return False
    
    def send_control_update(self, control_name: str, value: Any) -> bool:
        """Send control update via OSC."""
        return self.send_message(f"status/{control_name}", value)
    
    def send_dmx_data(self, dmx_data: list) -> bool:
        """Send DMX universe data via OSC."""
        return self.send_message("dmx/universe", dmx_data)
    
    def send_dmx_mapping(self, mapping: dict) -> bool:
        """Send DMX mapping data via OSC."""
        import json
        mapping_json = json.dumps(mapping)
        return self.send_message("dmx/mapping", mapping_json)
    
    def is_running(self) -> bool:
        """Check if OSC controller is running."""
        return self.running and OSC_AVAILABLE and self.config.enabled
    
    def stop(self) -> None:
        """Stop OSC server and cleanup."""
        self.running = False
        
        if self.server:
            try:
                self.server.shutdown()
                print("OSC server stopped")
            except Exception as e:
                print(f"OSC stop error: {e}")
        
        if self.server_thread and self.server_thread.is_alive():
            self.server_thread.join(timeout=1.0)
        
        self.server = None
        self.server_thread = None
        self.client = None
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.stop()
    
    def __repr__(self) -> str:
        """String representation of OSC controller."""
        status = "running" if self.is_running() else "stopped"
        return f"OSCController(listen_port={self.config.listen_port}, {status})"
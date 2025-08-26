"""
Laser Lighting Simulator Core
A Python implementation of a 14x14 red laser lighting array simulator
with various visual presets and effects.
Enhanced with DMX output and OSC control.
"""

import math
import time
import random
import json
from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import List, Tuple, Optional, Dict, Any, Callable
from threading import Thread

try:
    from pythonosc import dispatcher, udp_client
    from pythonosc import osc_server as server
    from pythonosc.osc_server import BlockingOSCUDPServer
    OSC_AVAILABLE = True
except Exception as e:
    import traceback
    print("--- NEW DETAILED OSC IMPORT ERROR ---")
    traceback.print_exc()
    print("-----------------------------------")
    OSC_AVAILABLE = False

try:
    import serial
    DMX_AVAILABLE = True
except ImportError:
    DMX_AVAILABLE = False
    print("DMX not available. Install with: pip install pyserial")


class LaserOrientation(Enum):
    TOP = "top"
    SIDE = "side"

class VisualPreset(Enum):
    GRID = "Grid"
    BRACKET = "Bracket"
    L_BRACKET = "L Bracket"
    S_CROSS = "S Cross"
    CROSS = "Cross"
    L_CROSS = "L Cross"
    S_DBL_CROSS = "S Dbl Cross"
    DBL_CROSS = "Dbl Cross"
    L_DBL_CROSS = "L Dbl Cross"
    CUBE = "Cube"
    FOUR_CUBES = "4 Cubes"
    NINE_CUBES = "9 Cubes"


class ScrollDirection(Enum):
    NONE = "None"
    LEFT_TO_RIGHT = "L to R"
    RIGHT_TO_LEFT = "R to L"
    TOP_TO_BOTTOM = "T to B"
    BOTTOM_TO_TOP = "B to T"
    # Corners
    TO_TL = "To TL"
    TO_TR = "To TR"
    TO_BL = "To BL"
    TO_BR = "To BR"
    # Center
    OUT_FROM_CENTER = "Out from Center"
    TOWARDS_CENTER = "Towards Center"
    LOOP_CENTER = "Loop Center"
    # Special
    PINWHEEL = "Pinwheel"
    SPOT = "Spot"


class EffectApplication(Enum):
    ALL = "All"
    ALTERNATE = "Alternate"

class BeatRate(Enum):
    OFF = "Off"
    ONE_THIRD = "1/3"
    ONE_HALF = "1/2"
    ONE = "1"
    FOUR = "4"

@dataclass
class Laser:
    id: str
    orientation: LaserOrientation
    brightness: int = 0  # 0-255
    dmx_address: int = 1  # DMX channel (1-512)
    

@dataclass
class ControlsState:
    dimmer: int = 100
    strobe: int = 0
    pulse: int = 0
    effect_application: EffectApplication = EffectApplication.ALL
    visual_preset: VisualPreset = VisualPreset.GRID
    scroll_direction: ScrollDirection = ScrollDirection.NONE
    laser_move_speed: int = 60              # Renamed from scroll_rate
    shocker_speed: int = 50                 # Added for manual slider
    saber_speed: int = 50                   # Added for manual slider
    scroll_laser_count: int = 8
    scroll_fade: int = 90
    scroll_phase: int = 0
    loop_effect: bool = False
    scroll_build_effect: bool = False
    show_laser_origins: bool = False
    
    # --- Add these new properties ---
    beat_sync_enabled: bool = False
    bpm: int = 140
    beat_strobe_rate: BeatRate = BeatRate.OFF
    beat_pulse_rate: BeatRate = BeatRate.OFF
    beat_laser_move_speed_rate: BeatRate = BeatRate.OFF
    beat_shocker_speed_rate: BeatRate = BeatRate.OFF   # New
    beat_saber_speed_rate: BeatRate = BeatRate.OFF     # New
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = {}
        for key, value in asdict(self).items():
            if isinstance(value, Enum):
                result[key] = value.value
            else:
                result[key] = value
        return result


@dataclass
class DMXConfig:
    enabled: bool = False
    port: str = "COM3"  # Serial port for DMX interface
    universe: int = 1
    start_address: int = 1  # Starting DMX address
    

@dataclass 
class OSCConfig:
    enabled: bool = False
    listen_port: int = 8000
    send_host: str = "127.0.0.1"
    send_port: int = 8001
    address_prefix: str = "/laser"


class DMXController:
    """Handles DMX output for laser control."""
    
    def __init__(self, config: DMXConfig):
        self.config = config
        self.serial_port = None
        self.dmx_data = [0] * 512  # DMX universe data
        
    def connect(self) -> bool:
        """Connect to DMX interface."""
        if not DMX_AVAILABLE or not self.config.enabled:
            return False
            
        try:
            self.serial_port = serial.Serial(
                self.config.port, 
                baudrate=115200,
                timeout=1
            )
            print(f"DMX connected on {self.config.port}")
            return True
        except Exception as e:
            print(f"DMX connection failed: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from DMX interface."""
        if self.serial_port:
            self.serial_port.close()
            self.serial_port = None
    
    def update_laser(self, laser: Laser):
        """Update DMX data for a single laser."""
        if laser.dmx_address > 0 and laser.dmx_address <= 512:
            self.dmx_data[laser.dmx_address - 1] = laser.brightness
    
    def send_dmx(self):
        """Send DMX data to interface."""
        if not self.serial_port or not self.config.enabled:
            return
            
        try:
            # Simple DMX protocol - adjust based on your interface
            packet = bytes([0x7E] + self.dmx_data + [0xE7])  # Example framing
            self.serial_port.write(packet)
        except Exception as e:
            print(f"DMX send error: {e}")


class OSCController:
    """Handles OSC input/output for external control."""
    
    def __init__(self, config: OSCConfig, simulator_callback):
        self.config = config
        self.simulator_callback = simulator_callback
        self.client = None
        self.server = None
        self.server_thread = None
        
        if OSC_AVAILABLE and config.enabled:
            self._setup_osc()
    
    def _setup_osc(self):
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
            self.server_thread = Thread(target=self.server.serve_forever)
            self.server_thread.daemon = True
            self.server_thread.start()
            
            print(f"OSC server listening on port {self.config.listen_port}")
            
        except Exception as e:
            print(f"OSC setup failed: {e}")
    
    def _register_handlers(self, disp):
        """Register OSC message handlers."""
        prefix = self.config.address_prefix
        
        # Sliders
        disp.map(f"{prefix}/dimmer", self._handle_dimmer)
        disp.map(f"{prefix}/strobe", self._handle_strobe)
        disp.map(f"{prefix}/pulse", self._handle_pulse)
        disp.map(f"{prefix}/speed", self._handle_speed)
        
        # Toggles
        disp.map(f"{prefix}/fade", self._handle_fade)
        disp.map(f"{prefix}/loop", self._handle_loop)
        disp.map(f"{prefix}/phase", self._handle_phase)
        disp.map(f"{prefix}/build", self._handle_build)
        
        # Presets
        disp.map(f"{prefix}/preset", self._handle_preset)
        disp.map(f"{prefix}/direction", self._handle_direction)
        disp.map(f"{prefix}/effect_mode", self._handle_effect_mode)
        disp.map(f"{prefix}/laser_count", self._handle_laser_count)
    
    def _handle_dimmer(self, address: str, value: float):
        self.simulator_callback("master_dimmer", int(value * 100))
    
    def _handle_strobe(self, address: str, value: float):
        self.simulator_callback("strobe", int(value * 100))
    
    def _handle_pulse(self, address: str, value: float):
        self.simulator_callback("pulse", int(value * 100))
    
    def _handle_speed(self, address: str, value: float):
        self.simulator_callback("laser_move_speed", int(value * 100))
    
    def _handle_fade(self, address: str, value: float):
        self.simulator_callback("fade_enabled", value > 0.5)
    
    def _handle_loop(self, address: str, value: float):
        self.simulator_callback("loop_enabled", value > 0.5)
    
    def _handle_phase(self, address: str, value: float):
        self.simulator_callback("phase_enabled", value > 0.5)
    
    def _handle_build(self, address: str, value: float):
        self.simulator_callback("build_enabled", value > 0.5)
    
    def _handle_preset(self, address: str, preset_name: str):
        self.simulator_callback("visual_preset", preset_name)
    
    def _handle_direction(self, address: str, direction_name: str):
        self.simulator_callback("scroll_direction", direction_name)
    
    def _handle_effect_mode(self, address: str, mode_name: str):
        self.simulator_callback("effect_application", mode_name)
    
    def _handle_laser_count(self, address: str, count: int):
        self.simulator_callback("scroll_laser_count", count)
    
    def send_control_update(self, control_name: str, value: Any):
        """Send control update via OSC."""
        if not self.client or not self.config.enabled:
            return
            
        try:
            address = f"{self.config.address_prefix}/{control_name}"
            self.client.send_message(address, value)
        except Exception as e:
            print(f"OSC send error: {e}")
    
    def stop(self):
        """Stop OSC server."""
        if self.server:
            self.server.shutdown()


class LaserSimulator:
    """Core laser simulator with all lighting effects and controls."""
    
    TOP_LASER_COUNT = 14
    SIDE_LASER_COUNT = 14
    DEFAULT_BRIGHTNESS = 255
    
    def __init__(self, dmx_config: DMXConfig = None, osc_config: OSCConfig = None):
        self.lasers: List[Laser] = []
        self.controls = ControlsState()
        self.start_time = time.time()
        
        # Enhanced features
        self.dmx_config = dmx_config or DMXConfig()
        self.osc_config = osc_config or OSCConfig()
        
        self.dmx_controller = DMXController(self.dmx_config) if dmx_config else None
        self.osc_controller = OSCController(self.osc_config, self._handle_osc_control) if osc_config else None
        
        # Persistent state for effects
        self.last_progress = {}
        self.built_lasers = [0] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        self.spot_lasers = [False] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        self.spot_time_accumulator = 0
        self.last_time = 0
        
        self._initialize_lasers()
        
        # Connect DMX if enabled
        if self.dmx_controller and self.dmx_config.enabled:
            self.dmx_controller.connect()
        
    def _initialize_lasers(self):
        """Initialize all laser objects with DMX addresses."""
        self.lasers = []
        dmx_addr = self.dmx_config.start_address if self.dmx_config else 1
        
        # Top lasers (left to right)
        for i in range(self.TOP_LASER_COUNT):
            self.lasers.append(
                Laser(
                    id=f"top-{i}", 
                    orientation=LaserOrientation.TOP, 
                    brightness=0,
                    dmx_address=dmx_addr
                )
            )
            dmx_addr += 1
        
        # Side lasers (top to bottom)
        for i in range(self.SIDE_LASER_COUNT):
            self.lasers.append(
                Laser(
                    id=f"side-{i}", 
                    orientation=LaserOrientation.SIDE, 
                    brightness=0,
                    dmx_address=dmx_addr
                )
            )
            dmx_addr += 1
    
    # Replace your _handle_osc_control method with this one
    def _handle_osc_control(self, control_name: str, value: Any):
        """Handle OSC control messages."""
        if hasattr(self.controls, control_name):
            try:
                if control_name == "visual_preset":
                    setattr(self.controls, control_name, VisualPreset(value))
                elif control_name == "scroll_direction":
                    # Add debugging and ensure proper enum conversion
                    print(f"🎯 SCROLL_DIRECTION: Received '{value}' (type: {type(value)})")
                    
                    # Handle the enum conversion more robustly
                    if isinstance(value, str):
                        # Try to find the enum member by value
                        scroll_dir = None
                        for direction in ScrollDirection:
                            if direction.value == value:
                                scroll_dir = direction
                                break
                        
                        if scroll_dir is None:
                            print(f"⚠️  Unknown scroll direction: {value}")
                            scroll_dir = ScrollDirection.NONE  # Default fallback
                        
                        print(f"🎯 SCROLL_DIRECTION: Setting to {scroll_dir} (enum member: {scroll_dir.name})")
                        setattr(self.controls, control_name, scroll_dir)
                    else:
                        # If it's already an enum, use it directly
                        setattr(self.controls, control_name, value)
                        
                elif control_name == "effect_application":
                    setattr(self.controls, control_name, EffectApplication(value))
                elif control_name in ["beat_strobe_rate", "beat_pulse_rate", "beat_laser_move_speed_rate", "beat_shocker_speed_rate", "beat_saber_speed_rate"]:
                    setattr(self.controls, control_name, BeatRate(value))
                else:
                    setattr(self.controls, control_name, value)
            except ValueError as e:
                print(f"Warning: Invalid value '{value}' for control '{control_name}': {e}")
                # For scroll_direction, set to NONE as fallback
                if control_name == "scroll_direction":
                    print(f"🎯 SCROLL_DIRECTION: Fallback to NONE due to error")
                    setattr(self.controls, control_name, ScrollDirection.NONE)
    
    def update(self, current_time: Optional[float] = None):
        """Update all laser brightnesses based on current controls and time."""
        if current_time is None:
            current_time = time.time() - self.start_time
            
        delta_time = current_time - self.last_time if self.last_time > 0 else 0
        self.last_time = current_time
            
        base_brightness = self.DEFAULT_BRIGHTNESS
        
        # --- Add Beat Sync Calculations ---
        beat_interval = 0
        if self.controls.beat_sync_enabled and self.controls.bpm > 0:
            beat_interval = 60.0 / self.controls.bpm

        use_beat_pulse = beat_interval > 0 and self.controls.beat_pulse_rate != BeatRate.OFF
        use_beat_strobe = beat_interval > 0 and self.controls.beat_strobe_rate != BeatRate.OFF
        
        # Reset all lasers to 0
        for laser in self.lasers:
            laser.brightness = 0
        
        # Step 1: Apply Visual Preset
        self._apply_visual_preset(base_brightness)
        
        # Step 2: Apply Dimmer
        self._apply_dimmer()
        
        # Step 3: Apply Pulse
        self._apply_pulse(current_time, use_beat_pulse, beat_interval)
        
        # Step 4: Apply Strobe
        self._apply_strobe(current_time, use_beat_strobe, beat_interval)
        
        # Step 5: Apply Movement/Scroll - ADD DEBUGGING HERE
        scroll_check = self.controls.scroll_direction != ScrollDirection.NONE
        
        # Add temporary debugging (remove this after fixing)
        if hasattr(self, '_last_scroll_direction') and self._last_scroll_direction != self.controls.scroll_direction:
            print(f"🎯 SCROLL CHANGE: {self._last_scroll_direction} -> {self.controls.scroll_direction}")
            print(f"🎯 SCROLL CHECK: scroll_direction != NONE? {scroll_check}")
        self._last_scroll_direction = self.controls.scroll_direction
        
        if scroll_check:
            self._apply_scroll(current_time, delta_time, base_brightness)
        else:
            # Ensure we clear any persistent scroll state when stopping
            self.last_progress = {}
            self.built_lasers = [0] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
            self.spot_lasers = [False] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        
        # Step 6: Update DMX output
        if self.dmx_controller:
            self._update_dmx()
    
    def _update_dmx(self):
        """Update DMX controller with current laser values."""
        for laser in self.lasers:
            self.dmx_controller.update_laser(laser)
        self.dmx_controller.send_dmx()
    
    # Replace your _apply_visual_preset method with this one
    def _apply_visual_preset(self, base_brightness: int):
        """Applies the selected visual preset pattern based on TypeScript logic."""
        preset = self.controls.visual_preset
        top_center = self.TOP_LASER_COUNT // 2
        side_center = self.SIDE_LASER_COUNT // 2

        if preset == VisualPreset.GRID:
            for laser in self.lasers: laser.brightness = base_brightness
        elif preset == VisualPreset.BRACKET:
            top_indices = [0, 1, 2, self.TOP_LASER_COUNT - 3, self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
            for i in top_indices: self.lasers[i].brightness = base_brightness
            side_indices = [0, 1, 2, self.SIDE_LASER_COUNT - 3, self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.L_BRACKET:
            top_indices = [0, 1, 2, 3, 4, self.TOP_LASER_COUNT - 5, self.TOP_LASER_COUNT - 4, self.TOP_LASER_COUNT - 3, self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
            for i in top_indices: self.lasers[i].brightness = base_brightness
            side_indices = [0, 1, 2, 3, 4, self.SIDE_LASER_COUNT - 5, self.SIDE_LASER_COUNT - 4, self.SIDE_LASER_COUNT - 3, self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.S_CROSS:
            for i in range(top_center - 1, top_center + 1): self.lasers[i].brightness = base_brightness
            for i in range(2, 4): self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.CROSS:
            for i in range(top_center - 2, top_center + 2): self.lasers[i].brightness = base_brightness
            for i in range(2, 6): self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.L_CROSS:
            for i in range(top_center - 3, top_center + 3): self.lasers[i].brightness = base_brightness
            for i in range(2, 8): self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.S_DBL_CROSS:
            for i in range(top_center - 1, top_center + 1): self.lasers[i].brightness = base_brightness
            side_indices = [2, 3, self.SIDE_LASER_COUNT - 4, self.SIDE_LASER_COUNT - 3]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.DBL_CROSS:
            for i in range(top_center - 2, top_center + 2): self.lasers[i].brightness = base_brightness
            side_indices = [2, 3, 4, 5, self.SIDE_LASER_COUNT - 6, self.SIDE_LASER_COUNT - 5, self.SIDE_LASER_COUNT - 4, self.SIDE_LASER_COUNT - 3]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.L_DBL_CROSS:
            for i in range(top_center - 3, top_center + 3): self.lasers[i].brightness = base_brightness
            side_indices = [2, 3, 4, 5, 6, 7, self.SIDE_LASER_COUNT - 8, self.SIDE_LASER_COUNT - 7, self.SIDE_LASER_COUNT - 6, self.SIDE_LASER_COUNT - 5, self.SIDE_LASER_COUNT - 4, self.SIDE_LASER_COUNT - 3]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.CUBE:
            top_indices = [0, 1, self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
            for i in top_indices: self.lasers[i].brightness = base_brightness
            side_indices = [0, 1, self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.FOUR_CUBES:
            top_indices = [0, 1, top_center - 1, top_center, self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
            for i in top_indices: self.lasers[i].brightness = base_brightness
            side_indices = [0, 1, side_center - 1, side_center, self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
            for i in side_indices: self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
        elif preset == VisualPreset.NINE_CUBES:
            indices = [0, 1, 4, 5, 8, 9, 12, 13]
            for i in indices:
                self.lasers[i].brightness = base_brightness
                self.lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_dimmer(self):
        """Apply  dimmer to all lasers."""
        dimmer_factor = self.controls.dimmer / 100
        for laser in self.lasers:
            laser.brightness = int(laser.brightness * dimmer_factor)
    
    def _apply_pulse(self, current_time: float, use_beat_pulse: bool, beat_interval: float):
        """Apply pulse effect to lasers, with beat sync support."""
        if use_beat_pulse:
            rate_multiplier = self._get_beat_rate_multiplier(self.controls.beat_pulse_rate)
            if rate_multiplier == 0: return

            pulse_duration = beat_interval / rate_multiplier
            phase = (current_time % pulse_duration) / pulse_duration
            pulse_value = (math.sin(phase * math.pi * 2 - math.pi / 2) + 1) / 2
            brightness_multiplier = 0.2 + pulse_value * 0.8
            
            # Beat-synced pulse applies to all lasers, ignoring alternate for simplicity
            for laser in self.lasers:
                laser.brightness = int(laser.brightness * brightness_multiplier)
            return

        # Fallback to original non-synced logic if beat sync is off
        if self.controls.pulse > 0:
            pulse_frequency = (self.controls.pulse / 100) * 6 # Matched to TS version's 6Hz max
            time_phase = current_time * math.pi * 2 * pulse_frequency
            
            if self.controls.effect_application == EffectApplication.ALTERNATE:
                overlap_opacity = 0.4
                phi = math.asin(overlap_opacity)
                single_pulse_duration = math.pi
                start_delay = single_pulse_duration - phi
                total_period = 2 * start_delay
                
                master_phase = time_phase % total_period
                
                top_brightness_mult = 0
                if master_phase < single_pulse_duration:
                    top_brightness_mult = math.sin(master_phase)
                
                side_brightness_mult = 0
                side_phase = master_phase - start_delay
                if side_phase < 0: side_phase += total_period
                if side_phase < single_pulse_duration:
                    side_brightness_mult = math.sin(side_phase)
                
                for laser in self.lasers:
                    if laser.orientation == LaserOrientation.TOP:
                        laser.brightness = int(laser.brightness * top_brightness_mult)
                    else:
                        laser.brightness = int(laser.brightness * side_brightness_mult)
            else:
                pulse_value = (math.sin(time_phase) + 1) / 2
                brightness_mult = 0.2 + pulse_value * 0.8
                for laser in self.lasers:
                    laser.brightness = int(laser.brightness * brightness_mult)

    def _apply_strobe(self, current_time: float, use_beat_strobe: bool, beat_interval: float):
        """Apply strobe effect to lasers, with beat sync support."""
        strobe_is_on = True
        cycle_count = 0

        if use_beat_strobe:
            rate_multiplier = self._get_beat_rate_multiplier(self.controls.beat_strobe_rate)
            if rate_multiplier == 0: return

            strobe_duration = beat_interval / rate_multiplier
            strobe_is_on = (current_time % strobe_duration) < (strobe_duration / 2)
            cycle_count = math.floor(current_time / strobe_duration)

        elif self.controls.strobe > 0:
            # FIXED: Use square wave instead of sine wave for more reliable strobing
            strobe_frequency = (self.controls.strobe / 100) * 20  # Reduced max to 20 Hz for stability
            period = 1.0 / strobe_frequency if strobe_frequency > 0 else 1.0
            
            # Create a square wave with 50% duty cycle
            phase = (current_time % period) / period  # 0 to 1
            strobe_is_on = phase < 0.5  # On for first half of cycle
            
            cycle_count = math.floor(current_time * strobe_frequency)
        
        else: # No strobe is active
            return

        # Apply the strobe effect based on the calculated on/off state
        if not strobe_is_on:
            for laser in self.lasers:
                laser.brightness = 0
        elif self.controls.effect_application == EffectApplication.ALTERNATE:
            is_top_active = (cycle_count % 2 == 0)
            for laser in self.lasers:
                if (is_top_active and laser.orientation == LaserOrientation.SIDE) or \
                (not is_top_active and laser.orientation == LaserOrientation.TOP):
                    laser.brightness = 0

    def _calculate_progress(self, period: float, current_time: float) -> float:
        """Calculate progress with loop and beat sync support."""
        use_beat_speed = (self.controls.beat_sync_enabled and self.controls.bpm > 0 and
                        self.controls.scroll_direction not in [ScrollDirection.NONE, ScrollDirection.SPOT] and
                        self.controls.beat_laser_move_speed_rate != BeatRate.OFF)

        if use_beat_speed:
            beat_interval = 60.0 / self.controls.bpm
            rate_multiplier = self._get_beat_rate_multiplier(self.controls.beat_laser_move_speed_rate)
            if rate_multiplier == 0:
                return 0
            
            beat_duration = beat_interval / rate_multiplier
            beat_count = math.floor(current_time / beat_duration)
            # Use quantized_time for stepped movement, which is the start of the current beat
            quantized_time = beat_count * beat_duration
            time_for_calc = quantized_time
        else:
            time_for_calc = current_time

        # --- Original progress calculation logic using the determined time ---
        effective_rate = self.controls.laser_move_speed / 3
        
        if self.controls.loop_effect:
            bounce_period = max(period - self.controls.scroll_laser_count, period * 0.5)
            full_period = bounce_period * 2
            phase = (time_for_calc * effective_rate) % full_period
            if phase < bounce_period:
                return phase  # Moving forward
            return full_period - phase  # Moving backward
        
        return (time_for_calc * effective_rate) % period
    
    def _calculate_brightness(self, distance_from_wave_center: float, base_brightness: int) -> int:
        """Calculate brightness based on distance from wave center with fade support."""
        if distance_from_wave_center < self.controls.scroll_laser_count / 2:
            # Use maximum fade when scroll_fade is 90 (soft), otherwise use minimal fade for 20 (hard)
            fade_factor = 1.0 if self.controls.scroll_fade == 90 else 0.1  # FIXED: was fade_enabled
            normalized_dist = distance_from_wave_center / (self.controls.scroll_laser_count / 2)
            falloff = normalized_dist ** (fade_factor * 2 + 1)
            return int(base_brightness * (1 - falloff))
        return 0
    
    def _update_progress(self, key: str, progress: float):
        """Update progress tracking for build effect."""
        if (progress < self.last_progress.get(key, 0) and 
            self.controls.scroll_build_effect and not self.controls.loop_effect):  # FIXED: was build_enabled and loop_enabled
            # Reset built lasers when progress wraps around
            self.built_lasers = [0] * len(self.built_lasers)
        self.last_progress[key] = progress
    
    def _apply_scroll(self, current_time: float, delta_time: float, base_brightness: int):
        """Apply scrolling/movement effects."""
        scroll_mask = [0] * len(self.lasers)
        direction = self.controls.scroll_direction
        
        # Reset built lasers when direction changes or build is turned off
        direction_key = f"{direction}_{self.controls.scroll_build_effect}"  # FIXED: was build_enabled
        if not hasattr(self, '_last_direction_key') or self._last_direction_key != direction_key:
            self.built_lasers = [0] * len(self.built_lasers)
            self.last_progress = {}
            self.spot_lasers = [False] * len(self.spot_lasers)
            self.spot_time_accumulator = 0
            self._last_direction_key = direction_key
        
        if direction == ScrollDirection.SPOT:
            # Spot effect - randomly select lasers at intervals
            min_freq = 1
            max_freq = 30
            frequency = min_freq + (max_freq - min_freq) * (self.controls.laser_move_speed - 1) / 99
            # Reduce sensitivity to speed by half to make it less jumpy
            frequency *= 0.5
            spot_change_interval = 1 / frequency
            
            self.spot_time_accumulator += delta_time
            
            if self.spot_time_accumulator >= spot_change_interval:
                while self.spot_time_accumulator >= spot_change_interval:
                    self.spot_time_accumulator -= spot_change_interval
                
                # Reset spot lasers
                self.spot_lasers = [False] * len(self.spot_lasers)
                
                # Create indices for all lasers
                total_lasers = self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT
                indices = list(range(total_lasers))
                
                # Shuffle indices
                random.shuffle(indices)
                
                # Select first scroll_laser_count indices
                for i in range(min(self.controls.scroll_laser_count, len(indices))):
                    self.spot_lasers[indices[i]] = True
            
            # Apply spot mask
            for index, laser in enumerate(self.lasers):
                if not self.spot_lasers[index]:
                    laser.brightness = 0
                    
        elif direction == ScrollDirection.PINWHEEL:
            # Pinwheel effect - create path from center outward in 4 directions
            tc = self.TOP_LASER_COUNT // 2
            sc = self.SIDE_LASER_COUNT // 2
            
            path = []
            # Top center to right
            path.extend(range(tc, self.TOP_LASER_COUNT))
            # Side center to bottom  
            path.extend(range(self.TOP_LASER_COUNT + sc, self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT))
            # Top center to left
            path.extend(range(tc - 1, -1, -1))
            # Side center to top
            path.extend(range(self.TOP_LASER_COUNT + sc - 1, self.TOP_LASER_COUNT - 1, -1))
            
            period = len(path) + self.controls.scroll_laser_count
            progress = self._calculate_progress(period, current_time)
            self._update_progress(direction.value, progress)
            
            def apply_wave(current_progress: float):
                for i in range(len(path)):
                    dist_from_wave_center = abs(i - current_progress)
                    brightness = self._calculate_brightness(dist_from_wave_center, base_brightness)
                    laser_db_index = path[i]
                    if brightness > 0 and laser_db_index < len(scroll_mask):
                        scroll_mask[laser_db_index] = max(scroll_mask[laser_db_index], brightness)
            
            apply_wave(progress)
            
            # Apply phase if enabled
            if self.controls.scroll_phase > 0:  # FIXED: was phase_enabled
                phase_offset = (self.controls.scroll_phase / 100) * period
                progress2 = (progress - phase_offset + period) % period
                apply_wave(progress2)
            
            # Build effect for paths
            if self.controls.scroll_build_effect:  # FIXED: was build_enabled
                for i in range(len(scroll_mask)):
                    self.built_lasers[i] = max(self.built_lasers[i], scroll_mask[i])
                    
        else:
            # Other movement effects (axis, center, diagonal)
            self._apply_other_movements(current_time, base_brightness, scroll_mask)
        
        # Apply the final scroll mask
        for index, laser in enumerate(self.lasers):
            if direction in [ScrollDirection.SPOT]:
                # Spot already applied directly to brightness
                continue
            else:
                mask_value = scroll_mask[index] / base_brightness if base_brightness > 0 else 0
                if self.controls.scroll_build_effect:  # FIXED: was build_enabled
                    mask_value = max(mask_value, self.built_lasers[index] / base_brightness)
                laser.brightness = int(laser.brightness * mask_value)
    
    def _apply_other_movements(self, current_time: float, base_brightness: int, scroll_mask: List[int]):
        """Apply axis-based, center-based, and diagonal movements."""
        direction = self.controls.scroll_direction
        
        axis_directions = [
            ScrollDirection.LEFT_TO_RIGHT, ScrollDirection.RIGHT_TO_LEFT,
            ScrollDirection.TOP_TO_BOTTOM, ScrollDirection.BOTTOM_TO_TOP
        ]
        
        corner_directions = [
            ScrollDirection.TO_TL, ScrollDirection.TO_TR,
            ScrollDirection.TO_BL, ScrollDirection.TO_BR
        ]
        
        if direction in axis_directions:
            # Axis-based scroll
            if direction in [ScrollDirection.LEFT_TO_RIGHT, ScrollDirection.RIGHT_TO_LEFT]:
                count = self.TOP_LASER_COUNT
                is_reversed = (direction == ScrollDirection.RIGHT_TO_LEFT)
                orientation = LaserOrientation.TOP
            else:
                count = self.SIDE_LASER_COUNT
                is_reversed = (direction == ScrollDirection.BOTTOM_TO_TOP)
                orientation = LaserOrientation.SIDE
            
            period = count + self.controls.scroll_laser_count
            progress = self._calculate_progress(period, current_time)
            self._update_progress(f"{orientation.value}-{is_reversed}", progress)
            
            def get_wave_brightness(current_progress: float, laser_index: int) -> int:
                pos = count - current_progress if is_reversed else current_progress
                dist_from_wave_center = abs(laser_index - pos)
                return self._calculate_brightness(dist_from_wave_center, base_brightness)
            
            for i in range(count):
                brightness1 = get_wave_brightness(progress, i)
                final_brightness = brightness1
                
                # Apply phase if enabled
                if self.controls.scroll_phase > 0:  # FIXED: was phase_enabled
                    phase_offset = (self.controls.scroll_phase / 100) * period
                    progress2 = (progress - phase_offset + period) % period
                    brightness2 = get_wave_brightness(progress2, i)
                    final_brightness = max(brightness1, brightness2)
                
                laser_db_index = i if orientation == LaserOrientation.TOP else self.TOP_LASER_COUNT + i
                if laser_db_index < len(scroll_mask):
                    scroll_mask[laser_db_index] = max(scroll_mask[laser_db_index], final_brightness)
                    if self.controls.scroll_build_effect:  # FIXED: was build_enabled
                        self.built_lasers[laser_db_index] = max(self.built_lasers[laser_db_index], final_brightness)
                        
        elif direction in [ScrollDirection.OUT_FROM_CENTER, ScrollDirection.TOWARDS_CENTER]:
            # Center movements
            for index, laser in enumerate(self.lasers):
                if laser.orientation == LaserOrientation.TOP:
                    center = (self.TOP_LASER_COUNT - 1) / 2.0
                    distance_from_center = abs(index - center)
                else:
                    side_index = index - self.TOP_LASER_COUNT
                    center = (self.SIDE_LASER_COUNT - 1) / 2.0
                    distance_from_center = abs(side_index - center)
                
                max_dist = math.ceil(max((self.TOP_LASER_COUNT - 1) / 2.0, (self.SIDE_LASER_COUNT - 1) / 2.0))
                period = max_dist + self.controls.scroll_laser_count
                
                def get_wave_brightness(current_progress: float) -> int:
                    if direction == ScrollDirection.OUT_FROM_CENTER:
                        wave_position = current_progress
                    else:  # TOWARDS_CENTER
                        wave_position = period - current_progress
                    dist_from_wave = abs(distance_from_center - wave_position)
                    return self._calculate_brightness(dist_from_wave, base_brightness)
                
                progress1 = self._calculate_progress(period, current_time)
                self._update_progress(direction.value, progress1)
                
                brightness1 = get_wave_brightness(progress1)
                final_brightness = brightness1
                
                # Apply phase if enabled
                if self.controls.scroll_phase > 0:  # FIXED: was phase_enabled
                    phase_offset = (self.controls.scroll_phase / 100) * period
                    progress2 = (progress1 - phase_offset + period) % period
                    brightness2 = get_wave_brightness(progress2)
                    final_brightness = max(brightness1, brightness2)
                
                scroll_mask[index] = final_brightness
                if self.controls.scroll_build_effect:  # FIXED: was build_enabled
                    self.built_lasers[index] = max(self.built_lasers[index], final_brightness)
                    
        elif direction in corner_directions:
            # Diagonal movements
            top_max = self.TOP_LASER_COUNT - 1
            side_max = self.SIDE_LASER_COUNT - 1
            
            for index, laser in enumerate(self.lasers):
                is_top = laser.orientation == LaserOrientation.TOP
                top_index = index if is_top else -1
                side_index = (index - self.TOP_LASER_COUNT) if not is_top else -1
                
                # Calculate distance based on direction
                if direction == ScrollDirection.TO_BR:  # Origin: TL (0,0)
                    if is_top:
                        dist = top_index * 2
                    else:
                        dist = side_index * 2 + 1
                elif direction == ScrollDirection.TO_TL:  # Origin: BR
                    if is_top:
                        dist = (top_max - top_index) * 2
                    else:
                        dist = (side_max - side_index) * 2 + 1
                elif direction == ScrollDirection.TO_TR:  # Origin: BL
                    if is_top:
                        dist = top_index * 2 + 1
                    else:
                        dist = (side_max - side_index) * 2
                elif direction == ScrollDirection.TO_BL:  # Origin: TR
                    if is_top:
                        dist = (top_max - top_index) * 2
                    else:
                        dist = side_index * 2 + 1
                else:
                    dist = 0
                
                max_dist = (max(self.TOP_LASER_COUNT, self.SIDE_LASER_COUNT) - 1) * 2 + 1
                period = max_dist + self.controls.scroll_laser_count
                
                def get_wave_brightness(current_progress: float) -> int:
                    wave_position = current_progress
                    dist_from_wave = abs(dist - wave_position)
                    # Compensate for linearization scaling
                    return self._calculate_brightness(dist_from_wave / 2, base_brightness)
                
                progress1 = self._calculate_progress(period, current_time)
                self._update_progress(direction.value, progress1)
                
                brightness1 = get_wave_brightness(progress1)
                final_brightness = brightness1
                
                # Apply phase if enabled
                if self.controls.scroll_phase > 0:  # FIXED: was phase_enabled
                    phase_offset = (self.controls.scroll_phase / 100) * period
                    progress2 = (progress1 - phase_offset + period) % period
                    brightness2 = get_wave_brightness(progress2)
                    final_brightness = max(brightness1, brightness2)
                
                scroll_mask[index] = final_brightness
                if self.controls.scroll_build_effect:  # FIXED: was build_enabled
                    self.built_lasers[index] = max(self.built_lasers[index], final_brightness)
    
    def _get_beat_rate_multiplier(self, rate: BeatRate) -> float:
        """Helper to convert a BeatRate enum to a frequency multiplier."""
        if rate == BeatRate.ONE_THIRD:
            return 3.0
        if rate == BeatRate.ONE_HALF:
            return 2.0
        if rate == BeatRate.ONE:
            return 1.0
        if rate == BeatRate.FOUR:
            return 1.0 / 4.0
        return 0

    # Enhanced methods for web/API integration
    def get_dmx_values(self) -> List[int]:
        """Get DMX values for all lasers."""
        return [laser.brightness for laser in self.lasers]
    
    def get_dmx_mapping(self) -> Dict[str, int]:
        """Get current DMX address mapping."""
        return {laser.id: laser.dmx_address for laser in self.lasers}
    
    def set_dmx_address(self, laser_id: str, address: int):
        """Set DMX address for specific laser."""
        for laser in self.lasers:
            if laser.id == laser_id:
                laser.dmx_address = address
                break
    
    def set_control(self, control_name: str, value):
        """Set a control value by name."""
        if hasattr(self.controls, control_name):
            setattr(self.controls, control_name, value)
            
            # Send OSC update if available
            if self.osc_controller:
                self.osc_controller.send_control_update(control_name, value)

    def get_state(self) -> Dict[str, Any]:
        """Get current simulator state for web interface."""
        # Convert the list of Laser objects into a list of dictionaries
        laser_dicts = []
        for laser in self.lasers:
            laser_dict = asdict(laser)
            laser_dict['orientation'] = laser.orientation.value
            laser_dicts.append(laser_dict)
            
        return {
            "controls": self.controls.to_dict(),
            "lasers": laser_dicts
        }
    
    def cleanup(self):
        """Cleanup resources."""
        if self.dmx_controller:
            self.dmx_controller.disconnect()
        if self.osc_controller:
            self.osc_controller.stop()
    
    def reset(self):
        """Reset simulator to initial state."""
        self.controls = ControlsState()
        self.start_time = time.time()
        self._initialize_lasers()
        self.last_progress = {}
        self.built_lasers = [0] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        self.spot_lasers = [False] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        self.spot_time_accumulator = 0
        self.last_time = 0


# Backward compatibility - can be used as drop-in replacement
if __name__ == "__main__":
    # Example usage with DMX/OSC disabled (works like original)
    simulator = LaserSimulator()
    
    try:
        while True:
            simulator.update()
            time.sleep(1/60)  # 60 FPS
    except KeyboardInterrupt:
        simulator.cleanup()
        print("Simulator stopped")
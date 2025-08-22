"""
Laser Lighting Simulator Core
A Python implementation of a 14x14 red laser lighting array simulator
with various visual presets and effects.
"""

import math
import time
import random
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Tuple, Optional


class LaserOrientation(Enum):
    TOP = "top"
    SIDE = "side"


class VisualPreset(Enum):
    ALL_ON = "All On"
    CROSS = "Cross"
    SMALL_CROSS = "Small Cross"
    BIG_CROSS = "Big Cross"
    CUBE = "Cube"
    FOUR_CUBES = "4 Cubes"


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


@dataclass
class Laser:
    id: str
    orientation: LaserOrientation
    brightness: int = 0  # 0-255
    

@dataclass
class ControlsState:
    master_dimmer: int = 100  # 0-100
    strobe: int = 0  # 0-100
    pulse: int = 0  # 0-100
    effect_application: EffectApplication = EffectApplication.ALL
    visual_preset: VisualPreset = VisualPreset.ALL_ON
    custom_preset: Optional[str] = None  # Track custom preset
    scroll_direction: ScrollDirection = ScrollDirection.NONE
    scroll_rate: int = 60  # 1-100
    scroll_laser_count: int = 8  # 1-8
    scroll_fade: int = 90  # 0-100
    scroll_phase: int = 50  # 0-100, default to 50
    # Movement modifiers
    fade_enabled: bool = False
    loop_enabled: bool = False
    phase_enabled: bool = False
    build_enabled: bool = False
    show_laser_origins: bool = False


class LaserSimulator:
    """Core laser simulator with all lighting effects and controls."""
    
    TOP_LASER_COUNT = 14
    SIDE_LASER_COUNT = 14
    DEFAULT_BRIGHTNESS = 255
    
    def __init__(self):
        self.lasers: List[Laser] = []
        self.controls = ControlsState()
        self.start_time = time.time()
        self._initialize_lasers()
        
        # Persistent state for effects
        self.last_progress = {}
        self.built_lasers = [0] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        self.spot_lasers = [False] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT)
        self.spot_time_accumulator = 0
        self.last_time = 0
        
    def _initialize_lasers(self):
        """Initialize all laser objects with default values."""
        self.lasers = []
        
        # Top lasers
        for i in range(self.TOP_LASER_COUNT):
            self.lasers.append(
                Laser(id=f"top-{i}", orientation=LaserOrientation.TOP, brightness=0)
            )
        
        # Side lasers
        for i in range(self.SIDE_LASER_COUNT):
            self.lasers.append(
                Laser(id=f"side-{i}", orientation=LaserOrientation.SIDE, brightness=0)
            )
    
    def update(self, current_time: Optional[float] = None):
        """Update all laser brightnesses based on current controls and time."""
        if current_time is None:
            current_time = time.time() - self.start_time
            
        # Calculate delta time for spot effect
        delta_time = current_time - self.last_time if self.last_time > 0 else 0
        self.last_time = current_time
            
        base_brightness = self.DEFAULT_BRIGHTNESS
        
        # Reset all lasers to 0
        for laser in self.lasers:
            laser.brightness = 0
        
        # Step 1: Apply Visual Preset
        self._apply_visual_preset(base_brightness)
        
        # Step 2: Apply Dimmer
        self._apply_dimmer()
        
        # Step 3: Apply Pulse
        if self.controls.pulse > 0:
            self._apply_pulse(current_time)
        
        # Step 4: Apply Strobe
        if self.controls.strobe > 0:
            self._apply_strobe(current_time)
        
        # Step 5: Apply Movement/Scroll
        if self.controls.scroll_direction != ScrollDirection.NONE:
            self._apply_scroll(current_time, delta_time, base_brightness)
    
    def _apply_visual_preset(self, base_brightness: int):
        """Apply the selected visual preset pattern."""
        # Check for custom preset first
        if self.controls.custom_preset:
            self._apply_custom_preset(self.controls.custom_preset, base_brightness)
            return
            
        preset = self.controls.visual_preset
        
        if preset == VisualPreset.ALL_ON:
            for laser in self.lasers:
                laser.brightness = base_brightness
                
        elif preset == VisualPreset.CROSS:
            # Top lasers: 4 in the center
            top_center = self.TOP_LASER_COUNT // 2
            for i in range(top_center - 2, top_center + 2):
                if 0 <= i < self.TOP_LASER_COUNT:
                    self.lasers[i].brightness = base_brightness
            
            # Side lasers: 4 starting from 3rd row
            for i in range(2, 6):
                side_idx = self.TOP_LASER_COUNT + i
                if side_idx < len(self.lasers):
                    self.lasers[side_idx].brightness = base_brightness
                    
        elif preset == VisualPreset.SMALL_CROSS:
            # Top lasers: 2 in the center
            top_center = self.TOP_LASER_COUNT // 2
            for i in range(top_center - 1, top_center + 1):
                if 0 <= i < self.TOP_LASER_COUNT:
                    self.lasers[i].brightness = base_brightness
            
            # Side lasers: 2 starting from 3rd row
            for i in range(2, 4):
                side_idx = self.TOP_LASER_COUNT + i
                if side_idx < len(self.lasers):
                    self.lasers[side_idx].brightness = base_brightness
                    
        elif preset == VisualPreset.BIG_CROSS:
            # Top lasers: 6 in the center
            top_center = self.TOP_LASER_COUNT // 2
            for i in range(top_center - 3, top_center + 3):
                if 0 <= i < self.TOP_LASER_COUNT:
                    self.lasers[i].brightness = base_brightness
            
            # Side lasers: 6 starting from 3rd row
            for i in range(2, 8):
                side_idx = self.TOP_LASER_COUNT + i
                if side_idx < len(self.lasers):
                    self.lasers[side_idx].brightness = base_brightness
                    
        elif preset == VisualPreset.CUBE:
            # Top lasers: first 2 and last 2
            top_indices = [0, 1, self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
            for i in top_indices:
                if 0 <= i < self.TOP_LASER_COUNT:
                    self.lasers[i].brightness = base_brightness
            
            # Side lasers: first 2 and last 2
            side_start = self.TOP_LASER_COUNT
            side_indices = [0, 1, self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
            for i in side_indices:
                laser_idx = side_start + i
                if laser_idx < len(self.lasers):
                    self.lasers[laser_idx].brightness = base_brightness
                    
        elif preset == VisualPreset.FOUR_CUBES:
            # Top lasers: first 2, middle 2, last 2
            top_center = self.TOP_LASER_COUNT // 2
            top_indices = [0, 1, top_center - 1, top_center, 
                          self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
            for i in top_indices:
                if 0 <= i < self.TOP_LASER_COUNT:
                    self.lasers[i].brightness = base_brightness
            
            # Side lasers: first 2, middle 2, last 2
            side_center = self.SIDE_LASER_COUNT // 2
            side_start = self.TOP_LASER_COUNT
            side_indices = [0, 1, side_center - 1, side_center,
                           self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
            for i in side_indices:
                laser_idx = side_start + i
                if laser_idx < len(self.lasers):
                    self.lasers[laser_idx].brightness = base_brightness
    
    def _apply_custom_preset(self, preset_name: str, base_brightness: int):
        """Apply custom visual preset patterns."""
        if preset_name == 'bracket':
            # Bracket: corners with 3 lasers each
            # Top: 0-2 (first 3) and 11-13 (last 3)
            for i in range(3):
                self.lasers[i].brightness = base_brightness
            for i in range(11, 14):
                self.lasers[i].brightness = base_brightness
            
            # Side: 0-2 (first 3) and 11-13 (last 3)
            for i in range(3):
                self.lasers[14 + i].brightness = base_brightness
            for i in range(11, 14):
                self.lasers[14 + i].brightness = base_brightness
            
        elif preset_name == 'l_bracket':
            # L-Bracket: L shape with 5 lasers on each segment
            # Top: 0-4 (first 5) and 9-13 (last 5)
            for i in range(5):
                self.lasers[i].brightness = base_brightness
            for i in range(9, 14):
                self.lasers[i].brightness = base_brightness
            
            # Side: 0-4 (first 5) and 9-13 (last 5)
            for i in range(5):
                self.lasers[14 + i].brightness = base_brightness
            for i in range(9, 14):
                self.lasers[14 + i].brightness = base_brightness
                
        elif preset_name == 's_dbl_cross':
            # Small Double Cross
            # Top center 2 (positions 6,7)
            self.lasers[6].brightness = base_brightness
            self.lasers[7].brightness = base_brightness
            
            # Side positions 2,3 and 10,11
            for i in [2, 3, 10, 11]:
                self.lasers[14 + i].brightness = base_brightness
                
        elif preset_name == 'dbl_cross':
            # Double Cross - includes all s_dbl_cross lasers plus additional ones
            # Top center 4 (positions 5,6,7,8)
            for i in [5, 6, 7, 8]:
                self.lasers[i].brightness = base_brightness
            
            # Side positions 2,3,4,5,8,9,10,11
            for i in [2, 3, 4, 5, 8, 9, 10, 11]:
                self.lasers[14 + i].brightness = base_brightness
                
        elif preset_name == 'l_dbl_cross':
            # Large Double Cross
            # Top positions 3-10
            for i in range(3, 11):
                self.lasers[i].brightness = base_brightness
            
            # Side positions 2-11
            for i in range(2, 12):
                self.lasers[14 + i].brightness = base_brightness
                
        elif preset_name == '9_cubes':
            # 9 Cubes - 3x3 grid of 2x2 squares
            positions = [0, 1, 4, 5, 8, 9, 12, 13]  # Fixed positions for 9 cubes pattern
            
            # Top lasers
            for pos in positions:
                if pos < 14:
                    self.lasers[pos].brightness = base_brightness
            
            # Side lasers
            for pos in positions:
                if pos < 14:
                    self.lasers[14 + pos].brightness = base_brightness
    
    def _apply_dimmer(self):
        """Apply master dimmer to all lasers."""
        dimmer_factor = self.controls.master_dimmer / 100
        for laser in self.lasers:
            laser.brightness = int(laser.brightness * dimmer_factor)
    
    def _apply_pulse(self, current_time: float):
        """Apply pulse effect to lasers."""
        pulse_frequency = (self.controls.pulse / 100) * 2  # 0 to 2 Hz (slower pulsing)
        time_phase = current_time * math.pi * 2 * pulse_frequency
        
        if self.controls.effect_application == EffectApplication.ALTERNATE:
            # Alternating pulse between top and side
            overlap_opacity = 0.4
            phi = math.asin(overlap_opacity)
            single_pulse_duration = math.pi
            start_delay = single_pulse_duration - phi
            total_period = 2 * start_delay
            
            master_phase = time_phase % total_period
            
            # Top lasers
            top_brightness_mult = 0
            if master_phase < single_pulse_duration:
                top_brightness_mult = math.sin(master_phase)
            
            # Side lasers
            side_brightness_mult = 0
            side_phase = master_phase - start_delay
            if side_phase < 0:
                side_phase += total_period
            if side_phase < single_pulse_duration:
                side_brightness_mult = math.sin(side_phase)
            
            for laser in self.lasers:
                if laser.orientation == LaserOrientation.TOP:
                    laser.brightness = int(laser.brightness * top_brightness_mult)
                else:
                    laser.brightness = int(laser.brightness * side_brightness_mult)
        else:
            # All mode - synchronized pulse
            pulse_value = (math.sin(time_phase) + 1) / 2
            brightness_mult = 0.2 + pulse_value * 0.8
            
            for laser in self.lasers:
                laser.brightness = int(laser.brightness * brightness_mult)
    
    def _apply_strobe(self, current_time: float):
        """Apply strobe effect to lasers."""
        strobe_frequency = (self.controls.strobe / 100) * 30  # 0 to 30 Hz
        strobe_is_on = math.sin(current_time * math.pi * 2 * strobe_frequency) > 0
        
        if not strobe_is_on:
            # Blackout period
            for laser in self.lasers:
                laser.brightness = 0
        elif self.controls.effect_application == EffectApplication.ALTERNATE:
            # Alternate strobe between groups
            strobe_cycle_count = int(current_time * strobe_frequency)
            is_top_active = (strobe_cycle_count % 2 == 0)
            
            for laser in self.lasers:
                if is_top_active and laser.orientation == LaserOrientation.SIDE:
                    laser.brightness = 0
                elif not is_top_active and laser.orientation == LaserOrientation.TOP:
                    laser.brightness = 0
    
    def _calculate_progress(self, period: float, current_time: float) -> float:
        """Calculate progress with loop effect support."""
        effective_rate = self.controls.scroll_rate / 3
        
        if self.controls.loop_enabled:
            # For bouncing, reduce the period so the wave bounces when leading edge hits boundary
            # instead of waiting for the entire wave to pass through
            bounce_period = max(period - self.controls.scroll_laser_count, period * 0.5)
            full_period = bounce_period * 2
            phase = (current_time * effective_rate) % full_period
            if phase < bounce_period:
                return phase  # Moving forward
            return full_period - phase  # Moving backward
        
        return (current_time * effective_rate) % period
    
    def _calculate_brightness(self, distance_from_wave_center: float, base_brightness: int) -> int:
        """Calculate brightness based on distance from wave center with fade support."""
        if distance_from_wave_center < self.controls.scroll_laser_count / 2:
            # Use maximum fade when fade_enabled is True, otherwise use minimal fade
            fade_factor = 1.0 if self.controls.fade_enabled else 0.1
            normalized_dist = distance_from_wave_center / (self.controls.scroll_laser_count / 2)
            falloff = normalized_dist ** (fade_factor * 2 + 1)
            return int(base_brightness * (1 - falloff))
        return 0
    
    def _update_progress(self, key: str, progress: float):
        """Update progress tracking for build effect."""
        if (progress < self.last_progress.get(key, 0) and 
            self.controls.build_enabled and not self.controls.loop_enabled):
            # Reset built lasers when progress wraps around
            self.built_lasers = [0] * len(self.built_lasers)
        self.last_progress[key] = progress
    
    def _apply_scroll(self, current_time: float, delta_time: float, base_brightness: int):
        """Apply scrolling/movement effects."""
        scroll_mask = [0] * len(self.lasers)
        direction = self.controls.scroll_direction
        
        # Reset built lasers when direction changes or build is turned off
        direction_key = f"{direction}_{self.controls.build_enabled}"
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
            frequency = min_freq + (max_freq - min_freq) * (self.controls.scroll_rate - 1) / 99
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
            if self.controls.phase_enabled and self.controls.scroll_phase > 0:
                phase_offset = (self.controls.scroll_phase / 100) * period
                progress2 = (progress - phase_offset + period) % period
                apply_wave(progress2)
            
            # Build effect for paths
            if self.controls.build_enabled:
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
                if self.controls.build_enabled:
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
                if self.controls.phase_enabled and self.controls.scroll_phase > 0:
                    phase_offset = (self.controls.scroll_phase / 100) * period
                    progress2 = (progress - phase_offset + period) % period
                    brightness2 = get_wave_brightness(progress2, i)
                    final_brightness = max(brightness1, brightness2)
                
                laser_db_index = i if orientation == LaserOrientation.TOP else self.TOP_LASER_COUNT + i
                if laser_db_index < len(scroll_mask):
                    scroll_mask[laser_db_index] = max(scroll_mask[laser_db_index], final_brightness)
                    if self.controls.build_enabled:
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
                if self.controls.phase_enabled and self.controls.scroll_phase > 0:
                    phase_offset = (self.controls.scroll_phase / 100) * period
                    progress2 = (progress1 - phase_offset + period) % period
                    brightness2 = get_wave_brightness(progress2)
                    final_brightness = max(brightness1, brightness2)
                
                scroll_mask[index] = final_brightness
                if self.controls.build_enabled:
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
                if self.controls.phase_enabled and self.controls.scroll_phase > 0:
                    phase_offset = (self.controls.scroll_phase / 100) * period
                    progress2 = (progress1 - phase_offset + period) % period
                    brightness2 = get_wave_brightness(progress2)
                    final_brightness = max(brightness1, brightness2)
                
                scroll_mask[index] = final_brightness
                if self.controls.build_enabled:
                    self.built_lasers[index] = max(self.built_lasers[index], final_brightness)
    
    def get_dmx_values(self) -> List[int]:
        """Get DMX values for all lasers (for future DMX output)."""
        return [laser.brightness for laser in self.lasers]
    
    def set_control(self, control_name: str, value):
        """Set a control value by name."""
        if hasattr(self.controls, control_name):
            setattr(self.controls, control_name, value)
    
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
"""
Movement and scrolling effects for laser arrays.
"""

import math
import random
from typing import List, Dict, Any
from .base import StatefulEffect
from ..models.laser import Laser
from ..models.enums import LaserOrientation, ScrollDirection
from ..core.state import ControlsState
from ..beat_sync.sync import BeatSync


class MovementEffect(StatefulEffect):
    """Applies movement and scrolling effects to laser arrays."""
    
    TOP_LASER_COUNT = 14
    SIDE_LASER_COUNT = 14
    
    def __init__(self):
        super().__init__("movement")
        self.reset_state()
    
    def reset_state(self) -> None:
        """Reset movement effect state."""
        super().reset_state()
        self.state.update({
            'last_progress': {},
            'built_lasers': [0] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT),
            'spot_lasers': [False] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT),
            'spot_time_accumulator': 0.0,
            'last_direction_key': '',
        })
    
    def is_active(self, controls: ControlsState) -> bool:
        """Check if movement effect should be active."""
        return (self.enabled and 
                controls.scroll_direction != ScrollDirection.NONE)
    
    def apply(self, lasers: List[Laser], controls: ControlsState, 
              current_time: float, delta_time: float = 0.0, 
              base_brightness: int = 255, **kwargs) -> None:
        """Apply movement effects to lasers."""
        direction = controls.scroll_direction
        
        if direction == ScrollDirection.NONE:
            self.reset_state()
            return
        
        # Check for direction changes and reset state if needed
        direction_key = f"{direction}_{controls.scroll_build_effect}"
        if self.get_state_value('last_direction_key') != direction_key:
            self.reset_state()
            self.set_state_value('last_direction_key', direction_key)
        
        # Apply specific movement effect
        if direction == ScrollDirection.SPOT:
            self._apply_spot_effect(lasers, controls, delta_time)
        elif direction == ScrollDirection.PINWHEEL:
            self._apply_pinwheel_effect(lasers, controls, current_time, base_brightness)
        else:
            self._apply_other_movements(lasers, controls, current_time, base_brightness)
    
    def _apply_spot_effect(self, lasers: List[Laser], controls: ControlsState,
                          delta_time: float) -> None:
        """Apply spot effect - randomly select lasers at intervals."""
        # Calculate frequency based on speed
        min_freq = 1
        max_freq = 30
        frequency = min_freq + (max_freq - min_freq) * (controls.laser_move_speed - 1) / 99
        frequency *= 0.5  # Reduce sensitivity to make it less jumpy
        
        spot_change_interval = 1 / frequency
        spot_time_accumulator = self.get_state_value('spot_time_accumulator', 0.0)
        spot_time_accumulator += delta_time
        
        # Check if it's time to change spot pattern
        if spot_time_accumulator >= spot_change_interval:
            while spot_time_accumulator >= spot_change_interval:
                spot_time_accumulator -= spot_change_interval
            
            # Reset and randomly select new spots
            total_lasers = self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT
            indices = list(range(total_lasers))
            random.shuffle(indices)
            
            spot_lasers = [False] * total_lasers
            for i in range(min(controls.scroll_laser_count, len(indices))):
                spot_lasers[indices[i]] = True
            
            self.set_state_value('spot_lasers', spot_lasers)
        
        self.set_state_value('spot_time_accumulator', spot_time_accumulator)
        
        # Apply spot pattern
        spot_lasers = self.get_state_value('spot_lasers', [False] * len(lasers))
        for index, laser in enumerate(lasers):
            if index < len(spot_lasers) and not spot_lasers[index]:
                laser.brightness = 0
    
    def _apply_pinwheel_effect(self, lasers: List[Laser], controls: ControlsState,
                              current_time: float, base_brightness: int) -> None:
        """Apply pinwheel movement effect."""
        tc = self.TOP_LASER_COUNT // 2
        sc = self.SIDE_LASER_COUNT // 2
        
        # Create path from center outward in 4 directions
        path = []
        path.extend(range(tc, self.TOP_LASER_COUNT))  # Top center to right
        path.extend(range(self.TOP_LASER_COUNT + sc, 
                         self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT))  # Side center to bottom
        path.extend(range(tc - 1, -1, -1))  # Top center to left
        path.extend(range(self.TOP_LASER_COUNT + sc - 1, 
                         self.TOP_LASER_COUNT - 1, -1))  # Side center to top
        
        period = len(path) + controls.scroll_laser_count
        progress = self._calculate_progress(period, current_time, controls)
        self._update_progress(ScrollDirection.PINWHEEL.value, progress, controls)
        
        scroll_mask = [0] * len(lasers)
        
        def apply_wave(current_progress: float):
            for i in range(len(path)):
                dist_from_wave_center = abs(i - current_progress)
                brightness = self._calculate_brightness(dist_from_wave_center, 
                                                      base_brightness, controls)
                laser_index = path[i]
                if brightness > 0 and laser_index < len(scroll_mask):
                    scroll_mask[laser_index] = max(scroll_mask[laser_index], brightness)
        
        apply_wave(progress)
        
        # Apply phase if enabled
        if controls.scroll_phase > 0:
            phase_offset = (controls.scroll_phase / 100) * period
            progress2 = (progress - phase_offset + period) % period
            apply_wave(progress2)
        
        # Apply the scroll mask
        self._apply_scroll_mask(lasers, scroll_mask, base_brightness, controls)
    
    def _apply_other_movements(self, lasers: List[Laser], controls: ControlsState,
                              current_time: float, base_brightness: int) -> None:
        """Apply axis-based, center-based, and diagonal movements."""
        direction = controls.scroll_direction
        scroll_mask = [0] * len(lasers)
        
        axis_directions = [
            ScrollDirection.LEFT_TO_RIGHT, ScrollDirection.RIGHT_TO_LEFT,
            ScrollDirection.TOP_TO_BOTTOM, ScrollDirection.BOTTOM_TO_TOP
        ]
        
        corner_directions = [
            ScrollDirection.TO_TL, ScrollDirection.TO_TR,
            ScrollDirection.TO_BL, ScrollDirection.TO_BR
        ]
        
        if direction in axis_directions:
            self._apply_axis_movement(scroll_mask, direction, controls, 
                                    current_time, base_brightness)
        elif direction in [ScrollDirection.OUT_FROM_CENTER, ScrollDirection.TOWARDS_CENTER]:
            self._apply_center_movement(lasers, scroll_mask, direction, controls, 
                                      current_time, base_brightness)
        elif direction in corner_directions:
            self._apply_diagonal_movement(lasers, scroll_mask, direction, controls, 
                                        current_time, base_brightness)
        
        # Apply the final scroll mask
        self._apply_scroll_mask(lasers, scroll_mask, base_brightness, controls)
    
    def _apply_axis_movement(self, scroll_mask: List[int], direction: ScrollDirection,
                            controls: ControlsState, current_time: float, 
                            base_brightness: int) -> None:
        """Apply axis-based scrolling movement."""
        if direction in [ScrollDirection.LEFT_TO_RIGHT, ScrollDirection.RIGHT_TO_LEFT]:
            count = self.TOP_LASER_COUNT
            is_reversed = (direction == ScrollDirection.RIGHT_TO_LEFT)
            orientation = LaserOrientation.TOP
        else:
            count = self.SIDE_LASER_COUNT
            is_reversed = (direction == ScrollDirection.BOTTOM_TO_TOP)
            orientation = LaserOrientation.SIDE
        
        period = count + controls.scroll_laser_count
        progress = self._calculate_progress(period, current_time, controls)
        self._update_progress(f"{orientation.value}-{is_reversed}", progress, controls)
        
        def get_wave_brightness(current_progress: float, laser_index: int) -> int:
            pos = count - current_progress if is_reversed else current_progress
            dist_from_wave_center = abs(laser_index - pos)
            return self._calculate_brightness(dist_from_wave_center, base_brightness, controls)
        
        for i in range(count):
            brightness1 = get_wave_brightness(progress, i)
            final_brightness = brightness1
            
            # Apply phase if enabled
            if controls.scroll_phase > 0:
                phase_offset = (controls.scroll_phase / 100) * period
                progress2 = (progress - phase_offset + period) % period
                brightness2 = get_wave_brightness(progress2, i)
                final_brightness = max(brightness1, brightness2)
            
            laser_index = i if orientation == LaserOrientation.TOP else self.TOP_LASER_COUNT + i
            if laser_index < len(scroll_mask):
                scroll_mask[laser_index] = max(scroll_mask[laser_index], final_brightness)
                
                # Build effect
                if controls.scroll_build_effect:
                    built_lasers = self.get_state_value('built_lasers', [])
                    if laser_index < len(built_lasers):
                        built_lasers[laser_index] = max(built_lasers[laser_index], final_brightness)
    
    def _apply_center_movement(self, lasers: List[Laser], scroll_mask: List[int],
                              direction: ScrollDirection, controls: ControlsState,
                              current_time: float, base_brightness: int) -> None:
        """Apply center-based movement effects."""
        for index, laser in enumerate(lasers):
            if laser.orientation == LaserOrientation.TOP:
                center = (self.TOP_LASER_COUNT - 1) / 2.0
                distance_from_center = abs(index - center)
            else:
                side_index = index - self.TOP_LASER_COUNT
                center = (self.SIDE_LASER_COUNT - 1) / 2.0
                distance_from_center = abs(side_index - center)
            
            max_dist = math.ceil(max((self.TOP_LASER_COUNT - 1) / 2.0, 
                                   (self.SIDE_LASER_COUNT - 1) / 2.0))
            period = max_dist + controls.scroll_laser_count
            
            def get_wave_brightness(current_progress: float) -> int:
                if direction == ScrollDirection.OUT_FROM_CENTER:
                    wave_position = current_progress
                else:  # TOWARDS_CENTER
                    wave_position = period - current_progress
                dist_from_wave = abs(distance_from_center - wave_position)
                return self._calculate_brightness(dist_from_wave, base_brightness, controls)
            
            progress1 = self._calculate_progress(period, current_time, controls)
            self._update_progress(direction.value, progress1, controls)
            
            brightness1 = get_wave_brightness(progress1)
            final_brightness = brightness1
            
            # Apply phase if enabled
            if controls.scroll_phase > 0:
                phase_offset = (controls.scroll_phase / 100) * period
                progress2 = (progress1 - phase_offset + period) % period
                brightness2 = get_wave_brightness(progress2)
                final_brightness = max(brightness1, brightness2)
            
            scroll_mask[index] = final_brightness
            
            # Build effect
            if controls.scroll_build_effect:
                built_lasers = self.get_state_value('built_lasers', [])
                if index < len(built_lasers):
                    built_lasers[index] = max(built_lasers[index], final_brightness)
    
    def _apply_diagonal_movement(self, lasers: List[Laser], scroll_mask: List[int],
                                direction: ScrollDirection, controls: ControlsState,
                                current_time: float, base_brightness: int) -> None:
        """Apply diagonal corner-to-corner movement effects."""
        top_max = self.TOP_LASER_COUNT - 1
        side_max = self.SIDE_LASER_COUNT - 1
        
        for index, laser in enumerate(lasers):
            is_top = laser.orientation == LaserOrientation.TOP
            top_index = index if is_top else -1
            side_index = (index - self.TOP_LASER_COUNT) if not is_top else -1
            
            # Calculate distance based on direction
            if direction == ScrollDirection.TO_BR:  # Origin: TL (0,0)
                dist = top_index * 2 if is_top else side_index * 2 + 1
            elif direction == ScrollDirection.TO_TL:  # Origin: BR
                dist = (top_max - top_index) * 2 if is_top else (side_max - side_index) * 2 + 1
            elif direction == ScrollDirection.TO_TR:  # Origin: BL
                dist = top_index * 2 + 1 if is_top else (side_max - side_index) * 2
            elif direction == ScrollDirection.TO_BL:  # Origin: TR
                dist = (top_max - top_index) * 2 if is_top else side_index * 2 + 1
            else:
                dist = 0
            
            max_dist = (max(self.TOP_LASER_COUNT, self.SIDE_LASER_COUNT) - 1) * 2 + 1
            period = max_dist + controls.scroll_laser_count
            
            def get_wave_brightness(current_progress: float) -> int:
                wave_position = current_progress
                dist_from_wave = abs(dist - wave_position)
                # Compensate for linearization scaling
                return self._calculate_brightness(dist_from_wave / 2, base_brightness, controls)
            
            progress1 = self._calculate_progress(period, current_time, controls)
            self._update_progress(direction.value, progress1, controls)
            
            brightness1 = get_wave_brightness(progress1)
            final_brightness = brightness1
            
            # Apply phase if enabled
            if controls.scroll_phase > 0:
                phase_offset = (controls.scroll_phase / 100) * period
                progress2 = (progress1 - phase_offset + period) % period
                brightness2 = get_wave_brightness(progress2)
                final_brightness = max(brightness1, brightness2)
            
            scroll_mask[index] = final_brightness
            
            # Build effect
            if controls.scroll_build_effect:
                built_lasers = self.get_state_value('built_lasers', [])
                if index < len(built_lasers):
                    built_lasers[index] = max(built_lasers[index], final_brightness)
    
    def _calculate_progress(self, period: float, current_time: float,
                           controls: ControlsState) -> float:
        """Calculate progress with loop and beat sync support."""
        beat_interval = BeatSync.calculate_beat_interval(controls.bpm)
        use_beat_speed = BeatSync.is_beat_effect_active(
            controls.beat_sync_enabled, controls.bpm, controls.beat_laser_move_speed_rate
        )
        
        if use_beat_speed and controls.scroll_direction not in [ScrollDirection.NONE, ScrollDirection.SPOT]:
            # Use quantized time for stepped movement
            time_for_calc = BeatSync.calculate_quantized_time(
                current_time, beat_interval, controls.beat_laser_move_speed_rate
            )
        else:
            time_for_calc = current_time
        
        effective_rate = controls.laser_move_speed / 3
        
        if controls.loop_effect:
            bounce_period = max(period - controls.scroll_laser_count, period * 0.5)
            full_period = bounce_period * 2
            phase = (time_for_calc * effective_rate) % full_period
            if phase < bounce_period:
                return phase  # Moving forward
            return full_period - phase  # Moving backward
        
        return (time_for_calc * effective_rate) % period
    
    def _calculate_brightness(self, distance_from_wave_center: float, 
                             base_brightness: int, controls: ControlsState) -> int:
        """Calculate brightness based on distance from wave center with fade support."""
        if distance_from_wave_center < controls.scroll_laser_count / 2:
            fade_factor = 1.0 if controls.scroll_fade == 90 else 0.1
            normalized_dist = distance_from_wave_center / (controls.scroll_laser_count / 2)
            falloff = normalized_dist ** (fade_factor * 2 + 1)
            return int(base_brightness * (1 - falloff))
        return 0
    
    def _update_progress(self, key: str, progress: float, controls: ControlsState) -> None:
        """Update progress tracking for build effect."""
        last_progress = self.get_state_value('last_progress', {})
        
        if (progress < last_progress.get(key, 0) and 
            controls.scroll_build_effect and not controls.loop_effect):
            # Reset built lasers when progress wraps around
            self.set_state_value('built_lasers', [0] * (self.TOP_LASER_COUNT + self.SIDE_LASER_COUNT))
        
        last_progress[key] = progress
        self.set_state_value('last_progress', last_progress)
    
    def _apply_scroll_mask(self, lasers: List[Laser], scroll_mask: List[int],
                          base_brightness: int, controls: ControlsState) -> None:
        """Apply the calculated scroll mask to lasers."""
        built_lasers = self.get_state_value('built_lasers', [0] * len(lasers))
        
        for index, laser in enumerate(lasers):
            if index < len(scroll_mask) and laser.brightness > 0:
                mask_value = scroll_mask[index] / base_brightness if base_brightness > 0 else 0
                
                if controls.scroll_build_effect and index < len(built_lasers):
                    mask_value = max(mask_value, built_lasers[index] / base_brightness)
                
                laser.brightness = int(laser.brightness * mask_value)
"""
Visual preset effects for laser array patterns.
"""

from typing import List
from .base import BaseEffect
from ..models.laser import Laser
from ..models.enums import VisualPreset, LaserOrientation
from ..core.state import ControlsState


class VisualPresetEffect(BaseEffect):
    """Applies visual preset patterns to the laser array."""
    
    TOP_LASER_COUNT = 14
    SIDE_LASER_COUNT = 14
    
    def __init__(self):
        super().__init__("visual_preset")
    
    def apply(self, lasers: List[Laser], controls: ControlsState, 
              current_time: float, base_brightness: int = 255, **kwargs) -> None:
        """Apply the selected visual preset pattern."""
        preset = controls.visual_preset
        top_center = self.TOP_LASER_COUNT // 2
        side_center = self.SIDE_LASER_COUNT // 2
        
        # Reset all lasers first
        for laser in lasers:
            laser.brightness = 0
        
        if preset == VisualPreset.GRID:
            self._apply_grid(lasers, base_brightness)
        elif preset == VisualPreset.BRACKET:
            self._apply_bracket(lasers, base_brightness)
        elif preset == VisualPreset.L_BRACKET:
            self._apply_l_bracket(lasers, base_brightness)
        elif preset == VisualPreset.S_CROSS:
            self._apply_s_cross(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.CROSS:
            self._apply_cross(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.L_CROSS:
            self._apply_l_cross(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.S_DBL_CROSS:
            self._apply_s_dbl_cross(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.DBL_CROSS:
            self._apply_dbl_cross(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.L_DBL_CROSS:
            self._apply_l_dbl_cross(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.CUBE:
            self._apply_cube(lasers, base_brightness)
        elif preset == VisualPreset.FOUR_CUBES:
            self._apply_four_cubes(lasers, base_brightness, top_center, side_center)
        elif preset == VisualPreset.NINE_CUBES:
            self._apply_nine_cubes(lasers, base_brightness)
    
    def _apply_grid(self, lasers: List[Laser], base_brightness: int) -> None:
        """All lasers on."""
        for laser in lasers:
            laser.brightness = base_brightness
    
    def _apply_bracket(self, lasers: List[Laser], base_brightness: int) -> None:
        """Corner bracket pattern."""
        top_indices = [0, 1, 2, self.TOP_LASER_COUNT - 3, 
                      self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
        for i in top_indices:
            lasers[i].brightness = base_brightness
        
        side_indices = [0, 1, 2, self.SIDE_LASER_COUNT - 3, 
                       self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_l_bracket(self, lasers: List[Laser], base_brightness: int) -> None:
        """Large bracket pattern."""
        top_indices = [0, 1, 2, 3, 4, self.TOP_LASER_COUNT - 5, 
                      self.TOP_LASER_COUNT - 4, self.TOP_LASER_COUNT - 3, 
                      self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
        for i in top_indices:
            lasers[i].brightness = base_brightness
        
        side_indices = [0, 1, 2, 3, 4, self.SIDE_LASER_COUNT - 5, 
                       self.SIDE_LASER_COUNT - 4, self.SIDE_LASER_COUNT - 3, 
                       self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_s_cross(self, lasers: List[Laser], base_brightness: int, 
                      top_center: int, side_center: int) -> None:
        """Small cross pattern."""
        for i in range(top_center - 1, top_center + 1):
            lasers[i].brightness = base_brightness
        for i in range(2, 4):
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_cross(self, lasers: List[Laser], base_brightness: int, 
                    top_center: int, side_center: int) -> None:
        """Medium cross pattern."""
        for i in range(top_center - 2, top_center + 2):
            lasers[i].brightness = base_brightness
        for i in range(2, 6):
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_l_cross(self, lasers: List[Laser], base_brightness: int, 
                      top_center: int, side_center: int) -> None:
        """Large cross pattern."""
        for i in range(top_center - 3, top_center + 3):
            lasers[i].brightness = base_brightness
        for i in range(2, 8):
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_s_dbl_cross(self, lasers: List[Laser], base_brightness: int, 
                          top_center: int, side_center: int) -> None:
        """Small double cross pattern."""
        for i in range(top_center - 1, top_center + 1):
            lasers[i].brightness = base_brightness
        side_indices = [2, 3, self.SIDE_LASER_COUNT - 4, self.SIDE_LASER_COUNT - 3]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_dbl_cross(self, lasers: List[Laser], base_brightness: int, 
                        top_center: int, side_center: int) -> None:
        """Medium double cross pattern."""
        for i in range(top_center - 2, top_center + 2):
            lasers[i].brightness = base_brightness
        side_indices = [2, 3, 4, 5, self.SIDE_LASER_COUNT - 6, 
                       self.SIDE_LASER_COUNT - 5, self.SIDE_LASER_COUNT - 4, 
                       self.SIDE_LASER_COUNT - 3]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_l_dbl_cross(self, lasers: List[Laser], base_brightness: int, 
                          top_center: int, side_center: int) -> None:
        """Large double cross pattern."""
        for i in range(top_center - 3, top_center + 3):
            lasers[i].brightness = base_brightness
        side_indices = [2, 3, 4, 5, 6, 7, self.SIDE_LASER_COUNT - 8, 
                       self.SIDE_LASER_COUNT - 7, self.SIDE_LASER_COUNT - 6, 
                       self.SIDE_LASER_COUNT - 5, self.SIDE_LASER_COUNT - 4, 
                       self.SIDE_LASER_COUNT - 3]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_cube(self, lasers: List[Laser], base_brightness: int) -> None:
        """Single cube pattern."""
        top_indices = [0, 1, self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
        for i in top_indices:
            lasers[i].brightness = base_brightness
        side_indices = [0, 1, self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_four_cubes(self, lasers: List[Laser], base_brightness: int, 
                         top_center: int, side_center: int) -> None:
        """Four cube pattern."""
        top_indices = [0, 1, top_center - 1, top_center, 
                      self.TOP_LASER_COUNT - 2, self.TOP_LASER_COUNT - 1]
        for i in top_indices:
            lasers[i].brightness = base_brightness
        side_indices = [0, 1, side_center - 1, side_center, 
                       self.SIDE_LASER_COUNT - 2, self.SIDE_LASER_COUNT - 1]
        for i in side_indices:
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
    
    def _apply_nine_cubes(self, lasers: List[Laser], base_brightness: int) -> None:
        """Nine cube grid pattern."""
        indices = [0, 1, 4, 5, 8, 9, 12, 13]
        for i in indices:
            lasers[i].brightness = base_brightness
            lasers[self.TOP_LASER_COUNT + i].brightness = base_brightness
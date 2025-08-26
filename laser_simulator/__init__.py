"""
Laser Lighting Simulator
A modular Python implementation of a 14x14 red laser lighting array simulator
with various visual presets and effects.
"""

from .core.simulator import LaserSimulator
from .models.config import DMXConfig, OSCConfig
from .models.enums import (
    LaserOrientation, VisualPreset, ScrollDirection, 
    EffectApplication, BeatRate
)
from .models.laser import Laser
from .core.state import ControlsState

__version__ = "2.0.0"
__all__ = [
    "LaserSimulator",
    "DMXConfig", 
    "OSCConfig",
    "LaserOrientation",
    "VisualPreset", 
    "ScrollDirection",
    "EffectApplication",
    "BeatRate",
    "Laser",
    "ControlsState"
]
"""
Enumeration definitions for the laser simulator.
"""

from enum import Enum


class LaserOrientation(Enum):
    """Orientation of laser beams."""
    TOP = "top"
    SIDE = "side"


class VisualPreset(Enum):
    """Visual patterns for laser array."""
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
    """Movement directions for laser effects."""
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
    """How effects are applied to different laser groups."""
    ALL = "All"
    ALTERNATE = "Alternate"


class BeatRate(Enum):
    """Beat synchronization rates."""
    OFF = "Off"
    ONE_THIRD = "1/3"
    ONE_HALF = "1/2"
    ONE = "1"
    FOUR = "4"
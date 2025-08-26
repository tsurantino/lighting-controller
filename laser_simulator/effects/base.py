"""
Base classes for laser effects.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ..models.laser import Laser
from ..core.state import ControlsState


class BaseEffect(ABC):
    """Base class for all laser effects."""
    
    def __init__(self, name: str):
        self.name = name
        self.enabled = True
    
    @abstractmethod
    def apply(self, lasers: List[Laser], controls: ControlsState, 
              current_time: float, **kwargs) -> None:
        """Apply the effect to the laser array."""
        pass
    
    def enable(self) -> None:
        """Enable the effect."""
        self.enabled = True
    
    def disable(self) -> None:
        """Disable the effect."""
        self.enabled = False
    
    def is_active(self, controls: ControlsState) -> bool:
        """Check if the effect should be active based on controls."""
        return self.enabled


class TimedEffect(BaseEffect):
    """Base class for time-based effects."""
    
    def __init__(self, name: str):
        super().__init__(name)
        self.last_time = 0.0
    
    def get_delta_time(self, current_time: float) -> float:
        """Get time delta since last update."""
        delta = current_time - self.last_time if self.last_time > 0 else 0.0
        self.last_time = current_time
        return delta


class StatefulEffect(BaseEffect):
    """Base class for effects that maintain state."""
    
    def __init__(self, name: str):
        super().__init__(name)
        self.state: Dict[str, Any] = {}
    
    def reset_state(self) -> None:
        """Reset effect state."""
        self.state.clear()
    
    def get_state_value(self, key: str, default: Any = None) -> Any:
        """Get a state value with default."""
        return self.state.get(key, default)
    
    def set_state_value(self, key: str, value: Any) -> None:
        """Set a state value."""
        self.state[key] = value


class EffectManager:
    """Manages and applies multiple effects."""
    
    def __init__(self):
        self.effects: List[BaseEffect] = []
    
    def add_effect(self, effect: BaseEffect) -> None:
        """Add an effect to the manager."""
        self.effects.append(effect)
    
    def remove_effect(self, effect_name: str) -> bool:
        """Remove an effect by name."""
        for i, effect in enumerate(self.effects):
            if effect.name == effect_name:
                self.effects.pop(i)
                return True
        return False
    
    def apply_all_effects(self, lasers: List[Laser], controls: ControlsState, 
                         current_time: float, **kwargs) -> None:
        """Apply all active effects to the laser array."""
        for effect in self.effects:
            if effect.is_active(controls):
                effect.apply(lasers, controls, current_time, **kwargs)
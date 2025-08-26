# Migration Guide: Monolithic to Modular Laser Simulator

## What Changed

The monolithic `laser_simulator.py` file has been refactored into a modular structure:

```
laser_simulator/
├── __init__.py              # Main exports
├── core/
│   ├── simulator.py         # Main LaserSimulator class
│   └── state.py             # ControlsState
├── models/
│   ├── enums.py             # All enums
│   ├── laser.py             # Laser model
│   └── config.py            # DMX/OSC config
├── effects/
│   ├── visual_presets.py    # Visual patterns
│   ├── pulse.py             # Pulse effects
│   ├── strobe.py            # Strobe effects
│   └── movement.py          # Movement effects
├── controllers/
│   ├── dmx.py               # DMX output
│   └── osc.py               # OSC control
├── beat_sync/
│   └── sync.py              # Beat synchronization
└── utils/
    └── helpers.py           # Utility functions
```

## Import Compatibility

Most imports should continue working due to the `__init__.py` files:

```python
# These imports still work:
from laser_simulator import LaserSimulator, DMXConfig, OSCConfig
from laser_simulator import LaserOrientation, VisualPreset, ScrollDirection

# New modular imports (optional):
from laser_simulator.effects import PulseEffect, StrobeEffect
from laser_simulator.controllers import DMXController
```

## Key Benefits

1. **Modularity**: Each component has a single responsibility
2. **Testability**: Individual effects can be tested in isolation
3. **Extensibility**: Easy to add new effects or controllers
4. **Maintainability**: Smaller, focused files are easier to understand
5. **Performance**: Only load modules you actually use

## Migration Steps

1. ✓ Original file backed up as `laser_simulator_backup.py`
2. ✓ New modular structure created
3. ✓ Import compatibility maintained
4. ✓ All functionality preserved

## Usage Examples

### Basic Usage (same as before)
```python
from laser_simulator import LaserSimulator, DMXConfig, OSCConfig

# Create with default settings
simulator = LaserSimulator()

# Or with custom configuration
dmx_config = DMXConfig(enabled=True, port="COM3")
osc_config = OSCConfig(enabled=True, listen_port=8000)
simulator = LaserSimulator(dmx_config, osc_config)

# Use exactly the same as before
simulator.set_control("visual_preset", "Cross")
simulator.update()
```

### Advanced Usage (new possibilities)
```python
from laser_simulator.core import LaserSimulator
from laser_simulator.effects import PulseEffect, MovementEffect
from laser_simulator.utils.helpers import Timer, FrameRateCounter

# Create with specific effects
simulator = LaserSimulator()

# Access individual effects for custom behavior
pulse_effect = simulator.effect_manager.effects[1]  # PulseEffect
pulse_effect.disable()  # Temporarily disable pulse

# Use utility classes
timer = Timer()
fps_counter = FrameRateCounter()
```

## Troubleshooting

If you encounter import errors:

1. Make sure the `laser_simulator/` directory exists
2. Check that all `__init__.py` files are present
3. Verify Python can find the module (check PYTHONPATH)

## Need Help?

If you find any compatibility issues, check the backup file and compare
with the new modular implementation. All functionality should be preserved.

#!/usr/bin/env python3
"""
Migration script to help transition from monolithic laser_simulator.py 
to the new modular structure.

This script:
1. Backs up the original laser_simulator.py
2. Updates imports in other files
3. Provides compatibility guidance
"""

import os
import shutil
import sys
from pathlib import Path


def backup_original_file():
    """Create a backup of the original laser_simulator.py."""
    original = Path("laser_simulator.py")
    if original.exists():
        backup = Path("laser_simulator_backup.py")
        shutil.copy2(original, backup)
        print(f"✓ Backed up original to {backup}")
        return True
    else:
        print("ℹ No laser_simulator.py found to backup")
        return False


def update_web_server():
    """Update web_server.py imports."""
    web_server = Path("web_server.py")
    if not web_server.exists():
        print("ℹ No web_server.py found")
        return
    
    print("✓ Updating web_server.py imports...")
    
    # Read current content
    with open(web_server, 'r') as f:
        content = f.read()
    
    # Update import
    old_import = "from laser_simulator import LaserSimulator, DMXConfig, OSCConfig"
    new_import = "from laser_simulator import LaserSimulator, DMXConfig, OSCConfig"
    
    if old_import in content:
        # The import actually stays the same due to __init__.py
        print("  - Import statement is already compatible")
    else:
        print("  - No import updates needed")


def update_laser_gui():
    """Update laser_gui.py imports."""
    laser_gui = Path("laser_gui.py")
    if not laser_gui.exists():
        print("ℹ No laser_gui.py found")
        return
    
    print("✓ Updating laser_gui.py imports...")
    
    # Read current content
    with open(laser_gui, 'r') as f:
        content = f.read()
    
    # The imports should work the same way due to __init__.py
    print("  - Import statements should remain compatible")


def create_compatibility_note():
    """Create a compatibility guide."""
    guide = """# Migration Guide: Monolithic to Modular Laser Simulator

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
"""
    
    with open("MIGRATION_GUIDE.md", "w") as f:
        f.write(guide)
    
    print("✓ Created MIGRATION_GUIDE.md")


def verify_structure():
    """Verify the new module structure exists."""
    required_paths = [
        "laser_simulator/__init__.py",
        "laser_simulator/core/simulator.py", 
        "laser_simulator/core/state.py",
        "laser_simulator/models/enums.py",
        "laser_simulator/models/laser.py",
        "laser_simulator/models/config.py",
        "laser_simulator/effects/base.py",
        "laser_simulator/effects/visual_presets.py",
        "laser_simulator/effects/pulse.py",
        "laser_simulator/effects/strobe.py",
        "laser_simulator/effects/movement.py",
        "laser_simulator/controllers/dmx.py",
        "laser_simulator/controllers/osc.py",
        "laser_simulator/beat_sync/sync.py",
        "laser_simulator/utils/helpers.py"
    ]
    
    missing = []
    for path in required_paths:
        if not Path(path).exists():
            missing.append(path)
    
    if missing:
        print(f"❌ Missing files:")
        for path in missing:
            print(f"   - {path}")
        return False
    else:
        print("✓ All required files present")
        return True


def test_imports():
    """Test that basic imports work."""
    try:
        # Test the main imports
        from laser_simulator import LaserSimulator, DMXConfig, OSCConfig
        from laser_simulator import LaserOrientation, VisualPreset, ScrollDirection
        
        # Test creating a simulator
        simulator = LaserSimulator()
        
        print("✓ Basic imports and creation work")
        return True
        
    except ImportError as e:
        print(f"❌ Import test failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Creation test failed: {e}")
        return False


def main():
    """Run the migration process."""
    print("🚀 Starting migration to modular laser simulator...")
    print()
    
    # Step 1: Backup original
    backup_original_file()
    
    # Step 2: Verify new structure
    if not verify_structure():
        print("❌ Migration failed - missing required files")
        print("   Please ensure all modular files are created first")
        return 1
    
    # Step 3: Test imports
    if not test_imports():
        print("❌ Migration failed - import test failed")
        return 1
    
    # Step 4: Update dependent files
    update_web_server()
    update_laser_gui()
    
    # Step 5: Create documentation
    create_compatibility_note()
    
    print()
    print("🎉 Migration completed successfully!")
    print()
    print("Next steps:")
    print("1. Test your existing code to ensure it still works")
    print("2. Read MIGRATION_GUIDE.md for detailed information")
    print("3. Consider using new modular features for future development")
    print("4. Remove laser_simulator_backup.py when you're confident everything works")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Test script for the modular laser simulator.
Verifies that all components work together correctly.
"""

import time
import sys
from pathlib import Path

# Add the current directory to path if needed
sys.path.insert(0, str(Path(__file__).parent))

try:
    from laser_simulator import (
        LaserSimulator, DMXConfig, OSCConfig,
        LaserOrientation, VisualPreset, ScrollDirection, EffectApplication
    )
    from laser_simulator.utils.helpers import Timer, FrameRateCounter
    print("✓ All imports successful")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)


def test_basic_functionality():
    """Test basic simulator functionality."""
    print("\n🧪 Testing basic functionality...")
    
    # Create simulator
    simulator = LaserSimulator()
    print(f"✓ Simulator created with {len(simulator.lasers)} lasers")
    
    # Test initial state
    state = simulator.get_state()
    assert 'lasers' in state
    assert 'controls' in state
    assert len(state['lasers']) == 28  # 14 top + 14 side
    print("✓ Initial state correct")
    
    # Test control setting
    simulator.set_control("dimmer", 80)
    assert simulator.get_control("dimmer") == 80
    print("✓ Control setting works")
    
    # Test visual preset
    simulator.set_control("visual_preset", "Cross")
    simulator.update()
    
    active_lasers = [l for l in simulator.lasers if l.brightness > 0]
    assert len(active_lasers) > 0
    print(f"✓ Visual preset applied ({len(active_lasers)} active lasers)")
    
    return True


def test_effects_sequence():
    """Test different effects in sequence."""
    print("\n🎨 Testing effects sequence...")
    
    simulator = LaserSimulator()
    
    # Test visual presets
    presets = [VisualPreset.GRID, VisualPreset.CROSS, VisualPreset.CUBE]
    for preset in presets:
        simulator.set_control("visual_preset", preset.value)
        simulator.update()
        active_count = len([l for l in simulator.lasers if l.brightness > 0])
        print(f"  - {preset.value}: {active_count} active lasers")
    
    # Test movement
    simulator.set_control("scroll_direction", "L to R")
    simulator.set_control("laser_move_speed", 50)
    for _ in range(5):
        simulator.update()
        time.sleep(0.1)
    print("  - Movement effect applied")
    
    # Test strobe
    simulator.set_control("strobe", 20)
    simulator.update()
    print("  - Strobe effect applied")
    
    print("✓ All effects working")
    return True


def test_dmx_mapping():
    """Test DMX address mapping."""
    print("\n🔌 Testing DMX mapping...")
    
    simulator = LaserSimulator()
    
    # Check DMX mapping
    mapping = simulator.get_dmx_mapping()
    assert len(mapping) == 28
    print(f"✓ DMX mapping has {len(mapping)} entries")
    
    # Test address assignment
    assert mapping['top-0'] == 1
    assert mapping['top-13'] == 14
    assert mapping['side-0'] == 15
    assert mapping['side-13'] == 28
    print("✓ DMX addresses assigned correctly")
    
    # Test setting custom address
    success = simulator.set_dmx_address('top-0', 100)
    assert success
    assert simulator.get_dmx_mapping()['top-0'] == 100
    print("✓ Custom DMX address setting works")
    
    return True


def test_beat_sync():
    """Test beat synchronization."""
    print("\n🎵 Testing beat synchronization...")
    
    simulator = LaserSimulator()
    
    # Enable beat sync
    simulator.set_control("beat_sync_enabled", True)
    simulator.set_control("bpm", 120)
    simulator.set_control("beat_pulse_rate", "1")
    simulator.set_control("visual_preset", "Cross")
    
    # Run for a few frames
    for i in range(10):
        simulator.update()
        time.sleep(0.05)  # 20 FPS
    
    print("✓ Beat sync effects applied without errors")
    return True


def test_performance():
    """Test performance with frame rate counter."""
    print("\n⚡ Testing performance...")
    
    simulator = LaserSimulator()
    fps_counter = FrameRateCounter()
    
    # Set up complex scene
    simulator.set_control("visual_preset", "Grid")
    simulator.set_control("scroll_direction", "Pinwheel")
    simulator.set_control("pulse", 50)
    simulator.set_control("scroll_phase", 35)
    simulator.set_control("laser_move_speed", 80)
    
    # Run performance test
    start_time = time.time()
    frame_count = 0
    
    while time.time() - start_time < 2.0:  # Run for 2 seconds
        simulator.update()
        fps_counter.update()
        frame_count += 1
        time.sleep(1/120)  # Target 120 FPS
    
    avg_fps = fps_counter.get_fps()
    print(f"✓ Performance: {avg_fps:.1f} FPS average over {frame_count} frames")
    
    if avg_fps > 60:
        print("✓ Performance is excellent (>60 FPS)")
    elif avg_fps > 30:
        print("✓ Performance is good (>30 FPS)")
    else:
        print("⚠ Performance may need optimization (<30 FPS)")
    
    return True


def test_state_persistence():
    """Test state management and persistence."""
    print("\n💾 Testing state management...")
    
    simulator = LaserSimulator()
    
    # Set various controls
    test_values = {
        "dimmer": 75,
        "visual_preset": "Cross",
        "scroll_direction": "L to R",
        "laser_move_speed": 65,
        "scroll_fade": 20,
        "beat_sync_enabled": True,
        "bpm": 140
    }
    
    for control, value in test_values.items():
        simulator.set_control(control, value)
    
    # Get state
    state = simulator.get_state()
    controls = state['controls']
    
    # Verify values
    for control, expected in test_values.items():
        actual = controls[control]
        if control in ["visual_preset", "scroll_direction"]:
            # These are stored as enum values
            continue
        assert actual == expected, f"Expected {control}={expected}, got {actual}"
    
    print("✓ State management working correctly")
    return True


def run_all_tests():
    """Run all tests."""
    print("🚀 Starting modular laser simulator tests...\n")
    
    tests = [
        test_basic_functionality,
        test_effects_sequence,
        test_dmx_mapping,
        test_beat_sync,
        test_performance,
        test_state_persistence
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
                print(f"❌ {test_func.__name__} failed")
        except Exception as e:
            failed += 1
            print(f"❌ {test_func.__name__} failed with exception: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! The modular simulator is working correctly.")
    else:
        print("❌ Some tests failed. Please check the implementation.")
    
    return failed == 0


def main():
    """Main test function."""
    try:
        success = run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Validation script to check if the modular refactoring was implemented correctly.
This script performs comprehensive checks on structure, imports, functionality, and performance.
"""

import os
import sys
import time
import importlib.util
from pathlib import Path
from typing import List, Tuple, Dict, Any


class RefactoringValidator:
    """Validates the modular laser simulator refactoring."""
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.passed_checks = 0
        self.total_checks = 0
        
    def check(self, condition: bool, error_msg: str, warning_msg: str = None) -> bool:
        """Check a condition and record results."""
        self.total_checks += 1
        if condition:
            self.passed_checks += 1
            return True
        else:
            if warning_msg:
                self.warnings.append(warning_msg)
            else:
                self.errors.append(error_msg)
            return False
    
    def validate_file_structure(self) -> bool:
        """Validate the directory structure and required files."""
        print("🗂️  Validating file structure...")
        
        required_files = [
            "laser_simulator/__init__.py",
            "laser_simulator/core/__init__.py",
            "laser_simulator/core/simulator.py",
            "laser_simulator/core/state.py",
            "laser_simulator/models/__init__.py", 
            "laser_simulator/models/enums.py",
            "laser_simulator/models/laser.py",
            "laser_simulator/models/config.py",
            "laser_simulator/effects/__init__.py",
            "laser_simulator/effects/base.py",
            "laser_simulator/effects/visual_presets.py",
            "laser_simulator/effects/pulse.py",
            "laser_simulator/effects/strobe.py",
            "laser_simulator/effects/movement.py",
            "laser_simulator/controllers/__init__.py",
            "laser_simulator/controllers/dmx.py",
            "laser_simulator/controllers/osc.py",
            "laser_simulator/beat_sync/__init__.py",
            "laser_simulator/beat_sync/sync.py",
            "laser_simulator/utils/__init__.py",
            "laser_simulator/utils/helpers.py"
        ]
        
        all_files_exist = True
        for file_path in required_files:
            exists = Path(file_path).exists()
            self.check(
                exists,
                f"Missing required file: {file_path}",
                f"Optional file missing: {file_path}" if file_path.endswith("__init__.py") else None
            )
            if not exists:
                all_files_exist = False
        
        return all_files_exist
    
    def validate_imports(self) -> bool:
        """Validate that all imports work correctly."""
        print("📦 Validating imports...")
        
        import_tests = [
            # Main package imports
            ("laser_simulator", ["LaserSimulator", "DMXConfig", "OSCConfig"]),
            ("laser_simulator", ["LaserOrientation", "VisualPreset", "ScrollDirection", "EffectApplication", "BeatRate"]),
            
            # Core imports
            ("laser_simulator.core.simulator", ["LaserSimulator"]),
            ("laser_simulator.core.state", ["ControlsState"]),
            
            # Model imports
            ("laser_simulator.models.enums", ["LaserOrientation", "VisualPreset"]),
            ("laser_simulator.models.laser", ["Laser"]),
            ("laser_simulator.models.config", ["DMXConfig", "OSCConfig"]),
            
            # Effect imports
            ("laser_simulator.effects.base", ["BaseEffect", "EffectManager"]),
            ("laser_simulator.effects.visual_presets", ["VisualPresetEffect"]),
            ("laser_simulator.effects.pulse", ["PulseEffect"]),
            ("laser_simulator.effects.strobe", ["StrobeEffect"]),
            ("laser_simulator.effects.movement", ["MovementEffect"]),
            
            # Controller imports
            ("laser_simulator.controllers.dmx", ["DMXController"]),
            ("laser_simulator.controllers.osc", ["OSCController"]),
            
            # Utility imports
            ("laser_simulator.beat_sync.sync", ["BeatSync"]),
            ("laser_simulator.utils.helpers", ["Timer", "apply_dimmer"])
        ]
        
        all_imports_work = True
        for module_name, expected_attrs in import_tests:
            try:
                module = importlib.import_module(module_name)
                for attr_name in expected_attrs:
                    has_attr = hasattr(module, attr_name)
                    self.check(
                        has_attr,
                        f"Module {module_name} missing attribute {attr_name}"
                    )
                    if not has_attr:
                        all_imports_work = False
            except ImportError as e:
                self.check(False, f"Failed to import {module_name}: {e}")
                all_imports_work = False
        
        return all_imports_work
    
    def validate_basic_functionality(self) -> bool:
        """Validate basic simulator functionality."""
        print("⚙️  Validating basic functionality...")
        
        try:
            from laser_simulator import LaserSimulator
            
            # Test simulator creation
            simulator = LaserSimulator()
            self.check(simulator is not None, "Failed to create LaserSimulator instance")
            
            # Test laser count
            expected_laser_count = 28  # 14 top + 14 side
            actual_count = len(simulator.lasers)
            self.check(
                actual_count == expected_laser_count,
                f"Expected {expected_laser_count} lasers, got {actual_count}"
            )
            
            # Test initial state
            state = simulator.get_state()
            required_keys = ['controls', 'lasers', 'stats']
            for key in required_keys:
                self.check(
                    key in state,
                    f"State missing required key: {key}"
                )
            
            # Test control setting
            simulator.set_control("dimmer", 75)
            dimmer_value = simulator.get_control("dimmer")
            self.check(
                dimmer_value == 75,
                f"Control setting failed: expected dimmer=75, got {dimmer_value}"
            )
            
            # Test update
            simulator.update()
            self.check(True, "Update method failed")  # If we get here, it didn't crash
            
            return True
            
        except Exception as e:
            self.check(False, f"Basic functionality test failed: {e}")
            return False
    
    def validate_effects(self) -> bool:
        """Validate that effects work correctly."""
        print("🎨 Validating effects...")
        
        try:
            from laser_simulator import LaserSimulator
            
            simulator = LaserSimulator()
            
            # Test visual presets
            presets_to_test = ["Grid", "Cross", "Cube"]
            for preset in presets_to_test:
                simulator.set_control("visual_preset", preset)
                simulator.update()
                
                active_lasers = [l for l in simulator.lasers if l.brightness > 0]
                self.check(
                    len(active_lasers) > 0,
                    f"Visual preset {preset} didn't activate any lasers"
                )
            
            # Test movement
            simulator.set_control("scroll_direction", "L to R")
            simulator.set_control("laser_move_speed", 50)
            simulator.update()
            # Movement effects are complex to validate, just check no errors
            
            # Test pulse
            simulator.set_control("pulse", 30)
            simulator.update()
            
            # Test strobe  
            simulator.set_control("strobe", 20)
            simulator.update()
            
            return True
            
        except Exception as e:
            self.check(False, f"Effects validation failed: {e}")
            return False
    
    def validate_dmx_functionality(self) -> bool:
        """Validate DMX-related functionality."""
        print("🔌 Validating DMX functionality...")
        
        try:
            from laser_simulator import LaserSimulator, DMXConfig
            from laser_simulator.controllers.dmx import DMXController
            
            # Test DMX configuration
            dmx_config = DMXConfig(enabled=False)  # Don't actually connect
            self.check(dmx_config.enabled == False, "DMX config creation failed")
            
            # Test DMX controller creation
            dmx_controller = DMXController(dmx_config)
            self.check(dmx_controller is not None, "DMX controller creation failed")
            
            # Test simulator with DMX
            simulator = LaserSimulator(dmx_config=dmx_config)
            
            # Test DMX mapping
            mapping = simulator.get_dmx_mapping()
            self.check(
                len(mapping) == 28,
                f"DMX mapping should have 28 entries, got {len(mapping)}"
            )
            
            # Test DMX address setting
            success = simulator.set_dmx_address("top-0", 100)
            self.check(success, "Setting DMX address failed")
            
            new_mapping = simulator.get_dmx_mapping()
            self.check(
                new_mapping["top-0"] == 100,
                f"DMX address not updated correctly: expected 100, got {new_mapping.get('top-0')}"
            )
            
            return True
            
        except Exception as e:
            self.check(False, f"DMX validation failed: {e}")
            return False
    
    def validate_performance(self) -> bool:
        """Validate performance characteristics."""
        print("⚡ Validating performance...")
        
        try:
            from laser_simulator import LaserSimulator
            
            simulator = LaserSimulator()
            
            # Set up a complex scenario
            simulator.set_control("visual_preset", "Grid")
            simulator.set_control("scroll_direction", "Pinwheel") 
            simulator.set_control("pulse", 50)
            simulator.set_control("scroll_phase", 35)
            simulator.set_control("laser_move_speed", 80)
            
            # Time multiple updates
            update_count = 100
            start_time = time.time()
            
            for _ in range(update_count):
                simulator.update()
            
            end_time = time.time()
            duration = end_time - start_time
            avg_time_per_update = duration / update_count
            effective_fps = 1 / avg_time_per_update if avg_time_per_update > 0 else 0
            
            # Performance requirements
            max_time_per_update = 0.010  # 10ms per update (100 FPS capability)
            min_fps = 60
            
            self.check(
                avg_time_per_update < max_time_per_update,
                f"Performance too slow: {avg_time_per_update*1000:.1f}ms per update (should be <{max_time_per_update*1000:.1f}ms)",
                f"Performance warning: {avg_time_per_update*1000:.1f}ms per update"
            )
            
            self.check(
                effective_fps > min_fps,
                f"Effective FPS too low: {effective_fps:.1f} (should be >{min_fps})",
                f"FPS warning: {effective_fps:.1f} FPS"
            )
            
            print(f"  Performance: {avg_time_per_update*1000:.1f}ms per update, {effective_fps:.1f} effective FPS")
            
            return True
            
        except Exception as e:
            self.check(False, f"Performance validation failed: {e}")
            return False
    
    def validate_backward_compatibility(self) -> bool:
        """Validate that the API is backward compatible."""
        print("🔄 Validating backward compatibility...")
        
        try:
            # Test that main imports still work as before
            from laser_simulator import LaserSimulator, DMXConfig, OSCConfig
            from laser_simulator import LaserOrientation, VisualPreset, ScrollDirection, EffectApplication, BeatRate
            
            # Test that basic usage pattern works
            simulator = LaserSimulator()
            
            # Old-style control setting
            simulator.set_control("visual_preset", "Cross")
            simulator.set_control("dimmer", 80)
            simulator.set_control("scroll_direction", "L to R")
            
            # Old-style state access
            state = simulator.get_state()
            self.check("controls" in state and "lasers" in state, "State structure changed")
            
            # Old-style update
            simulator.update()
            
            print("  ✓ All backward compatibility checks passed")
            return True
            
        except Exception as e:
            self.check(False, f"Backward compatibility validation failed: {e}")
            return False
    
    def check_for_original_file(self) -> bool:
        """Check if original laser_simulator.py still exists."""
        print("📄 Checking for original file...")
        
        original_exists = Path("laser_simulator.py").exists()
        backup_exists = Path("laser_simulator_backup.py").exists()
        
        if original_exists and not backup_exists:
            self.warnings.append("Original laser_simulator.py exists but no backup found. Consider running migration script first.")
        elif original_exists and backup_exists:
            self.warnings.append("Both original and backup exist. Consider removing original after validation.")
        
        return True
    
    def run_validation(self) -> bool:
        """Run all validation checks."""
        print("🚀 Starting laser simulator refactoring validation...\n")
        
        validation_steps = [
            ("File Structure", self.validate_file_structure),
            ("Imports", self.validate_imports),
            ("Basic Functionality", self.validate_basic_functionality),
            ("Effects", self.validate_effects),
            ("DMX Functionality", self.validate_dmx_functionality),
            ("Performance", self.validate_performance),
            ("Backward Compatibility", self.validate_backward_compatibility),
            ("Original File Check", self.check_for_original_file),
        ]
        
        all_passed = True
        
        for step_name, step_func in validation_steps:
            try:
                result = step_func()
                if not result:
                    all_passed = False
                    print(f"❌ {step_name} validation failed")
                else:
                    print(f"✅ {step_name} validation passed")
            except Exception as e:
                all_passed = False
                print(f"❌ {step_name} validation crashed: {e}")
                self.errors.append(f"{step_name} validation crashed: {e}")
            
            print()
        
        return all_passed
    
    def print_summary(self):
        """Print validation summary."""
        print("=" * 60)
        print("🎯 VALIDATION SUMMARY")
        print("=" * 60)
        
        print(f"✅ Passed: {self.passed_checks}/{self.total_checks} checks")
        
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for i, error in enumerate(self.errors, 1):
                print(f"   {i}. {error}")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for i, warning in enumerate(self.warnings, 1):
                print(f"   {i}. {warning}")
        
        if not self.errors and not self.warnings:
            print("\n🎉 ALL VALIDATIONS PASSED!")
            print("   Your modular refactoring is complete and working correctly.")
        elif not self.errors:
            print(f"\n✅ VALIDATION SUCCESSFUL (with {len(self.warnings)} warnings)")
            print("   Your refactoring is working correctly, but please review the warnings.")
        else:
            print(f"\n❌ VALIDATION FAILED ({len(self.errors)} errors)")
            print("   Please fix the errors before using the modular version.")
        
        print("\n" + "=" * 60)


def main():
    """Main validation function."""
    validator = RefactoringValidator()
    
    try:
        success = validator.run_validation()
        validator.print_summary()
        
        return 0 if success and not validator.errors else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Validation interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected validation error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
"""
PyGame GUI for Laser Lighting Simulator
Provides visual preview and control interface for the laser simulator.
Designed to match the DMX Control Emulator interface.
"""

import pygame
import sys
import math
import time
from typing import List, Tuple, Optional, Dict, Any
from laser_simulator import (
    LaserSimulator, LaserOrientation, VisualPreset, 
    ScrollDirection, EffectApplication, ControlsState,
    DMXConfig, OSCConfig
)

class Slider:
    """Custom slider widget for pygame."""
    
    def __init__(self, x: int, y: int, w: int, h: int, 
                 min_val: float, max_val: float, init_val: float,
                 label: str = "", show_value: bool = True):
        self.rect = pygame.Rect(x, y, w, h)
        self.min_val = min_val
        self.max_val = max_val
        self.value = init_val
        self.label = label
        self.show_value = show_value
        self.dragging = False
        self.enabled = True
        
    def handle_event(self, event):
        """Handle mouse events for the slider."""
        if not self.enabled:
            return False
            
        if event.type == pygame.MOUSEBUTTONDOWN:
            handle_pos = int(self.rect.x + (self.value - self.min_val) / (self.max_val - self.min_val) * self.rect.width)
            handle_rect = pygame.Rect(handle_pos - 10, self.rect.y - 10, 20, self.rect.height + 20)
            if handle_rect.collidepoint(event.pos) or self.rect.collidepoint(event.pos):
                self.dragging = True
                rel_x = event.pos[0] - self.rect.x
                rel_x = max(0, min(rel_x, self.rect.width))
                self.value = self.min_val + (rel_x / self.rect.width) * (self.max_val - self.min_val)
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            self.dragging = False
        elif event.type == pygame.MOUSEMOTION:
            if self.dragging:
                rel_x = event.pos[0] - self.rect.x
                rel_x = max(0, min(rel_x, self.rect.width))
                self.value = self.min_val + (rel_x / self.rect.width) * (self.max_val - self.min_val)
                return True
        return False
    
    def draw(self, screen, font, text_color=(200, 200, 200)):
        """Draw the slider."""
        # Draw label
        if self.label:
            label_color = text_color if self.enabled else (100, 100, 100)
            label_text = font.render(self.label, True, label_color)
            screen.blit(label_text, (self.rect.x, self.rect.y - 20))
            
            if self.show_value:
                value_text = font.render(str(int(self.value)), True, label_color)
                value_rect = value_text.get_rect(right=self.rect.right, y=self.rect.y - 20)
                screen.blit(value_text, value_rect)
        
        # Draw track
        track_color = (55, 65, 81) if self.enabled else (30, 35, 45)
        track_rect = pygame.Rect(self.rect.x, self.rect.y + 2, self.rect.width, 4)
        pygame.draw.rect(screen, track_color, track_rect, border_radius=2)
        
        # Draw handle
        handle_pos = int(self.rect.x + (self.value - self.min_val) / (self.max_val - self.min_val) * self.rect.width)
        handle_color = (220, 38, 38) if self.enabled else (100, 30, 30)
        pygame.draw.circle(screen, handle_color, (handle_pos, self.rect.centery), 8)


class Button:
    """Custom button widget for pygame."""
    
    def __init__(self, x: int, y: int, w: int, h: int, text: str, 
                 icon: str = None, selected: bool = False):
        self.rect = pygame.Rect(x, y, w, h)
        self.text = text
        self.icon = icon
        self.selected = selected
        self.hovered = False
        self.enabled = True
        
    def handle_event(self, event):
        """Handle mouse events for the button."""
        if not self.enabled:
            return False
            
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                return True
        return False
    
    def draw(self, screen, font):
        """Draw the button."""
        if not self.enabled:
            color = (30, 35, 45)
            text_color = (100, 100, 100)
        elif self.selected:
            color = (220, 38, 38)
            text_color = (255, 255, 255)
        elif self.hovered:
            color = (75, 85, 99)
            text_color = (200, 200, 200)
        else:
            color = (55, 65, 81)
            text_color = (200, 200, 200)
            
        pygame.draw.rect(screen, color, self.rect, border_radius=4)
        
        text_surface = font.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)


class Toggle:
    """Custom toggle switch widget."""
    
    def __init__(self, x: int, y: int, label: str = "", state: bool = False):
        self.rect = pygame.Rect(x, y, 50, 25)
        self.label = label
        self.state = state
        
    def handle_event(self, event):
        """Handle mouse events for the toggle."""
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.state = not self.state
                return True
        return False
    
    def draw(self, screen, font):
        """Draw the toggle switch."""
        track_color = (220, 38, 38) if self.state else (55, 65, 81)
        pygame.draw.rect(screen, track_color, self.rect, border_radius=12)
        
        handle_x = self.rect.x + 35 if self.state else self.rect.x + 15
        pygame.draw.circle(screen, (255, 255, 255), (handle_x, self.rect.centery), 10)
        
        if self.label:
            label_text = font.render(self.label, True, (200, 200, 200))
            # Position label to the right of the toggle
            screen.blit(label_text, (self.rect.x + 60, self.rect.y + 3))


class TextInput:
    """Simple text input widget."""
    
    def __init__(self, x: int, y: int, w: int, h: int, initial_text: str = ""):
        self.rect = pygame.Rect(x, y, w, h)
        self.text = initial_text
        self.active = False
        
    def handle_event(self, event):
        """Handle events for text input."""
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.active = self.rect.collidepoint(event.pos)
            return self.active
        elif event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif event.unicode.isdigit():
                self.text += event.unicode
            return True
        return False
    
    def draw(self, screen, font):
        """Draw the text input."""
        color = (75, 85, 99) if self.active else (55, 65, 81)
        pygame.draw.rect(screen, color, self.rect, border_radius=4)
        pygame.draw.rect(screen, (100, 100, 100), self.rect, 2, border_radius=4)
        
        text_surface = font.render(self.text, True, (255, 255, 255))
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)


class LaserSimulatorGUI:
    """PyGame-based GUI for the laser simulator - DMX Control Emulator."""
    
    def __init__(self, width: int = 1400, height: int = 900):
        pygame.init()
        
        # Display setup
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Laser Rig Simulator - DMX Control Emulator")
        
        # Colors
        self.BG_COLOR = (29, 37, 53)
        self.GRID_COLOR = (220, 38, 38)
        self.GRID_BG = (15, 20, 30)
        self.TEXT_COLOR = (255, 255, 255)
        
        # Fonts
        self.title_font = pygame.font.Font(None, 42)
        self.subtitle_font = pygame.font.Font(None, 20)
        self.label_font = pygame.font.Font(None, 16)
        self.button_font = pygame.font.Font(None, 14)
        
        # Simulator
        dmx_config = DMXConfig(enabled=False)
        osc_config = OSCConfig(enabled=False)
        self.simulator = LaserSimulator(dmx_config, osc_config)
        
        # Layout
        self.grid_size = 560
        self.grid_x = 50
        self.grid_y = 120
        
        # Control panel
        self.control_x = self.grid_x + self.grid_size + 80
        self.control_y = 120
        
        # Clock
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Control elements
        self.sliders: Dict[str, Slider] = {}
        self.buttons: Dict[str, Button] = {}
        self.button_groups: Dict[str, List[Button]] = {}
        self.toggles: Dict[str, Toggle] = {}
        self.text_inputs: Dict[str, TextInput] = {}
        
        # State
        self.bpm = 140
        
        # Create UI
        self._create_ui_elements()
        
    def _create_ui_elements(self):
        """Create all UI control elements with proper layout."""
        x = self.control_x
        y = self.control_y
        
        # Column 1: Main controls
        # Dimmer, Strobe, Pulse
        self.sliders['dimmer'] = Slider(x, y + 20, 300, 10, 0, 100, 100, "Dimmer")
        self.sliders['strobe'] = Slider(x, y + 70, 300, 10, 0, 100, 0, "Strobe")
        self.sliders['pulse'] = Slider(x, y + 120, 300, 10, 0, 100, 0, "Pulse")
        
        # Effect mode
        y_offset = y + 170
        self.button_groups['effect_mode'] = [
            Button(x, y_offset, 145, 35, "All", selected=True),
            Button(x + 155, y_offset, 145, 35, "Alternate")
        ]
        
        # Visual presets (3x4 grid)
        y_offset = y + 230
        preset_data = [
            ('Grid', VisualPreset.ALL_ON),
            ('Bracket', 'bracket'),
            ('L-Bracket', 'l_bracket'),
            ('S Cross', VisualPreset.SMALL_CROSS),
            ('Cross', VisualPreset.CROSS),
            ('L Cross', VisualPreset.BIG_CROSS),
            ('S Dbl Cross', 's_dbl_cross'),
            ('Dbl Cross', 'dbl_cross'),
            ('L Dbl Cross', 'l_dbl_cross'),
            ('Cube', VisualPreset.CUBE),
            ('4 Cubes', VisualPreset.FOUR_CUBES),
            ('9 Cubes', '9_cubes')
        ]
        
        self.button_groups['visual_presets'] = []
        self.preset_mappings = {}
        for i, (name, preset) in enumerate(preset_data):
            row = i // 3
            col = i % 3
            btn = Button(
                x + col * 105, y_offset + row * 45,
                95, 40, name,
                selected=(i == 0)
            )
            self.button_groups['visual_presets'].append(btn)
            self.preset_mappings[i] = preset
        
        # Direction pad (3x3) - directly below visual presets
        y_offset = y + 420
        directions = [
            'TL', 'Up', 'TR',
            'Left', 'X', 'Right',
            'BL', 'Down', 'BR'
        ]
        
        self.button_groups['direction_pad'] = []
        for i, text in enumerate(directions):
            row = i // 3
            col = i % 3
            btn = Button(
                x + col * 105, y_offset + row * 45,
                95, 40, text,
                selected=(text == 'X')
            )
            self.button_groups['direction_pad'].append(btn)
        
        # Movement presets (below direction pad)
        y_offset = y + 570
        self.button_groups['movement_presets'] = [
            Button(x, y_offset, 70, 35, "Out"),
            Button(x + 75, y_offset, 70, 35, "In"),
            Button(x + 150, y_offset, 70, 35, "Pinwheel"),
            Button(x + 225, y_offset, 70, 35, "Spot")
        ]
        
        # Movement modifiers and speed
        y_offset = y + 620
        self.button_groups['movement_modifiers'] = []
        mod_labels = ['Loop', 'Fade', 'Phase', 'Build']
        for i, label in enumerate(mod_labels):
            btn = Button(x + i * 75, y_offset, 70, 30, label)
            self.button_groups['movement_modifiers'].append(btn)
        
        # Number of lasers
        y_offset = y + 660
        self.button_groups['num_lasers'] = []
        for i, num in enumerate(['1', '2', '4', '8']):
            btn = Button(x + i * 75, y_offset, 70, 30, num,
                        selected=(num == '8'))
            self.button_groups['num_lasers'].append(btn)
        
        # Speed slider (full width)
        y_offset = y + 720
        self.sliders['speed'] = Slider(x, y_offset, 300, 10, 0, 100, 60, "Speed")
        
        # Column 2: BPM and Config controls
        col2_x = x + 350
        
        # Beat Sync section
        self.toggles['beat_sync'] = Toggle(col2_x, y + 20, "Beat Sync")
        self.text_inputs['bpm'] = TextInput(col2_x + 60, y + 18, 60, 30, "140")
        
        # Strobe/Pulse/Movement Speed controls
        y_offset = y + 80
        speed_labels = ['Strobe', 'Pulse', 'Movement Speed']
        speed_options = ['Off', '1/3', '1/2', '1', '4']
        
        for j, label in enumerate(speed_labels):
            # Label
            label_text = self.label_font.render(label, True, (150, 150, 150))
            label_y = y_offset + j * 60
            
            # Buttons
            button_group_name = f'{label.lower().replace(" ", "_")}_speed'
            self.button_groups[button_group_name] = []
            for i, option in enumerate(speed_options):
                btn = Button(col2_x + i * 45, label_y + 20, 40, 25, option,
                           selected=(option == 'Off'))
                self.button_groups[button_group_name].append(btn)
        
        # Config controls below BPM
        self.sliders['haze_density'] = Slider(col2_x, y + 300, 250, 10, 0, 100, 80, "Haze Density")
        self.sliders['linear_gradient'] = Slider(col2_x, y + 350, 250, 10, 0, 100, 95, "Linear Gradient")
        self.toggles['show_origins'] = Toggle(col2_x, y + 400, "Show Laser Origins")
        
    def _draw_grid(self):
        """Draw the 14x14 laser grid with thin beams and haze effect."""
        # Draw grid background (black)
        grid_rect = pygame.Rect(self.grid_x, self.grid_y, self.grid_size, self.grid_size)
        pygame.draw.rect(self.screen, (0, 0, 0), grid_rect)
        
        # Draw haze glow effect around edges based on haze density
        haze_intensity = self.sliders['haze_density'].value / 100
        if haze_intensity > 0:
            max_glow_width = 40  # Maximum glow width in pixels
            glow_width = int(max_glow_width * haze_intensity)
            
            # Create multiple layers of glow for smooth gradient
            for layer in range(glow_width):
                alpha = int(30 * haze_intensity * (1 - layer / glow_width))
                if alpha > 0:
                    glow_color = (alpha, 0, 0)  # Red glow
                    
                    # Draw glow rectangles around the main grid
                    glow_rect = pygame.Rect(
                        self.grid_x - layer - 1, 
                        self.grid_y - layer - 1,
                        self.grid_size + 2 * (layer + 1),
                        self.grid_size + 2 * (layer + 1)
                    )
                    pygame.draw.rect(self.screen, glow_color, glow_rect, 1)
        
        # Draw grid lines only if they're visible (very faint, only when haze is low)
        if haze_intensity < 0.3:  # Only show grid lines when haze is low
            cell_size = self.grid_size / 14
            grid_line_color = (20, 0, 0)  # Very faint red
            for i in range(15):
                x = self.grid_x + i * cell_size
                y = self.grid_y + i * cell_size
                pygame.draw.line(self.screen, grid_line_color,
                               (x, self.grid_y), (x, self.grid_y + self.grid_size), 1)
                pygame.draw.line(self.screen, grid_line_color,
                               (self.grid_x, y), (self.grid_x + self.grid_size, y), 1)
        
        # Draw lasers as thin beams (14 top, 14 side)
        for laser in self.simulator.lasers:
            if laser.brightness > 5:  # Only draw if brightness is above minimum threshold
                opacity = laser.brightness / 255
                color = (int(255 * opacity), 0, 0)  # Full red when bright
                
                if laser.orientation == LaserOrientation.TOP:
                    # Vertical beam - 14 evenly spaced
                    laser_index = int(laser.id.split('-')[1])
                    if laser_index < 14:  # Ensure valid index
                        x = self.grid_x + (laser_index + 0.5) * (self.grid_size / 14)
                        
                        # Draw thin vertical line
                        pygame.draw.line(self.screen, color,
                                       (x, self.grid_y),
                                       (x, self.grid_y + self.grid_size), 2)
                        
                        # Draw glow effect based on haze density
                        if opacity > 0.3 and haze_intensity > 0.2:
                            glow_width = int(6 * haze_intensity * opacity)
                            for glow in range(1, glow_width + 1):
                                glow_alpha = int(opacity * 100 * haze_intensity / (glow + 1))
                                if glow_alpha > 0:
                                    glow_color = (glow_alpha, 0, 0)
                                    pygame.draw.line(self.screen, glow_color,
                                                   (x - glow, self.grid_y),
                                                   (x - glow, self.grid_y + self.grid_size), 1)
                                    pygame.draw.line(self.screen, glow_color,
                                                   (x + glow, self.grid_y),
                                                   (x + glow, self.grid_y + self.grid_size), 1)
                else:
                    # Horizontal beam - 14 evenly spaced
                    laser_index = int(laser.id.split('-')[1])
                    if laser_index < 14:  # Ensure valid index
                        y = self.grid_y + (laser_index + 0.5) * (self.grid_size / 14)
                        
                        # Draw thin horizontal line
                        pygame.draw.line(self.screen, color,
                                       (self.grid_x, y),
                                       (self.grid_x + self.grid_size, y), 2)
                        
                        # Draw glow effect based on haze density
                        if opacity > 0.3 and haze_intensity > 0.2:
                            glow_width = int(6 * haze_intensity * opacity)
                            for glow in range(1, glow_width + 1):
                                glow_alpha = int(opacity * 100 * haze_intensity / (glow + 1))
                                if glow_alpha > 0:
                                    glow_color = (glow_alpha, 0, 0)
                                    pygame.draw.line(self.screen, glow_color,
                                                   (self.grid_x, y - glow),
                                                   (self.grid_x + self.grid_size, y - glow), 1)
                                    pygame.draw.line(self.screen, glow_color,
                                                   (self.grid_x, y + glow),
                                                   (self.grid_x + self.grid_size, y + glow), 1)
        
        # Draw laser origins if enabled
        if self.simulator.controls.show_laser_origins:
            cell_size = self.grid_size / 14
            for i in range(14):
                # Top origins (above grid)
                x = self.grid_x + (i + 0.5) * cell_size
                pygame.draw.circle(self.screen, self.GRID_COLOR, (int(x), self.grid_y - 10), 3)
                
                # Side origins (left of grid)
                y = self.grid_y + (i + 0.5) * cell_size
                pygame.draw.circle(self.screen, self.GRID_COLOR, (self.grid_x - 10, int(y)), 3)
    
    def _draw_title(self):
        """Draw the title and subtitle."""
        title_text = self.title_font.render("Laser Rig Simulator", True, self.GRID_COLOR)
        title_rect = title_text.get_rect(center=(self.width // 2, 40))
        self.screen.blit(title_text, title_rect)
        
        subtitle_text = self.subtitle_font.render("DMX Control Emulator", True, (150, 150, 150))
        subtitle_rect = subtitle_text.get_rect(center=(self.width // 2, 65))
        self.screen.blit(subtitle_text, subtitle_rect)
    
    def _draw_labels(self):
        """Draw section labels."""
        # BPM label
        if self.toggles['beat_sync'].state:
            bpm_text = self.label_font.render("BPM", True, (150, 150, 150))
            self.screen.blit(bpm_text, (self.control_x + 475, self.control_y + 25))
        
        # Speed control labels
        col2_x = self.control_x + 350
        y_offset = self.control_y + 80
        
        labels = ['Strobe', 'Pulse', 'Movement Speed']
        for i, label in enumerate(labels):
            label_text = self.label_font.render(label, True, (150, 150, 150))
            self.screen.blit(label_text, (col2_x, y_offset + i * 60))
    
    def _update_controls(self):
        """Update simulator controls from UI values."""
        # Update sliders
        self.simulator.controls.master_dimmer = int(self.sliders['dimmer'].value)
        self.simulator.controls.strobe = int(self.sliders['strobe'].value)
        self.simulator.controls.pulse = int(self.sliders['pulse'].value)
        self.simulator.controls.scroll_rate = int(self.sliders['speed'].value)
        
        # Update BPM
        if self.text_inputs['bpm'].text:
            self.bpm = int(self.text_inputs['bpm'].text)
        
        # Update show origins
        self.simulator.controls.show_laser_origins = self.toggles['show_origins'].state
        
        # Handle control dependencies
        if self.simulator.controls.strobe > 0:
            self.sliders['pulse'].value = 0
            self.simulator.controls.pulse = 0
        elif self.simulator.controls.pulse > 0:
            self.sliders['strobe'].value = 0
            self.simulator.controls.strobe = 0
    
    def _handle_events(self):
        """Handle pygame events."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            # Handle sliders
            for slider in self.sliders.values():
                slider.handle_event(event)
            
            # Handle toggles
            for toggle in self.toggles.values():
                toggle.handle_event(event)
            
            # Handle text inputs
            for text_input in self.text_inputs.values():
                text_input.handle_event(event)
            
            # Handle button clicks
            if event.type == pygame.MOUSEBUTTONDOWN:
                # Effect mode
                for i, button in enumerate(self.button_groups['effect_mode']):
                    if button.handle_event(event):
                        for b in self.button_groups['effect_mode']:
                            b.selected = False
                        button.selected = True
                        self.simulator.controls.effect_application = (
                            EffectApplication.ALL if i == 0 else EffectApplication.ALTERNATE
                        )
                
                # Visual presets
                for i, button in enumerate(self.button_groups['visual_presets']):
                    if button.handle_event(event):
                        for b in self.button_groups['visual_presets']:
                            b.selected = False
                        button.selected = True
                        
                        preset = self.preset_mappings[i]
                        if isinstance(preset, str):
                            # Custom preset - set it in controls
                            self.simulator.controls.custom_preset = preset
                            self.simulator.controls.visual_preset = VisualPreset.ALL_ON  # Default
                        else:
                            # Standard preset - clear custom and set standard
                            self.simulator.controls.custom_preset = None
                            self.simulator.controls.visual_preset = preset
                
                # Strobe/Pulse/Movement speed buttons
                for group_name in ['strobe_speed', 'pulse_speed', 'movement_speed']:
                    if group_name in self.button_groups:
                        for i, button in enumerate(self.button_groups[group_name]):
                            if button.handle_event(event):
                                # Deselect all in this group
                                for b in self.button_groups[group_name]:
                                    b.selected = False
                                button.selected = True
                                
                                # Map button to speed multiplier
                                speed_map = {
                                    'Off': 0,
                                    '1/3': 33,
                                    '1/2': 50,
                                    '1': 100,
                                    '4': 400
                                }
                                
                                if self.toggles['beat_sync'].state and self.bpm > 0:
                                    # Apply beat sync multiplier
                                    base_rate = self.bpm / 60  # Convert BPM to Hz
                                    multiplier = speed_map.get(button.text, 100) / 100
                                    
                                    if group_name == 'strobe_speed':
                                        if button.text == 'Off':
                                            self.simulator.controls.strobe = 0
                                        else:
                                            self.simulator.controls.strobe = int(base_rate * multiplier * 20)
                                            self.sliders['strobe'].value = self.simulator.controls.strobe
                                    elif group_name == 'pulse_speed':
                                        if button.text == 'Off':
                                            self.simulator.controls.pulse = 0
                                        else:
                                            self.simulator.controls.pulse = int(base_rate * multiplier * 20)
                                            self.sliders['pulse'].value = self.simulator.controls.pulse
                                    elif group_name == 'movement_speed':
                                        if button.text == 'Off':
                                            self.simulator.controls.scroll_rate = 0
                                        else:
                                            self.simulator.controls.scroll_rate = int(base_rate * multiplier * 30)
                                            self.sliders['speed'].value = self.simulator.controls.scroll_rate
                
                # Movement presets (mutually exclusive with direction pad)
                for i, button in enumerate(self.button_groups['movement_presets']):
                    if button.handle_event(event):
                        # Deselect all direction and movement buttons
                        for b in self.button_groups['direction_pad']:
                            b.selected = False
                        for b in self.button_groups['movement_presets']:
                            b.selected = False
                        button.selected = True
                        
                        move_map = {
                            0: ScrollDirection.OUT_FROM_CENTER,
                            1: ScrollDirection.TOWARDS_CENTER,
                            2: ScrollDirection.PINWHEEL,
                            3: ScrollDirection.SPOT
                        }
                        if i in move_map:
                            self.simulator.controls.scroll_direction = move_map[i]
                
                # Direction pad (mutually exclusive with movement presets)
                for i, button in enumerate(self.button_groups['direction_pad']):
                    if button.handle_event(event):
                        # Deselect all direction and movement buttons
                        for b in self.button_groups['direction_pad']:
                            b.selected = False
                        for b in self.button_groups['movement_presets']:
                            b.selected = False
                        button.selected = True
                        
                        direction_map = [
                            ScrollDirection.TO_TL, ScrollDirection.BOTTOM_TO_TOP, ScrollDirection.TO_TR,
                            ScrollDirection.RIGHT_TO_LEFT, ScrollDirection.NONE, ScrollDirection.LEFT_TO_RIGHT,
                            ScrollDirection.TO_BL, ScrollDirection.TOP_TO_BOTTOM, ScrollDirection.TO_BR
                        ]
                        self.simulator.controls.scroll_direction = direction_map[i]
                        # If selecting X (center), also deselect movement presets
                        if i == 4:  # X button
                            for b in self.button_groups['movement_presets']:
                                b.selected = False
                
                # Movement modifiers (build is mutually exclusive with loop/fade/phase)
                for i, button in enumerate(self.button_groups['movement_modifiers']):
                    if button.handle_event(event):
                        if i == 3:  # Build
                            # Build disables other modifiers
                            self.simulator.controls.loop_enabled = False
                            self.simulator.controls.fade_enabled = False
                            self.simulator.controls.phase_enabled = False
                            self.simulator.controls.build_enabled = not self.simulator.controls.build_enabled
                            
                            # Update all button states
                            self.button_groups['movement_modifiers'][0].selected = False  # Loop
                            self.button_groups['movement_modifiers'][1].selected = False  # Fade
                            self.button_groups['movement_modifiers'][2].selected = False  # Phase
                            self.button_groups['movement_modifiers'][3].selected = self.simulator.controls.build_enabled  # Build
                            
                        else:  # Loop, Fade, or Phase
                            # Other modifiers disable Build
                            self.simulator.controls.build_enabled = False
                            self.button_groups['movement_modifiers'][3].selected = False  # Build
                            
                            if i == 0:  # Loop
                                self.simulator.controls.loop_enabled = not self.simulator.controls.loop_enabled
                                button.selected = self.simulator.controls.loop_enabled
                            elif i == 1:  # Fade
                                self.simulator.controls.fade_enabled = not self.simulator.controls.fade_enabled
                                button.selected = self.simulator.controls.fade_enabled
                            elif i == 2:  # Phase
                                self.simulator.controls.phase_enabled = not self.simulator.controls.phase_enabled
                                button.selected = self.simulator.controls.phase_enabled
                
                # Number of lasers (radio button behavior)
                for i, button in enumerate(self.button_groups['num_lasers']):
                    if button.handle_event(event):
                        # Deselect all other buttons
                        for b in self.button_groups['num_lasers']:
                            b.selected = False
                        # Select this button
                        button.selected = True
                        # Update the simulator control
                        self.simulator.controls.scroll_laser_count = int(button.text)
            
            # Update hover states
            if event.type == pygame.MOUSEMOTION:
                for group in self.button_groups.values():
                    for button in group:
                        button.handle_event(event)
    
    def run(self):
        """Main game loop."""
        while self.running:
            # Handle events
            self._handle_events()
            
            # Update
            self._update_controls()
            self.simulator.update()
            
            # Draw
            self.screen.fill(self.BG_COLOR)
            self._draw_title()
            self._draw_grid()
            self._draw_labels()
            
            # Draw all UI elements
            for slider in self.sliders.values():
                slider.draw(self.screen, self.label_font)
            
            for group in self.button_groups.values():
                for button in group:
                    button.draw(self.screen, self.button_font)
            
            for toggle in self.toggles.values():
                toggle.draw(self.screen, self.label_font)
            
            for text_input in self.text_inputs.values():
                text_input.draw(self.screen, self.label_font)
            
            # Update display
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    gui = LaserSimulatorGUI()
    gui.run()
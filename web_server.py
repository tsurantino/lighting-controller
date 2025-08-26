import time
from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit
from laser_simulator import LaserSimulator, DMXConfig, OSCConfig

# --- Configuration ---
DEBUG = False  # Set to True to enable debug output
DMX_ENABLED = False 
OSC_ENABLED = True

# --- Flask App Setup ---
app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')
app.config['SECRET_KEY'] = 'your_very_secret_key'
# Only enable SocketIO logging if DEBUG is True
socketio = SocketIO(app, cors_allowed_origins="*", logger=DEBUG, engineio_logger=DEBUG)

# --- Global Simulator Instance ---
simulator = LaserSimulator(
    dmx_config=DMXConfig(enabled=DMX_ENABLED, port="COM3"), 
    osc_config=OSCConfig(enabled=OSC_ENABLED, listen_port=8000)
)

# --- Background Task ---
thread = None

def debug_print(message):
    """Print message only if DEBUG is enabled."""
    if DEBUG:
        print(message)

def simulator_loop():
    """The main simulator update loop that pushes state to clients."""
    debug_print("Simulator loop started")
    loop_count = 0
    while True:
        try:
            loop_count += 1
            if loop_count % 30 == 0 and DEBUG:  # Print every second only if debug
                debug_print(f"Simulator loop iteration {loop_count}")
            
            simulator.update()
            state = simulator.get_state()
            
            if loop_count % 30 == 0 and DEBUG:  # Print state every second only if debug
                debug_print(f"State has {len(state.get('lasers', []))} lasers")
            
            socketio.emit('state_update', state)
            socketio.sleep(1/30)
            
        except Exception as e:
            print(f"Error in simulator loop: {e}")  # Always print errors
            if DEBUG:
                import traceback
                traceback.print_exc()
            socketio.sleep(1)

# --- HTTP Routes ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the React app and its assets."""
    debug_print(f"Serving path: {path}")
    if path != "" and path != "index.html":
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- WebSocket Handlers ---
@socketio.on('connect')
def handle_connect(auth=None):
    """A new client has connected."""
    global thread
    debug_print('Client connected')
    if thread is None:
        debug_print("Starting simulator loop...")
        thread = socketio.start_background_task(target=simulator_loop)
    else:
        debug_print("Simulator loop already running")

@socketio.on('disconnect')
def handle_disconnect():
    """A client has disconnected."""
    debug_print('Client disconnected')

@socketio.on('control_change')
def handle_control_change(data):
    """Handle control changes from the frontend."""
    print(f"🔧 RECEIVED: {data}")  # Always print, not debug_print
    
    name_map = { 
        "visualPreset": "visual_preset", 
        "effectApplication": "effect_application", 
        "scrollDirection": "scroll_direction", 
        "laserMoveSpeed": "laser_move_speed",
        "shockerSpeed": "shocker_speed",
        "saberSpeed": "saber_speed",
        "mhSpeed": "mh_speed",
        "scrollLaserCount": "scroll_laser_count", 
        "scrollFade": "scroll_fade", 
        "scrollBuildEffect": "scroll_build_effect", 
        "loopEffect": "loop_effect", 
        "scrollPhase": "scroll_phase", 
        "beatSyncEnabled": "beat_sync_enabled", 
        "bpm": "bpm", 
        "beatStrobeRate": "beat_strobe_rate", 
        "beatPulseRate": "beat_pulse_rate", 
        "beatLaserMoveSpeedRate": "beat_laser_move_speed_rate",
        "beatShockerSpeedRate": "beat_shocker_speed_rate",
        "beatSaberSpeedRate": "beat_saber_speed_rate",
        "beatMhSpeedRate": "beat_mh_speed_rate",
        "dimmer": "dimmer", 
        "pulse": "pulse", 
        "strobe": "strobe",
        "hazeDensity": "haze_density",
        "linearGradient": "linear_gradient",
        "showLaserOrigins": "show_laser_origins"
    }
    
    js_name = data.get('control')
    value = data.get('value')
    python_name = name_map.get(js_name, js_name)
    
    # Always print these key values for debugging
    print(f"🔄 MAPPING: {js_name} -> {python_name} = {value} (type: {type(value)})")
    
    # Add special logging for the problematic controls
    if python_name == "visual_preset":
        print(f"🎯 VISUAL PRESET: Sending '{value}' to backend")
    elif python_name == "scroll_direction":  
        print(f"🎯 SCROLL DIRECTION: Sending '{value}' to backend")
    
    simulator._handle_osc_control(python_name, value)

if __name__ == '__main__':
    print("Starting Flask server at http://localhost:5000")  # Always print startup message
    socketio.run(app, host='0.0.0.0', port=5000, debug=DEBUG)
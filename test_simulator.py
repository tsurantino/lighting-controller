import time
from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit
from laser_simulator import LaserSimulator, DMXConfig, OSCConfig

# --- Configuration ---
# Set to False if you don't have a DMX device connected to avoid the port error
DMX_ENABLED = False 
OSC_ENABLED = True

# --- Flask App Setup ---
app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')
app.config['SECRET_KEY'] = 'your_very_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# --- Global Simulator Instance ---
simulator = LaserSimulator(
    # IMPORTANT: Change "COM3" to your Mac's port name (e.g., "/dev/tty.usbserial-XXXX")
    dmx_config=DMXConfig(enabled=DMX_ENABLED, port="COM3"), 
    osc_config=OSCConfig(enabled=OSC_ENABLED, listen_port=8000)
)

# --- Background Task ---
# We only need one global variable to hold our thread
thread = None

def simulator_loop():
    """The main simulator update loop that pushes state to clients."""
    print("Simulator loop started")
    loop_count = 0
    while True:
        try:
            loop_count += 1
            if loop_count % 30 == 0:  # Print every second
                print(f"Simulator loop iteration {loop_count}")
            
            simulator.update()
            state = simulator.get_state()
            
            if loop_count % 30 == 0:  # Print state every second
                print(f"State has {len(state.get('lasers', []))} lasers")
            
            socketio.emit('state_update', state)
            socketio.sleep(1/30)
            
        except Exception as e:
            print(f"Error in simulator loop: {e}")
            import traceback
            traceback.print_exc()
            socketio.sleep(1)  # Wait before retrying

# --- HTTP Routes ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the React app and its assets."""
    print(f"Serving path: {path}")
    if path != "" and path != "index.html":
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- WebSocket Handlers ---
@socketio.on('connect')
def handle_connect(auth=None):
    """A new client has connected."""
    global thread
    print(f'Client connected from {request.sid if "request" in globals() else "unknown"}')
    # Use a simpler check: if the thread variable is still None, start the task.
    if thread is None:
        print("Starting simulator loop...")
        thread = socketio.start_background_task(target=simulator_loop)
    else:
        print("Simulator loop already running")

@socketio.on('disconnect')
def handle_disconnect():
    """A client has disconnected."""
    print('Client disconnected')

@socketio.on('control_change')
def handle_control_change(data):
    """Handle control changes from the frontend."""
    print(f"Received control change: {data}")
    name_map = { "visualPreset": "visual_preset", "effectApplication": "effect_application", "scrollDirection": "scroll_direction", "scrollRate": "scroll_rate", "scrollLaserCount": "scroll_laser_count", "scrollFade": "scroll_fade", "scrollBuildEffect": "scroll_build_effect", "loopEffect": "loop_effect", "scrollPhase": "scroll_phase", "beatSyncEnabled": "beat_sync_enabled", "bpm": "bpm", "beatStrobeRate": "beat_strobe_rate", "beatPulseRate": "beat_pulse_rate", "beatSpeedRate": "beat_speed_rate", "dimmer":"dimmer", "pulse":"pulse", "strobe":"strobe" }
    js_name = data.get('control')
    value = data.get('value')
    python_name = name_map.get(js_name, js_name)
    print(f"Mapping {js_name} -> {python_name} = {value}")
    simulator._handle_osc_control(python_name, value)

if __name__ == '__main__':
    print("Starting Flask server at http://localhost:5000")
    # The async_mode is automatically detected when eventlet is installed
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
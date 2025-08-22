# Laser Rig Simulator

A web-based simulator for a laser lighting rig with top and side-mounted lasers. This provides a visual representation of DMX-controlled laser effects, allowing for complex combinations of patterns, movements, and beat-synced effects.

## Controls Breakdown

The control panel is divided into several sections, each managing a different aspect of the laser rig's output. Each control manipulates a specific piece of the `ControlsState` interface (`types.ts`), which is then processed within the main `calculateLasers` function in `App.tsx`.

### Global Controls

These controls affect the overall output of the rig.

-   **Dimmer:** A master fader that controls the overall brightness.
    -   **State:** `controls.dimmer` (0-100)
    -   **Implementation:** Applied as a global multiplier to every laser's brightness at the beginning of the effects chain in `calculateLasers`.
        ```typescript
        // App.tsx -> calculateLasers()
        nextLasers.forEach(laser => {
          laser.brightness *= (controls.dimmer / 100);
        });
        ```

-   **Strobe:** Creates a flashing effect. The slider controls the frequency. This is disabled if Beat Sync for Strobe is active.
    -   **State:** `controls.strobe` (0-100)
    -   **Implementation:** Uses a sine wave to determine the on/off state. The frequency is derived from the slider value.
        ```typescript
        // App.tsx -> calculateLasers()
        const strobeFrequency = (strobe / 100) * 30;
        strobeIsOn = Math.sin(time * Math.PI * 2 * strobeFrequency) > 0;
        ```

-   **Pulse:** Creates a smooth brightness modulation effect. The slider controls the speed. This is disabled if Beat Sync for Pulse is active.
    -   **State:** `controls.pulse` (0-100)
    -   **Implementation:** Modulates brightness using a sine wave to create a smooth rise and fall.
        ```typescript
        // App.tsx -> calculateLasers()
        const pulseFrequency = (pulse / 100) * 6;
        const timePhase = time * Math.PI * 2 * pulseFrequency;
        const pulseValue = (Math.sin(timePhase) + 1) / 2;
        ```

-   **Effect Application:** Determines how Strobe and Pulse are applied.
    -   **State:** `controls.effectApplication` (`EffectApplication.All` or `EffectApplication.Alternate`)
    -   **Implementation:** A conditional check within the Strobe and Pulse logic in `calculateLasers` applies the effect either to all lasers or alternates between `LaserOrientation.Top` and `LaserOrientation.Side` groups.

### Visual Presets

This section defines the base pattern of which lasers are turned on, selected via `VisualButton` components in `Controls.tsx`.

-   **State:** `controls.visualPreset` (from `VisualPreset` enum in `types.ts`)
-   **Implementation:** A large `switch (controls.visualPreset)` statement in `calculateLasers` sets the initial `brightness` for specific laser indices based on the selected preset.

    ```typescript
    // App.tsx -> calculateLasers()
    switch (controls.visualPreset) {
      case VisualPreset.Grid:
        nextLasers.forEach(laser => laser.brightness = baseBrightness);
        break;
      case VisualPreset.Cross:
        // ... logic to turn on lasers in a cross shape
        break;
      // ... other cases
    }
    ```
-   **Presets:** Grid, Bracket, L Bracket, S Cross, Cross, L Cross, S Dbl Cross, Dbl Cross, L Dbl Cross, Cube, 4 Cubes, 9 Cubes.

### Movement Controls

These controls apply a moving brightness mask over the active Visual Preset. The core logic resides in the `if (controls.scrollDirection !== ScrollDirection.None)` block in `calculateLasers`.

#### Directional D-Pad & Other Movement Presets

-   **State:** `controls.scrollDirection` (from `ScrollDirection` enum in `types.ts`)
-   **UI:** Implemented with `ScrollButton` and `MovementPresetButton` components in `Controls.tsx`.
-   **Implementation:**
    -   **Up/Down/Left/Right:** Handled by the `applyAxisScroll` helper function within `calculateLasers`.
    -   **Diagonals (To TL, etc.):** A linearized distance `dist` is calculated for each laser relative to a corner origin. This distance is then used to position the movement wave.
    -   **Out/In:** The `distanceFromCenter` for each laser is calculated, and the wave moves along this radial axis.
    -   **Pinwheel:** The movement follows a pre-defined `path` array of laser indices.
    -   **Spot:** Randomly selects a number of lasers (defined by `scrollLaserCount`) to turn on at an interval determined by `scrollRate`. This uses the `spotLasersRef` to persist the selection between animation frames.

### Movement Modifiers & Parameters

These modify the behavior of the active movement effect.

-   **Fade (Toggle):** Toggles the wave's edge between soft and hard.
    -   **State:** `controls.scrollFade` (toggled between 20 for hard and 90 for soft).
    -   **Implementation:** The `scrollFade` value is used as an exponent in the `calculateBrightness` helper function to shape the falloff curve of the wave. A higher value creates a softer edge.
        ```typescript
        // App.tsx -> calculateLasers() -> calculateBrightness()
        const falloff = Math.pow(normalizedDist, fadeFactor * 2 + 1);
        ```

-   **Loop (Toggle):** The movement wave reverses direction at the end of its path.
    -   **State:** `controls.loopEffect` (boolean)
    -   **Implementation:** In the `calculateProgress` helper, a conditional check modifies the progress calculation to create a "ping-pong" effect.
        ```typescript
        // App.tsx -> calculateLasers() -> calculateProgress()
        if (loopEffect) {
          // ... logic to reverse direction
        }
        ```

-   **Phase (Toggle):** Adds a second, out-of-phase movement wave.
    -   **State:** `controls.scrollPhase` (0 or 35)
    -   **Implementation:** If `scrollPhase > 0`, a second progress value (`progress2`) is calculated with an offset. The brightness from both waves is computed, and the maximum value is used.
        ```typescript
        // App.tsx -> calculateLasers()
        const brightness2 = getWaveBrightness(progress2);
        finalBrightness = Math.max(brightness1, brightness2);
        ```

-   **Build (Toggle):** Lit lasers remain lit, allowing the wave to "paint" the rig.
    -   **State:** `controls.scrollBuildEffect` (boolean)
    -   **Implementation:** A React ref, `builtLasersRef`, stores the maximum brightness value each laser has reached. This ref's values are combined with the current movement mask value to ensure lasers stay on. The ref is reset when the movement direction changes.

-   **Number of Lasers (1, 2, 4, 8):** Controls the width of the wave.
    -   **State:** `controls.scrollLaserCount` (1, 2, 4, or 8)
    -   **Implementation:** Used in `calculateBrightness` to determine how far from the wave's center the brightness should extend. `if (distanceFromWaveCenter < scrollLaserCount / 2)`

-   **Speed:** Controls the velocity of the movement.
    -   **State:** `controls.scrollRate` (1-100)
    -   **Implementation:** Used in `calculateProgress` to determine the speed of the animation. It's multiplied by the elapsed `time`. `(time * effectiveRate) % period;`

### Beat Sync Controls

Synchronizes effects to a musical tempo.

-   **State:** `controls.beatSyncEnabled` (boolean), `controls.bpm` (number).
-   **Implementation:** When `beatSyncEnabled` is true, boolean flags like `useBeatPulse` are set. The core timing is based on `beatInterval = 60 / bpm`.

-   **Effect-Specific Modifiers (Strobe, Pulse, Movement Speed):**
    -   **State:** `controls.beatStrobeRate`, `controls.beatPulseRate`, `controls.beatSpeedRate` (of type `BeatRate`).
    -   **Implementation:** The `getBeatRateMultiplier` helper function converts the selected rate (e.g., '1/2') into a numeric multiplier. This multiplier adjusts the `beatInterval` to calculate the correct duration for the effect (e.g., `pulseDuration = beatInterval / rateMultiplier`). For movement speed, time is quantized to the beat, ensuring the wave "steps" in time with the music.

### Configuration Settings

General visual settings for the simulator.

-   **Haze Density:** Simulates atmospheric haze.
    -   **State:** `controls.hazeDensity` (0-100)
    -   **Implementation:** Passed as a prop to `LaserBeam.tsx`. It controls the `blur` amount in a CSS filter, creating a glow effect.
        ```typescript
        // components/LaserBeam.tsx
        const hazeBlurAmount = hazeDensity / 15;
        // ...
        filter: `blur(${hazeBlurAmount}px)`,
        ```

-   **Linear Gradient:** Controls the perceived length of the laser beams.
    -   **State:** `controls.linearGradient` (0-100)
    -   **Implementation:** Passed as a prop to `LaserBeam.tsx`. It defines the color-stop percentage in the `linear-gradient` CSS property for the beam elements.

-   **Show Laser Origins:** Toggles the visibility of the emitters.
    -   **State:** `controls.showLaserOrigins` (boolean)
    -   **Implementation:** Used for conditional rendering of the origin `div` within `LaserBeam.tsx`.
        ```jsx
        // components/LaserBeam.tsx
        {showOrigin && (
          <div /* ... origin element ... */ />
        )}
        ```

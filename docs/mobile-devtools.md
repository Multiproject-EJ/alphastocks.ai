# Mobile DevTools Documentation

## Overview

The Mobile QA Harness provides comprehensive debugging and testing tools for the investing board game mobile experience. It includes a debug overlay, device preview, and automated screenshot capture.

## Features

### 1. Debug Overlay

A toggleable floating overlay that displays real-time metrics and game events.

**Displays:**
- Viewport dimensions (width × height)
- Device pixel ratio (DPR)
- Safe-area insets (top, right, bottom, left)
- Current game phase (idle, rolling, moving, landed)
- Overlay stack length and top overlay name
- Last 20 game/UI events with timestamps

**Usage:**
- Click the 🔧 button in the top-right corner to toggle the overlay
- Click "Clear" to reset the event log
- The overlay is collapsible and starts collapsed by default

### 2. Device Preview Panel

A panel for testing different mobile device configurations.

**Available Presets:**
1. **iPhone SE** - 320×568, DPR 2, safe-area top 20px
2. **iPhone 12 mini** - 360×780, DPR 3, safe-area top 44px, bottom 34px
3. **iPhone 14 Pro** - 393×852, DPR 3, safe-area top 59px, bottom 34px
4. **Small Android** - 360×640, DPR 2, safe-area top 24px

**Usage:**
- Click the 📱 button in the bottom-right corner to open the panel
- Select a device preset to constrain the viewport
- Safe-area insets are simulated via CSS custom properties
- Click "Reset to Real Device" to return to normal viewport

### 3. Screenshot Capture Workflow

Automated Playwright tests for capturing screenshots across device presets.

**What it captures:**
- Board in idle state
- After roll action
- With modal open
- DevTools overlay visible
- Device preview panel

**Screenshots are saved to:** `apps/investing-board-game-v3/artifacts/screenshots/`

## How to Enable DevTools

DevTools are **only available in development mode** and never bundled in production.

### Method 1: Environment Variable (Recommended)

Set the environment variable before starting the dev server:

```bash
VITE_DEVTOOLS=1 npm run dev
```

### Method 2: Dev Mode (Automatic)

DevTools are automatically enabled when running the Vite dev server:

```bash
npm run dev
```

### Method 3: Query Parameter (Quick Testing)

Add `?devtools=1` to the URL:

```
http://localhost:5173/board-game-v3/?devtools=1
```

This is useful for testing devtools in preview builds.

## Event Logging

The devtools automatically log key game and UI events:

### Logged Events

- **roll_pressed** - When the dice roll button is clicked (payload: multiplier, rollsRemaining)
- **move_started** - When player movement begins (payload: totalMovement, startPosition)
- **move_ended** - When player movement completes (payload: newPosition, totalMovement)
- **tile_landed** - When player lands on a tile (payload: position, tileType, passedStart)
- **modal_opened** - When a modal is opened (payload: modal name)
- **nav_switch** - When bottom navigation is used (payload: section, from)

Events are stored in memory (last 20) and displayed in the debug overlay with timestamps.

## Running Screenshot Tests

### Prerequisites

Install Playwright browsers (first time only):

```bash
npx playwright install
```

### Run Tests

```bash
npm run e2e:screenshots
```

This will:
1. Start the dev server with devtools enabled
2. Launch Chromium browser
3. Navigate through device presets
4. Capture screenshots in various states
5. Save screenshots to `artifacts/screenshots/`

### View Test Results

Playwright generates an HTML report:

```bash
npx playwright show-report
```

## Metrics Explained

### Viewport

The visible area of the browser window in pixels. Important for responsive design testing.

### Device Pixel Ratio (DPR)

The ratio between physical pixels and CSS pixels. Higher DPR means sharper displays (Retina screens).

- DPR 1: Standard displays
- DPR 2: Retina displays (most modern phones)
- DPR 3: High-resolution displays (iPhone Pro models)

### Safe Area Insets

The insets from screen edges to avoid notches, rounded corners, and system UI.

- **Top**: Status bar, notch, Dynamic Island
- **Bottom**: Home indicator, gesture area
- **Left/Right**: Curved edges (rare)

On real devices, these are provided by the OS. In devtools, they're simulated per preset.

### Game Phase

The current state of the game loop:

- **idle**: Waiting for user input
- **rolling**: Dice animation in progress
- **moving**: Player piece is moving
- **landed**: Player has landed, tile effects active

### Overlay Stack

Count of active modals/overlays. Useful for debugging modal issues and z-index problems.

## Production Safety

DevTools code is **completely excluded** from production builds through:

1. **Tree-shaking**: Dynamic imports with conditional checks
2. **Dead code elimination**: Vite removes unused code
3. **Environment checks**: `import.meta.env.DEV` is replaced with `false` in production

To verify, build for production and check the bundle:

```bash
npm run build
# DevTools should not appear in dist/assets/*.js
```

## Tips

1. **Mobile Testing**: Use Chrome DevTools device emulation + devtools overlay for comprehensive mobile debugging
2. **Performance**: The overlay updates in real-time but has minimal performance impact
3. **Events**: Clear the event log frequently when debugging to avoid clutter
4. **Screenshots**: Run screenshot tests after major UI changes to catch regressions
5. **Safe Area**: Test with iPhone presets to ensure UI doesn't overlap with system elements

## Troubleshooting

**DevTools not appearing?**
- Check that you're running in dev mode or have `?devtools=1` in URL
- Verify the 🔧 button appears in top-right corner
- Check browser console for errors

**Events not logging?**
- Events only log when devtools are enabled
- Check that `logEvent` is being called (not undefined)
- Some events may only fire in certain game states

**Screenshots failing?**
- Ensure dev server is running on port 5173
- Install Playwright browsers: `npx playwright install`
- Check artifacts/screenshots directory permissions

**Safe area not working?**
- Safe area simulation uses CSS custom properties
- Real device safe areas require viewport-fit=cover meta tag
- Check that device preset is active in Device Preview panel

## Future Enhancements

Potential additions to the devtools:

- Network request logger
- Performance metrics (FPS, memory)
- State inspector (React DevTools integration)
- Touch gesture visualizer
- Orientation change simulation
- Custom safe area editor

## Support

For issues or feature requests related to devtools, please contact the development team or file an issue in the project repository.

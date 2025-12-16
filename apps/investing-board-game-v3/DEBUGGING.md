# Debugging Guide

## Enable Debug Logging

The game includes a comprehensive debugging system to help troubleshoot issues with game mechanics.

### How to Enable

1. Open the browser's developer console (F12 or Cmd+Option+I)
2. Enter the following command:
   ```javascript
   localStorage.setItem('DEBUG_GAME', 'true')
   ```
3. Refresh the page

### What Gets Logged

When debug mode is enabled, you'll see detailed console logs for:

- **Dice Rolling**: Roll value, current position, and target position
- **Movement**: Start and progress of player token movement
- **Tile Landing**: Which tile the player landed on and its properties
- **Phase Transitions**: Changes between game phases (idle, rolling, moving, landed)
- **Modal Events**: Opening and closing of various game modals
- **Game Actions**: Stock purchases, challenge selections, etc.

### Example Debug Output

```
[DEBUG] Dice roll started: {roll: 5, currentPosition: 0, targetPosition: 5}
[DEBUG] Movement started
[DEBUG] Landing on tile: {position: 5, tile: {...}}
[DEBUG] handleTileLanding: {position: 5, tile: {...}}
[DEBUG] Category tile - showing stock card
[DEBUG] Opening Stock modal
```

### Disable Debug Logging

To turn off debug logging:
```javascript
localStorage.removeItem('DEBUG_GAME')
```

Then refresh the page.

## Common Issues

### Player Token Not Moving After First Roll

**Fixed in v1.1.0** - This was caused by a JavaScript closure issue where the `currentHop` variable was being incremented before React processed the state update. The fix captures the position value in a local constant before updating state.

### Phase Stuck in 'landed'

Check that all modals properly call their `onOpenChange` handlers when closing. The game uses modal state to determine when to transition back to 'idle' phase.

## Reporting Bugs

When reporting bugs, please:
1. Enable debug mode
2. Reproduce the issue
3. Copy the relevant console logs
4. Include your browser and version
5. Describe the steps to reproduce

# UI Mode State Machine

## Overview
The UI Mode State Machine provides a centralized way to manage different view modes in the application (board game, city builder, gallery, etc.). It replaces scattered boolean flags and manual state updates with a single source of truth.

## Architecture

### Core Components

1. **State Machine** (`src/lib/uiModeStateMachine.ts`)
   - Defines all UI modes
   - Defines valid transitions between modes
   - Provides mode enter/exit handlers

2. **Context Provider** (`src/context/UIModeContext.tsx`)
   - Manages global UI mode state
   - Handles mode transitions with validation
   - Persists last mode to localStorage

3. **Hooks** (`src/hooks/useUIMode.ts`)
   - `useUIMode()` - Access current mode and actions
   - `useBoardMode()` - Check if in board mode
   - `useGamePhase()` - Get/set game phase

## UI Modes

| Mode | Description | Can Transition To |
|------|-------------|-------------------|
| `board` | Main game board | cityBuilder, gallery, portfolio, hub, shop, casino, biasSanctuary (Case Study), challenges, leaderboard, settings |
| `cityBuilder` | Building/upgrading city | board |
| `gallery` | Net worth gallery view | board |
| `portfolio` | Portfolio management | board |
| `hub` | Hub/navigation view | board, cityBuilder, gallery, portfolio, shop, challenges, leaderboard |
| `shop` | Shop interface | board, hub |
| `casino` | Casino mini-game | board |
| `biasSanctuary` | Case Study (investment phycology modal) | board |
| `challenges` | Challenges view | board, hub |
| `leaderboard` | Leaderboard view | board, hub |
| `settings` | Settings | board, hub |

## Game Phases

Phases are specific to the `board` mode:
- `idle` - Ready for user input
- `rolling` - Dice are rolling
- `moving` - Player piece is moving
- `landed` - Player has landed on a tile
- `paused` - Game is paused

## Usage Examples

### Basic Usage

```tsx
import { useUIMode } from '@/hooks/useUIMode'

function MyComponent() {
  const { mode, transitionTo, phase } = useUIMode()
  
  // Check current mode
  if (mode === 'board') {
    console.log('On game board')
  }
  
  // Transition to another mode
  const openShop = async () => {
    const success = await transitionTo('shop')
    if (!success) {
      console.error('Cannot transition to shop right now')
    }
  }
  
  // Check game phase (only relevant in board mode)
  if (phase === 'rolling') {
    console.log('Dice are rolling!')
  }
}
```

### Blocking Transitions

```tsx
import { useUIMode } from '@/hooks/useUIMode'

function DiceRollHandler() {
  const { setCanTransition, setPhase } = useUIMode()
  
  const handleRoll = async () => {
    // Block mode transitions during dice roll
    setCanTransition(false)
    setPhase('rolling')
    
    // ... dice rolling logic
    
    setPhase('moving')
    // ... movement logic
    
    setPhase('landed')
    // Re-enable transitions after landing
    setCanTransition(true)
  }
}
```

### Checking Mode

```tsx
import { useUIMode } from '@/hooks/useUIMode'

function NavigationButton() {
  const { mode, canTransitionTo } = useUIMode()
  
  const isActive = mode === 'shop'
  const canOpen = canTransitionTo('shop')
  
  return (
    <button 
      disabled={!canOpen}
      className={isActive ? 'active' : ''}
    >
      Shop
    </button>
  )
}
```

### Using Convenience Hooks

```tsx
import { useBoardMode, useGamePhase } from '@/hooks/useUIMode'

function GameBoard() {
  const isBoardMode = useBoardMode()
  const [phase, setPhase] = useGamePhase()
  
  if (!isBoardMode) {
    return null // Not on board
  }
  
  return (
    <div>
      <p>Current phase: {phase}</p>
      <button onClick={() => setPhase('idle')}>
        Reset
      </button>
    </div>
  )
}
```

## Integration with Overlay System

The UI Mode system works alongside the existing Overlay Manager:

```tsx
const handleOpenShop = async () => {
  // 1. Transition mode
  const success = await transitionTo('shop')
  if (!success) return
  
  // 2. Show overlay
  showOverlay({
    id: 'shop',
    component: ShopModal,
    priority: 'normal',
    onClose: () => {
      // 3. Return to board when closing
      transitionTo('board')
    }
  })
}
```

## Benefits

1. **Single Source of Truth**: Always know what mode the app is in
2. **Prevent Invalid States**: Can't have conflicting modes active
3. **Validated Transitions**: Only allowed transitions can happen
4. **Transition Guards**: Block transitions during critical actions
5. **Mode History**: Track previous mode for back navigation
6. **Easy to Use**: Simple hooks for common operations
7. **Type Safe**: Full TypeScript support
8. **Debuggable**: DevTools show current mode/phase

## DevTools

When DevTools are enabled (dev mode), you can see:
- Current UI mode
- Current phase (for board mode)
- Previous mode
- Mode data (if any)
- Transition state (enabled/blocked)

## Future Enhancements

Potential improvements:
1. Transition animations between modes
2. Mode-specific data persistence
3. Undo/redo functionality using mode history
4. Analytics integration for mode transitions
5. More granular transition guards
6. Mode-based rendering in UIModeRenderer component

## Notes

- Mode transitions are async to support enter/exit handlers
- Phase is only relevant when in `board` mode
- localStorage persists the last mode (restored on app reload)
- Transitions can be blocked during critical operations (e.g., dice roll)
- Mode enter/exit handlers run during transitions for cleanup

# Pro Tools Integration

This document describes the Pro Tools overlay integration in the Investing Board Game V3.

## Overview

The Pro Tools overlay provides a full-screen interface for accessing advanced investment tools from within the board game. It displays a main menu with placeholder items for future features and shows the current game state.

## Components

### ProToolsOverlay Component

Located at: `src/components/ProToolsOverlay.tsx`

**Features:**
- Full-screen overlay with fixed positioning (z-index: 100)
- Prominent "ProTools" text logo at the top with gradient styling
- Main menu with tool categories (Portfolio Analysis, Market Insights, News & Updates, Learning Center)
- Game state summary displaying Cash, Net Worth, Portfolio Value, and Holdings count
- Background scroll locking when overlay is open
- Close button (X) to dismiss the overlay

**Props:**
- `open: boolean` - Controls overlay visibility
- `onOpenChange: (open: boolean) => void` - Callback when overlay state changes
- `gameState: GameState` - Current game state to display in the overlay

### Integration in App.tsx

The Pro Tools button is positioned in the bottom-right corner of the board game interface. Clicking it now opens the main Pro Tools workspace (`/?proTools=1`) in a new tab so players can switch between the game and the workspace. If the new window is blocked, the in-game `ProToolsOverlay` will open as a fallback.

**Button Location:** Bottom-right corner (absolute positioning with `bottom-8 right-8`)
**Icon:** Toolbox icon from @phosphor-icons/react
**State Management:** Uses React's `useState` hook with `proToolsOpen` state (fallback only)

## Main Menu Items

The overlay displays four main tool categories (currently marked as "Coming Soon"):

1. **Portfolio Analysis** - Analyze portfolio performance and risk metrics
2. **Market Insights** - Access real-time market data and trends
3. **News & Updates** - Stay informed with the latest financial news
4. **Learning Center** - Educational resources and investment guides

## Game State Display

The overlay shows real-time game state information:
- **Cash**: Current available cash balance
- **Net Worth**: Total net worth (cash + portfolio value)
- **Portfolio**: Total value of stock holdings
- **Holdings**: Number of stocks owned

All currency values are formatted using the `formatCurrency()` helper function (displays in thousands with 1 decimal place, e.g., "$100.0k").

## User Experience

1. User clicks the ProTools button (Toolbox icon) in bottom-right corner
2. Full-screen overlay appears instantly covering the entire viewport
3. Background page scroll is locked (preventing interaction with game board)
4. "ProTools" text logo is prominently displayed at the top
5. Game state summary shows current financial status
6. Main menu displays available tools (currently placeholders)
7. User clicks X button to close overlay
8. Overlay disappears and scroll is restored

## Diagnostics

To investigate navigation issues between the board game and ProTools, a lightweight diagnostics log is stored in `localStorage` under the key `protools.navigation.log.v1`. Entries include timestamps, source app, and action identifiers.

### How to view
- Enable DevTools overlay with `?devtools=1` (or set `VITE_DEVTOOLS=1`).
- Open the in-game DevTools panel and review the **ProTools** section for recent events.
- On mobile layouts (dev builds), the `BoardDebugOverlay` includes a **ProTools** block with the latest entries and a clear button.

### Captured events (examples)
- `open_attempt`, `open_window_success`, `open_window_blocked`
- `overlay_open`, `overlay_retry`, `visibility_visible`

### Clearing
Use the **Clear** button in the DevTools overlay or remove the `protools.navigation.log.v1` item from localStorage.

## Styling

The overlay uses Tailwind CSS with:
- Gradient background on header (`bg-gradient-to-r from-accent/10 to-accent/5`)
- Gradient text for logo (`bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent`)
- Responsive grid layout for game state cards and menu items
- Hover effects on menu items
- Disabled state styling for "Coming Soon" features

## Accessibility

- Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="pro-tools-title"`)
- Semantic HTML structure
- Keyboard accessible close button
- Clear labels and descriptions for all interactive elements

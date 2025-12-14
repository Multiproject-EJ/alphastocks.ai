# Pro Tools Integration

This document describes the Pro Tools overlay integration in the Investing Board Game V3.

## Overview

The Pro Tools overlay provides a full-screen interface for accessing advanced investment tools from within the board game. It uses an iframe to embed the Pro Tools UI and implements secure postMessage communication to share game state.

## Components

### ProToolsOverlay Component

Located at: `src/components/ProToolsOverlay.tsx`

**Features:**
- Full-screen overlay with fixed positioning (z-index: 100)
- Title bar with "Pro Tools" label and close button
- Iframe embedding the Pro Tools UI from `/pro-tools`
- Background scroll locking when overlay is open
- Secure postMessage communication

**Props:**
- `open: boolean` - Controls overlay visibility
- `onOpenChange: (open: boolean) => void` - Callback when overlay state changes
- `gameState: GameState` - Current game state to share with Pro Tools
- `sessionId?: string` - Optional session identifier (defaults to 'BOARDGAME_V3_SESSION')

### Integration in App.tsx

The Pro Tools button is positioned in the top-left corner of the board game interface. Clicking it opens the ProToolsOverlay.

## PostMessage Communication

When the iframe loads, the parent window sends game context to the embedded Pro Tools page using the following message format:

```typescript
{
  type: 'ALPHASTOCKS_PT_CONTEXT',
  version: 1,
  source: 'boardgame-v3',
  sessionId: string,
  payload: {
    cash: number,
    netWorth: number,
    portfolioValue: number,
    stars: number,
    holdings: Array<{
      ticker: string,
      name: string,
      shares: number,
      totalCost: number
    }>
  }
}
```

### Receiving Messages in Pro Tools

The Pro Tools page should listen for this message:

```javascript
window.addEventListener('message', (event) => {
  // Verify origin for security
  if (event.origin !== window.location.origin) return;
  
  // Check message type
  if (event.data.type === 'ALPHASTOCKS_PT_CONTEXT') {
    const { payload, sessionId } = event.data;
    // Use the game state data...
  }
});
```

## URL Parameters

The iframe loads the Pro Tools with these query parameters:
- `embed=1` - Indicates the page is embedded in an iframe
- `source=boardgame-v3` - Identifies the embedding source
- `session=<sessionId>` - Provides session tracking

Example URL: `/pro-tools?embed=1&source=boardgame-v3&session=BOARDGAME_V3_SESSION`

## Security Considerations

1. **Same-Origin Policy**: The iframe loads from a relative URL on the same domain, ensuring same-origin policy protection.
2. **PostMessage Targeting**: Messages are sent to `window.location.origin` to prevent leakage to other origins.
3. **No Sandbox**: Since the iframe loads trusted content from the same origin, no sandbox restrictions are applied.

## User Experience

1. User clicks "Pro Tools" button in top-left corner
2. Full-screen overlay appears instantly
3. Background page scroll is locked
4. Pro Tools UI loads in iframe
5. Game state is sent to Pro Tools via postMessage
6. User clicks X button to close overlay
7. Overlay disappears and scroll is restored

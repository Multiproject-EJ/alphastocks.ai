# Investing Board Game V2

## Overview

This feature module contains the new version of the Investing Board Game, integrated from the donor repository `Multiproject-EJ/investing-board-game`. It is designed to coexist with the legacy board game feature located at `workspace/src/features/boardgame/BoardGameApp.tsx`.

## Structure

```
investing-board-game-v2/
├── BoardGameV2Page.tsx      # Main page component
├── components/              # Game-specific components
├── styles/                  # Scoped CSS files
│   └── BoardGameV2Page.css # Main page styles
├── index.ts                 # Module exports
└── README.md               # This file
```

## Key Features

- **Scoped Styling**: All styles use `.board-game-v2-root` prefix to avoid conflicts
- **TypeScript Support**: Written in TypeScript for type safety
- **Preact Compatible**: Uses Preact's FunctionalComponent types
- **Dark Theme Support**: Includes dark theme CSS variables

## Integration Points

### Routing
This feature is integrated into the main application navigation. Users can access it through the navigation menu as "Board Game (V2)".

### Coexistence with Legacy
The legacy board game (`BoardGameApp.tsx`) remains functional and accessible. Both versions can run simultaneously without conflicts.

## Dependencies

Currently uses only standard dependencies from the host repository:
- `preact`: ^10.19.3

### New Dependencies (if any)
_To be documented as components are ported from the donor repository in Step 2._

## Development Notes

### Step 1 (Completed)
- ✅ Created feature module skeleton
- ✅ Added placeholder component with scoped styles
- ✅ Set up module exports

### Step 2 (Pending)
- [ ] Port UI components from donor repository
- [ ] Integrate game logic
- [ ] Document any new dependencies

### Step 3 (Pending)
- [ ] Add navigation entry
- [ ] Test coexistence with legacy board game

## Style Guidelines

All CSS classes must be prefixed with `board-game-v2-` to maintain style isolation. Example:

```css
.board-game-v2-root { }
.board-game-v2-header { }
.board-game-v2-container { }
```

## Usage

```typescript
import BoardGameV2Page from './features/investing-board-game-v2';

// In your component
<BoardGameV2Page />
```

## Testing

_Testing instructions will be added as the feature develops._

## License

This code is part of the alphastocks.ai project and follows the same license terms.

# Investing Board Game V2

## Overview

This feature module contains the new version of the Investing Board Game, integrated from the legacy board game feature. It is designed to coexist with the legacy board game feature located at `workspace/src/features/boardgame/BoardGameApp.tsx`.

## Structure

```
investing-board-game-v2/
├── BoardGameV2Page.tsx      # Main page component with game logic
├── components/              # Game-specific components
│   ├── AvatarToken.tsx      # Player token visual
│   ├── BoardRoot.tsx        # Main board with tiles and dice
│   ├── CenterPanels.tsx     # Side panels with game state
│   ├── Dice.tsx             # Dice rolling component
│   └── WealthThrone.tsx     # Center display showing performance
├── styles/                  # Scoped CSS files
│   ├── AvatarToken.css
│   ├── BoardGameV2Page.css  # Main page styles
│   ├── BoardRoot.css
│   ├── CenterPanels.css
│   ├── Dice.css
│   ├── GameBoard.css        # Legacy placeholder styles (unused)
│   └── WealthThrone.css
├── index.ts                 # Module exports
└── README.md               # This file
```

## Key Features

- **Scoped Styling**: All styles use `.board-game-v2-` prefix to avoid conflicts
- **TypeScript Support**: Written in TypeScript for type safety
- **Preact Compatible**: Uses Preact's FunctionalComponent types
- **Dark Theme**: Styled with dark theme colors for consistency
- **Full Game Logic**: Complete board game with stocks, thrifty paths, and wealth tracking

## Integration Points

### Routing
This feature is integrated into the main application navigation. Users can access it through the navigation menu as "Board Game (V2)".

### Coexistence with Legacy
The legacy board game (`BoardGameApp.tsx`) remains functional and accessible. Both versions can run simultaneously without conflicts.

## Game Features

### Board Game Mechanics
- 13-tile board with corners, categories, and events
- Dice rolling to move around the board
- Land on tiles to trigger actions

### Stock Trading
- Buy stocks when landing on category tiles
- Three position sizes: small (2%), medium (5%), large (10%)
- Track portfolio holdings and net worth

### Thrifty Path System
- Earn stars by completing thrifty challenges
- 21 different thrifty path options
- Random selection of 5 paths when triggered

### Wealth Tracking
- Visual wealth throne showing performance
- Track cash, portfolio value, and total net worth
- Holdings table with detailed position info

## Dependencies

Uses only standard dependencies from the host repository:
- `preact`: ^10.19.3

No additional dependencies required.

## Development Notes

### Completed
- ✅ Created feature module skeleton
- ✅ Ported all components from legacy boardgame feature
- ✅ Applied scoped V2 styling to all components
- ✅ Integrated full game logic into BoardGameV2Page
- ✅ Set up module exports

## Style Guidelines

All CSS classes are prefixed with `board-game-v2-` to maintain style isolation. Example:

```css
.board-game-v2-root { }
.board-game-v2-header { }
.board-game-v2-tile { }
```

## Usage

```typescript
import BoardGameV2Page from './features/investing-board-game-v2';

// In your component
<BoardGameV2Page />
```

## Testing

The feature can be tested by:
1. Building the application with `npm run build`
2. Running dev server with `npm run dev`
3. Navigating to the Board Game (V2) section

## License

This code is part of the alphastocks.ai project and follows the same license terms.

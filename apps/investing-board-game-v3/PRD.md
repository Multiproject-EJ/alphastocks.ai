# Planning Guide

A dice-driven investing simulation inspired by Monopoly, designed as a premium digital board game that teaches portfolio management through interactive gameplay.

**Experience Qualities**: 
1. **Premium** - Feels like a high-end fintech product with sophisticated visual design and attention to detail
2. **Immersive** - The board dominates the screen like a real game table, drawing players into the experience
3. **Educational** - Makes investing concepts tangible through game mechanics without feeling preachy

**Complexity Level**: Light Application (multiple features with basic state)
This is an interactive UI prototype with dice rolling, tile navigation, modal interactions, and draggable elements. All data is mocked and held in component state.

## Essential Features

### Dice Rolling
- **Functionality**: Player clicks "ROLL" button to generate random 1-6 result
- **Purpose**: Core game mechanic that drives movement and progression
- **Trigger**: Click on ROLL button in draggable dice HUD
- **Progression**: Idle state → Click ROLL → Animate dice → Show result → Move player → Land on tile → Show modal
- **Success criteria**: Dice shows random number, phase updates, player avatar moves to new tile

### Tile Navigation
- **Functionality**: Player avatar moves across tiles based on dice roll
- **Purpose**: Navigate the board to encounter different investment opportunities
- **Trigger**: After dice roll completes
- **Progression**: Current position → Calculate new position (modulo board length) → Animate movement → Highlight new tile → Trigger tile action
- **Success criteria**: Avatar visually moves, correct tile becomes active, appropriate modal appears

### Category Tile Interaction
- **Functionality**: Landing on category tiles shows stock purchase options
- **Purpose**: Present investment opportunities with different conviction levels
- **Trigger**: Player lands on Turnarounds/Dividends/Growth/Moats/Value tile
- **Progression**: Land on tile → Modal appears with stock info → Choose buy amount or pass → Update portfolio → Close modal
- **Success criteria**: Modal displays mocked stock data, buttons update cash/portfolio, modal dismisses cleanly

### Thrifty Path System
- **Functionality**: Special opportunity to choose challenges for star rewards
- **Purpose**: Add secondary progression system and variety
- **Trigger**: Random chance when landing on certain tiles
- **Progression**: Land on tile → Thrifty Path modal appears → Browse 5 options → Choose one or skip → Award stars → Close modal
- **Success criteria**: Modal shows 5 unique challenges, choosing one adds stars, skip works correctly

### Draggable Dice HUD
- **Functionality**: Floating dice interface can be repositioned
- **Purpose**: Allow players to customize UI layout for comfort
- **Trigger**: Click and drag on dice HUD
- **Progression**: Mouse down on HUD → Drag to new position → Release → HUD stays in new location
- **Success criteria**: Smooth drag interaction, HUD stays within board bounds, position persists during session

## Edge Case Handling

- **Board overflow** - Position wraps using modulo to stay within tile count
- **Insufficient funds** - Buy buttons disable when player can't afford purchase
- **Modal stacking** - Only one modal shows at a time, new modals replace previous
- **HUD bounds** - Draggable dice constrained to board area, won't go off-screen
- **Bankruptcy** - Cash displays can show negative values (game continues as prototype)

## Design Direction

The design should evoke the feeling of sitting at a premium gaming table in a sophisticated financial institution. Dark, luxurious, with gold accents that suggest wealth and achievement. The board should feel like a physical object with depth and materiality, while the UI elements maintain a modern, digital polish.

## Color Selection

A dark fintech aesthetic with gold/amber accents for premium feel, plus Monopoly-inspired color-coded property groups.

- **Primary Color**: Deep Navy `oklch(0.15 0.04 250)` - Main board background, communicates trust and depth
- **Secondary Colors**: Charcoal `oklch(0.25 0.01 250)` for cards/panels, Darker Navy `oklch(0.12 0.03 250)` for borders
- **Accent Color**: Rich Gold `oklch(0.75 0.15 85)` - Highlights, active states, rewards, premium feel
- **Category Colors** (Monopoly-style borders):
  - Turnarounds: Magenta `oklch(0.60 0.20 330)` - Contrarian plays
  - Dividends: Sky Blue `oklch(0.65 0.20 200)` - Steady income
  - Growth: Orange `oklch(0.70 0.18 25)` - High potential
  - Moats: Deep Red `oklch(0.55 0.22 15)` - Competitive advantages
  - Value: Yellow `oklch(0.75 0.15 85)` - Undervalued opportunities
- **Foreground/Background Pairings**: 
  - Primary Navy (oklch(0.15 0.04 250)): White text (oklch(0.98 0 0)) - Ratio 11.2:1 ✓
  - Charcoal Cards (oklch(0.25 0.01 250)): Light Gray (oklch(0.92 0 0)) - Ratio 8.5:1 ✓
  - Gold Accent (oklch(0.75 0.15 85)): Dark Navy (oklch(0.12 0.03 250)) - Ratio 9.1:1 ✓

## Font Selection

Typography should balance financial seriousness with gaming approachability, using geometric sans-serifs that feel modern and precise.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Space Grotesk Bold / 32px / -0.02em letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold / 20px / -0.01em letter spacing
  - H3 (Card Titles): Space Grotesk Medium / 16px / normal letter spacing
  - Body (Descriptions): Inter Regular / 14px / 0.4em line height
  - Labels (Tags): JetBrains Mono Medium / 11px / 0.05em letter spacing / uppercase

## Animations

Animations should enhance the board game feeling with physics-based movements and satisfying feedback. Use sparingly but purposefully - dice roll anticipation, smooth avatar movement across tiles, modal enter/exit with slight scale, gold glow pulse on Wealth Throne, subtle hover states on tiles and buttons.

## Component Selection

- **Components**: 
  - Dialog for tile action modals (stock purchases, events, Thrifty Path)
  - Card for info widgets, tile elements, and floating HUD
  - Button for all actions (varying sizes and variants)
  - Badge for tile category tags and status indicators
  - Separator for dividing content sections in cards
  
- **Customizations**: 
  - Custom board grid layout with 26 tiles (reduced from 31) arranged in Monopoly-style square
  - 4 corner tiles: Start/ThriftyPath, Casino, Court of Capital, Bias Sanctuary
  - Corners without full features display placeholder text
  - Corner tiles are larger (200x200px) than regular tiles (100x120px)
  - Category tiles feature prominent color-coded top borders matching their investment type
  - Custom draggable component using framer-motion
  - Custom Wealth Throne centerpiece with SVG rings
  - Custom tile strip component with highlighting
  
- **States**: 
  - Buttons: default (subtle border), hover (gold glow), active (pressed scale), disabled (reduced opacity)
  - Tiles: inactive (subtle), active (gold border + glow), hover (brightness increase)
  - Modals: enter (fade + scale from 95%), exit (fade + scale to 95%)
  - Dice HUD: idle, rolling (shake animation), landed (bounce)
  
- **Icon Selection**: 
  - Dice (dice-five) for roll button
  - Coins (coins) for cash indicators
  - TrendUp (trend-up) for portfolio value
  - Star (star) for Thrifty Path rewards
  - Play (play) for action buttons
  - X (x) for modal close
  
- **Spacing**: 
  - Board padding: p-8
  - Card padding: p-6
  - Card gaps: gap-4
  - Tile gaps: gap-2
  - Section spacing: space-y-6
  
- **Mobile**: 
  - On mobile (<768px): Stack info cards vertically, reduce board padding to p-4, make tiles scrollable horizontally, reduce font sizes by 10%, make dice HUD fixed bottom instead of draggable

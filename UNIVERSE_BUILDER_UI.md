# Universe Builder - UI Mockup & Visual Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GLOBAL STOCK UNIVERSE BUILDER                     │
│   Systematically catalog every stock from every exchange worldwide   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┬─────────────────┬───────────────────┐              │
│  │  Total      │  Stocks         │  Exchanges        │              │
│  │  Exchanges  │  Cataloged      │  Completed        │              │
│  │     31      │    15,234       │       2           │              │
│  └─────────────┴─────────────────┴───────────────────┘              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  PROGRESS TRACKER                                       │        │
│  │  ┌──────────────┬──────────────┬──────────┬──────────┐ │        │
│  │  │ Current      │ Current      │ Status   │ Last Run │ │        │
│  │  │ Exchange     │ Letter       │          │          │ │        │
│  │  │ XNAS         │ M            │ idle     │ Dec 16   │ │        │
│  │  └──────────────┴──────────────┴──────────┴──────────┘ │        │
│  │                                                         │        │
│  │  Progress: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░] M / Z (50%)    │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                    🔄 ANALYSE                           │        │
│  │         (Large gradient blue/purple button)             │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  PIPELINE STATUS                                        │        │
│  │                                                         │        │
│  │   🌐            →         🤖           →        🎯       │        │
│  │  Universe              ValueBot            Investment   │        │
│  │  Builder               Analysis            Universe     │        │
│  │  15,234                    —                   —         │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  STOCK EXCHANGES                      [Region: All ▾]   │        │
│  │                                       [Refresh]          │        │
│  ├─────────────────────────────────────────────────────────┤        │
│  │ ☑│ Exchange Name        │Country│Region│Progress│Stocks│        │
│  │ ☑│ NYSE (XNYS)         │ USA   │Americas│  Z   │ 8,234│        │
│  │ ☑│ NASDAQ (XNAS)       │ USA   │Americas│  M   │ 6,521│        │
│  │ ☐│ LSE (XLON)          │ UK    │Europe │  A   │  479 │        │
│  │ ☐│ TSE (XTKS)          │ Japan │Asia-P │  —   │   0  │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  CATALOGED STOCKS                    [View Stocks ▾]    │        │
│  ├─────────────────────────────────────────────────────────┤        │
│  │ Ticker│Company       │Exchange│Country│Sector │Added   │        │
│  │ AAPL  │ Apple Inc    │ XNAS   │ USA   │ Tech  │ Dec 16 │        │
│  │ MSFT  │ Microsoft    │ XNAS   │ USA   │ Tech  │ Dec 16 │        │
│  │ META  │ Meta         │ XNAS   │ USA   │ Tech  │ Dec 16 │        │
│  │                                                          │        │
│  │              [Previous]  Page 1 of 305  [Next]          │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## Color Scheme (Dark Theme)

### Primary Colors
- Background: `#0c111d` (dark blue-grey)
- Surface: `rgba(87, 102, 138, 0.08)` (translucent blue-grey)
- Text Primary: `#ffffff` (white)
- Text Secondary: `#b4c1d8` (light blue-grey)
- Border: `rgba(255, 255, 255, 0.08)` (subtle white)

### Accent Colors
- Primary Gradient: `linear-gradient(135deg, #3b82f6, #8b5cf6)` (blue to purple)
- Success: `rgba(34, 197, 94, 0.1)` background, `#86efac` text
- Error: `rgba(239, 68, 68, 0.1)` background, `#fca5a5` text
- Priority Row: `rgba(59, 130, 246, 0.1)` (blue highlight)

### Interactive Elements
- Button Primary: Gradient with shadow `0 4px 12px rgba(59, 130, 246, 0.3)`
- Button Hover: Enhanced shadow `0 6px 16px rgba(59, 130, 246, 0.4)`
- Progress Bar: `linear-gradient(90deg, #3b82f6, #8b5cf6)`

## Component States

### Loading State
```
┌─────────────────────────────────────────────────┐
│      [○ spinner] Analyzing...                   │
│      (Button disabled, shows CSS spinner)       │
└─────────────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────────────┐
│  ✓ Analysis Complete!                           │
│  Found 87 stocks (inserted 43 new) for         │
│  NASDAQ (USA) - Letter M                       │
│  Next: Continue with N                         │
└─────────────────────────────────────────────────┘
```

### Completed State
```
┌─────────────────────────────────────────────────┐
│      [🔄 ANALYSE]                               │
│      (Button disabled)                          │
│  ✅ All exchanges have been analyzed!           │
│  The global stock catalog is complete.         │
└─────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────┐
│  ⚠ Error: Failed to fetch status                │
│  Check API connection and try again            │
└─────────────────────────────────────────────────┘
```

## Mobile Layout (< 768px)

```
┌──────────────────────┐
│  Universe Builder    │
├──────────────────────┤
│ Total Exchanges      │
│      31              │
├──────────────────────┤
│ Stocks Cataloged     │
│     15,234           │
├──────────────────────┤
│ Exchanges Completed  │
│       2              │
├──────────────────────┤
│ PROGRESS TRACKER     │
│ Exchange: XNAS       │
│ Letter: M            │
│ Status: idle         │
│ [▓▓▓▓░░] M/Z (50%)   │
├──────────────────────┤
│   [🔄 ANALYSE]       │
├──────────────────────┤
│ 🌐                   │
│ Universe Builder     │
│ 15,234               │
│         ↓            │
│ 🤖                   │
│ ValueBot             │
│ —                    │
│         ↓            │
│ 🎯                   │
│ Investment Universe  │
│ —                    │
├──────────────────────┤
│ EXCHANGES            │
│ [Region: All ▾]      │
│ [Refresh]            │
│                      │
│ ☑ NYSE (USA)         │
│ Progress: Z          │
│ Stocks: 8,234        │
│                      │
│ ☑ NASDAQ (USA)       │
│ Progress: M          │
│ Stocks: 6,521        │
└──────────────────────┘
```

## Typography

### Headers
- H2 (Main Title): `1.75rem`, `700` weight
- H3 (Section Headers): `1.25rem`, `600` weight
- Stats Values: `1.5rem`, `700` weight
- Stats Labels: `0.875rem`, `500` weight

### Body
- Regular Text: `0.875rem`, `400` weight
- Table Headers: `0.875rem`, `500` weight
- Detail Meta: `0.75rem`, uppercase, letter-spacing `0.05em`

### Code
- Ticker Symbols: Monospace font, inline `<code>` element
- MIC Codes: Monospace font, secondary color

## Interactive Elements

### Analyse Button
- Size: `min-width: 200px`, `padding: 1rem 2rem`
- Font: `1.125rem`, `700` weight
- Effect: Translate up 2px on hover, enhanced shadow
- Transition: All properties `0.2s ease`

### Priority Checkbox
- Custom styled checkbox
- Checked state highlights entire row with blue tint
- Visual indicator with ⭐ in UI

### Progress Bar
- Height: `8px`
- Border radius: `4px`
- Animated fill with gradient
- Percentage label below

### Tables
- Zebra striping: odd rows `rgba(87, 102, 138, 0.08)`
- Row hover: Subtle highlight
- Priority rows: Blue tint background
- Cell padding: `0.5rem 0.75rem`

## Accessibility Features

### ARIA Labels
- Buttons: `aria-label` for icon-only buttons
- Tables: `role="table"` with proper headers
- Progress: `role="progressbar"` with values
- Loading states: `aria-busy="true"`

### Keyboard Navigation
- All interactive elements tab-accessible
- Focus indicators visible
- Enter/Space trigger buttons
- Escape closes dialogs

### Screen Readers
- Status messages: `role="status"` or `role="alert"`
- Live regions: `aria-live="polite"` for progress updates
- Descriptive labels for all form controls

## Animation & Transitions

### Spinner (CSS)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```
- Border spinner (not emoji)
- 1s linear infinite
- White with transparent borders

### Button Hover
- Transform: `translateY(-2px)`
- Box-shadow increase
- Transition: `all 0.2s ease`

### Progress Bar Fill
- Width transition: `0.3s ease`
- Smooth gradient slide

## Responsive Breakpoints

### Desktop (> 768px)
- Multi-column grid layouts
- Horizontal pipeline flow
- Full table visibility

### Mobile (≤ 768px)
- Single column stacks
- Vertical pipeline flow
- Simplified table (fewer columns)
- Full-width controls

## Performance Notes

- Lazy load stocks table (only on expand)
- Pagination keeps DOM light (50 items/page)
- Debounce API calls (button disabled during fetch)
- CSS animations GPU-accelerated
- Images/icons as inline SVG or emoji (no external requests)

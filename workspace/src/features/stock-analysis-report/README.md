# Stock Analysis Report Component

A mobile-first, scrollable modal component that displays comprehensive Protools analysis data in an easy-to-digest format.

## Features

- ✅ Sticky header with ticker symbol and verdict
- ✅ Executive summary with investment rating
- ✅ Valuation scenarios (Base/Bull/Bear cases)
- ✅ Porter's Five Forces breakdown
- ✅ Stress test scenarios
- ✅ Full analysis with metadata
- ✅ Loading state with skeleton loader
- ✅ Mobile-first responsive design
- ✅ Accessibility features (ARIA labels, semantic HTML)

## Usage

### Basic Example

```jsx
import { useState } from 'preact/hooks';
import StockAnalysisReport from './features/stock-analysis-report/StockAnalysisReport.jsx';

function MyComponent() {
  const [reportOpen, setReportOpen] = useState(false);
  
  const analysisData = {
    symbol: 'NVDA',
    label: 'Investable',
    summary: 'Remain overweight as demand visibility stays strong...',
    valuation: {
      base: 980,
      bull: 1120,
      bear: 780
    },
    porter_forces: {
      supplier_power: 'Medium — key foundries concentrated...',
      buyer_power: 'Low — hyperscalers scrambling for GPU capacity.',
      competitive_rivalry: 'Rising — AMD catching up...',
      threat_new: 'Low — capex intensity and ecosystem lock-in...',
      threat_substitutes: 'Medium — custom ASICs for specific workloads...'
    },
    stress_tests: [
      { scenario: 'Cloud capex pause', delta: -0.18 },
      { scenario: 'China export tightening', delta: -0.12 }
    ],
    analyzed_at: '2025-12-15T10:30:00Z'
  };

  return (
    <div>
      <button onClick={() => setReportOpen(true)}>
        View Analysis
      </button>
      
      <StockAnalysisReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        analysisData={analysisData}
      />
    </div>
  );
}
```

### With Demo Data

```jsx
import demoData from './data/demo/demo.stock_analyses.json';

// Use first stock analysis from demo data
const nvdaAnalysis = demoData.rows.find(row => row.symbol === 'NVDA');

<StockAnalysisReport
  open={true}
  onOpenChange={(open) => console.log('Modal open state:', open)}
  analysisData={nvdaAnalysis}
/>
```

## Component Props

### `StockAnalysisReport`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Whether the modal is visible |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback when modal should open/close |
| `analysisData` | `AnalysisData \| null` | No | Analysis data to display (shows loading if null) |

### `AnalysisData` Interface

```typescript
interface AnalysisData {
  symbol: string;                // Stock ticker (e.g., "NVDA")
  label: string;                 // Investment rating ("Investable", "Monitor", "Hedge", "Avoid")
  summary: string;               // Executive summary text
  valuation: {
    base: number;                // Base case target price
    bull: number;                // Bull case target price
    bear: number;                // Bear case target price
  };
  porter_forces: {
    supplier_power: string;
    buyer_power: string;
    competitive_rivalry: string;
    threat_new: string;
    threat_substitutes: string;
  };
  stress_tests: Array<{
    scenario: string;            // Scenario name
    delta: number;               // Impact as decimal (e.g., -0.18 = -18%)
  }>;
  analyzed_at?: string;          // ISO 8601 timestamp
}
```

## Sub-Components

All sub-components are internal and not intended for direct use:

- `ReportHeader` - Sticky header with ticker and close button
- `ExecutiveSummary` - Verdict card with rating stars
- `ValuationSection` - Three scenario cards (Bear/Base/Bull)
- `PorterForcesSection` - Five force analysis cards
- `StressTestsSection` - Risk scenario cards
- `FullAnalysisSection` - Complete analysis with metadata
- `LoadingState` - Skeleton loader for async data

## Styling

The component uses CSS custom properties from the existing design system:

- `--surface-card` - Card background color
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary text color
- `--accent` - Accent color for labels
- `--positive` - Positive value color
- `--border` - Border color

### Global CSS Dependencies

The component relies on these global classes from `app.css`:
- `.modal-backdrop` - Modal overlay backdrop styling
- `.detail-meta` - Secondary/meta text styling

All component-specific styles are defined in `styles/stock-analysis-report.css` and follow mobile-first responsive design patterns.

## Accessibility

- Proper ARIA labels (`role="dialog"`, `aria-modal="true"`)
- Semantic HTML structure
- Keyboard-accessible close button
- Screen reader friendly content

## Design Patterns

The component follows existing patterns from:
- `UniverseDeepDiveModal.tsx` for modal structure
- `app.css` for styling conventions
- CSS variable usage for theming

## Investment Ratings

The component displays star ratings for investment labels:

- **Investable**: ⭐⭐⭐ (3 stars)
- **Monitor**: ⭐⭐ (2 stars)
- **Hedge**: ⭐ (1 star)
- **Avoid**: No stars

## Browser Support

Compatible with all modern browsers. Requires:
- Preact 10.x
- CSS Grid support
- CSS Custom Properties support

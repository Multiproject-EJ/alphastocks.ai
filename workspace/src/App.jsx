import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getRuntimeConfig } from './config/runtimeConfig.js';
import { getDataService } from './data/dataService.js';
import { formatDateLabel, formatPercent, formatUsd } from './features/dashboard/dashboardUtils.js';
import { useDashboardData } from './features/dashboard/useDashboardData.js';
import { AIAnalysis } from './features/ai-analysis/AIAnalysis.jsx';
import Module0DataLoader from './features/valuebot/modules/Module0DataLoader.tsx';
import Module1CoreDiagnostics from './features/valuebot/modules/Module1CoreDiagnostics.tsx';
import Module2GrowthEngine from './features/valuebot/modules/Module2GrowthEngine.tsx';
import Module3ScenarioEngine from './features/valuebot/modules/Module3ScenarioEngine.tsx';
import Module4ValuationEngine from './features/valuebot/modules/Module4ValuationEngine.tsx';
import Module5TimingMomentum from './features/valuebot/modules/Module5TimingMomentum.tsx';
import Module6FinalVerdict from './features/valuebot/modules/Module6FinalVerdict.tsx';
import BatchQueueTab from './features/valuebot/BatchQueueTab.tsx';
import {
  ValueBotContext,
  defaultPipelineProgress,
  defaultValueBotAnalysisContext
} from './features/valuebot/types.ts';
import UniverseDeepDiveModal from './features/valuebot/UniverseDeepDiveModal.tsx';
import useFetchDeepDivesFromUniverse from './features/valuebot/useFetchDeepDivesFromUniverse.ts';
import { useAuth } from './context/AuthContext.jsx';
import UniverseBuilder from './features/universe-builder/UniverseBuilder.jsx';
import SearchTab from './features/universe-builder/SearchTab.jsx';

const DEFAULT_FOCUS_LIST = [
  { id: 'focus-1', title: 'SPY breakout', caption: 'Checklist ready • 09:30', tag: { tone: 'tag-green', label: 'Today' } },
  { id: 'focus-2', title: 'NVDA earnings', caption: 'Review catalyst notes', tag: { label: 'Tomorrow' } },
  { id: 'focus-3', title: 'Macro digest', caption: 'Upload CPI research PDF', tag: { tone: 'tag-blue', label: 'Pinned' } },
  { id: 'focus-4', title: 'Position audit', caption: 'Rotate winners & laggards', tag: { label: 'Next week' } }
];

const DEFAULT_UNIVERSE_ROWS = [
  {
    id: 'e2c9f12b-0c1c-4b2d-ae8e-143e2bb6a414',
    name: 'NVIDIA Corporation',
    symbol: 'NVDA',
    profile_id: '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5',
    created_at: '2025-10-31T12:00:00Z'
  },
  {
    id: '5a2a9b9d-8762-4b22-8b33-0ad8e1a1e7a5',
    name: 'Taiwan Semiconductor Manufacturing',
    symbol: 'TSM',
    profile_id: '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5',
    created_at: '2025-10-30T17:15:00Z'
  },
  {
    id: '4e3545d2-55a7-4a8f-b01a-8cd59c528c6a',
    name: 'Microsoft',
    symbol: 'MSFT',
    profile_id: '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5',
    created_at: '2025-10-29T15:45:00Z'
  }
];

const dashboardTabs = ['Morning Edition', 'Notes', 'Tasks', 'Analytics', 'ValueBot'];
const defaultSectionTabs = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4', 'Tab 5'];

const MORNING_NEWS_ALERT_ID = 'morning-news';

const ALERT_CONFIGS = [
  {
    id: MORNING_NEWS_ALERT_ID,
    name: 'Morning news briefing',
    schedule: 'Daily • 09:00',
    description: 'Audio rundown of the macro tape and top catalysts for the session.',
    target: 'dashboard'
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report digest',
    schedule: 'Quarterly • Every 3 months',
    description: 'Recap upcoming earnings releases and filings so the team can prep early.',
    target: 'dashboard'
  }
];

const isMorningNewsWindow = () => {
  const now = new Date();
  return now.getHours() >= 9 && now.getHours() < 12;
};

const createInitialAlertState = () =>
  ALERT_CONFIGS.reduce((acc, alert) => {
    const isMorningAlert = alert.id === MORNING_NEWS_ALERT_ID && isMorningNewsWindow();
    acc[alert.id] = {
      enabled: true,
      triggered: isMorningAlert,
      unread: isMorningAlert,
      lastTriggered: isMorningAlert ? new Date().toISOString() : null
    };
    return acc;
  }, {});

const valueBotTabs = [
  {
    id: 'valuebot-batch-queue',
    label: 'Batch Queue',
    fullLabel: 'Batch Queue — Deep-Dive Job Manager',
    title: 'Batch Queue — Deep-Dive Job Manager',
    description: 'Add, monitor, and maintain jobs in the ValueBot deep-dive batch worker queue.',
    component: BatchQueueTab,
    bullets: [
      'Insert pending deep-dive jobs scoped to your account.',
      'Refresh the queue to track status, attempts, and errors.',
      'Requeue or cancel entries without touching the worker logic.'
    ]
  },
  {
    id: 'valuebot-quicktake',
    label: 'QuickTake',
    fullLabel: 'QuickTake',
    title: 'QuickTake',
    description: 'One-glance summary of the company’s setup, latest signals, and what to tackle next.',
    component: AIAnalysis,
    bullets: [
      'Show a concise snapshot of thesis, risks, valuation range, and timing signals.',
      'Highlight urgent follow-ups, open questions, and recent AI findings.',
      'Offer a launchpad into the deeper ValueBot modules when you need more detail.'
    ]
  },
  {
    id: 'valuebot-data-loader',
    label: '0.Data',
    fullLabel: 'MODULE 0 — Data Loader (Pre-Step)',
    title: 'MODULE 0 — Data Loader (Pre-Step)',
    description: 'Aggregate raw inputs before any analysis starts so the copilot has a clean foundation.',
    component: Module0DataLoader,
    bullets: [
      'Upload financials, KPIs, and alternative data into one staging view.',
      'Validate currency, time periods, and unit consistency automatically.',
      'Surface missing fields and offer quick-fill prompts to complete the pack.'
    ],
    infoSections: [
      {
        title: 'Module brief',
        text: `MODULE 0 — Data Loader (Pre-Step)

Your system fetches:
  • Historical financials
  • Price history
  • Market cap
  • Segments
  • Competitors
  • Macro references
  • Recent filings (optional later)

This is not AI — it’s your database query.

This data is then passed to all modules.`
      }
    ]
  },
  {
    id: 'valuebot-core-diagnostics',
    label: 'Core',
    fullLabel: 'MODULE 1 — Core Risk & Quality Diagnostics',
    title: 'MODULE 1 — Core Risk & Quality Diagnostics',
    description: 'Assess durability, governance, and downside guardrails before sizing conviction.',
    component: Module1CoreDiagnostics,
    bullets: [
      'Score balance sheet safety, disclosure quality, and operational resilience.',
      'Flag governance gaps, key-person exposure, and concentration risks.',
      'Generate follow-up questions for management or channel checks.'
    ],
    infoSections: [
      { title: 'Purpose', items: ['Create the foundation numbers used in later narrative.'] },
      { title: 'Input', items: ['Ticker + financials'] },
      {
        title: 'Output',
        items: [
          'Debt & balance sheet risk score',
          'Cash flow strength score',
          'Margin strength score',
          'Competition & moat grade',
          'Explanation paragraphs for each'
        ]
      },
      { title: 'Used later by', items: ['Module 3 (Scenario Analysis)', 'Module 4 (Valuation)', 'Module 5 (Final Verdicts)'] },
      {
        title: 'Prompt',
        text: `You are ValueBot.ai — Module 1: Core Risk & Quality Diagnostics.
Analyze the company using ONLY the provided data.

Return exactly this JSON:
{
  "risk_summary": "...",
  "debt_score": {"value": X, "label": "...", "reason": "..."},
  "cashflow_score": {"value": X, "label": "...", "reason": "..."},
  "margin_score": {"value": X, "label": "...", "reason": "..."},
  "moat_score": {"value": X, "label": "...", "reason": "..."},
  "composite_quality": X.X
}

Rules:
- Score on the 1–10 scale (world class → horrific).
- Explanations MUST be concise and structured.`
      }
    ]
  },
  {
    id: 'valuebot-growth-engine',
    label: 'Business',
    fullLabel: 'MODULE 2 — Business Model & Growth Engine',
    title: 'MODULE 2 — Business Model & Growth Engine',
    description: 'Map how revenue, unit economics, and reinvestment create or erode advantage.',
    component: Module2GrowthEngine,
    bullets: [
      'Break down monetization layers, cohorts, and pricing power signals.',
      'Highlight margin drivers, efficiency curves, and reinvestment flywheels.',
      'Stress-test competitive moat durability alongside growth assumptions.'
    ],
    infoSections: [
      { title: 'Purpose', items: ['Develop the strategic view.'] },
      {
        title: 'Input',
        items: ['Ticker', 'Data', 'Output from Module 1']
      },
      {
        title: 'Output',
        items: [
          'Key revenue drivers',
          'Moat expansion or decay',
          'Strategic tailwinds/headwinds',
          'Capital allocation quality',
          '5–15 year logical “story spine”'
        ]
      },
      { title: 'Used by', items: ['Module 3 (Scenario analysis)', 'Module 4 (Valuation)'] },
      {
        title: 'Prompt',
        text: `You are ValueBot.ai — Module 2: Business Model & Growth Engine.
Using the data AND the Module 1 output, analyze:

- Key revenue drivers (short + long term)
- Moat dynamics
- Secular trends
- Capital allocation efficiency
- FCF durability implications

Return JSON:
{
  "growth_drivers": [...],
  "moat_outlook": "...",
  "secular_trends": [...],
  "capital_allocation": "...",
  "long_term_durability": "..."
}`
      }
    ]
  },
  {
    id: 'valuebot-scenario-engine',
    label: 'Scenarios',
    fullLabel: 'MODULE 3 — Scenario Engine (Bear / Base / Bull)',
    title: 'MODULE 3 — Scenario Engine (Bear / Base / Bull)',
    description: 'Spin parallel futures with transparent assumptions for quick “what if” pivots.',
    component: Module3ScenarioEngine,
    bullets: [
      'Preset bear, base, and bull templates with editable revenue and margin drivers.',
      'Overlay macro sensitivities, execution risks, and cost of capital changes.',
      'Export tornado charts and tables for investment committee memos.'
    ],
    infoSections: [
      { title: 'Purpose', items: ['Quantify futures.'] },
      { title: 'Input', items: ['Data', 'Output from Modules 1 & 2'] },
      {
        title: 'Output',
        items: [
          'Revenue CAGR estimates',
          'Margin trajectory',
          'FCF trajectory',
          '5- and 15-year valuation ranges',
          'Key risks per scenario'
        ]
      },
      { title: 'Used by', items: ['Module 4 (Valuation)', 'Module 5 (Final verdicts)', 'Frontend visuals'] },
      {
        title: 'Prompt',
        text: `You are ValueBot.ai — Module 3: Scenario Engine.
Using financial data AND outputs from Module 1 + 2:

Create Bear, Base, and Bull scenarios with this JSON:

{
  "scenarios": [
    {
      "name": "Bear",
      "revenue_cagr": X,
      "margin_outlook": "...",
      "fcf_outlook": "...",
      "key_risks": "...",
      "valuation_5y": "XX–YY",
      "valuation_15y": "XX–YY"
    },
    { Base scenario ... },
    { Bull scenario ... }
  ]
}`
      }
    ]
  },
  {
    id: 'valuebot-valuation-engine',
    label: 'Valuation',
    fullLabel: 'MODULE 4 — Valuation Engine (DCF + Reverse Engineering)',
    title: 'MODULE 4 — Valuation Engine (DCF + Reverse Engineering)',
    description: 'Translate scenarios into intrinsic value ranges with forward and reverse math.',
    component: Module4ValuationEngine,
    bullets: [
      'Run discounted cash flow outputs alongside trading and transaction comps.',
      'Reverse-engineer implied growth, margins, and discount rates from the current price.',
      'Summarize valuation bridges with margin of safety and IRR callouts.'
    ],
    infoSections: [
      { title: 'Purpose', items: ['Turn scenarios into valuation ranges and implied expectations.'] },
      { title: 'Input', items: ['Data', 'Module 1 scores', 'Module 3 valuation ranges'] },
      {
        title: 'Output',
        items: [
          'Probability-weighted valuation',
          'Reverse-engineered assumptions baked into current price',
          'Upside/downside %',
          'Entry zone boundaries (Accumulate / Buy / Strong Buy) per ValueBot rules'
        ]
      },
      {
        title: 'Prompt',
        text: `You are ValueBot.ai — Module 4: Valuation Engine.

Using the financial data, Module 1 scores, and all Module 3 scenarios:

Return JSON:
{
  "fair_value_probability_weighted": "XX–YY",
  "reverse_engineered_growth": "...",
  "upside_percent": X,
  "downside_percent": X,
  "entry_zones": {
     "accumulate_below": X,
     "buy_below": X,
     "strong_buy_below": X
  }
}`
      }
    ]
  },
  {
    id: 'valuebot-timing-momentum',
    label: 'Timing',
    fullLabel: 'MODULE 5 — Timing & Momentum',
    title: 'MODULE 5 — Timing & Momentum',
    description: 'Blend technicals, catalysts, and positioning data to calibrate entry points.',
    component: Module5TimingMomentum,
    bullets: [
      'Monitor catalyst calendar, liquidity, and sentiment inflections.',
      'Track momentum signals, regime filters, and risk/reward skew.',
      'Propose staged entries, stop-loss guidelines, and alert thresholds.'
    ],
    infoSections: [
      { title: 'Purpose', items: ['Evaluate when to buy.'] },
      { title: 'Input', items: ['Price history', 'Technicals', 'All scenario outputs', 'Valuation ranges'] },
      {
        title: 'Output',
        items: [
          'Timing verdict (Buy / Hold / Wait / Avoid)',
          'Momentum signals',
          'Sentiment catalysts',
          'Flags for whether the company sits in Accumulate / Buy / Strong-Buy zones today'
        ]
      },
      {
        title: 'Prompt',
        text: `You are ValueBot.ai — Module 5: Timing & Momentum.

Using price history, valuation ranges, and scenario outputs:

Return JSON:
{
  "timing": "Buy | Hold | Wait | Avoid",
  "momentum_score": X,
  "catalysts": [...],
  "is_accumulate": true/false,
  "is_buy": true/false,
  "is_strong_buy": true/false
}`
      }
    ]
  },
  {
    id: 'valuebot-final-verdict',
    label: 'Verdict',
    fullLabel: 'MODULE 6 — Final Verdict Synthesizer',
    title: 'MODULE 6 — Final Verdict Synthesizer',
    description: 'Roll up the entire workbook into a crisp decision-ready brief.',
    component: Module6FinalVerdict,
    bullets: [
      'Summarize thesis, risks, valuation range, and timing in one page.',
      'Generate buy/hold/pass options with confidence scores and next steps.',
      'Produce shareable outputs for IC decks, memos, or stakeholder updates.'
    ],
    infoSections: [
      { title: 'Purpose', items: ['Build the same tables your Master Prompt produces.'] },
      { title: 'Input', items: ['All earlier module outputs'] },
      {
        title: 'Output',
        items: [
          'All 4 tables: One-Liner Summary, Final Verdicts, Scorecard, Valuation Ranges',
          'Short narrative summary'
        ]
      },
      {
        title: 'Prompt',
        text: `You are ValueBot.ai — Module 6: Final Verdict Synthesizer.

Combine all module outputs into:
- Top tables (One-Liner, Final Verdicts, Scorecard, Valuation Ranges)
- A short narrative summary (~10 sentences)

Return JSON containing:
{
   "tables": { one_liner: "...", ... },
   "narrative": "..."
}`
      }
    ]
  }
];

const defaultValueBotTabId = 'valuebot-quicktake';
const defaultValueBotTabLabel =
  valueBotTabs.find((tab) => tab.id === defaultValueBotTabId)?.label ?? valueBotTabs[0].label;
const valueBotPrimaryTabLabels = valueBotTabs.slice(0, 2).map((tab) => tab.label);
const valueBotModuleTabLabels = valueBotTabs.slice(2).map((tab) => tab.label);
const ENABLE_BOARDGAME_V3 = true; // V3 is now the default and only visible game

const sectionTabsById = {
  dashboard: dashboardTabs,
  valuebot: valueBotTabs.map((tab) => tab.label),
  quadrant: ['Universe', 'Universe Quadrant', 'Add Stocks'],
  checkin: ['Tab 1', 'Trading Journal', 'Tab 3', 'Tab 4', 'Tab 5'],
  focuslist: ['Focus List'],
  'boardgame-v3': [],
  'universe-builder': ['Global Ticker Database', 'Search']
};

const settingsNavItem = { id: 'settings', icon: '⚙️', shortLabel: 'Prefs' };

const getSectionTabs = (sectionId) => sectionTabsById[sectionId] ?? defaultSectionTabs;
const boardGameV3NavItem = {
  id: 'boardgame-v3',
  icon: '🎮',
  title: 'Investment Board Game',
  caption: 'Interactive investing simulation',
  shortLabel: 'Game'
};

const baseNavigation = [
  { id: 'dashboard', icon: '🏠', title: 'Morning Sales Desk', caption: 'Added + updated', shortLabel: 'Desk' },
  { id: 'checkin', icon: '🧘', title: 'Check-In', caption: 'Daily reflections', shortLabel: 'Calm' },
  { id: 'focuslist', icon: '🎯', title: 'Focus List', caption: 'Priority names', shortLabel: 'Focus' },
  { id: 'valuebot', icon: '🤖', title: 'ValueBot', caption: 'Valuation copilot', shortLabel: 'Bot' },
  { id: 'quadrant', icon: '🧭', title: 'Investing Universe', caption: '', shortLabel: 'Map' },
  { id: 'universe-builder', icon: '🌐', title: 'Universe Builder', caption: 'Build global stock catalog', shortLabel: 'Universe' },
  { id: 'portfolio', icon: '💼', title: 'Portfolio', caption: 'Results & ledger', hasSubmenu: true, shortLabel: 'Book' }
];

const DemoBanner = () => (
  <div className="demo-banner" role="status">
    <strong>Demo data mode:</strong> Supabase keys not detected. Loading local fixtures.
  </div>
);

const staticSections = {
  checkin: {
    title: 'Check-In',
    meta:
      'Reflect and reset your positioning for the session. Transform setbacks into playbooks that sharpen timing, sizing, and conviction. AI-powered learning analysis tracks patterns, scores mistakes, and monitors improvement over time.',
    cards: [
      {
        title: 'Prompt',
        body: (
          <>
            <p>What bias showed up yesterday? How will you counter it today?</p>
            <textarea rows={4} placeholder="Capture your thoughts..."></textarea>
            <button className="btn-primary" type="button">Save reflection</button>
          </>
        )
      },
      {
        title: 'Transformation to-dos',
        body: (
          <>
            <p>Keep this checklist front-and-center as you level up decision systems:</p>
            <ol>
              <li>
                Add all short seller reports, study them deeply, and incorporate the lessons into downside knowledge.
              </li>
              <li>
                Use the robot for both timing <em>and</em> sizing decisions—run simulations to understand exposure and risk.
              </li>
              <li>Practice with the InvestorGame exercises to reinforce patience and selectivity.</li>
              <li>
                Update your profiles to top-tier standards. Review the Pandora sale and other exits: why did you sell, do you
                regret it, and what should have been handled differently? Capture how each move felt, categorize the lessons,
                and build guardrails so it doesn&rsquo;t happen again.
              </li>
            </ol>
          </>
        )
      },
      {
        title: 'Prepared Chat Examples',
        body: (
          <>
            <p><strong>Example conversations based on your records:</strong></p>
            <div className="chat-examples">
              <div className="chat-example">
                <strong>💬 "Am I repeating the same mistakes?"</strong>
                <p className="detail-meta">
                  Analysis: Reviewed 10 transactions and 3 journal entries. Found pattern: you tend to let losses linger 
                  too long on consumer names (JNJ exit came late). Severity: Medium. Good news: you're showing improvement 
                  with FOMO discipline on breakout gaps.
                </p>
              </div>
              <div className="chat-example">
                <strong>💬 "What are my biggest risk patterns?"</strong>
                <p className="detail-meta">
                  Analysis: Top issue - overconfidence after wins (see Oct 29 journal). This led to aggressive NVDA position 
                  sizing on Oct 31. Severity: High. Recommendation: Implement mandatory cool-down period after profitable trades.
                </p>
              </div>
              <div className="chat-example">
                <strong>💬 "Show me where I'm improving"</strong>
                <p className="detail-meta">
                  Progress detected: Discipline score improving week-over-week. Oct 29: Good discipline exiting laggards early. 
                  Oct 31: Patient on FOMO entries. Pattern: You're successfully applying lessons from previous sessions. Keep it up!
                </p>
              </div>
              <div className="chat-example">
                <strong>💬 "Analyze my recent energy trade"</strong>
                <p className="detail-meta">
                  XLE Sell (Oct 31): Trimmed after relative strength fade - this shows good macro overlay awareness. 
                  Severity of error: Low (actually a smart defensive move). Learning indicator: You're applying 
                  quadrant thinking in real-time. Score: ⭐️⭐️⭐️⭐️
                </p>
              </div>
            </div>
          </>
        )
      },
      {
        title: 'Learning Analysis Dashboard',
        body: (
          <>
            <p><strong>Pattern Recognition & Scoring System</strong></p>
            <table className="table subtle">
              <thead>
                <tr>
                  <th>Issue Type</th>
                  <th>Occurrences</th>
                  <th>Severity</th>
                  <th>Trend</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>FOMO on breakouts</td>
                  <td>2 instances</td>
                  <td>🟡 Medium</td>
                  <td>📈 Improving</td>
                  <td>⭐️⭐️⭐️⭐️</td>
                </tr>
                <tr>
                  <td>Holding losers too long</td>
                  <td>1 instance</td>
                  <td>🟡 Medium</td>
                  <td>⚠️ Watch</td>
                  <td>⭐️⭐️⭐️</td>
                </tr>
                <tr>
                  <td>Post-win overconfidence</td>
                  <td>1 instance</td>
                  <td>🔴 High</td>
                  <td>⚠️ New pattern</td>
                  <td>⭐️⭐️</td>
                </tr>
                <tr>
                  <td>Macro-aware exits</td>
                  <td>3 instances</td>
                  <td>🟢 Positive</td>
                  <td>📈 Improving</td>
                  <td>⭐️⭐️⭐️⭐️⭐️</td>
                </tr>
              </tbody>
            </table>
            <div className="learning-summary">
              <p><strong>Overall Learning Indicator:</strong> 📊 Positive trajectory with areas to watch</p>
              <p>
                <strong>Key Insight:</strong> You're successfully implementing patience disciplines from the InvestorGame system.
                However, watch for overconfidence cycles after profitable periods.
              </p>
            </div>
          </>
        )
      },
      {
        title: 'Developer Notes: AI Oracle Process',
        body: (
          <>
            <div className="dev-notes">
              <h4>🔧 Implementation Overview</h4>
              <p><strong>Purpose:</strong> AI Oracle analyzes all user records (transactions, journal entries, portfolio moves) 
              to identify behavioral patterns, score mistakes, track learning progress, and assess action severity.</p>
              
              <h4>📋 Analysis Process</h4>
              <ol>
                <li><strong>Data Ingestion:</strong> Continuously monitors journal_entries and transactions tables for new records</li>
                <li><strong>Pattern Detection:</strong> Uses NLP to identify recurring themes in bias_notes and transaction notes</li>
                <li><strong>Severity Scoring:</strong> Classifies issues as Low/Medium/High based on financial impact and frequency</li>
                <li><strong>Learning Trajectory:</strong> Compares current patterns vs historical to determine improvement/regression</li>
                <li><strong>Actionable Insights:</strong> Generates specific, personalized recommendations</li>
              </ol>
              
              <h4>🎯 Scoring Methodology</h4>
              <ul>
                <li>⭐️ - Critical issue, immediate attention needed</li>
                <li>⭐️⭐️ - Significant concern, high severity</li>
                <li>⭐️⭐️⭐️ - Moderate issue, needs monitoring</li>
                <li>⭐️⭐️⭐️⭐️ - Minor issue or improving pattern</li>
                <li>⭐️⭐️⭐️⭐️⭐️ - Positive behavior, reinforcement recommended</li>
              </ul>
              
              <h4>🔄 Data Flow</h4>
              <pre className="code-block">
{`User Action → Record Created → AI Analysis → Pattern Match
→ Severity Check → Learning Comparison → Score Assignment
→ Chat Response Generation → Insight Display`}
              </pre>
              
              <h4>🚀 Future Enhancements</h4>
              <ul>
                <li>Real-time chat interface with GPT-4 integration</li>
                <li>Automated alerts when negative patterns emerge</li>
                <li>Comparison with peer anonymized data for benchmarking</li>
                <li>ML-powered prediction of likely next mistakes</li>
                <li>Integration with InvestorGame system for unified discipline tracking</li>
              </ul>
              
              <h4>📊 Demo Data Source</h4>
              <p>
                Current examples use: <code>demo.journal_entries.json</code> (3 entries) and 
                <code>demo.transactions.json</code> (10 trades). In production, connects to live Supabase tables.
              </p>
            </div>
          </>
        )
      }
    ]
  },
  focuslist: {
    title: 'Focus list',
    meta: 'Priority names, catalysts, and routines you want to keep visible during the session.',
    cards: []
  },
  valuebot: {
    title: 'ValueBot command center',
    meta: 'Give ValueBot a focused prompt, then drill into the dedicated tabs for management, moat, balance sheet, and more.',
    cards: [],
    component: <AIAnalysis />
  },
  settings: {
    title: 'Settings',
    meta: 'Preferences for alerts, integrations, and localization.',
    cards: [
      {
        title: 'Quick preferences',
        body: (
          <>
            <p>Select an area to configure:</p>
            <ul>
              <li>Alerts &amp; notifications</li>
              <li>AI integrations</li>
              <li>Localization</li>
            </ul>
          </>
        )
      }
    ]
  },
  'boardgame-v3': {
    title: 'Investment Board Game',
    meta: 'Interactive investing simulation to sharpen your decision-making skills.',
    isExternal: true,
    externalPath: '/board-game-v3/'
  },
  quadrant: {
    title: 'Investing Universe',
    meta: 'Map market regimes, capital at risk, and opportunity sets into one actionable quadrant.',
    cards: [
      {
        title: 'Quadrant map',
        body: (
          <>
            <p>
              Plot where the market, your book, and your watchlist live today. Use it to decide whether to attack, defend, or
              stand down.
            </p>
            <div className="quadrant-grid" role="presentation">
              <div className="quadrant-cell">Offense • High clarity</div>
              <div className="quadrant-cell">Defense • High volatility</div>
              <div className="quadrant-cell">Scout • Emerging themes</div>
              <div className="quadrant-cell">Hibernate • Low edge</div>
            </div>
          </>
        )
      },
      {
        title: 'Universe journal prompts',
        body: (
          <>
            <ol>
              <li>What regime are you trading right now? List the confirming data.</li>
              <li>Which quadrant is your top idea in, and what would move it?</li>
              <li>How aligned is your sizing with the current quadrant?</li>
            </ol>
          </>
        )
      }
    ]
  },
  'universe-builder': {
    title: 'Global Stock Universe Builder',
    meta: 'Systematically catalog every stock from every exchange worldwide. The foundation for ValueBot analysis.',
    cards: [],
    component: <UniverseBuilder />
  },
};


const App = () => {
  const [theme, setTheme] = useState('dark');
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      }).format(new Date()),
    []
  );
  const dashboardTitle = useMemo(
    () => `Morning Sales Desk — ${todayLabel}`,
    [todayLabel]
  );
  const dashboardCaption = 'Added to universe • Recently updated';
  const mainNavigation = useMemo(() => {
    const nav = [];
    // V3 is the only visible board game
    if (ENABLE_BOARDGAME_V3) {
      nav.push(boardGameV3NavItem);
    }
    // V1 is hidden but remains in codebase (not added to nav)
    // V2 has been deleted
    nav.push(...baseNavigation);
    return nav;
  }, []);
  const defaultActiveSection = ENABLE_BOARDGAME_V3 ? 'boardgame-v3' : 'dashboard';
  const [activeSection, setActiveSection] = useState(defaultActiveSection);
  const [activeTabsBySection, setActiveTabsBySection] = useState(() => {
    const initialMap = {};
    mainNavigation.forEach((item) => {
      initialMap[item.id] = getSectionTabs(item.id)[0];
    });
    if (defaultValueBotTabLabel) {
      initialMap.valuebot = defaultValueBotTabLabel;
    }
    return initialMap;
  });
  const [authStatus, setAuthStatus] = useState(null);
  const [activeValueBotTab, setActiveValueBotTab] = useState(defaultValueBotTabId);
  const [valueBotContext, setValueBotContext] = useState(() => ({
    ...defaultValueBotAnalysisContext,
    deepDiveConfig: { ...defaultValueBotAnalysisContext.deepDiveConfig }
  }));
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isProToolsOpen, setIsProToolsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileNavDrawerOpen, setIsMobileNavDrawerOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState(() => createInitialAlertState());
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [portfolioView, setPortfolioView] = useState('protools'); // 'protools' or 'boardgame'
  const [universeRows, setUniverseRows] = useState(DEFAULT_UNIVERSE_ROWS);
  const [universeLoadError, setUniverseLoadError] = useState(null);
  const [universeIsLoading, setUniverseIsLoading] = useState(false);
  const [newStockName, setNewStockName] = useState('');
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [editingUniverseId, setEditingUniverseId] = useState(null);
  const [openUniverseActionsId, setOpenUniverseActionsId] = useState(null);
  const [editStockName, setEditStockName] = useState('');
  const [editStockSymbol, setEditStockSymbol] = useState('');
  const [universeMutationError, setUniverseMutationError] = useState(null);
  const [isUniverseMutating, setIsUniverseMutating] = useState(false);
  const [selectedUniverseRowId, setSelectedUniverseRowId] = useState(null);
  const [deepDiveModalTicker, setDeepDiveModalTicker] = useState(null);
  const [deepDiveModalCompany, setDeepDiveModalCompany] = useState(null);
  const [tabsScrollState, setTabsScrollState] = useState({ atStart: true, atEnd: false });
  const [tabsScrollStateModules, setTabsScrollStateModules] = useState({ atStart: true, atEnd: false });
  const tabsRef = useRef(null);
  const tabsRefModules = useRef(null);
  const SCROLL_EDGE_THRESHOLD = 5; // Threshold in pixels for detecting scroll edges
  const runtimeConfig = useMemo(() => getRuntimeConfig(), []);
  const dataService = useMemo(() => getDataService(), [runtimeConfig.mode]);
  const { user, signOut } = useAuth();
  const isSupabaseMode = dataService?.mode === 'supabase';
  const themeCopy = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
  
  // Mobile bottom navigation: Primary items (5 most important)
  const mobilePrimaryNavItems = [
    { id: 'dashboard', icon: '📰', label: 'News' },
    { id: 'focuslist', icon: '🎯', label: 'List' },
    { id: 'valuebot', icon: '🤖', label: 'Bot' },
    { id: 'portfolio', icon: '💼', label: 'Portfolio' },
    { id: 'more', icon: '⋯', label: 'More' }
  ];
  
  // Mobile bottom navigation: Overflow items (shown in drawer)
  const mobileOverflowNavItems = mainNavigation.filter(
    item => !['dashboard', 'focuslist', 'valuebot', 'portfolio'].includes(item.id)
  );
  
  // Legacy mobile sidebar navigation (used when isMobileView is true but in sidebar layout)
  // TODO: This can be removed once bottom navigation is fully tested and adopted
  const mobilePrimaryNav = [
    { id: 'boardgame-v3', icon: '🎮', label: 'Investment Game' },
    { id: 'dashboard', icon: '📰', label: 'News' },
    { id: 'focuslist', icon: '🎯', label: 'List' },
    { id: 'valuebot', icon: '🤖', label: 'ValueBot' },
    { id: 'portfolio', icon: '💼', label: 'Portfolio' }
  ];
  const mobileOverflowNav = mainNavigation.filter(
    (item) => !mobilePrimaryNav.some((primary) => primary.id === item.id)
  );
  const {
    focusList,
    portfolioSummary,
    boardGamePortfolioSummary,
    ledgerHighlights,
    eventsScope,
    setEventsScope,
    hasGlobalEvents,
    hasPersonalEvents,
    eventsDigest,
    latestJournal,
    analysisSummary,
    loadError: dashboardError
  } = useDashboardData({
    dataService,
    profileId: activeProfile?.id ?? user?.id,
    defaultFocusList: DEFAULT_FOCUS_LIST
  });
  const morningNewsAlert = alertSettings[MORNING_NEWS_ALERT_ID];
  const hasMorningNewsPing = Boolean(
    morningNewsAlert?.enabled && morningNewsAlert?.triggered && morningNewsAlert?.unread
  );
  const {
    deepDives: userDeepDives,
    loading: deepDiveIndexLoading,
    error: deepDiveIndexError,
    refresh: refreshDeepDiveIndex
  } = useFetchDeepDivesFromUniverse();
  const deepDiveTickers = useMemo(
    () => new Set((userDeepDives ?? []).map((item) => item.ticker)),
    [userDeepDives]
  );
  const handleAlertToggle = useCallback((alertId) => {
    setAlertSettings((prev) => {
      const current = prev[alertId];
      if (!current) {
        return prev;
      }

      const nextEnabled = !current.enabled;
      return {
        ...prev,
        [alertId]: {
          ...current,
          enabled: nextEnabled,
          triggered: nextEnabled ? current.triggered : false,
          unread: nextEnabled ? current.unread : false
        }
      };
    });
  }, []);
  const handleMorningNewsAcknowledgement = useCallback(() => {
    setAlertSettings((prev) => {
      const current = prev[MORNING_NEWS_ALERT_ID];
      if (!current) {
        return prev;
      }

      if (!current.unread) {
        return prev;
      }

      return {
        ...prev,
        [MORNING_NEWS_ALERT_ID]: {
          ...current,
          unread: false
        }
      };
    });
  }, []);

  const profileDisplayName = useMemo(
    () =>
      activeProfile?.display_name ||
      user?.user_metadata?.display_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Demo Trader',
    [activeProfile?.display_name, user?.email, user?.user_metadata?.display_name, user?.user_metadata?.full_name]
  );

  const profileEmail = useMemo(
    () => activeProfile?.email || user?.email || 'demo@alphastocks.ai',
    [activeProfile?.email, user?.email]
  );
  const dataError = profileError ?? dashboardError;
  const dataDiagnostics = useMemo(
    () => ({
      mode: runtimeConfig.mode,
      supabaseUrlConfigured: Boolean(runtimeConfig?.env?.supabaseUrl),
      supabaseAnonKeyConfigured: Boolean(runtimeConfig?.env?.supabaseAnonKey),
      profileError: profileError ? profileError.message ?? String(profileError) : null,
      dashboardError: dashboardError ? dashboardError.message ?? String(dashboardError) : null
    }),
    [dashboardError, profileError, runtimeConfig]
  );
  const demoAccountPlan = useMemo(
    () => ({
      planLabel: 'Pro trial',
      daysRemaining: 12,
      renewal: 'Renews Sep 30, 2024',
      seats: { used: 2, total: 5 },
      workspaceValue: '$1.27M',
      ytd: '+12.4%',
      bestStrategy: 'Momentum • Growth tilt',
      usage: [
        { label: 'API calls', used: 12500, limit: 50000 },
        { label: 'Backtests', used: 8, limit: 20 },
        { label: 'Storage', used: 18, limit: 50, unit: 'GB' }
      ],
      scheduledReports: ['Morning alpha drop', 'Friday factor brief']
    }),
    []
  );
  const proToolsPreview = useMemo(
    () => [
      {
        name: 'Factor Lab',
        description: 'Surface momentum, value, and quality tilts per portfolio',
        status: 'Beta'
      },
      {
        name: 'Scenario Studio',
        description: 'Shock CPI, rates, or commodities and preview P&L impact',
        status: 'Stable'
      },
      {
        name: 'Signal Copilot',
        description: 'Generate custom alerts with natural language prompts',
        status: 'New'
      }
    ],
    []
  );
  const signalIdeas = useMemo(
    () => [
      {
        name: 'Growth acceleration',
        detail: 'QoQ revenue +10% with margin expansion',
        status: 'Armed'
      },
      {
        name: 'Factor drift guardrail',
        detail: 'Alert if value tilt > 20% while quality < 5%',
        status: 'Idle'
      },
      {
        name: 'Liquidity watch',
        detail: 'Daily turnover < $5M triggers hedge suggestion',
        status: 'Armed'
      }
    ],
    []
  );
  const activityTimeline = useMemo(
    () => [
      {
        label: 'Backtest completed',
        timestamp: '3m ago',
        detail: 'Momentum with volatility cap'
      },
      {
        label: 'Import succeeded',
        timestamp: 'Today, 7:45am',
        detail: 'Synced 12 new holdings from Supabase'
      },
      {
        label: 'Alert delivered',
        timestamp: 'Yesterday',
        detail: `Weekly factor drift digest sent to ${profileEmail}`
      }
    ],
    [profileEmail]
  );
  const workspaceStatus = dataError
    ? { tone: 'error', message: 'Unable to load workspace profile. Check data service configuration.' }
    : authStatus;
  useEffect(() => {
    if (!user) return;

    setAuthStatus({ tone: 'success', message: 'Sign in successful' });
  }, [user]);

  useEffect(() => {
    if (authStatus?.tone !== 'success' || dataError) return undefined;

    const timer = setTimeout(() => setAuthStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [authStatus, dataError]);
  const openAccountDialog = useCallback(() => setIsAccountDialogOpen(true), []);
  const closeAccountDialog = useCallback(() => setIsAccountDialogOpen(false), []);
  const openSettingsDialog = useCallback(() => setIsSettingsDialogOpen(true), []);
  const closeSettingsDialog = useCallback(() => setIsSettingsDialogOpen(false), []);
  const handleSignOut = useCallback(async () => {
    if (runtimeConfig.mode === 'demo' || isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      await signOut();
      closeAccountDialog();
    } catch (error) {
      console.error('Sign out failed', error);
    } finally {
      setIsSigningOut(false);
    }
  }, [closeAccountDialog, isSigningOut, runtimeConfig.mode, signOut]);

  const focusDashboardWorkspace = useCallback(() => {
    setActiveSection('dashboard');
  }, []);

  const openProToolsWorkspace = useCallback(() => {
    focusDashboardWorkspace();
    setIsProToolsOpen(true);
  }, [focusDashboardWorkspace]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('proTools') === '1') {
      openProToolsWorkspace();
    }
  }, [openProToolsWorkspace]);

  const handleProToolsToggle = useCallback(() => {
    setIsProToolsOpen((prev) => {
      const nextIsOpen = !prev;

      if (nextIsOpen) {
        focusDashboardWorkspace();
      } else if (typeof window !== 'undefined') {
        window.location.assign('/board-game-v3/');
      }

      return nextIsOpen;
    });
  }, [focusDashboardWorkspace]);
  const handleMenuSelection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileNavOpen(false);
    setIsMobileNavDrawerOpen(false);
  };

  // Handler for mobile nav item selection
  const handleMobileNavSelection = useCallback((itemId) => {
    if (itemId === 'more') {
      setIsMobileNavDrawerOpen(true);
    } else {
      handleMenuSelection(itemId);
    }
  }, []);

  // Handler to close mobile drawer
  const closeMobileNavDrawer = useCallback(() => {
    setIsMobileNavDrawerOpen(false);
  }, []);

  const handleValueBotContextUpdate = useCallback((updates) => {
    setValueBotContext((prev) => ({
      ...prev,
      ...updates,
      deepDiveConfig: {
        ...prev.deepDiveConfig,
        ...(updates?.deepDiveConfig ?? {})
      }
    }));
  }, []);

  const handleSetPipelineProgress = useCallback((progress) => {
    setValueBotContext((prev) => {
      const nextProgress =
        typeof progress === 'function'
          ? progress(prev?.pipelineProgress ?? defaultPipelineProgress)
          : progress;

      return {
        ...prev,
        pipelineProgress: nextProgress
      };
    });
  }, []);

  const valueBotProviderValue = useMemo(
    () => ({
      context: valueBotContext,
      updateContext: handleValueBotContextUpdate,
      setPipelineProgress: handleSetPipelineProgress
    }),
    [handleSetPipelineProgress, handleValueBotContextUpdate, valueBotContext]
  );

  const finalVerdictTab = useMemo(
    () => valueBotTabs.find((tab) => tab.id === 'valuebot-final-verdict'),
    []
  );

  const handleReopenDeepDive = useCallback(
    (row) => {
      if (!row) return;

      const restoredContext = {
        deepDiveConfig: {
          ...valueBotContext?.deepDiveConfig,
          ticker: row.ticker,
          provider: row.provider || 'openai',
          model: row.model || '',
          timeframe: row.timeframe || '',
          customQuestion: row.custom_question || ''
        },
        companyName: row.company_name || '',
        market: row.currency || '',
        module0OutputMarkdown: row.module0_markdown || '',
        module1OutputMarkdown: row.module1_markdown || '',
        module2Markdown: row.module2_markdown || '',
        module3Markdown: row.module3_markdown || '',
        module4Markdown: row.module4_markdown || '',
        module5Markdown: row.module5_markdown || '',
        module6Markdown: row.module6_markdown || '',
        pipelineProgress: {
          ...defaultPipelineProgress,
          status: 'success',
          currentStep: 6,
          steps: {
            module0: 'done',
            module1: 'done',
            module2: 'done',
            module3: 'done',
            module4: 'done',
            module5: 'done',
            module6: 'done'
          },
          errorMessage: null
        }
      };

      handleValueBotContextUpdate(restoredContext);
      setActiveSection('valuebot');

      if (finalVerdictTab) {
        setActiveValueBotTab(finalVerdictTab.id);
        setActiveTabsBySection((prev) => ({
          ...prev,
          valuebot: finalVerdictTab.label
        }));
      }
    },
    [finalVerdictTab, handleValueBotContextUpdate, valueBotContext?.deepDiveConfig]
  );

  const openDeepDiveModal = useCallback((row) => {
    if (!row) return;

    setDeepDiveModalTicker(row.symbol || row.ticker || null);
    setDeepDiveModalCompany(row.name || row.company_name || row.symbol || row.ticker || null);
  }, []);

  const closeDeepDiveModal = useCallback(() => {
    setDeepDiveModalTicker(null);
    setDeepDiveModalCompany(null);
  }, []);

  const activeValueBotConfig = useMemo(
    () => valueBotTabs.find((tab) => tab.id === activeValueBotTab) ?? valueBotTabs[0],
    [activeValueBotTab]
  );

  const tabsForSection = getSectionTabs(activeSection);
  const hasTabs = tabsForSection.length > 0;
  const activeTab = hasTabs ? activeTabsBySection[activeSection] ?? tabsForSection[0] : null;

  const handleTabSelection = (tab) => {
    if (!hasTabs) return;

    setActiveTabsBySection((prev) => ({
      ...prev,
      [activeSection]: tab
    }));

    if (activeSection === 'valuebot') {
      const matchingTab = valueBotTabs.find((item) => item.label === tab || item.id === tab);
      if (matchingTab) {
        setActiveValueBotTab(matchingTab.id);
      }
    }
  };

  useEffect(() => {
    if (activeSection !== 'valuebot') return;

    const activeLabel = valueBotTabs.find((tab) => tab.id === activeValueBotTab)?.label;
    if (!activeLabel) return;

    setActiveTabsBySection((prev) => {
      if (prev.valuebot === activeLabel) return prev;
      return {
        ...prev,
        valuebot: activeLabel
      };
    });
  }, [activeSection, activeValueBotTab]);

  const sortedUniverseRows = useMemo(
    () =>
      [...(universeRows ?? [])].sort((a, b) => {
        const aDate = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      }),
    [universeRows]
  );

  useEffect(() => {
    if (!sortedUniverseRows.length) {
      setSelectedUniverseRowId(null);
      return;
    }

    if (selectedUniverseRowId && sortedUniverseRows.some((row) => row.id === selectedUniverseRowId)) {
      return;
    }

    setSelectedUniverseRowId(sortedUniverseRows[0].id);
  }, [selectedUniverseRowId, sortedUniverseRows]);

  const selectedUniverseRow = useMemo(
    () => sortedUniverseRows.find((row) => row.id === selectedUniverseRowId) ?? sortedUniverseRows[0] ?? null,
    [selectedUniverseRowId, sortedUniverseRows]
  );

  const handleUniverseStockAdd = useCallback(
    async (event) => {
      event.preventDefault();

      const symbol = newStockSymbol.trim().toUpperCase();
      const name = newStockName.trim();

      if ((!symbol && !name) || isUniverseMutating) {
        return;
      }

      const payload = {
        symbol: symbol || name,
        name: name || symbol,
        profile_id: user?.id ?? null
      };

      setIsUniverseMutating(true);
      setUniverseMutationError(null);

      try {
        const createdAt = new Date().toISOString();
        const inserted =
          typeof dataService?.createRow === 'function'
            ? await dataService.createRow('investment_universe', {
                ...payload,
                created_at: createdAt
              })
            : null;

        setUniverseRows((prev) => [
          inserted ?? {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            created_at: createdAt,
            ...payload
          },
          ...(prev ?? [])
        ]);

        setNewStockName('');
        setNewStockSymbol('');
        setActiveTabsBySection((prev) => ({
          ...prev,
          quadrant: 'Universe'
        }));
      } catch (error) {
        console.error('Failed to add investment universe row', error);
        setUniverseMutationError(error);
      } finally {
        setIsUniverseMutating(false);
      }
    },
    [dataService, isUniverseMutating, newStockName, newStockSymbol, user?.id]
  );

  const beginUniverseEdit = useCallback((row) => {
    setEditingUniverseId(row?.id ?? null);
    setEditStockName(row?.name ?? '');
    setEditStockSymbol(row?.symbol ?? '');
    setUniverseMutationError(null);
  }, []);

  const cancelUniverseEdit = useCallback(() => {
    setEditingUniverseId(null);
    setEditStockName('');
    setEditStockSymbol('');
  }, []);

  const handleUniverseUpdate = useCallback(async () => {
    if (!editingUniverseId || isUniverseMutating) {
      return;
    }

    const symbol = editStockSymbol.trim().toUpperCase();
    const name = editStockName.trim();

    if (!symbol && !name) {
      return;
    }

    const updates = {
      symbol: symbol || name,
      name: name || symbol
    };

    const existingRow = (universeRows ?? []).find((row) => row.id === editingUniverseId);
    const match = existingRow?.profile_id
      ? { id: editingUniverseId, profile_id: existingRow.profile_id }
      : { id: editingUniverseId };

    setIsUniverseMutating(true);
    setUniverseMutationError(null);

    try {
      const updatedRows =
        typeof dataService?.updateRows === 'function'
          ? await dataService.updateRows('investment_universe', match, updates)
          : [];

      setUniverseRows((prev) =>
        (prev ?? []).map((row) =>
          row.id === editingUniverseId
            ? {
                ...row,
                ...updates,
                ...(updatedRows?.find((updated) => updated.id === editingUniverseId) ?? {})
              }
            : row
        )
      );

      cancelUniverseEdit();
    } catch (error) {
      console.error('Failed to update investment universe row', error);
      setUniverseMutationError(error);
    } finally {
      setIsUniverseMutating(false);
    }
  }, [
    cancelUniverseEdit,
    dataService,
    editStockName,
    editStockSymbol,
    editingUniverseId,
    isUniverseMutating,
    universeRows
  ]);

  const handleUniverseDelete = useCallback(
    async (rowId) => {
      if (!rowId || isUniverseMutating) {
        return;
      }

      const existingRow = (universeRows ?? []).find((row) => row.id === rowId);
      const match = existingRow?.profile_id ? { id: rowId, profile_id: existingRow.profile_id } : { id: rowId };

      setIsUniverseMutating(true);
      setUniverseMutationError(null);

      try {
        if (typeof dataService?.deleteRows === 'function') {
          await dataService.deleteRows('investment_universe', match);
        }

        setUniverseRows((prev) => (prev ?? []).filter((row) => row.id !== rowId));

        if (editingUniverseId === rowId) {
          cancelUniverseEdit();
        }
      } catch (error) {
        console.error('Failed to delete investment universe row', error);
        setUniverseMutationError(error);
      } finally {
        setIsUniverseMutating(false);
      }
    },
    [cancelUniverseEdit, dataService, editingUniverseId, isUniverseMutating, universeRows]
  );

  const handleUniverseDeleteWithConfirm = useCallback(
    async (row) => {
      if (!row?.id) {
        return;
      }

      const label = row.name || row.symbol || row.ticker || 'this entry';
      const confirmed = window.confirm(
        `Delete ${label} from your Investing Universe? This will not delete any saved deep dives.`
      );

      if (!confirmed) {
        return;
      }

      await handleUniverseDelete(row.id);
      setOpenUniverseActionsId((current) => (current === row.id ? null : current));
    },
    [handleUniverseDelete]
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateViewport = () => setIsMobileView(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!isMobileView) {
      setIsMobileNavOpen(false);
      setIsMobileNavDrawerOpen(false);
    }
  }, [isMobileView]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    const handleDismiss = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (!target.closest('.mobile-nav-popover') && !target.closest('.mobile-nav-more')) {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('click', handleDismiss);

    return () => {
      document.removeEventListener('click', handleDismiss);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (isAccountDialogOpen || isSettingsDialogOpen) {
      document.body.classList.add('dialog-open');
    } else {
      document.body.classList.remove('dialog-open');
    }

    return () => {
      document.body.classList.remove('dialog-open');
    };
  }, [isAccountDialogOpen, isSettingsDialogOpen]);

  useEffect(() => {
    if (activeSection === 'boardgame-v3') {
      // Provide a slight delay to show the loading message before redirect
      const timer = setTimeout(() => {
        window.location.assign('/board-game-v3/');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  useEffect(() => {
    if (!isProToolsOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProToolsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProToolsOpen]);

  // Detect scroll position for fade indicators
  useEffect(() => {
    const tabsElement = tabsRef.current;
    const tabsElementModules = tabsRefModules.current;
    if (!isMobileView) return;

    const updateScrollState = (element, setState) => {
      if (!element) return;
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const atStart = scrollLeft <= SCROLL_EDGE_THRESHOLD;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - SCROLL_EDGE_THRESHOLD;
      setState({ atStart, atEnd });
    };

    const handleScroll = () => {
      updateScrollState(tabsElement, setTabsScrollState);
      updateScrollState(tabsElementModules, setTabsScrollStateModules);
    };

    const handleResize = () => {
      updateScrollState(tabsElement, setTabsScrollState);
      updateScrollState(tabsElementModules, setTabsScrollStateModules);
    };

    // Initial update
    handleScroll();

    if (tabsElement) {
      tabsElement.addEventListener('scroll', handleScroll);
    }
    if (tabsElementModules) {
      tabsElementModules.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (tabsElement) {
        tabsElement.removeEventListener('scroll', handleScroll);
      }
      if (tabsElementModules) {
        tabsElementModules.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileView, activeSection, hasTabs, SCROLL_EDGE_THRESHOLD]);

  useEffect(() => {
    const syncMorningNewsWindow = () => {
      setAlertSettings((prev) => {
        const current = prev[MORNING_NEWS_ALERT_ID];
        if (!current) {
          return prev;
        }

        if (!current.enabled && (current.triggered || current.unread)) {
          return {
            ...prev,
            [MORNING_NEWS_ALERT_ID]: {
              ...current,
              triggered: false,
              unread: false
            }
          };
        }

        const shouldTrigger = current.enabled && isMorningNewsWindow();
        if (shouldTrigger && !current.triggered) {
          return {
            ...prev,
            [MORNING_NEWS_ALERT_ID]: {
              ...current,
              triggered: true,
              unread: true,
              lastTriggered: new Date().toISOString()
            }
          };
        }

        if (!shouldTrigger && current.triggered) {
          return {
            ...prev,
            [MORNING_NEWS_ALERT_ID]: {
              ...current,
              triggered: false
            }
          };
        }

        return prev;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!(event.target instanceof Element)) return;

      const actionsCell = event.target.closest('.universe-actions-cell');
      if (!actionsCell) {
        setOpenUniverseActionsId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenUniverseActionsId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

    syncMorningNewsWindow();
    const timer = window.setInterval(syncMorningNewsWindow, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    dataService
      .getTable('profiles', user?.id ? { limit: 1, match: { id: user.id } } : { limit: 1 })
      .then(({ rows }) => {
        if (!cancelled) {
          setActiveProfile(rows?.[0] ?? null);
          setProfileError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to load profiles from data service', error);
          setProfileError(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dataService, user?.id]);

  const fetchUniverseRows = useCallback(async () => {
    setUniverseIsLoading(true);
    setUniverseLoadError(null);

    try {
      const { rows } = await dataService.getTable(
        'investment_universe',
        user?.id
          ? { match: { profile_id: user.id }, order: { column: 'created_at', ascending: false } }
          : { order: { column: 'created_at', ascending: false } }
      );

      setUniverseRows(rows?.length ? rows : DEFAULT_UNIVERSE_ROWS);
    } catch (error) {
      console.error('Failed to load investing universe', error);
      setUniverseRows(DEFAULT_UNIVERSE_ROWS);
      setUniverseLoadError(error);
    } finally {
      setUniverseIsLoading(false);
    }
  }, [dataService, user?.id]);

  useEffect(() => {
    fetchUniverseRows();
  }, [fetchUniverseRows]);

  const handleUniverseRefresh = useCallback(async () => {
    await Promise.allSettled([fetchUniverseRows(), refreshDeepDiveIndex()]);
  }, [fetchUniverseRows, refreshDeepDiveIndex]);

  const section = useMemo(() => {
    if (activeSection === 'dashboard') {
      const metaFallback =
        eventsScope === 'global'
          ? hasGlobalEvents
            ? 'Global market snapshot • Updated moments ago'
            : 'Global market feed unavailable — connect live data to populate.'
          : 'Pre-market status • Updated moments ago';

      const cards = [
        {
          title: 'Market radar',
          size: 'wide',
          body: eventsDigest?.items?.length ? (
            <>
              <div className="dashboard-toolbar" role="group" aria-label="Market radar scope">
                <div className="dashboard-toolbar-buttons">
                  <button
                    type="button"
                    className="dashboard-toggle"
                    onClick={() => setEventsScope('personal')}
                    aria-pressed={eventsScope === 'personal'}
                    disabled={!hasPersonalEvents}
                  >
                    My portfolios
                  </button>
                  <button
                    type="button"
                    className="dashboard-toggle"
                    onClick={() => setEventsScope('global')}
                    aria-pressed={eventsScope === 'global'}
                    disabled={!hasGlobalEvents}
                  >
                    Global market
                  </button>
                </div>
              </div>
              <div className="dashboard-timeline">
                {eventsDigest.items.map((item) => (
                  <div key={item.id} className="dashboard-timeline-item">
                    <div className="dashboard-timeline-date">{item.dateLabel}</div>
                    <div className="dashboard-timeline-content">
                      <strong>{item.title}</strong>
                      <span>{item.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="dashboard-toolbar" role="group" aria-label="Market radar scope">
                <div className="dashboard-toolbar-buttons">
                  <button
                    type="button"
                    className="dashboard-toggle"
                    onClick={() => setEventsScope('personal')}
                    aria-pressed={eventsScope === 'personal'}
                    disabled={!hasPersonalEvents}
                  >
                    My portfolios
                  </button>
                  <button
                    type="button"
                    className="dashboard-toggle"
                    onClick={() => setEventsScope('global')}
                    aria-pressed={eventsScope === 'global'}
                    disabled={!hasGlobalEvents}
                  >
                    Global market
                  </button>
                </div>
              </div>
              <p>
                {eventsScope === 'global'
                  ? 'No global market events captured. Connect Supabase to stream live catalysts.'
                  : 'No upcoming events captured. Add catalysts to stay ready.'}
              </p>
            </>
          )
        },
        {
          title: 'Portfolio pulse',
          size: 'spotlight',
          body: portfolioSummary ? (
            <>
              <div className="dashboard-metric-grid">
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Total NAV</span>
                  <span className="dashboard-metric-value">{formatUsd(portfolioSummary.totals.nav)}</span>
                </div>
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Cash</span>
                  <span className="dashboard-metric-value">{formatUsd(portfolioSummary.totals.cash)}</span>
                  <span className="dashboard-metric-delta">{formatPercent(portfolioSummary.totals.cashRatio, 1)} cash</span>
                </div>
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Weighted alpha</span>
                  <span className="dashboard-metric-value">{formatPercent(portfolioSummary.totals.weightedAlpha, 1)}</span>
                </div>
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Portfolios</span>
                  <span className="dashboard-metric-value">{portfolioSummary.totals.portfolioCount}</span>
                  {portfolioSummary.bestPortfolio && (
                    <span className="dashboard-metric-delta">
                      Top: {portfolioSummary.bestPortfolio.name} ({formatPercent(portfolioSummary.bestPortfolio.alpha, 1)})
                    </span>
                  )}
                </div>
              </div>
              <ul className="dashboard-list subtle">
                {portfolioSummary.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Connect portfolio data to surface NAV, alpha, and cash allocation.</p>
          )
        },
        {
          title: 'Latest reflection',
          size: 'third',
          body: latestJournal ? (
            <div className="dashboard-note">
              <p className="detail-meta">
                {formatDateLabel(latestJournal.created_at)} • Mood {latestJournal.mood} • Confidence {latestJournal.confidence}/5
              </p>
              <p className="dashboard-note-body">{latestJournal.bias_notes}</p>
              <p className="dashboard-note-plan">Plan: {latestJournal.plan}</p>
            </div>
          ) : (
            <p>Capture your reflection to surface it here for the morning brief.</p>
          )
        },
        {
          title: 'Analysis queue',
          size: 'third',
          body: analysisSummary ? (
            <div className="dashboard-queue">
              <div className="dashboard-metric-grid compact">
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Active</span>
                  <span className="dashboard-metric-value">{analysisSummary.total}</span>
                </div>
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Running</span>
                  <span className="dashboard-metric-value">{analysisSummary.counts.running ?? 0}</span>
                </div>
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Queued</span>
                  <span className="dashboard-metric-value">{analysisSummary.counts.queued ?? 0}</span>
                </div>
                <div className="dashboard-metric">
                  <span className="dashboard-metric-label">Completed</span>
                  <span className="dashboard-metric-value">{analysisSummary.counts.completed ?? 0}</span>
                </div>
              </div>
              {(analysisSummary.runningSymbols.length > 0 || analysisSummary.queuedSymbols.length > 0) && (
                <ul className="dashboard-list">
                  {analysisSummary.runningSymbols.length > 0 && (
                    <li>Running: {analysisSummary.runningSymbols.join(', ')}</li>
                  )}
                  {analysisSummary.queuedSymbols.length > 0 && (
                    <li>Queued: {analysisSummary.queuedSymbols.join(', ')}</li>
                  )}
                </ul>
              )}
              {analysisSummary.lastCompleted && (
                <p className="detail-meta">
                  Last completed {(analysisSummary.lastCompleted.taskType || 'task').replace(/_/g, ' ')} on{' '}
                  {formatDateLabel(analysisSummary.lastCompleted.completedAt)}
                </p>
              )}
            </div>
          ) : (
            <p>No AI analysis tasks in the queue. Kick off research to populate this feed.</p>
          )
        },
        {
          title: 'Recent moves',
          size: 'third',
          body: ledgerHighlights?.length ? (
            <ul className="dashboard-list">
              {ledgerHighlights.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span className="detail-meta">{item.caption}</span>
                  {item.note && <p>{item.note}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>Record trades to populate the morning ledger summary.</p>
          )
        }
      ];

      if (morningNewsAlert?.enabled) {
        cards.unshift({
          title: 'Morning news briefing',
          size: 'third',
          body: (
            <>
              <p>
                Kick off the day with the curated 09:00 alert. When the light is red, fresh news is waiting for you.
              </p>
              <button
                type="button"
                className={`btn-primary morning-news-button${hasMorningNewsPing ? ' alert' : ''}`}
                onClick={handleMorningNewsAcknowledgement}
              >
                Morning News
                {hasMorningNewsPing && <span className="morning-news-button__ping" aria-hidden="true" />}
              </button>
              <p className="detail-meta">
                {hasMorningNewsPing
                  ? 'New audio briefing ready — tap to acknowledge.'
                  : 'Briefing cleared for today. Reopen anytime.'}
              </p>
            </>
          )
        });
      }

      return {
        title: dashboardTitle,
        meta: `${dashboardCaption} — ${eventsDigest?.meta ?? metaFallback}`,
        layout: 'dashboard',
        cards
      };
    }

    if (activeSection === 'portfolio') {
      // Determine which portfolio to show
      const showBoardGame = portfolioView === 'boardgame' && boardGamePortfolioSummary;
      const showProTools = portfolioView === 'protools' && portfolioSummary;
      
      // If board game view is selected but no data, fallback to protools
      const effectiveView = showBoardGame ? 'boardgame' : 'protools';
      const effectiveSummary = showBoardGame ? boardGamePortfolioSummary : portfolioSummary;
      
      const cards = [];
      
      // Add toggle card if both portfolios exist
      if (boardGamePortfolioSummary || portfolioSummary) {
        const hasBothPortfolios = boardGamePortfolioSummary && portfolioSummary;
        
        if (hasBothPortfolios) {
          cards.push({
            title: 'Portfolio View',
            body: (
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button
                  onClick={() => setPortfolioView('protools')}
                  className={`toggle-button ${portfolioView === 'protools' ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    background: portfolioView === 'protools' ? 'var(--accent-primary)' : 'transparent',
                    color: portfolioView === 'protools' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  💼 ProTools Portfolio
                </button>
                <button
                  onClick={() => setPortfolioView('boardgame')}
                  className={`toggle-button ${portfolioView === 'boardgame' ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    background: portfolioView === 'boardgame' ? 'var(--accent-primary)' : 'transparent',
                    color: portfolioView === 'boardgame' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🎮 Board Game Portfolio
                </button>
              </div>
            )
          });
        }
      }
      
      // Add results snapshot card
      cards.push({
        title: effectiveView === 'boardgame' ? 'Board Game Results' : 'Results snapshot',
        body: effectiveSummary ? (
          <>
            <p className="detail-meta">{effectiveSummary.meta}</p>
            <ul>
              {effectiveSummary.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {effectiveView === 'boardgame' && effectiveSummary.categoryAllocation && (
              <>
                <p className="detail-meta" style="margin-top: 16px;"><strong>Category Allocation:</strong></p>
                <ul>
                  {Object.entries(effectiveSummary.categoryAllocation)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, percentage]) => (
                      <li key={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}: {percentage.toFixed(1)}%
                      </li>
                    ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p>
            {effectiveView === 'boardgame'
              ? 'No board game portfolio data available. Play the investment board game to build your portfolio!'
              : 'Performance data will appear once portfolio snapshots load.'}
          </p>
        )
      });
      
      // Add ledger highlights only for protools view
      if (effectiveView === 'protools') {
        cards.push({
          title: 'Ledger highlights',
          body: ledgerHighlights.length > 0 ? (
            <ul>
              {ledgerHighlights.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  {item.note && <span> — {item.note}</span>}
                  <span className="detail-meta">{item.caption}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent transactions recorded in demo data.</p>
          )
        });
      }
      
      return {
        title: 'Portfolio',
        meta: effectiveSummary?.meta ?? 'Monitor realized performance and ledger entries.',
        cards
      };
    }

    if (activeSection === 'boardgame-v3') {
      return {
        ...staticSections['boardgame-v3']
      };
    }

    return staticSections[activeSection] ?? staticSections.checkin;
  }, [
    activeSection,
    analysisSummary,
    alertSettings,
    eventsDigest,
    eventsScope,
    hasGlobalEvents,
    hasPersonalEvents,
    handleAlertToggle,
    handleMorningNewsAcknowledgement,
    latestJournal,
    ledgerHighlights,
    morningNewsAlert,
    portfolioSummary,
    boardGamePortfolioSummary,
    portfolioView,
    hasMorningNewsPing,
    dashboardTitle,
    dashboardCaption
  ]);

  const renderDefaultSection = () => {
    if (section.isExternal) {
      return (
        <>
          <h2>{section.title}</h2>
          {section.meta && <p className="detail-meta">{section.meta}</p>}
          <div className="detail-card">
            <p>Redirecting to standalone app...</p>
            <p className="detail-meta">
              If you are not redirected automatically, <a href={section.externalPath}>click here</a>.
            </p>
          </div>
        </>
      );
    }

    return (
      <>
        <h2>{section.title}</h2>
        {section.meta && <p className="detail-meta">{section.meta}</p>}
        {section.cards && section.cards.length > 0 && (
          <div className={`detail-grid${section.layout ? ` detail-grid--${section.layout}` : ''}`}>
            {section.cards.map((card) => (
              <div key={card.title} className="detail-card" data-size={card.size}>
                <h3>{card.title}</h3>
                {card.body}
              </div>
            ))}
          </div>
        )}
        {section.component && <div className="detail-component">{section.component}</div>}
      </>
    );
  };

  const renderUniverseTable = () => {
    if (universeIsLoading) {
      return <p>Loading your universe…</p>;
    }

    if (!sortedUniverseRows.length) {
      return <p>No stocks added yet. Use the Add Stocks tab to seed your universe.</p>;
    }

    const formatScore = (value) => {
      if (typeof value === 'number' && !Number.isNaN(value)) return value.toFixed(1);
      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        if (!Number.isNaN(parsed)) return parsed.toFixed(1);
      }
      return '—';
    };

    return (
      <table className="table subtle">
        <thead>
          <tr>
            <th>Company</th>
            <th>Ticker</th>
            <th title="From the most recent MASTER deep dive">Risk</th>
            <th title="From the most recent MASTER deep dive">Quality</th>
            <th title="From the most recent MASTER deep dive">Timing</th>
            <th title="From the most recent MASTER deep dive">Score</th>
            <th>Model</th>
            <th>Added</th>
            <th>Deep Dive</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUniverseRows.map((row) => {
            const hasDeepDive = deepDiveTickers.has(row.symbol || row.ticker);
            return (
              <tr
                key={row.id}
                onClick={() => setSelectedUniverseRowId(row.id)}
                aria-selected={row.id === selectedUniverseRowId}
                style={{
                  background: row.id === selectedUniverseRowId ? 'rgba(79, 70, 229, 0.08)' : undefined,
                  cursor: 'pointer'
                }}
              >
                <td>
                  {editingUniverseId === row.id ? (
                    <input
                      type="text"
                      value={editStockName}
                      onInput={(event) => setEditStockName(event.target.value)}
                      aria-label="Edit company name"
                    />
                  ) : (
                    row.name || row.symbol || '—'
                  )}
                </td>
                <td>
                  {editingUniverseId === row.id ? (
                    <input
                      type="text"
                      value={editStockSymbol}
                      onInput={(event) => setEditStockSymbol(event.target.value)}
                      aria-label="Edit ticker symbol"
                    />
                  ) : (
                    <code>{row.symbol || '—'}</code>
                  )}
                </td>
                <td>{row.last_risk_label || '—'}</td>
                <td>{row.last_quality_label || '—'}</td>
                <td>{row.last_timing_label || '—'}</td>
                <td>{formatScore(row.last_composite_score)}</td>
                <td>{row.last_model?.trim() || '—'}</td>
                <td title={row.last_deep_dive_at ? `Last deep dive ${formatDateLabel(row.last_deep_dive_at)}` : undefined}>
                  {formatDateLabel(row.created_at || new Date().toISOString())}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (hasDeepDive) {
                        openDeepDiveModal(row);
                      }
                    }}
                    disabled={!hasDeepDive}
                    title={hasDeepDive ? 'Open saved deep dives' : 'No deep dive saved yet.'}
                  >
                    {hasDeepDive ? 'Deep Dive' : 'No Deep Dive'}
                  </button>
                </td>
                <td className="universe-actions-cell">
                  {editingUniverseId === row.id ? (
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleUniverseUpdate();
                        }}
                        disabled={isUniverseMutating}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          cancelUniverseEdit();
                        }}
                        disabled={isUniverseMutating}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-compact universe-actions-trigger"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenUniverseActionsId((current) =>
                            current === row.id ? null : row.id
                          );
                        }}
                        disabled={isUniverseMutating}
                        aria-expanded={openUniverseActionsId === row.id}
                        aria-haspopup="menu"
                      >
                        Actions
                      </button>
                      {openUniverseActionsId === row.id && (
                        <div
                          className="universe-actions-menu"
                          role="menu"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedUniverseRowId(row.id);
                              setOpenUniverseActionsId(null);
                            }}
                            disabled={isUniverseMutating}
                            role="menuitem"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              beginUniverseEdit(row);
                              setOpenUniverseActionsId(null);
                            }}
                            disabled={isUniverseMutating}
                            role="menuitem"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleUniverseDeleteWithConfirm(row);
                            }}
                            disabled={isUniverseMutating}
                            role="menuitem"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderQuadrantPanel = () => {
    if (activeTab === 'Add Stocks') {
      return (
        <>
          <h2>Add stocks to your universe</h2>
          <p className="detail-meta">Capture a company name and/or ticker to track it in your Investing Universe.</p>
          <div className="detail-card">
            <form className="form-grid" onSubmit={handleUniverseStockAdd}>
              <label className="form-field">
                <span>Company name</span>
                <input
                  type="text"
                  value={newStockName}
                  onInput={(event) => setNewStockName(event.target.value)}
                  placeholder="NVIDIA Corporation"
                  aria-label="Company name"
                />
              </label>
              <label className="form-field">
                <span>Ticker</span>
                <input
                  type="text"
                  value={newStockSymbol}
                  onInput={(event) => setNewStockSymbol(event.target.value)}
                  placeholder="NVDA"
                  aria-label="Ticker symbol"
                />
              </label>
              <div className="form-actions">
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={(!newStockName.trim() && !newStockSymbol.trim()) || isUniverseMutating}
                >
                  {isUniverseMutating ? 'Saving…' : 'Add to universe'}
                </button>
                <p className="detail-meta">
                  {isSupabaseMode
                    ? 'Saved directly to Supabase. You can edit or delete rows in the Universe tab.'
                    : 'Entries are saved locally for this demo session. Configure Supabase to sync your universe to the cloud.'}
                </p>
              </div>
            </form>
          </div>
        </>
      );
    }

    if (activeTab === 'Universe Quadrant') {
      return renderDefaultSection();
    }

    return (
      <>
        <h2>{section.title}</h2>
        <p className="detail-meta">{section.meta}</p>
        <div className="detail-card" data-size="wide">
          <div className="detail-card__header">
            <div>
              <h3>Universe tracker</h3>
              <p className="detail-meta">
                Risk / Quality / Timing / Score refresh automatically from your latest ValueBot Module 6 MASTER deep dive.
              </p>
            </div>
            <div className="pill-list">
              <button
                className="btn-secondary"
                type="button"
                onClick={handleUniverseRefresh}
                disabled={universeIsLoading}
              >
                {universeIsLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {renderUniverseTable()}
          {universeLoadError && (
            <p className="detail-meta" role="status">
              Supabase fetch failed; showing local defaults instead.
            </p>
          )}
          {universeMutationError && (
            <p className="detail-meta" role="status">
              {isSupabaseMode ? 'Supabase sync failed: ' : 'Update failed: '}
              {universeMutationError.message || 'Please try again.'}
            </p>
          )}
          {deepDiveIndexError && (
            <p className="detail-meta" role="status">
              Unable to check saved deep dives right now: {deepDiveIndexError}
            </p>
          )}
          {deepDiveIndexLoading && <p className="detail-meta">Checking for saved deep dives…</p>}
        </div>
      </>
    );
  };

  const renderFocusListPanel = () => {
    if (hasTabs && activeTab !== 'Focus List') {
      return renderDefaultSection();
    }

    return (
      <>
        <h2>{section.title}</h2>
        {section.meta && <p className="detail-meta">{section.meta}</p>}
        <div className="detail-grid detail-grid--dashboard">
          {[0, 1, 2].map((index) => (
            <div className="detail-card" data-size="third" key={`focus-column-${index}`}>
              <header className="list-header">
                <h3>Today&apos;s focus</h3>
                <button className="btn-tertiary" type="button" disabled>
                  + Add
                </button>
              </header>
              <ul className="list-items">
                {focusList.map((item, itemIndex) => (
                  <li key={`${item.id}-${index}`} className={`list-item${itemIndex === 0 ? ' active' : ''}`}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.caption}</span>
                    </div>
                    <span className={`tag ${item.tag?.tone || ''}`.trim()}>{item.tag?.label ?? 'Watch'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderUniverseBuilderPanel = () => {
    // Tab 1: Global Ticker Database - shows the main UniverseBuilder component
    if (activeTab === 'Global Ticker Database') {
      return (
        <>
          <h2>{section.title}</h2>
          <p className="detail-meta">{section.meta}</p>
          <div className="detail-component">
            <UniverseBuilder />
          </div>
        </>
      );
    }

    // Tab 2: Search - shows the SearchTab component
    if (activeTab === 'Search') {
      return (
        <>
          <h2>Search Stock Universe</h2>
          <p className="detail-meta">Search and browse all cataloged stocks from the global stock universe database.</p>
          <div className="detail-component">
            <SearchTab />
          </div>
        </>
      );
    }

    // Default fallback to first tab
    return (
      <>
        <h2>{section.title}</h2>
        <p className="detail-meta">{section.meta}</p>
        <div className="detail-component">
          <UniverseBuilder />
        </div>
      </>
    );
  };

  const renderCheckInJournalPanel = () => (
    <>
      <h2>Trading Journal</h2>
      <p className="detail-meta">Daily reflections to anchor your session.</p>
      <div className="detail-grid detail-grid--balanced">
        <div className="detail-card">
          <h3>Journal prompts</h3>
          <ol>
            <li>What regime are you trading right now? List the confirming data.</li>
            <li>Which quadrant is your top idea in, and what would move it?</li>
            <li>How aligned is your sizing with the current quadrant?</li>
          </ol>
        </div>
      </div>
    </>
  );

  const renderValueBotWorkspace = () => (
    <section className="valuebot-panel" aria-label="ValueBot workspace">
      <header className="valuebot-header">
        <div>
          <h2>ValueBot research console</h2>
          <p>
            Explore AI-generated valuation prompts, conviction notes, and scenario planning tabs tailored for deep fundamental
            work.
          </p>
        </div>
        <span className="tag tag-blue">AI assistant</span>
      </header>

      <div className="valuebot-views">
        <article className="valuebot-view active" aria-hidden={false}>
          <h3>{activeValueBotConfig?.title}</h3>
          <p>{activeValueBotConfig?.description}</p>
          <ul>
            {activeValueBotConfig?.bullets?.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          <div className="detail-component valuebot-content-panel">
            {activeValueBotConfig?.id === 'valuebot-quicktake' ? (
              <AIAnalysis />
            ) : activeValueBotConfig?.id === 'valuebot-batch-queue' ? (
              <BatchQueueTab />
            ) : (
              <>
                {activeValueBotConfig?.id === 'valuebot-data-loader' && <Module0DataLoader />}
                {activeValueBotConfig?.id === 'valuebot-core-diagnostics' && <Module1CoreDiagnostics />}
                {activeValueBotConfig?.id === 'valuebot-growth-engine' && <Module2GrowthEngine />}
                {activeValueBotConfig?.id === 'valuebot-scenario-engine' && <Module3ScenarioEngine />}
                {activeValueBotConfig?.id === 'valuebot-valuation-engine' && <Module4ValuationEngine />}
                {activeValueBotConfig?.id === 'valuebot-timing-momentum' && <Module5TimingMomentum />}
                {activeValueBotConfig?.id === 'valuebot-final-verdict' && <Module6FinalVerdict />}
              </>
            )}
          </div>

          {activeValueBotConfig?.infoSections?.map((section) => (
            <div className="valuebot-info" key={`${activeValueBotConfig.id}-${section.title}`}>
              <h4>{section.title}</h4>
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.text ? <p>{section.text}</p> : null}
            </div>
          ))}
        </article>
      </div>
    </section>
  );

  const renderActivePanel = () => {
    if (activeSection === 'valuebot' || (activeSection === 'dashboard' && activeTab === 'ValueBot')) {
      return renderValueBotWorkspace();
    }

    if (activeSection === 'focuslist') {
      return renderFocusListPanel();
    }

    if (activeSection === 'quadrant') {
      return renderQuadrantPanel();
    }

    if (activeSection === 'checkin' && activeTab === 'Trading Journal') {
      return renderCheckInJournalPanel();
    }

    if (activeSection === 'universe-builder') {
      return renderUniverseBuilderPanel();
    }

    if (!hasTabs) {
      return renderDefaultSection();
    }

    if (activeTab === tabsForSection[0]) {
      return renderDefaultSection();
    }

    return (
      <>
        <h2>{activeTab}</h2>
        <p className="detail-meta">Custom tab for {section.title}</p>
        <div className="detail-card">
          <p>This tab is reserved for future {section.title} content.</p>
        </div>
      </>
    );
  };

  const getShortLabel = (tab) => {
    // Map long tab names to shorter mobile-friendly versions
    const shortLabels = {
      'Morning Edition': 'Morning',
      'Analytics': 'Stats',
      'ValueBot': 'Bot',
      'Batch Queue': 'Queue',
      'QuickTake': 'Quick',
      'Trading Journal': 'Journal',
      'Global Ticker Database': 'Database',
      'Universe Quadrant': 'Quadrant',
      'Add Stocks': 'Add'
    };
    
    return shortLabels[tab] || tab;
  };

  const renderTabButton = (tab) => {
    const valueBotTabConfig =
      activeSection === 'valuebot'
        ? valueBotTabs.find((item) => item.label === tab || item.id === tab)
        : null;

    const displayLabel = valueBotTabConfig?.label ?? tab;
    const fullLabel = valueBotTabConfig?.fullLabel ?? valueBotTabConfig?.title ?? tab;
    const shortLabel = getShortLabel(displayLabel);

    const tabClasses = ['tab'];
    if (activeTab === tab) tabClasses.push('active');
    if (valueBotTabConfig) {
      tabClasses.push('valuebot-tab');
      if (valueBotTabConfig.id === 'valuebot-batch-queue') {
        tabClasses.push('valuebot-tab--batch');
      }
      if (valueBotTabConfig.id === 'valuebot-quicktake') {
        tabClasses.push('valuebot-tab--quicktake');
      }
    }

    return (
      <button
        key={tab}
        className={tabClasses.join(' ')}
        role="tab"
        aria-selected={activeTab === tab}
        onClick={() => handleTabSelection(tab)}
        type="button"
        aria-label={fullLabel}
      >
        <span className="tab__label-short">{shortLabel}</span>
        <span className="tab__label-full">{displayLabel}</span>
      </button>
    );
  };

  const renderTabs = () => {
    if (!hasTabs) return null;

    const wrapperClasses = ['app-tabs-wrapper'];
    if (isMobileView) {
      if (tabsScrollState.atStart) wrapperClasses.push('at-start');
      if (tabsScrollState.atEnd) wrapperClasses.push('at-end');
    }

    const wrapperClassesModules = ['app-tabs-wrapper'];
    if (isMobileView) {
      if (tabsScrollStateModules.atStart) wrapperClassesModules.push('at-start');
      if (tabsScrollStateModules.atEnd) wrapperClassesModules.push('at-end');
    }

    if (activeSection === 'valuebot') {
      return (
        <div className="valuebot-tab-groups" role="presentation">
          <div className={wrapperClasses.join(' ')}>
            <div 
              className="app-tabs valuebot-tab-row" 
              role="tablist" 
              aria-label="ValueBot quick actions"
              ref={tabsRef}
            >
              {valueBotPrimaryTabLabels.map(renderTabButton)}
            </div>
          </div>
          <div className={wrapperClassesModules.join(' ')}>
            <div 
              className="app-tabs valuebot-tab-row valuebot-tab-row--modules" 
              role="tablist" 
              aria-label="ValueBot modules"
              ref={tabsRefModules}
            >
              {valueBotModuleTabLabels.map(renderTabButton)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={wrapperClasses.join(' ')}>
        <div className="app-tabs" role="tablist" ref={tabsRef}>
          {tabsForSection.map(renderTabButton)}
        </div>
      </div>
    );
  };

  const renderSettingsDialogContent = () => (
    <div className="settings-dialog__content">
      <div className="detail-card">
        <p>Select an area to configure:</p>
        <ul>
          <li>Alerts &amp; notifications</li>
          <li>AI integrations</li>
          <li>Localization</li>
        </ul>
      </div>
      <div className="detail-card">
        <div className="settings-dialog__header">
          <div>
            <p className="detail-meta">Notifications</p>
            <h3>In-app alert settings</h3>
          </div>
          <p className="detail-meta">Control which nudges surface inside the workspace navigation.</p>
        </div>
        <table className="table subtle alerts-table">
          <thead>
            <tr>
              <th scope="col">Alert</th>
              <th scope="col">Schedule</th>
              <th scope="col">Status</th>
              <th scope="col">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {ALERT_CONFIGS.map((alert) => {
              const state = alertSettings[alert.id];
              const isMorningAlert = alert.id === MORNING_NEWS_ALERT_ID;
              const waiting = Boolean(state?.enabled && state?.triggered && state?.unread);
              return (
                <tr key={alert.id}>
                  <td>
                    <div className="alert-name">
                      <strong>{alert.name}</strong>
                      <span>{alert.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="detail-meta">{alert.schedule}</span>
                  </td>
                  <td>
                    {waiting ? (
                      <span className="tag tag-red">Waiting</span>
                    ) : state?.triggered ? (
                      <span className="tag tag-green">Acknowledged</span>
                    ) : (
                      <span className="detail-meta">Idle</span>
                    )}
                    {isMorningAlert && state?.lastTriggered && !waiting && (
                      <p className="detail-meta" aria-live="polite">
                        Last ping {formatDateLabel(state.lastTriggered)}
                      </p>
                    )}
                  </td>
                  <td>
                    <label className="alert-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(state?.enabled)}
                        onChange={() => handleAlertToggle(alert.id)}
                      />
                      <span className="alert-toggle-slider" aria-hidden="true" />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const workspaceActionButtons = (
    <>
      <button
        type="button"
        className={`pro-action-button${isAccountDialogOpen ? ' active' : ''}`}
        onClick={openAccountDialog}
        aria-expanded={isAccountDialogOpen}
        aria-haspopup="dialog"
        aria-controls="accountDialog"
        aria-label="Account"
      >
        <span className="item-icon" aria-hidden="true">👤</span>
      </button>
      <button
        type="button"
        className={`pro-action-button${isSettingsDialogOpen ? ' active' : ''}`}
        onClick={openSettingsDialog}
        aria-label="Settings"
      >
        <span className="item-icon" aria-hidden="true">{settingsNavItem.icon}</span>
      </button>
      <button
        type="button"
        className="pro-action-button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={themeCopy}
        aria-pressed={theme === 'dark'}
      >
        <span className="item-icon" aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
      </button>
    </>
  );

  return (
    <ValueBotContext.Provider value={valueBotProviderValue}>
      <main className="app-stage">
        <div className="app-foreground">
          <div className="pro-toggle-bar">
            {workspaceStatus && !(isMobileView && workspaceStatus.tone === 'error') && (
              <span
                className={`workspace-status workspace-status--${workspaceStatus.tone}`}
                role={workspaceStatus.tone === 'error' ? 'alert' : 'status'}
              >
                {workspaceStatus.message}
              </span>
            )}

            <button
              type="button"
              className={`pro-toggle${isProToolsOpen ? ' active' : ''}${isMobileView ? ' pro-toggle--compact' : ''}`}
              onClick={handleProToolsToggle}
              aria-haspopup="dialog"
              aria-expanded={isProToolsOpen}
              aria-pressed={isProToolsOpen}
              aria-label={isProToolsOpen ? 'Close Pro Tools workspace' : 'Open Pro Tools workspace'}
            >
              <span className="pro-toggle__indicator" aria-hidden="true" />
              <span className="pro-toggle__label">Pro Tools</span>
              {isProToolsOpen && (
                <span className="pro-toggle__close" aria-hidden="true" role="presentation">
                  ✕
                </span>
              )}
            </button>

            {!isMobileView && (
              <div className="pro-toggle-actions" role="group" aria-label="Workspace quick actions">
                {workspaceActionButtons}
              </div>
            )}
          </div>

          {isMobileView && workspaceStatus?.tone === 'error' && (
            <div className="workspace-status-dock" aria-live="polite">
              <span className="workspace-status workspace-status--error" role="alert">
                {workspaceStatus.message}
              </span>
            </div>
          )}

          {isProToolsOpen && (
            <div
              className="pro-overlay visible"
              role="dialog"
              aria-modal="true"
              aria-label="Pro tools workspace"
            >
              <div className="pro-overlay__backdrop" onClick={() => setIsProToolsOpen(false)} aria-hidden="true" />
              <div className="pro-overlay__panel">
                <header className="pro-overlay__header">
                  <div>
                    <p className="detail-meta">Workspace</p>
                    <h2>Pro Tools</h2>
                  </div>
                </header>
                <div className="pro-overlay__content">
                  <section className="app" aria-live="polite">
                    {runtimeConfig.isDemoMode && <DemoBanner />}

                    <div className="app-shell">
                      <nav
                        className={`app-menu${!isMobileView ? ' app-menu--compact' : ''}`}
                        aria-label="Primary"
                      >
                        {isMobileView ? (
                      <div className="mobile-nav-shell">
                        <div className="mobile-nav-row" role="tablist">
                          {mobilePrimaryNav.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className={`menu-item${activeSection === item.id ? ' active' : ''}`}
                              data-section={item.id}
                              onClick={() => handleMenuSelection(item.id)}
                              aria-label={item.label}
                            >
                              <span className="item-icon" aria-hidden="true">
                                {item.icon}
                              </span>
                            </button>
                          ))}

                          <button
                            type="button"
                            className={`menu-item mobile-nav-more${isMobileNavOpen ? ' active' : ''}`}
                            onClick={() => setIsMobileNavOpen((prev) => !prev)}
                            aria-expanded={isMobileNavOpen}
                            aria-haspopup="menu"
                            aria-label="More navigation"
                          >
                            <span className="item-icon" aria-hidden="true">
                              ⋯
                            </span>
                          </button>
                        </div>

                        {isMobileNavOpen && (
                          <div className="mobile-nav-popover" role="menu" aria-label="More navigation">
                            {mobileOverflowNav.map((item) => {
                              const isDashboardItem = item.id === 'dashboard';
                              const navTitle = isDashboardItem ? dashboardTitle : item.title;
                              let caption = isDashboardItem ? dashboardCaption : item.caption;
                              if (isDashboardItem && hasMorningNewsPing) {
                                caption = `${dashboardCaption} • Morning News`;
                              }
                              const handleClick = () => {
                                if (item.action) {
                                  item.action();
                                  setIsMobileNavOpen(false);
                                  return;
                                }
                                handleMenuSelection(item.id);
                              };
                              return (
                                <button
                                  key={item.id}
                                  className={`menu-item${activeSection === item.id ? ' active' : ''}`}
                                  data-section={item.id}
                                  onClick={handleClick}
                                  role="menuitem"
                                  aria-label={item.label ?? item.title}
                                >
                                  {item.icon && (
                                    <span className="item-icon" aria-hidden="true">
                                      {item.icon}
                                    </span>
                                  )}
                                  <div className="item-copy">
                                    <span className="item-title">{navTitle}</span>
                                    <span className="item-caption">
                                      {caption}
                                      {isDashboardItem && hasMorningNewsPing && (
                                        <span className="menu-alert-indicator" aria-hidden="true" />
                                      )}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {mainNavigation.map((item) => {
                            const isDashboardItem = item.id === 'dashboard';
                            const navTitle = isDashboardItem ? dashboardTitle : item.title;
                            let caption = isDashboardItem ? dashboardCaption : item.caption;
                            if (isDashboardItem && hasMorningNewsPing) {
                              caption = `${dashboardCaption} • Morning News`;
                            }
                            const isActive = activeSection === item.id;
                            const buttonClasses = ['menu-item'];
                            if (isActive) {
                              buttonClasses.push('active', 'menu-item--expanded');
                            }
                            return (
                              <button
                                key={item.id}
                                className={buttonClasses.join(' ')}
                                data-section={item.id}
                                onClick={() => handleMenuSelection(item.id)}
                                aria-expanded={isActive}
                              >
                                {item.icon && (
                                  <span className="item-icon" aria-hidden="true">
                                    {item.icon}
                                  </span>
                                )}
                                <span className="menu-item__label">{item.shortLabel ?? item.title}</span>
                                {isActive && (
                                  <div className="menu-item__details">
                                    <span className="item-title">{navTitle}</span>
                                    <span className="item-caption">
                                      {caption || 'Explore more'}
                                      {isDashboardItem && hasMorningNewsPing && (
                                        <span className="menu-alert-indicator" aria-hidden="true" />
                                      )}
                                    </span>
                                  </div>
                                )}
                              </button>
                            );
                          }
                        )}
                      </>
                    )}
                  </nav>

                  <div className="workspace" id="workspace">
                    {renderTabs()}

                    <div className="app-panels">
                      <section className="app-detail" aria-label="Detail">
                        <article className="detail-view visible">
                          {renderActivePanel()}
                        </article>
                      </section>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mobile Bottom Navigation (visible only on mobile) */}
              {isMobileView && (
                <>
                  <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
                    {mobilePrimaryNavItems.map((item) => {
                      const isActive = item.id !== 'more' && activeSection === item.id;
                      const isMoreBtn = item.id === 'more';
                      const hasOverflowActive = isMoreBtn && mobileOverflowNavItems.some(
                        overflowItem => overflowItem.id === activeSection
                      );

                      const classNames = ['mobile-nav-item'];
                      if (isActive) classNames.push('active');
                      if (isMoreBtn) {
                        classNames.push('mobile-nav-more-btn');
                        if (hasOverflowActive) classNames.push('has-overflow');
                      }

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={classNames.join(' ')}
                          onClick={() => handleMobileNavSelection(item.id)}
                          aria-label={item.label}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span className="item-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                          <span className="item-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Mobile Navigation Drawer */}
                  <div
                    className={`mobile-nav-drawer-backdrop${isMobileNavDrawerOpen ? ' visible' : ''}`}
                    onClick={closeMobileNavDrawer}
                    aria-hidden="true"
                  />
                  <div
                    className={`mobile-nav-drawer${isMobileNavDrawerOpen ? ' open' : ''}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="More navigation options"
                  >
                    <div className="mobile-nav-drawer-handle" aria-hidden="true" />
                    <div className="mobile-nav-drawer-content">
                      <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                        More Options
                      </h3>
                      <div className="mobile-nav-drawer-actions" role="group" aria-label="Workspace quick actions">
                        {workspaceActionButtons}
                      </div>
                      {mobileOverflowNavItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`mobile-nav-drawer-item${isActive ? ' active' : ''}`}
                            onClick={() => handleMobileNavSelection(item.id)}
                          >
                            <span className="item-icon" aria-hidden="true">
                              {item.icon}
                            </span>
                            <span>{item.title || item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

                {deepDiveModalTicker && (
                  <UniverseDeepDiveModal
                    ticker={deepDiveModalTicker}
                    companyName={deepDiveModalCompany}
                    onClose={closeDeepDiveModal}
                    onReopenDeepDive={(dive) => {
                      handleReopenDeepDive(dive);
                      closeDeepDiveModal();
                    }}
                    userId={user?.id || null}
                  />
                )}

                <div
                  id="accountDialog"
                  className={`app-dialog${isAccountDialogOpen ? ' visible' : ''}`}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="accountDialogTitle"
                  aria-hidden={!isAccountDialogOpen}
                  hidden={!isAccountDialogOpen}
                >
                  <div className="dialog-backdrop" onClick={closeAccountDialog} aria-hidden="true" />
                  <div className="dialog-panel" role="document">
                    <div className="dialog-header">
                      <h2 id="accountDialogTitle">Workspace account</h2>
                      <button
                        type="button"
                        className="dialog-close"
                        aria-label="Close account dialog"
                        onClick={closeAccountDialog}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="dialog-body account-dialog">
                      <div className="account-hero">
                        <div className="workspace-title">
                          <p className="eyebrow">Workspace account</p>
                          <h1>AlphaStocks Workspace</h1>
                          <p>
                            Welcome,
                            {' '}
                            {profileDisplayName}.
                          </p>
                          <div className="pill-row" aria-label="Workspace status chips">
                            <span className="pill pill--brand">
                              {demoAccountPlan.planLabel}
                              {' '}
                              •
                              {' '}
                              {demoAccountPlan.daysRemaining}
                              {' '}
                              days left
                            </span>
                            <span className="pill">
                              Seats
                              {' '}
                              {demoAccountPlan.seats.used}
                              /
                              {demoAccountPlan.seats.total}
                            </span>
                            <span className="pill">Last login · 2 hours ago</span>
                          </div>
                        </div>
                        <div className="account-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-pressed={theme === 'dark'}
                          >
                            {themeCopy}
                          </button>
                          <div className="app-user" aria-label="Workspace email">
                            {profileEmail}
                          </div>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleSignOut}
                            disabled={runtimeConfig.mode === 'demo' || isSigningOut}
                          >
                            {isSigningOut ? 'Signing out…' : 'Log out'}
                          </button>
                        </div>
                      </div>

                      <div className="account-grid" role="list">
                        <section className="account-card account-card--glow" role="listitem">
                          <div className="card-header">
                            <div>
                              <p className="eyebrow">Plan & usage</p>
                              <h3>Pro workspace trial</h3>
                              <p className="card-subtle">{demoAccountPlan.renewal}</p>
                            </div>
                            <div className="pill pill--soft">Upgrade</div>
                          </div>
                          <div className="account-plan-grid">
                            <dl>
                              <div>
                                <dt>Workspace value</dt>
                                <dd>{demoAccountPlan.workspaceValue}</dd>
                              </div>
                              <div>
                                <dt>YTD</dt>
                                <dd>{demoAccountPlan.ytd}</dd>
                              </div>
                              <div>
                                <dt>Top strategy</dt>
                                <dd>{demoAccountPlan.bestStrategy}</dd>
                              </div>
                            </dl>
                            <div className="usage-stack" aria-label="Usage meters">
                              {demoAccountPlan.usage.map((item) => {
                                const percentage = Math.min(100, Math.round((item.used / item.limit) * 100));
                                const remaining = item.limit - item.used;

                                return (
                                  <div key={item.label} className="usage-meter">
                                    <div className="usage-header">
                                      <span>{item.label}</span>
                                      <span>
                                        {item.used.toLocaleString()}
                                        {' '}
                                        /
                                        {' '}
                                        {item.limit.toLocaleString()} {item.unit ?? ''}
                                      </span>
                                    </div>
                                    <div className="usage-bar" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
                                      <span style={{ width: `${percentage}%` }} />
                                    </div>
                                    <p className="card-subtle">
                                      {remaining.toLocaleString()}
                                      {' '}
                                      {item.unit ?? 'calls'} remaining before reset
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="scheduled-reports" aria-label="Scheduled reports">
                            <h4>Scheduled drops</h4>
                            <ul>
                              {demoAccountPlan.scheduledReports.map((report) => (
                                <li key={report}>
                                  <span className="status-dot status-dot--success" aria-hidden="true" />
                                  {report}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </section>

                        <section className="account-card account-card--diagnostics" role="listitem" aria-live="polite">
                          <div className="card-header">
                            <div>
                              <p className="eyebrow">Data service diagnostics</p>
                              <h3>Supabase connection</h3>
                              <p className="card-subtle">
                                {dataDiagnostics.mode === 'supabase'
                                  ? 'Live Supabase configuration detected.'
                                  : 'Running in demo mode with live data disabled.'}
                              </p>
                            </div>
                            <span
                              className={`status-badge ${
                                dataDiagnostics.dashboardError || dataDiagnostics.profileError ? 'status-badge--warning' : 'status-badge--success'
                              }`}
                            >
                              {dataDiagnostics.dashboardError || dataDiagnostics.profileError ? 'Action needed' : 'Healthy'}
                            </span>
                          </div>
                          <ul className="diagnostics-list">
                            <li>
                              <span>Mode</span>
                              <div className="diagnostics-value">
                                <span className="status-dot status-dot--success" aria-hidden="true" />
                                {dataDiagnostics.mode === 'supabase' ? 'Supabase' : 'Demo'}
                              </div>
                            </li>
                            <li>
                              <span>Supabase URL</span>
                              <div className="diagnostics-value">
                                <span
                                  className={`status-dot ${dataDiagnostics.supabaseUrlConfigured ? 'status-dot--success' : 'status-dot--warning'}`}
                                  aria-hidden="true"
                                />
                                {dataDiagnostics.supabaseUrlConfigured ? 'Configured' : 'Missing'}
                              </div>
                            </li>
                            <li>
                              <span>Anon key</span>
                              <div className="diagnostics-value">
                                <span
                                  className={`status-dot ${
                                    dataDiagnostics.supabaseAnonKeyConfigured ? 'status-dot--success' : 'status-dot--warning'
                                  }`}
                                  aria-hidden="true"
                                />
                                {dataDiagnostics.supabaseAnonKeyConfigured ? 'Configured' : 'Missing'}
                              </div>
                            </li>
                          </ul>
                          <div className="diagnostics-callout">
                            {dataDiagnostics.profileError && (
                              <p>
                                <strong>Profile load error:</strong>
                                {' '}
                                {dataDiagnostics.profileError}
                              </p>
                            )}
                            {dataDiagnostics.dashboardError ? (
                              <p>
                                <strong>Dashboard data error:</strong>
                                {' '}
                                {dataDiagnostics.dashboardError}
                              </p>
                            ) : (
                              <p>No dashboard errors detected. Schema cache looks healthy.</p>
                            )}
                          </div>
                        </section>

                        <section className="account-card" role="listitem">
                          <div className="card-header">
                            <div>
                              <p className="eyebrow">Pro tools preview</p>
                              <h3>Level up your research</h3>
                            </div>
                            <span className="pill pill--soft">Included in trial</span>
                          </div>
                          <div className="pro-tools">
                            {proToolsPreview.map((tool) => (
                              <div key={tool.name} className="pro-tool">
                                <div className="pro-tool__header">
                                  <div>
                                    <p className="pro-tool__title">{tool.name}</p>
                                    <p className="card-subtle">{tool.description}</p>
                                  </div>
                                  <span className="status-badge status-badge--soft">{tool.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="account-card" role="listitem">
                          <div className="card-header">
                            <div>
                              <p className="eyebrow">Signal ideas</p>
                              <h3>Ready-made guardrails</h3>
                            </div>
                            <span className="pill pill--soft">Demo</span>
                          </div>
                          <ul className="signal-list">
                            {signalIdeas.map((signal) => (
                              <li key={signal.name}>
                                <div>
                                  <p className="signal-title">{signal.name}</p>
                                  <p className="card-subtle">{signal.detail}</p>
                                </div>
                                <span className="status-badge status-badge--soft">{signal.status}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section className="account-card account-card--timeline" role="listitem">
                          <div className="card-header">
                            <div>
                              <p className="eyebrow">Activity</p>
                              <h3>Recent workspace events</h3>
                            </div>
                            <span className="pill pill--soft">Live demo</span>
                          </div>
                          <ol className="activity-timeline">
                            {activityTimeline.map((event) => (
                              <li key={event.label}>
                                <div className="timeline-dot" aria-hidden="true" />
                                <div>
                                  <p className="signal-title">{event.label}</p>
                                  <p className="card-subtle">{event.detail}</p>
                                </div>
                                <span className="timeline-time">{event.timestamp}</span>
                              </li>
                            ))}
                          </ol>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="settingsDialog"
                  className={`app-dialog${isSettingsDialogOpen ? ' visible' : ''}`}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="settingsDialogTitle"
                  aria-hidden={!isSettingsDialogOpen}
                  hidden={!isSettingsDialogOpen}
                >
                  <div className="dialog-backdrop" onClick={closeSettingsDialog} aria-hidden="true" />
                  <div className="dialog-panel" role="document">
                    <div className="dialog-header">
                      <div>
                        <p className="detail-meta">Preferences</p>
                        <h2 id="settingsDialogTitle">Settings</h2>
                      </div>
                      <button
                        type="button"
                        className="dialog-close"
                        aria-label="Close settings dialog"
                        onClick={closeSettingsDialog}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="dialog-body settings-dialog">{renderSettingsDialogContent()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
    </ValueBotContext.Provider>
  );
};

export default App;

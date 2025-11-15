import { useEffect, useMemo, useState } from 'preact/hooks';
import { getRuntimeConfig } from './config/runtimeConfig.js';
import { getDataService } from './data/dataService.js';
import { formatDateLabel, formatPercent, formatUsd } from './features/dashboard/dashboardUtils.js';
import { useDashboardData } from './features/dashboard/useDashboardData.js';

const DEFAULT_FOCUS_LIST = [
  { id: 'focus-1', title: 'SPY breakout', caption: 'Checklist ready • 09:30', tag: { tone: 'tag-green', label: 'Today' } },
  { id: 'focus-2', title: 'NVDA earnings', caption: 'Review catalyst notes', tag: { label: 'Tomorrow' } },
  { id: 'focus-3', title: 'Macro digest', caption: 'Upload CPI research PDF', tag: { tone: 'tag-blue', label: 'Pinned' } },
  { id: 'focus-4', title: 'Position audit', caption: 'Rotate winners & laggards', tag: { label: 'Next week' } }
];

const tabs = ['Overview', 'Notes', 'Tasks', 'Analytics', 'ValueBot'];

const valueBotTabs = [
  {
    id: 'valuebot-1',
    label: 'Tab 1',
    title: 'Tab 1 — Opening snapshot',
    description: 'ValueBot summarizes overnight news and highlights factors impacting cash flow stability.',
    bullets: [
      'Key macro datapoints shaping discount rates.',
      'Sector heat map filtered by valuation spread.',
      'Signals worth validating during the morning call.'
    ]
  },
  {
    id: 'valuebot-2',
    label: 'Tab 2',
    title: 'Tab 2 — Valuation screens',
    description: 'Deploy curated screeners that weigh EV/EBITDA against free cash flow momentum.',
    bullets: [
      'Blend relative valuation with historical z-scores.',
      'Surface upgrades or downgrades that shift multiples.',
      'Rank opportunities by margin of safety.'
    ]
  },
  {
    id: 'valuebot-3',
    label: 'Tab 3',
    title: 'Tab 3 — Earnings quality',
    description: 'Automated forensic accounting checks identify accrual spikes and working capital drifts.',
    bullets: [
      'Review Beneish-style risk scores.',
      'Flag inconsistent revenue recognition narratives.',
      'Track restatement probability.'
    ]
  },
  {
    id: 'valuebot-4',
    label: 'Tab 4',
    title: 'Tab 4 — Capital allocation',
    description: 'Audit buyback cadence, dividend coverage, and reinvestment priorities.',
    bullets: [
      'Compare payout ratios versus peers.',
      'Map reinvestment IRRs and hurdle rates.',
      'Highlight dilution or leverage creep.'
    ]
  },
  {
    id: 'valuebot-5',
    label: 'Tab 5',
    title: 'Tab 5 — Risk guardrails',
    description: 'Scenario grids stress-test valuation assumptions against macro and company shocks.',
    bullets: [
      'Customizable probability trees.',
      'Downside capture estimates.',
      'Suggested hedges per theme.'
    ]
  },
  {
    id: 'valuebot-6',
    label: 'Tab 6',
    title: 'Tab 6 — Catalyst radar',
    description: 'Rolling roadmap of events, filings, and management appearances.',
    bullets: [
      'Track how catalysts shift conviction.',
      'Assign prep tasks to teammates.',
      'Auto-ingest transcripts for highlights.'
    ]
  },
  {
    id: 'valuebot-7',
    label: 'Tab 7',
    title: 'Tab 7 — Macro overlay',
    description: 'Link portfolio names to regime models for growth, inflation, and liquidity.',
    bullets: [
      'Dynamic beta adjustments.',
      'Factor exposures to monitor.',
      'Playbooks per macro quadrant.'
    ]
  },
  {
    id: 'valuebot-8',
    label: 'Tab 8',
    title: 'Tab 8 — Signal log',
    description: 'Chronicle prompts, answers, and follow-ups to maintain an audit trail.',
    bullets: [
      'Timestamped recommendations.',
      'Confidence scoring with rationale.',
      'Link back to shared research notes.'
    ]
  },
  {
    id: 'valuebot-9',
    label: 'Tab 9',
    title: 'Tab 9 — Compliance summary',
    description: 'Real-time guardrails around restricted lists, disclosures, and approvals.',
    bullets: [
      'Instant alerts for sensitive tickers.',
      'Track approvals tied to reports.',
      'Shareable PDF snapshots.'
    ]
  },
  {
    id: 'valuebot-10',
    label: 'Tab 10',
    title: 'Tab 10 — Action board',
    description: 'Roll up ValueBot recommendations into next actions aligned with execution windows.',
    bullets: [
      'Auto-prioritized todo list.',
      'Hand-off checklist for operations.',
      'Context-aware reminders.'
    ]
  }
];

const portfolioSubsections = [
  { id: 'portfolio-results', label: 'Results' },
  { id: 'portfolio-ledger', label: 'Ledger / Records' }
];

const mainNavigation = [
  { id: 'dashboard', title: 'Today / Dashboard', caption: 'Morning overview' },
  { id: 'checkin', title: 'Check-In', caption: 'Daily reflections' },
  { id: 'alpha', title: 'AI Oracle Chat', caption: 'Learning & pattern analysis' },
  { id: 'portfolio', title: 'Portfolio', caption: 'Results & ledger', hasSubmenu: true },
  { id: 'settings', title: 'Settings', caption: 'Preferences' },
  { id: 'punchcard', title: 'PUNCHCard MONOPLOY - Fishing SWIPE', caption: 'Patience & selectivity drill' },
  { id: 'quadrant', title: 'Universe Quadrant', caption: 'Macro positioning map' },
  { id: 'knowledge', title: 'Knowledge (Transform)', caption: 'Systems upgrade' }
];

const DemoBanner = () => (
  <div className="demo-banner" role="status">
    <strong>Demo data mode:</strong> Supabase keys not detected. Loading local fixtures.
  </div>
);

const staticSections = {
  checkin: {
    title: 'Check-In',
    meta: 'Reflect and reset your positioning for the session.',
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
      }
    ]
  },
  alpha: {
    title: 'AI Oracle Chat',
    meta: 'AI-powered learning analysis that tracks patterns, scores mistakes, and monitors improvement over time.',
    cards: [
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
                <strong>Key Insight:</strong> You're successfully implementing patience disciplines from the punchcard system. 
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
                <li>Integration with punchcard system for unified discipline tracking</li>
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
  punchcard: {
    title: 'PUNCHCard MONOPLOY - Fishing SWIPE',
    meta: 'Gamify patience: log the few swings you are willing to take and why they are worth the punch card.',
    cards: [
      {
        title: 'Select the day’s one big cast',
        body: (
          <>
            <p>
              Document the single opportunity that deserves a punch. If it does not clear the conviction bar, let it pass and
              record the lesson.
            </p>
            <ul className="pill-list">
              <li className="pill">Set-up quality</li>
              <li className="pill">Catalyst clarity</li>
              <li className="pill">Sizing discipline</li>
            </ul>
          </>
        )
      },
      {
        title: 'Fishing swipe log',
        body: (
          <>
            <p>Track which casts you actually took and whether they honored the punch card rules.</p>
            <table className="table subtle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Opportunity</th>
                  <th>Reason</th>
                  <th>Discipline score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>09:45</td>
                  <td>Breakout retry</td>
                  <td>Rejected – patience preserved</td>
                  <td>⭐️⭐️⭐️⭐️</td>
                </tr>
                <tr>
                  <td>14:10</td>
                  <td>Pullback entry</td>
                  <td>Taken – plan followed</td>
                  <td>⭐️⭐️⭐️</td>
                </tr>
              </tbody>
            </table>
          </>
        )
      }
    ]
  },
  quadrant: {
    title: 'Universe Quadrant',
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
  knowledge: {
    title: 'Knowledge (Transform)',
    meta: 'Transform setbacks into playbooks that sharpen timing, sizing, and conviction.',
    cards: [
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
              <li>Practice with the Monopoly punchcard fishing game to reinforce patience and selectivity.</li>
              <li>
                Update your profiles to top-tier standards. Review the Pandora sale and other exits: why did you sell, do you
                regret it, and what should have been handled differently? Capture how each move felt, categorize the lessons,
                and build guardrails so it doesn&rsquo;t happen again.
              </li>
            </ol>
          </>
        )
      }
    ]
  }
};


const App = () => {
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeValueBotTab, setActiveValueBotTab] = useState(valueBotTabs[0].id);
  const [portfolioSub, setPortfolioSub] = useState('portfolio-results');
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const runtimeConfig = useMemo(() => getRuntimeConfig(), []);
  const dataService = useMemo(() => getDataService(), [runtimeConfig.mode]);
  const themeCopy = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
  const {
    focusList,
    portfolioSummary,
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
    profileId: activeProfile?.id,
    defaultFocusList: DEFAULT_FOCUS_LIST
  });
  const dataError = profileError ?? dashboardError;

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    dataService
      .getTable('profiles', { limit: 1 })
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
  }, [dataService]);

  const section = useMemo(() => {
    if (activeSection === 'dashboard') {
      const metaFallback =
        eventsScope === 'global'
          ? hasGlobalEvents
            ? 'Global market snapshot • Updated moments ago'
            : 'Global market feed unavailable — connect live data to populate.'
          : 'Pre-market status • Updated moments ago';

      return {
        title: 'Today / Dashboard',
        meta: eventsDigest?.meta ?? metaFallback,
        layout: 'dashboard',
        cards: [
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
        ]
      };
    }

    if (activeSection === 'portfolio') {
      return {
        title: 'Portfolio',
        meta: portfolioSummary?.meta ?? 'Monitor realized performance and ledger entries.',
        cards: [
          {
            title: 'Results snapshot',
            body: portfolioSummary ? (
              <>
                <p className="detail-meta">{portfolioSummary.meta}</p>
                <ul>
                  {portfolioSummary.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Performance data will appear once portfolio snapshots load.</p>
            ),
            subtarget: 'portfolio-results'
          },
          {
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
            ),
            subtarget: 'portfolio-ledger'
          }
        ]
      };
    }

    return staticSections[activeSection] ?? staticSections.checkin;
  }, [
    activeSection,
    analysisSummary,
    eventsDigest,
    eventsScope,
    hasGlobalEvents,
    latestJournal,
    ledgerHighlights,
    portfolioSummary
  ]);

  return (
    <main className="app-stage">
      <section className="app" aria-live="polite">
        <header className="app-topbar">
          <div className="workspace-title">
            <h1>AlphaStocks Workspace</h1>
            <p>
              Welcome,
              {' '}
              {activeProfile?.display_name ?? 'Demo Trader'}.
            </p>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-pressed={theme === 'light'}
            >
              {themeCopy}
            </button>
            <div className="app-user">{activeProfile?.email ?? 'demo@alphastocks.ai'}</div>
            <button type="button" className="btn-secondary" disabled>
              Log out
            </button>
          </div>
        </header>

        {runtimeConfig.isDemoMode && <DemoBanner />}
        {dataError && (
          <div className="demo-banner warning" role="alert">
            Unable to load workspace profile. Check data service configuration.
          </div>
        )}

        <div className="app-shell">
          <nav className="app-menu" aria-label="Primary">
            {mainNavigation.map((item) => (
              <button
                key={item.id}
                className={`menu-item${activeSection === item.id ? ' active' : ''}`}
                data-section={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (item.id === 'portfolio') {
                    setPortfolioSub('portfolio-results');
                  }
                }}
              >
                <span className="item-title">{item.title}</span>
                <span className="item-caption">{item.caption}</span>
              </button>
            ))}
            <div className="submenu" data-parent="portfolio" aria-hidden={activeSection !== 'portfolio'}>
              {portfolioSubsections.map((item) => (
                <button
                  key={item.id}
                  className={`submenu-item${portfolioSub === item.id ? ' active' : ''}`}
                  data-sub={item.id}
                  onClick={() => {
                    setActiveSection('portfolio');
                    setPortfolioSub(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="workspace" id="workspace">
            <div className="app-tabs" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`tab${activeTab === tab ? ' active' : ''}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="app-panels">
              <aside className="app-list" aria-label="Key items">
                <header className="list-header">
                  <h2>Focus list</h2>
                  <button className="btn-tertiary" type="button" disabled>
                    + Add
                  </button>
                </header>
                <ul className="list-items">
                  {focusList.map((item, index) => (
                    <li key={item.id} className={`list-item${index === 0 ? ' active' : ''}`}>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.caption}</span>
                      </div>
                      <span className={`tag ${item.tag?.tone || ''}`.trim()}>{item.tag?.label ?? 'Watch'}</span>
                    </li>
                  ))}
                </ul>
              </aside>

              <section className="app-detail" aria-label="Detail">
                <article className="detail-view visible">
                  <h2>{section.title}</h2>
                  {section.meta && <p className="detail-meta">{section.meta}</p>}
                  <div
                    className={`detail-grid${section.layout ? ` detail-grid--${section.layout}` : ''}`}
                  >
                    {section.cards.map((card) => (
                      <div
                        key={card.title}
                        className={`detail-card${
                          card.subtarget && portfolioSub === card.subtarget ? ' highlight' : ''
                        }`}
                        data-subtarget={card.subtarget}
                        data-size={card.size}
                      >
                        <h3>{card.title}</h3>
                        {card.body}
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </div>
            {activeTab === 'ValueBot' && (
              <section className="valuebot-panel" aria-label="ValueBot workspace">
                <header className="valuebot-header">
                  <div>
                    <h2>ValueBot research console</h2>
                    <p>
                      Explore AI-generated valuation prompts, conviction notes, and scenario planning tabs tailored for
                      deep fundamental work.
                    </p>
                  </div>
                  <span className="tag tag-blue">AI assistant</span>
                </header>
                <div className="valuebot-tabs" role="tablist" aria-label="ValueBot prompts">
                  {valueBotTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`valuebot-tab${activeValueBotTab === tab.id ? ' active' : ''}`}
                      type="button"
                      role="tab"
                      aria-selected={activeValueBotTab === tab.id}
                      onClick={() => setActiveValueBotTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="valuebot-views">
                  {valueBotTabs.map((tab) => (
                    <article
                      key={tab.id}
                      className={`valuebot-view${activeValueBotTab === tab.id ? ' active' : ''}`}
                      aria-hidden={activeValueBotTab !== tab.id}
                    >
                      <h3>{tab.title}</h3>
                      <p>{tab.description}</p>
                      <ul>
                        {tab.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;

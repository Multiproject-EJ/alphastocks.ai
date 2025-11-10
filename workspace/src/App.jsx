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

const tabs = ['Overview', 'Notes', 'Tasks', 'Analytics'];

const portfolioSubsections = [
  { id: 'portfolio-results', label: 'Results' },
  { id: 'portfolio-ledger', label: 'Ledger / Records' }
];

const mainNavigation = [
  { id: 'dashboard', title: 'Today / Dashboard', caption: 'Morning overview' },
  { id: 'checkin', title: 'Check-In', caption: 'Daily reflections' },
  { id: 'alpha', title: 'Stock Alpha', caption: 'Idea tracker' },
  { id: 'portfolio', title: 'Portfolio', caption: 'Results & ledger', hasSubmenu: true },
  { id: 'settings', title: 'Settings', caption: 'Preferences' },
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
    title: 'Stock Alpha',
    meta: 'Track hypotheses, catalysts, and conviction levels.',
    cards: [
      {
        title: 'Idea pipeline',
        body: (
          <>
            <ul className="pill-list">
              <li className="pill">Growth</li>
              <li className="pill">Event-driven</li>
              <li className="pill">Swing</li>
            </ul>
            <p>Add notes, attach files, and set review reminders.</p>
          </>
        )
      },
      {
        title: 'Alpha research feed',
        body: <p>Upload research snippets and tag by strategy to see aggregate performance.</p>
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
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;

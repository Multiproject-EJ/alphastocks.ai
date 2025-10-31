import { useEffect, useMemo, useState } from 'preact/hooks';

const focusList = [
  { id: 'focus-1', title: 'SPY breakout', caption: 'Checklist ready • 09:30', tag: { tone: 'tag-green', label: 'Today' } },
  { id: 'focus-2', title: 'NVDA earnings', caption: 'Review catalyst notes', tag: { label: 'Tomorrow' } },
  { id: 'focus-3', title: 'Macro digest', caption: 'Upload CPI research PDF', tag: { tone: 'tag-blue', label: 'Pinned' } },
  { id: 'focus-4', title: 'Position audit', caption: 'Rotate winners & laggards', tag: { label: 'Next week' } }
];

const tabs = ['Overview', 'Notes', 'Tasks', 'Analytics'];

const sectionDefinitions = {
  dashboard: {
    title: 'Today / Dashboard',
    meta: 'Pre-market status • Updated 15 minutes ago',
    cards: [
      {
        title: 'Opening checklist',
        body: (
          <ul>
            <li>Review overnight news drivers</li>
            <li>Set risk ranges &amp; alerts</li>
            <li>Confirm liquidity plan</li>
          </ul>
        )
      },
      {
        title: 'Market internals',
        body: <p>Futures +0.8%, VIX cooling to 15.7, breadth 68% advancing.</p>
      },
      {
        title: 'Active strategies',
        body: <p>Momentum breakout on large-cap tech, mean reversion in energy.</p>
      }
    ]
  },
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
  portfolio: {
    title: 'Portfolio',
    meta: 'Monitor realized performance and ledger entries.',
    cards: [
      {
        title: 'Results snapshot',
        body: (
          <>
            <p className="detail-meta">Total NAV $4.7M • YTD +12.4%</p>
            <ul>
              <li>Alpha +340 bps vs. benchmark</li>
              <li>Cash 18% • Gross 142%</li>
              <li>Volatility trending lower (12.1%)</li>
            </ul>
          </>
        ),
        subtarget: 'portfolio-results'
      },
      {
        title: 'Ledger highlights',
        body: (
          <>
            <ul>
              <li><strong>BUY</strong> NVDA 150 @ $1,035 — AI ramp adds conviction.</li>
              <li><strong>SELL</strong> XOM 200 @ $104 — trimming after rally.</li>
              <li><strong>DIV</strong> SCHD $3,250 — reinvest schedule for Friday.</li>
            </ul>
          </>
        ),
        subtarget: 'portfolio-ledger'
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
  }
};

const portfolioSubsections = [
  { id: 'portfolio-results', label: 'Results' },
  { id: 'portfolio-ledger', label: 'Ledger / Records' }
];

const mainNavigation = [
  { id: 'dashboard', title: 'Today / Dashboard', caption: 'Morning overview' },
  { id: 'checkin', title: 'Check-In', caption: 'Daily reflections' },
  { id: 'alpha', title: 'Stock Alpha', caption: 'Idea tracker' },
  { id: 'portfolio', title: 'Portfolio', caption: 'Results & ledger', hasSubmenu: true },
  { id: 'settings', title: 'Settings', caption: 'Preferences' }
];

const DemoBanner = () => (
  <div className="demo-banner" role="status">
    <strong>Demo data mode:</strong> Supabase keys not detected. Loading local fixtures.
  </div>
);

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [portfolioSub, setPortfolioSub] = useState('portfolio-results');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const themeCopy = theme === 'dark' ? 'Switch to light' : 'Switch to dark';

  const section = useMemo(() => sectionDefinitions[activeSection], [activeSection]);

  return (
    <main className="app-stage">
      <section className="app" aria-live="polite">
        <header className="app-topbar">
          <div className="workspace-title">
            <h1>AlphaStocks Workspace</h1>
            <p>Welcome, Demo Trader.</p>
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
            <div className="app-user">demo@alphastocks.ai</div>
            <button type="button" className="btn-secondary" disabled>
              Log out
            </button>
          </div>
        </header>

        <DemoBanner />

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
                      <span className={`tag ${item.tag.tone || ''}`.trim()}>{item.tag.label}</span>
                    </li>
                  ))}
                </ul>
              </aside>

              <section className="app-detail" aria-label="Detail">
                <article className="detail-view visible">
                  <h2>{section.title}</h2>
                  {section.meta && <p className="detail-meta">{section.meta}</p>}
                  <div className="detail-grid">
                    {section.cards.map((card) => (
                      <div
                        key={card.title}
                        className={`detail-card${
                          card.subtarget && portfolioSub === card.subtarget ? ' highlight' : ''
                        }`}
                        data-subtarget={card.subtarget}
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

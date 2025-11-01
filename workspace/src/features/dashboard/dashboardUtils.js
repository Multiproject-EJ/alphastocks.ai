const parseIsoDate = (value) => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? null : new Date(timestamp);
};

const formatUsd = (value, digits = 0) => {
  const amount = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(amount);
};

const formatPercent = (value, digits = 1) => {
  const ratio = Number.isFinite(value) ? value : 0;
  return `${(ratio * 100).toFixed(digits)}%`;
};

const formatDateLabel = (value) => {
  const date = parseIsoDate(value);

  if (!date) {
    return 'TBD';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const buildFocusListFromWatchlist = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const urgencyToTag = (alerts = {}) => {
    switch (alerts.urgency) {
      case 'today':
        return { label: 'Today', tone: 'tag-green' };
      case 'upcoming':
        return { label: 'Soon' };
      case 'pinned':
        return { label: 'Pinned', tone: 'tag-blue' };
      case 'monitor':
        return { label: 'Monitor' };
      default:
        return { label: 'Watch' };
    }
  };

  return rows
    .filter((item) => item && item.symbol)
    .sort((a, b) => (b.conviction ?? 0) - (a.conviction ?? 0))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: `${item.symbol} • ${(item.conviction ?? 0).toFixed(0)}/5`,
      caption: item.thesis ?? '',
      tag: urgencyToTag(item.alerts || {})
    }));
};

const computePortfolioSummary = (snapshots = [], positions = [], portfolios = []) => {
  if (!Array.isArray(snapshots) || snapshots.length === 0) {
    return null;
  }

  const portfolioNameMap = new Map(
    portfolios.filter((portfolio) => portfolio?.id).map((portfolio) => [portfolio.id, portfolio.name])
  );

  const latestByPortfolio = new Map();

  snapshots.forEach((snapshot) => {
    const seen = latestByPortfolio.get(snapshot.portfolio_id);
    const snapshotDate = parseIsoDate(snapshot.as_of);

    if (!seen || (snapshotDate && snapshotDate > seen.date)) {
      latestByPortfolio.set(snapshot.portfolio_id, {
        ...snapshot,
        date: snapshotDate
      });
    }
  });

  const latestSnapshots = Array.from(latestByPortfolio.values());

  if (latestSnapshots.length === 0) {
    return null;
  }

  const totalNav = latestSnapshots.reduce((acc, snapshot) => acc + (snapshot.nav ?? 0), 0);
  const totalCash = latestSnapshots.reduce((acc, snapshot) => acc + (snapshot.cash ?? 0), 0);
  const weightedAlpha =
    totalNav > 0
      ? latestSnapshots.reduce((acc, snapshot) => acc + (snapshot.nav ?? 0) * (snapshot.alpha ?? 0), 0) / totalNav
      : 0;
  const cashRatio = totalNav > 0 ? totalCash / totalNav : 0;

  const bestPortfolio = latestSnapshots.reduce((best, snapshot) => {
    if (!best || (snapshot.alpha ?? -Infinity) > (best.alpha ?? -Infinity)) {
      return snapshot;
    }

    return best;
  }, null);

  return {
    meta: `Total NAV ${formatUsd(totalNav)} • YTD ${formatPercent(weightedAlpha)}`,
    bullets: [
      `Weighted alpha ${formatPercent(weightedAlpha)} vs. benchmark`,
      `Cash ${totalNav > 0 ? formatPercent(totalCash / totalNav) : '0.0%'} across ${latestSnapshots.length} portfolios`,
      bestPortfolio
        ? `Top contributor ${portfolioNameMap.get(bestPortfolio.portfolio_id) ?? 'Portfolio'} (${formatPercent(
            bestPortfolio.alpha ?? 0
          )} alpha)`
        : 'Monitoring contributions across portfolios'
    ],
    totals: {
      nav: totalNav,
      cash: totalCash,
      cashRatio,
      weightedAlpha,
      portfolioCount: latestSnapshots.length
    },
    bestPortfolio: bestPortfolio
      ? {
          name: portfolioNameMap.get(bestPortfolio.portfolio_id) ?? 'Portfolio',
          alpha: bestPortfolio.alpha ?? 0
        }
      : null
  };
};

const computeLedgerHighlights = (transactions = [], portfolios = []) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const portfolioNameMap = new Map(
    portfolios.filter((portfolio) => portfolio?.id).map((portfolio) => [portfolio.id, portfolio.name])
  );

  return transactions
    .slice()
    .sort((a, b) => {
      const aDate = parseIsoDate(a.executed_at)?.getTime() ?? 0;
      const bDate = parseIsoDate(b.executed_at)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: `${String(item.type || '').toUpperCase()} ${item.symbol} ${item.qty ?? 0} @ ${formatUsd(item.price, 2)}`,
      caption: `${portfolioNameMap.get(item.portfolio_id) ?? 'Portfolio'} • ${formatDateLabel(item.executed_at)}`,
      note: item.notes ?? ''
    }));
};

const computeEventsDigest = (events = []) => {
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  const now = Date.now();

  const enriched = events
    .map((event) => ({
      ...event,
      dateObj: parseIsoDate(event.date)
    }))
    .filter((event) => event.dateObj)
    .sort((a, b) => a.dateObj - b.dateObj);

  if (enriched.length === 0) {
    return null;
  }

  const upcoming = enriched.filter((event) => event.dateObj.getTime() >= now - 12 * 60 * 60 * 1000);
  const focus = (upcoming.length > 0 ? upcoming : enriched).slice(0, 3);

  return {
    meta:
      upcoming.length > 0
        ? `Next: ${upcoming[0].title} on ${formatDateLabel(upcoming[0].date)}`
        : 'No upcoming events scheduled — keep building the calendar.',
    items: focus.map((event) => ({
      id: event.id,
      title: event.title,
      dateLabel: formatDateLabel(event.date),
      caption: `${event.category} • ${event.source}`
    }))
  };
};

const pickLatestJournalEntry = (entries = []) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  return entries
    .slice()
    .sort((a, b) => {
      const aDate = parseIsoDate(a.created_at)?.getTime() ?? 0;
      const bDate = parseIsoDate(b.created_at)?.getTime() ?? 0;
      return bDate - aDate;
    })[0];
};

const summarizeAnalysisQueue = (tasks = []) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return null;
  }

  const counts = tasks.reduce((acc, task) => {
    const status = task.status ?? 'unknown';
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const runningSymbols = tasks
    .filter((task) => task.status === 'running')
    .map((task) => task.payload?.symbol)
    .filter(Boolean);

  const queuedSymbols = tasks
    .filter((task) => task.status === 'queued')
    .map((task) => task.payload?.symbol)
    .filter(Boolean);

  const lastCompleted = tasks
    .filter((task) => task.status === 'completed' && task.completed_at)
    .sort((a, b) => (parseIsoDate(b.completed_at)?.getTime() ?? 0) - (parseIsoDate(a.completed_at)?.getTime() ?? 0))[0];

  return {
    total: tasks.length,
    counts,
    runningSymbols,
    queuedSymbols,
    lastCompleted: lastCompleted
      ? {
          taskType: lastCompleted.task_type,
          completedAt: lastCompleted.completed_at
        }
      : null
  };
};

export {
  parseIsoDate,
  formatUsd,
  formatPercent,
  formatDateLabel,
  buildFocusListFromWatchlist,
  computePortfolioSummary,
  computeLedgerHighlights,
  computeEventsDigest,
  pickLatestJournalEntry,
  summarizeAnalysisQueue
};

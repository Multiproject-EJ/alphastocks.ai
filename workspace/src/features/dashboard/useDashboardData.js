import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  buildFocusListFromWatchlist,
  computeEventsDigest,
  computeLedgerHighlights,
  computePortfolioSummary,
  pickLatestJournalEntry,
  summarizeAnalysisQueue
} from './dashboardUtils.js';

export const useDashboardData = ({ dataService, profileId, defaultFocusList = [] }) => {
  const [focusList, setFocusList] = useState(defaultFocusList);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [ledgerHighlights, setLedgerHighlights] = useState([]);
  const [eventsRows, setEventsRows] = useState([]);
  const [eventsScope, setEventsScope] = useState('personal');
  const [latestJournal, setLatestJournal] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setFocusList(defaultFocusList);
  }, [defaultFocusList]);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspaceData = async () => {
      try {
        const [
          watchlist,
          snapshots,
          positions,
          portfolios,
          transactions,
          events,
          journals,
          analysisTasks
        ] = await Promise.all([
          dataService.getTable('watchlist_items'),
          dataService.getTable('portfolio_snapshots'),
          dataService.getTable('portfolio_positions'),
          dataService.getTable('portfolios'),
          dataService.getTable('transactions'),
          dataService.getTable('events'),
          dataService.getTable('journal_entries'),
          dataService.getTable('analysis_tasks')
        ]);

        if (cancelled) {
          return;
        }

        const focus = buildFocusListFromWatchlist(watchlist.rows);
        setFocusList(focus?.length ? focus : defaultFocusList);
        setPortfolioSummary(computePortfolioSummary(snapshots.rows, positions.rows, portfolios.rows));
        setLedgerHighlights(computeLedgerHighlights(transactions.rows, portfolios.rows));
        setEventsRows(events.rows ?? []);
        setLatestJournal(pickLatestJournalEntry(journals.rows));
        setAnalysisSummary(summarizeAnalysisQueue(analysisTasks.rows));
        setLoadError(null);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load workspace datasets', error);
          setLoadError((previous) => previous ?? error);
        }
      }
    };

    loadWorkspaceData();

    return () => {
      cancelled = true;
    };
  }, [dataService, defaultFocusList]);

  const hasGlobalEvents = useMemo(() => eventsRows.some((event) => !event?.profile_id), [eventsRows]);
  const hasPersonalEvents = useMemo(
    () => eventsRows.some((event) => Boolean(event?.profile_id)),
    [eventsRows]
  );

  useEffect(() => {
    if (eventsScope === 'personal' && !hasPersonalEvents && hasGlobalEvents) {
      setEventsScope('global');
    }
  }, [eventsScope, hasPersonalEvents, hasGlobalEvents]);

  const eventsDigest = useMemo(() => {
    if (!Array.isArray(eventsRows) || eventsRows.length === 0) {
      return null;
    }

    const filtered = eventsRows.filter((event) => {
      if (eventsScope === 'global') {
        return !event?.profile_id;
      }

      if (!profileId) {
        return Boolean(event?.profile_id);
      }

      return event?.profile_id === profileId;
    });

    return computeEventsDigest(filtered);
  }, [eventsRows, eventsScope, profileId]);

  return {
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
    loadError
  };
};

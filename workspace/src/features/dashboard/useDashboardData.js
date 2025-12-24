import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  buildFocusListFromWatchlist,
  computeEventsDigest,
  computeLedgerHighlights,
  computePortfolioSummary,
  pickLatestJournalEntry,
  summarizeAnalysisQueue
} from './dashboardUtils.js';
import { getBoardGamePortfolio, transformBoardGamePortfolioSummary } from '../../services/boardGamePortfolioSync.js';

export const useDashboardData = ({ dataService, profileId, defaultFocusList = [] }) => {
  const [focusList, setFocusList] = useState(defaultFocusList);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [boardGamePortfolioSummary, setBoardGamePortfolioSummary] = useState(null);
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

    const shouldWaitForProfile = dataService?.mode === 'supabase' && !profileId;

    if (shouldWaitForProfile) {
      // Avoid triggering Supabase RLS errors before the authenticated profile is available.
      setLoadError(null);
      return undefined;
    }

    const buildScopedOptions = (table) => {
      const tablesScopedToProfile = new Set([
        'watchlist_items',
        'portfolio_snapshots',
        'portfolio_positions',
        'portfolios',
        'transactions',
        'journal_entries',
        'analysis_tasks',
        'board_game_profiles'
      ]);

      if (!profileId || !tablesScopedToProfile.has(table)) {
        return undefined;
      }

      return { match: { profile_id: profileId } };
    };

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
          analysisTasks,
          boardGameProfile
        ] = await Promise.all([
          dataService.getTable('watchlist_items', buildScopedOptions('watchlist_items')),
          dataService.getTable('portfolio_snapshots', buildScopedOptions('portfolio_snapshots')),
          dataService.getTable('portfolio_positions', buildScopedOptions('portfolio_positions')),
          dataService.getTable('portfolios', buildScopedOptions('portfolios')),
          dataService.getTable('transactions', buildScopedOptions('transactions')),
          dataService.getTable('events'),
          dataService.getTable('journal_entries', buildScopedOptions('journal_entries')),
          dataService.getTable('analysis_tasks', buildScopedOptions('analysis_tasks')),
          getBoardGamePortfolio(dataService, profileId)
        ]);

        if (cancelled) {
          return;
        }

        const focus = buildFocusListFromWatchlist(watchlist.rows);
        setFocusList(focus?.length ? focus : defaultFocusList);
        setPortfolioSummary(computePortfolioSummary(snapshots.rows, positions.rows, portfolios.rows));
        setBoardGamePortfolioSummary(transformBoardGamePortfolioSummary(boardGameProfile));
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
  }, [dataService, defaultFocusList, profileId]);

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
    boardGamePortfolioSummary,
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

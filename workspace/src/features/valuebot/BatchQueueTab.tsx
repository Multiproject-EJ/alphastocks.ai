import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

type AutoRunStatus =
  | { state: 'idle' }
  | { state: 'running' }
  | { state: 'success'; message: string }
  | { state: 'error'; message: string; detail?: string };
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { defaultDeepDiveConfig, ValuebotAutoSettings, ValueBotQueueJob, ValueBotQueueStatus } from './types.ts';
import { getModelOptionsForProvider, providerOptions } from './providerConfig.ts';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed'
};

const AUTO_INTERVAL_MS = 5 * 60 * 1000;

const BatchQueueTab: FunctionalComponent = () => {
  const { user } = useAuth();
  const [queueJobs, setQueueJobs] = useState<ValueBotQueueJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerStatusMessage, setWorkerStatusMessage] = useState<string | null>(null);
  const [isAutoRunLoading, setIsAutoRunLoading] = useState(false);
  const [autoRunStatus, setAutoRunStatus] = useState<AutoRunStatus>({ state: 'idle' });
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<ValueBotQueueJob[]>([]);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);
  const [clearCompletedError, setClearCompletedError] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('');
  const [newCustomQuestion, setNewCustomQuestion] = useState('');
  const [newProvider, setNewProvider] = useState(defaultDeepDiveConfig.provider);
  const [newModel, setNewModel] = useState(defaultDeepDiveConfig.model || '');
  const [showExplainer, setShowExplainer] = useState(false);
  const [autoQueueEnabled, setAutoQueueEnabled] = useState<boolean | null>(null);
  const [isSavingAutoToggle, setIsSavingAutoToggle] = useState(false);
  const [lastAutoRunAt, setLastAutoRunAt] = useState<string | null>(null);
  const [nextRunCountdown, setNextRunCountdown] = useState<string | null>(null);
  const [autoMaxJobs, setAutoMaxJobs] = useState<number | null>(null);
  const [secondsPerJobEstimate, setSecondsPerJobEstimate] = useState<number | null>(null);
  const [isLoadingFromUniverse, setIsLoadingFromUniverse] = useState(false);
  const [universeLoadResult, setUniverseLoadResult] = useState<{ success: boolean; message: string } | null>(null);

  const profileId = user?.id ?? null;
  const modelChoices = useMemo(() => getModelOptionsForProvider(newProvider), [newProvider]);

  const isSupabaseReady = typeof supabase?.from === 'function';

  const loadJobs = useCallback(async () => {
    if (!isSupabaseReady) {
      setError('Supabase is not configured. Connect Supabase to manage the batch queue.');
      setQueueJobs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    let queueQuery = supabase
      .from('valuebot_analysis_queue')
      .select(
        'id, ticker, company_name, status, provider, model, last_run, last_run_at, attempts, error, last_error, created_at, source, user_id'
      )
      .order('created_at', { ascending: true });

    if (profileId) {
      queueQuery = queueQuery.eq('user_id', profileId);
    }

    const { data, error: fetchError } = await queueQuery;

    if (fetchError) {
      setError(fetchError.message || 'Failed to load queue.');
      setQueueJobs([]);
    } else {
      const normalized = ((data as ValueBotQueueJob[]) ?? []).map((job) => {
        const status = (job.status as string) || 'pending';
        const lastRun = (job as any).last_run ?? (job as any).last_run_at ?? null;
        const attempts = typeof job.attempts === 'number' ? job.attempts : 0;
        const error = (job as any).error ?? (job as any).last_error ?? null;

        return {
          ...job,
          status: status as ValueBotQueueStatus,
          last_run: lastRun,
          last_run_at: lastRun,
          attempts,
          error
        } as ValueBotQueueJob;
      });

      setQueueJobs(normalized);
      setCompletedJobs(normalized.filter((job) => job.status === 'completed'));
    }

    setIsLoading(false);
  }, [isSupabaseReady, profileId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const fetchAutoSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/valuebot-auto-settings');
      if (!response.ok) {
        throw new Error(`Failed to load auto queue setting (${response.status})`);
      }
      const payload: ValuebotAutoSettings = await response.json();
      setAutoQueueEnabled(payload?.autoQueueEnabled !== false);
      setLastAutoRunAt(payload?.lastAutoRunAt ?? null);
      if (payload?.maxJobs != null) setAutoMaxJobs(payload.maxJobs);
      if (payload?.secondsPerJobEstimate != null) setSecondsPerJobEstimate(payload.secondsPerJobEstimate);
    } catch (err) {
      console.error('[ValueBot UI] Failed to load auto queue setting', err);
      // Default to enabled to mirror server-side fail-safe.
      setAutoQueueEnabled(true);
    }
  }, []);

  useEffect(() => {
    fetchAutoSettings();
  }, [fetchAutoSettings]);

  const fetchQueue = useCallback(async () => {
    await loadJobs();
  }, [loadJobs]);

  const formatDate = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const handleAddJob = async (event: Event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const ticker = newTicker.trim().toUpperCase();
    const companyName = newCompanyName.trim();
    const timeframe = newTimeframe.trim();
    const customQuestion = newCustomQuestion.trim();

    if (!ticker && !companyName) {
      setFormError('Enter a ticker, a company name, or both.');
      return;
    }

    if (!isSupabaseReady) {
      setFormError('Supabase is not configured.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      ticker: ticker || null,
      company_name: companyName || null,
      provider: newProvider,
      model: newModel?.trim() || null,
      timeframe: timeframe || null,
      custom_question: customQuestion || null,
      status: 'pending' as ValueBotQueueStatus,
      user_id: profileId,
      source: 'manual_queue'
    };

    const { error: insertError } = await supabase.from('valuebot_analysis_queue').insert([payload]);

    if (insertError) {
      setFormError(insertError.message);
    } else {
      setNewTicker('');
      setNewCompanyName('');
      setNewTimeframe('');
      setNewCustomQuestion('');
      setNewProvider(defaultDeepDiveConfig.provider);
      setNewModel(defaultDeepDiveConfig.model || '');
      loadJobs();
    }

    setIsSubmitting(false);
  };

  const handleAutoToggle = useCallback(
    async (nextValue: boolean) => {
      if (autoQueueEnabled === null) return;

      setAutoQueueEnabled(nextValue);
      setIsSavingAutoToggle(true);

      try {
        const response = await fetch('/api/valuebot-auto-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autoQueueEnabled: nextValue })
        });

        if (!response.ok) {
          throw new Error(`Failed to save auto queue setting (${response.status})`);
        }
      } catch (err) {
        console.error('[ValueBot UI] Failed to update auto queue setting', err);
        setAutoQueueEnabled(!nextValue);
        setWorkerStatusMessage('Failed to update auto queue runner setting.');
      } finally {
        setIsSavingAutoToggle(false);
      }
    },
    [autoQueueEnabled]
  );

  const updateJobStatus = async (job: ValueBotQueueJob, status: ValueBotQueueStatus) => {
    if (!isSupabaseReady) {
      setError('Supabase is not configured.');
      return;
    }

    let query = supabase
      .from('valuebot_analysis_queue')
      .update({
        status,
        last_error: null,
        last_run_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (profileId) {
      query = query.eq('user_id', profileId);
    }

    const { error: updateError } = await query;
    if (updateError) {
      setError(updateError.message);
      return;
    }

    loadJobs();
  };

  const handleCancel = async (job: ValueBotQueueJob) => {
    const confirmed = window.confirm('Cancel this queued deep dive?');
    if (!confirmed) return;

    await deleteQueueJob(job.id);
  };

  const handleRequeue = async (job: ValueBotQueueJob) => {
    await updateJobStatus(job, 'pending');
  };

  const deleteQueueJob = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('valuebot_analysis_queue')
      .delete()
      .eq('id', id);

    if (deleteError) setWorkerStatusMessage(deleteError.message);
    else {
      setWorkerStatusMessage('Job deleted from queue.');
      fetchQueue();
    }
  };

  const handleClearCompletedJobs = async () => {
    try {
      setIsClearingCompleted(true);
      setClearCompletedError(null);

      const response = await fetch('/api/valuebot-batch-worker?action=clear_completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'clear_completed' })
      });

      const json = await response.json().catch(() => ({} as any));

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || 'Failed to clear completed jobs');
      }

      setCompletedJobs([]);

      await Promise.all(
        [
          fetchQueue?.(),
          fetchAutoSettings?.()
        ].filter(Boolean)
      );
    } catch (err: any) {
      console.error('[ValueBot] Failed to clear completed jobs', err);
      setClearCompletedError(err?.message || 'Failed to clear completed jobs');
    } finally {
      setIsClearingCompleted(false);
    }
  };

  const handleRunWorkerNow = useCallback(async () => {
    if (workerRunning) return;

    setWorkerRunning(true);
    setWorkerStatusMessage('Worker running…');

    let message: string | null = null;
    let wasSuccessful = false;

    try {
      const response = await fetch('/api/valuebot-batch-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const text = await response.text();
      let payload: any;

      try {
        payload = JSON.parse(text);
      } catch (err) {
        console.error('Worker returned non-JSON response', err, text);
        message = 'Worker request failed. See console for details.';
        return;
      }

      if (payload?.ok === true) {
        wasSuccessful = true;
        message = `Worker finished: processed ${payload.processed} jobs, failed ${payload.failed ?? 0}, remaining ${payload.remaining ?? 'unknown'}.`;
      } else {
        message = `Worker error (${response.status}): ${payload?.error || 'Unexpected error.'}`;
      }
    } catch (networkErr) {
      console.error('Worker request failed', networkErr);
      message = 'Worker request failed. See console for details.';
    } finally {
      if (message) {
        setWorkerStatusMessage(message);
      }
      await fetchQueue();
      if (wasSuccessful && autoQueueEnabled) {
        await fetchAutoSettings();
      }
      setWorkerRunning(false);
    }
  }, [autoQueueEnabled, fetchAutoSettings, fetchQueue, workerRunning]);

  async function handleAutoRunOnce() {
    try {
      setIsAutoRunLoading(true);
      setAutoRunStatus({ state: 'running' });

      const response = await fetch('/api/valuebot-cron-worker?source=ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({} as any));

      if (data?.ok) {
        setAutoRunStatus({ state: 'success', message: data?.message || 'Auto run completed.' });
      } else {
        setAutoRunStatus({
          state: 'error',
          message: data?.message || 'Auto run failed.',
          detail: data?.errorDetail || data?.error || data?.reason
        });
      }

      await Promise.all(
        [
          fetchQueue?.(),
          fetchAutoSettings?.()
        ].filter(Boolean)
      );
    } catch (err) {
      console.error('[ValueBot UI] Auto run once error', err);
      setAutoRunStatus({
        state: 'error',
        message: 'Auto run failed.',
        detail: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsAutoRunLoading(false);
    }
  }

  async function handleLoadFromUniverse() {
    try {
      setIsLoadingFromUniverse(true);
      setUniverseLoadResult(null);

      // First, get unqueued stocks from the universe builder
      const unqueuedResponse = await fetch('/api/universe-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-unqueued-stocks', limit: 3 })
      });

      const unqueuedData = await unqueuedResponse.json();

      if (!unqueuedResponse.ok || !unqueuedData.ok) {
        throw new Error(unqueuedData.error || 'Failed to fetch unqueued stocks');
      }

      if (!unqueuedData.stocks || unqueuedData.stocks.length === 0) {
        setUniverseLoadResult({
          success: false,
          message: 'No stocks available. All stocks are either already queued or analyzed.'
        });
        return;
      }

      // Add the stocks to the queue
      const addResponse = await fetch('/api/universe-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-to-queue',
          stocks: unqueuedData.stocks,
          provider: newProvider,
          model: newModel || null
        })
      });

      const addData = await addResponse.json();

      if (!addResponse.ok || !addData.ok) {
        throw new Error(addData.error || 'Failed to add stocks to queue');
      }

      const messages: string[] = [];
      if (addData.added > 0) {
        const tickerList = addData.stocks.map((s: any) => s.ticker).join(', ');
        messages.push(`✅ Added ${addData.added} stock(s): ${tickerList}`);
      }
      if (addData.skippedInQueue?.length > 0) {
        messages.push(`⚠️ Already in queue: ${addData.skippedInQueue.join(', ')}`);
      }
      if (addData.skippedInUniverse?.length > 0) {
        messages.push(`ℹ️ Already analyzed: ${addData.skippedInUniverse.join(', ')}`);
      }

      setUniverseLoadResult({
        success: addData.added > 0,
        message: messages.join(' | ')
      });

      // Refresh the queue
      await loadJobs();

    } catch (err) {
      console.error('[ValueBot] Load from universe error', err);
      setUniverseLoadResult({
        success: false,
        message: `Failed: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      setIsLoadingFromUniverse(false);
    }
  }

  const pendingOrFailedJobs = useMemo(() => {
    return queueJobs.filter((job) => {
      const status = (job.status as string) || 'pending';
      return status === 'pending' || status === 'running' || status === 'failed';
    });
  }, [queueJobs]);

  const hasPendingOrRunningJobs = useMemo(() => {
    return queueJobs.some((job) => {
      const status = (job.status as string) || 'pending';
      return status === 'pending' || status === 'running';
    });
  }, [queueJobs]);

  const pendingCount = useMemo(
    () => queueJobs.filter((job) => job.status === 'pending').length,
    [queueJobs]
  );

  useEffect(() => {
    if (!autoQueueEnabled) {
      setNextRunCountdown(null);
      return;
    }

    if (!lastAutoRunAt) {
      setNextRunCountdown('Next auto run: awaiting first run…');
      return;
    }

    const computeCountdown = () => {
      const lastRunMs = new Date(lastAutoRunAt).getTime();
      if (Number.isNaN(lastRunMs)) {
        setNextRunCountdown('Next auto run: awaiting schedule…');
        return;
      }

      const delta = AUTO_INTERVAL_MS - (Date.now() - lastRunMs);

      if (delta <= 0) {
        setNextRunCountdown('Next auto run: due any moment…');
        return;
      }

      const minutes = Math.floor(delta / 60000);
      const seconds = Math.floor((delta % 60000) / 1000);
      setNextRunCountdown(`Next auto run in ~${minutes}m ${seconds}s`);
    };

    computeCountdown();
    const timer = setInterval(computeCountdown, 1000);
    return () => clearInterval(timer);
  }, [autoQueueEnabled, lastAutoRunAt]);

  useEffect(() => {
    if (!autoQueueEnabled || !hasPendingOrRunningJobs) return;

    const interval = setInterval(() => {
      fetchQueue();
      fetchAutoSettings();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoQueueEnabled, hasPendingOrRunningJobs, fetchQueue, fetchAutoSettings]);

  const formatLastAutoRun = (value: string | null) => {
    if (!value) return 'not recorded yet.';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'not recorded yet.';

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;

    return date.toLocaleString();
  };

  const completedCount = completedJobs.length;

  const renderStatus = (status: ValueBotQueueStatus) => STATUS_LABELS[status] ?? status;
  const manualButtonLabel = workerRunning ? 'Running…' : 'Manual (1 job)';

  const maxJobsFromServer = autoMaxJobs ?? 0;
  const secondsPerJob = secondsPerJobEstimate ?? 70;
  const jobsPerRun = maxJobsFromServer || 1;
  const estimatedSecondsPerRun = jobsPerRun * secondsPerJob;
  const estimatedMinutesPerRun = Math.round(estimatedSecondsPerRun / 60);
  const cyclesNeeded = maxJobsFromServer > 0 ? Math.ceil(pendingCount / maxJobsFromServer) : 0;
  const totalSecondsAllCycles = cyclesNeeded * estimatedSecondsPerRun;
  const totalMinutesAllCycles = Math.round(totalSecondsAllCycles / 60);
  const totalHoursAllCycles = totalMinutesAllCycles / 60;

  return (
    <div className="valuebot-batch-layout">
      {showExplainer && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal valuebot-batch-explainer-modal">
            <h4>ValueBot automation — batch queue explainer</h4>
            <p className="detail-meta">
              Manage the background queue powering /api/valuebot-batch-worker. Add tickers, monitor progress, and requeue jobs without disrupting your live ValueBot workspace.
            </p>
            <ul className="detail-list">
              <li>Scope queue entries to your account; only your rows are shown.</li>
              <li>Use provider/model defaults from the deep-dive config for consistency.</li>
              <li>Requeue finished or failed jobs to run them again with the worker.</li>
            </ul>
            {!isSupabaseReady && (
              <p className="detail-meta" role="status">
                Supabase credentials are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable queue management.
              </p>
            )}
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => setShowExplainer(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="valuebot-batch-header">
        <h3>Batch queue</h3>
        <button type="button" className="btn-secondary btn-xs" onClick={() => setShowExplainer(true)}>
          What is this?
        </button>
      </div>

      <section className="valuebot-batch-section" aria-label="Add to batch queue">
        <div className="detail-card" role="region">
          <div className="detail-card__header">
            <div>
              <p className="eyebrow">Add jobs</p>
              <h3>Add stocks to deep-dive batch queue</h3>
            </div>
          </div>

          <form className="detail-grid" onSubmit={handleAddJob}>
            <label className="field">
              <span>Ticker</span>
              <input
                type="text"
                placeholder="NVDA"
                value={newTicker}
                onInput={(event) => setNewTicker(event.currentTarget.value)}
              />
            </label>

            <label className="field">
              <span>Company name</span>
              <input
                type="text"
                placeholder="NVIDIA Corporation"
                value={newCompanyName}
                onInput={(event) => setNewCompanyName(event.currentTarget.value)}
              />
            </label>

            <p className="detail-meta" style={{ gridColumn: '1 / -1' }}>
              You can add jobs with just a ticker, just a company name, or both. Use whatever you have.
            </p>

            <label className="field">
              <span>Market / timeframe (optional)</span>
              <input
                type="text"
                placeholder="US • Large Cap"
                value={newTimeframe}
                onInput={(event) => setNewTimeframe(event.currentTarget.value)}
              />
            </label>

            <label className="field">
              <span>Custom note or question (optional)</span>
              <input
                type="text"
                placeholder="Focus on AI data center cycle"
                value={newCustomQuestion}
                onInput={(event) => setNewCustomQuestion(event.currentTarget.value)}
              />
            </label>

            <label className="field">
              <span>Provider</span>
              <select
                value={newProvider}
                onChange={(event) => {
                  setNewProvider(event.currentTarget.value);
                  setNewModel('');
                }}
              >
                {providerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Model</span>
              <select value={newModel} onChange={(event) => setNewModel(event.currentTarget.value)}>
                {modelChoices.map((option) => (
                  <option key={option.value || 'default'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {formError && <p className="form-error" role="alert">{formError}</p>}

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={isSubmitting || !isSupabaseReady}>
                {isSubmitting ? 'Adding…' : 'Add to queue'}
              </button>
              <p className="detail-meta">
                Jobs are inserted into <code>valuebot_analysis_queue</code> with a pending status for the batch worker to process.
              </p>
            </div>
          </form>

          {/* Load from Universe section */}
          <div className="universe-load-section" style={{ marginTop: '24px', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p className="eyebrow">🌐 Global Universe</p>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>Load stocks from Universe Builder</p>
                <p className="detail-meta">
                  Add 3 stocks from your global stock catalog that haven't been analyzed yet.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleLoadFromUniverse}
                disabled={isLoadingFromUniverse}
              >
                {isLoadingFromUniverse ? 'Loading…' : '📋 Load 3 from Universe'}
              </button>
            </div>
            {universeLoadResult && (
              <p
                className="detail-meta"
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: universeLoadResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${universeLoadResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  color: universeLoadResult.success ? '#86efac' : '#fcd34d'
                }}
              >
                {universeLoadResult.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="valuebot-batch-section" aria-label="Queued jobs">
        <div className="detail-card" data-size="wide" role="region">
          <div className="detail-card__header">
            <div>
              <p className="eyebrow">Queue</p>
              <h3>Analysis queue</h3>
              <p className="detail-meta" role="status">
                Auto queue runner: {autoQueueEnabled === null ? 'Loading…' : autoQueueEnabled ? 'ON' : 'OFF'}
              </p>
            </div>
            <div className="pill-list">
              <button className="btn-secondary" type="button" onClick={loadJobs} disabled={isLoading}>
                {isLoading ? 'Loading…' : 'Refresh'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCompletedOpen(true)}
                disabled={completedCount === 0}
              >
                Completed ({completedCount})
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={handleRunWorkerNow}
                disabled={workerRunning || isLoading}
              >
                {manualButtonLabel}
              </button>
            </div>
          </div>

          <p className="detail-meta">
            Jobs are processed by the /api/valuebot-batch-worker in small batches. Use “Manual (1 job)” to trigger a manual run.
          </p>

          <div
            className="valuebot-auto-toggle-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              margin: '12px 0'
            }}
          >
            <label className="valuebot-auto-toggle-label" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontWeight: 600 }}>Auto queue runner</span>
              <span className="detail-meta">
                When enabled, a background GitHub Actions workflow will periodically call the ValueBot worker to process pending jobs.
              </span>
            </label>
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              aria-label="Toggle automatic queue runner"
            >
              <input
                type="checkbox"
                checked={!!autoQueueEnabled}
                disabled={autoQueueEnabled === null || isSavingAutoToggle}
                onChange={(event) => handleAutoToggle(event.currentTarget.checked)}
              />
              <span className="detail-meta">
                {autoQueueEnabled === null ? 'Loading…' : autoQueueEnabled ? 'On' : 'Off'}
                {isSavingAutoToggle ? ' (saving…) ' : ''}
              </span>
            </label>
          </div>

          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-tertiary"
              onClick={handleAutoRunOnce}
              disabled={
                isAutoRunLoading || !autoQueueEnabled || isLoading
              }
            >
              {isAutoRunLoading ? 'Running auto cycle…' : 'Run auto cycle now'}
            </button>

            {autoRunStatus.state === 'running' && (
              <span style={{ fontSize: 12, opacity: 0.8 }}>Auto run in progress…</span>
            )}
            {autoRunStatus.state === 'success' && (
              <span style={{ fontSize: 12, opacity: 0.9 }}>{autoRunStatus.message}</span>
            )}
            {autoRunStatus.state === 'error' && (
              <span style={{ fontSize: 12, opacity: 0.9, color: '#fca5a5', display: 'grid', gap: 2 }}>
                <span>Auto run failed: {autoRunStatus.message}</span>
                {autoRunStatus.detail && (
                  <span style={{ fontSize: 11, opacity: 0.8 }}>
                    {(autoRunStatus.detail || '').slice(0, 140)}
                    {autoRunStatus.detail.length > 140 ? '…' : ''}
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="detail-meta" style={{ margin: '4px 0 12px', display: 'grid', gap: '4px' }}>
            <div>
              <strong>Auto runner:</strong> {autoQueueEnabled === null ? 'Loading…' : autoQueueEnabled ? 'ON' : 'OFF'}
            </div>
            {autoQueueEnabled === false ? (
              <div>Auto runner is OFF.</div>
            ) : (
              <>
                <div>Last auto run: {lastAutoRunAt ? formatLastAutoRun(lastAutoRunAt) : 'not recorded yet.'}</div>
                <div>{nextRunCountdown || 'Next auto run: due any moment…'}</div>
              </>
            )}
          </div>

          {autoMaxJobs !== null && autoMaxJobs > 0 && (
            <div className="detail-meta" style={{ marginTop: '6px', display: 'grid', gap: '4px', fontSize: '12px' }}>
              <div>
                Max jobs per auto run: <strong style={{ color: '#e2e8f0' }}>{autoMaxJobs}</strong>{' '}
                <span style={{ opacity: 0.75 }}>(server setting)</span>
              </div>

              {estimatedMinutesPerRun > 0 && (
                <div>
                  Rough time per auto run:{' '}
                  <strong style={{ color: '#e2e8f0' }}>~{estimatedMinutesPerRun} min</strong>{' '}
                  <span style={{ opacity: 0.75 }}>(assuming ~{secondsPerJob} sec per deep dive)</span>
                </div>
              )}

              {pendingCount > autoMaxJobs && cyclesNeeded > 1 && autoMaxJobs > 0 && (
                <div
                  style={{
                    marginTop: '4px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '8px',
                    color: '#fcd34d'
                  }}
                >
                  You currently have <strong>{pendingCount}</strong> pending jobs. The auto runner will process up to{' '}
                  <strong>{autoMaxJobs}</strong> per cycle, so clearing the queue will likely take about{' '}
                  <strong>
                    {cyclesNeeded} run{cyclesNeeded > 1 ? 's' : ''}
                  </strong>
                  {totalMinutesAllCycles > 0 && (
                    <>
                      {' '}(~{totalMinutesAllCycles} min
                      {totalHoursAllCycles >= 1 && ` ≈ ${totalHoursAllCycles.toFixed(1)} hours`})
                    </>
                  )}
                  .
                </div>
              )}
            </div>
          )}

          {workerStatusMessage && (
            <p className="detail-meta" role="status">
              {workerStatusMessage}
            </p>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {isLoading && <p className="detail-meta">Loading queue…</p>}

          {!isLoading && !error && pendingOrFailedJobs.length === 0 && (
            <p className="detail-meta">No jobs queued yet. Use the form above to add your first ticker.</p>
          )}

          {!isLoading && !error && pendingOrFailedJobs.length > 0 && (
            <div className="valuebot-batch-queue-table">
              <table className="table subtle">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Provider</th>
                    <th>Model</th>
                    <th>Last run</th>
                    <th>Attempts</th>
                    <th>Error</th>
                    <th>Created</th>
                    <th>Source</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {pendingOrFailedJobs.map((job) => {
                    const canRequeue =
                      job.status === 'failed' ||
                      job.status === 'skipped' ||
                      job.status === 'succeeded' ||
                      job.status === 'completed' ||
                      job.status === 'cancelled';
                    const canCancel = job.status === 'pending' || job.status === 'running';
                    const tickerLabel = job.ticker
                      ? job.ticker
                      : job.company_name
                        ? '(no ticker)'
                        : '—';
                    const errorMessage =
                      (job as any)?.error ||
                      (job as any)?.last_error ||
                      (job.status === 'failed' ? 'Failed (no error recorded).' : '—');
                    const statusLabel = renderStatus(job.status);
                    return (
                      <tr key={job.id}>
                        <td>{tickerLabel}</td>
                        <td>{job.company_name || '—'}</td>
                        <td className={`status-pill status-${job.status}`}>{statusLabel}</td>
                        <td>{job.provider || 'default'}</td>
                        <td>{job.model || 'default'}</td>
                        <td>{formatDate((job as any).last_run ?? (job as any).last_run_at ?? null)}</td>
                        <td>{job.attempts ?? 0}</td>
                        <td title={errorMessage}>
                          {errorMessage !== '—'
                            ? errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '…' : '')
                            : '—'}
                        </td>
                        <td>{formatDate(job.created_at)}</td>
                        <td>{job.source || 'manual_queue'}</td>
                        <td>
                          <div className="pill-list">
                            {canRequeue && (
                              <button className="btn-secondary btn-compact" type="button" onClick={() => handleRequeue(job)}>
                                Requeue
                              </button>
                            )}
                            {canCancel && (
                              <button className="btn-tertiary btn-compact" type="button" onClick={() => handleCancel(job)}>
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (!confirm('Delete this job from the queue?')) return;
                                deleteQueueJob(job.id);
                              }}
                              className="btn-danger"
                              disabled={workerRunning}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <CompletedJobsModal
        open={isCompletedOpen}
        onClose={() => setIsCompletedOpen(false)}
        completedJobs={completedJobs}
        onClearCompleted={handleClearCompletedJobs}
        formatDate={formatDate}
        isClearing={isClearingCompleted}
        clearError={clearCompletedError}
      />
    </div>
  );
};

export default BatchQueueTab;

function CompletedJobsModal({
  open,
  onClose,
  completedJobs,
  onClearCompleted,
  formatDate,
  isClearing,
  clearError
}: {
  open: boolean;
  onClose: () => void;
  completedJobs: ValueBotQueueJob[];
  onClearCompleted: () => Promise<void> | void;
  formatDate: (value: string | null) => string;
  isClearing: boolean;
  clearError: string | null;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-5xl rounded-xl bg-slate-900/95 p-5 shadow-2xl border border-slate-800/70"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Queue</p>
            <h3>Completed jobs ({completedJobs.length})</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            aria-label="Close completed jobs"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/70">
          {completedJobs.length === 0 ? (
            <div className="p-4">
              <p className="detail-meta">No completed jobs yet.</p>
            </div>
          ) : (
            <div className="valuebot-batch-queue-table" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="table subtle">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th>Last run</th>
                    <th>Attempts</th>
                    <th>Provider</th>
                    <th>Model</th>
                    <th>Created</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {completedJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.ticker || '—'}</td>
                      <td>{job.company_name || '—'}</td>
                      <td>{formatDate((job as any).last_run_at ?? (job as any).last_run ?? null)}</td>
                      <td>{job.attempts ?? 0}</td>
                      <td>{job.provider || 'openai'}</td>
                      <td>{job.model || 'gpt-4o-mini'}</td>
                      <td>{formatDate(job.created_at)}</td>
                      <td>{job.source || 'manual_queue'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/70 pt-3"
          style={{ position: 'sticky', bottom: 0 }}
        >
          <div className="text-xs text-slate-400">
            {clearError ? (
              <div className="text-red-400">{clearError}</div>
            ) : (
              <span>
                {completedJobs.length === 0
                  ? 'No completed jobs to clear.'
                  : `Completed jobs: ${completedJobs.length}`}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClearCompleted}
              disabled={isClearing || completedJobs.length === 0}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isClearing ? 'Clearing…' : 'Clear completed'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-50 hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

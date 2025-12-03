import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { defaultDeepDiveConfig, ValueBotQueueJob, ValueBotQueueStatus } from './types.ts';
import { getModelOptionsForProvider, providerOptions } from './providerConfig.ts';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  succeeded: 'Completed',
  failed: 'Failed',
  skipped: 'Cancelled',
  cancelled: 'Cancelled'
};

const BatchQueueTab: FunctionalComponent = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ValueBotQueueJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerStatusMessage, setWorkerStatusMessage] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('');
  const [newCustomQuestion, setNewCustomQuestion] = useState('');
  const [newProvider, setNewProvider] = useState(defaultDeepDiveConfig.provider);
  const [newModel, setNewModel] = useState(defaultDeepDiveConfig.model || '');
  const [showExplainer, setShowExplainer] = useState(false);

  const profileId = user?.id ?? null;
  const modelChoices = useMemo(() => getModelOptionsForProvider(newProvider), [newProvider]);

  const isSupabaseReady = typeof supabase?.from === 'function';

  const loadJobs = useCallback(async () => {
    if (!isSupabaseReady) {
      setError('Supabase is not configured. Connect Supabase to manage the batch queue.');
      setJobs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    let query = supabase
      .from('valuebot_analysis_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileId) {
      query = query.eq('user_id', profileId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setJobs([]);
    } else {
      setJobs((data as ValueBotQueueJob[]) ?? []);
    }

    setIsLoading(false);
  }, [isSupabaseReady, profileId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

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

  const updateJobStatus = async (job: ValueBotQueueJob, status: ValueBotQueueStatus) => {
    if (!isSupabaseReady) {
      setError('Supabase is not configured.');
      return;
    }

    let query = supabase
      .from('valuebot_analysis_queue')
      .update({
        status,
        error: null,
        last_run: null
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

    await updateJobStatus(job, 'skipped');
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

  const handleRunWorkerNow = useCallback(async () => {
    if (workerRunning) return;

    setWorkerRunning(true);
    setWorkerStatusMessage('Worker running…');

    let message: string | null = null;

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
        message = `Worker finished: processed ${payload.processed} jobs, remaining ${payload.remaining ?? 'unknown'}.`;
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
      setWorkerRunning(false);
    }
  }, [fetchQueue, workerRunning]);

  const renderStatus = (status: ValueBotQueueStatus) => statusLabels[status] ?? status;

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
        </div>
      </section>

      <section className="valuebot-batch-section" aria-label="Queued jobs">
        <div className="detail-card" data-size="wide" role="region">
          <div className="detail-card__header">
            <div>
              <p className="eyebrow">Queue</p>
              <h3>Analysis queue</h3>
            </div>
            <div className="pill-list">
              <button className="btn-secondary" type="button" onClick={loadJobs} disabled={isLoading}>
                {isLoading ? 'Loading…' : 'Refresh'}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={handleRunWorkerNow}
                disabled={workerRunning || isLoading}
              >
                {workerRunning ? 'Running…' : 'Run worker now'}
              </button>
            </div>
          </div>

          <p className="detail-meta">
            Jobs are processed by the /api/valuebot-batch-worker in small batches. Use “Run worker now” to trigger a manual run.
          </p>

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

          {!isLoading && !error && jobs.length === 0 && (
            <p className="detail-meta">No jobs queued yet. Use the form above to add your first ticker.</p>
          )}

          {!isLoading && !error && jobs.length > 0 && (
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
                  {jobs.map((job) => {
                    const canRequeue =
                      job.status === 'failed' ||
                      job.status === 'skipped' ||
                      job.status === 'succeeded' ||
                      job.status === 'completed' ||
                      job.status === 'cancelled';
                    const canCancel = job.status === 'pending' || job.status === 'running' || job.status === 'failed';
                    const tickerLabel = job.ticker
                      ? job.ticker
                      : job.company_name
                        ? '(no ticker)'
                        : '—';
                    const errorMessage =
                      (job as any)?.error ||
                      job.error ||
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
    </div>
  );
};

export default BatchQueueTab;

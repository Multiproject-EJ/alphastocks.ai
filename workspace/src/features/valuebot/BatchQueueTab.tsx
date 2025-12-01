import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { defaultDeepDiveConfig, ValueBotQueueJob, ValueBotQueueStatus } from './types.ts';
import { getModelOptionsForProvider, providerOptions } from './providerConfig.ts';

const statusLabels: Record<ValueBotQueueStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  succeeded: 'Completed',
  failed: 'Failed',
  skipped: 'Skipped'
};

const BatchQueueTab: FunctionalComponent = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ValueBotQueueJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningWorker, setIsRunningWorker] = useState(false);
  const [workerStatus, setWorkerStatus] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('');
  const [newCustomQuestion, setNewCustomQuestion] = useState('');
  const [newProvider, setNewProvider] = useState(defaultDeepDiveConfig.provider);
  const [newModel, setNewModel] = useState(defaultDeepDiveConfig.model || '');

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
        last_error: null,
        started_at: null,
        completed_at: null,
        last_run_at: null
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

  const renderStatus = (status: ValueBotQueueStatus) => statusLabels[status] ?? status;

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card" role="region" aria-label="Batch queue overview">
        <div className="detail-card__header">
          <div>
            <p className="eyebrow">ValueBot automation</p>
            <h3>Batch queue explainer</h3>
          </div>
        </div>
        <p className="detail-meta">
          Manage the background queue powering /api/valuebot-batch-worker. Add tickers, monitor progress, and requeue jobs
          without disrupting your live ValueBot workspace.
        </p>
        <ul className="detail-list">
          <li>Scope queue entries to your account; only your rows are shown.</li>
          <li>Use provider/model defaults from the deep-dive config for consistency.</li>
          <li>Requeue finished or failed jobs to run them again with the worker.</li>
        </ul>
        {!isSupabaseReady && (
          <p className="detail-meta" role="status">
            Supabase credentials are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable queue
            management.
          </p>
        )}
      </div>

      <div className="detail-card" role="region" aria-label="Add to batch queue">
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
              Jobs are inserted into <code>valuebot_analysis_queue</code> with a pending status for the batch worker to
              process.
            </p>
          </div>
        </form>
      </div>

      <div className="detail-card" data-size="wide" role="region" aria-label="Queued jobs">
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
              onClick={async () => {
                if (isRunningWorker) return;
                setWorkerStatus('Running batch worker…');
                setIsRunningWorker(true);

                try {
                  const response = await fetch('/api/valuebot-batch-worker', { method: 'POST' });
                  const payload = await response.json().catch(() => ({}));

                  if (response.ok && payload?.ok !== false) {
                    const processed = payload?.processed ?? 0;
                    const remaining = payload?.remaining ?? 0;
                    setWorkerStatus(`Worker finished: processed ${processed} jobs, remaining ${remaining}.`);
                    loadJobs();
                  } else {
                    const message = payload?.error || payload?.message || 'Worker request failed.';
                    setWorkerStatus(`Worker failed: ${message}`);
                  }
                } catch (err: any) {
                  setWorkerStatus(`Worker failed: ${err?.message || 'Unexpected error.'}`);
                } finally {
                  setIsRunningWorker(false);
                }
              }}
              disabled={isRunningWorker || isLoading}
            >
              {isRunningWorker ? 'Running…' : 'Run worker now'}
            </button>
          </div>
        </div>

        {workerStatus && (
          <p className="detail-meta" role="status">
            {workerStatus}
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
          <div className="table-wrapper">
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
                  const canRequeue = job.status === 'failed' || job.status === 'skipped' || job.status === 'succeeded';
                  const canCancel = job.status === 'pending' || job.status === 'running' || job.status === 'failed';
                  const tickerLabel = job.ticker || '—';
                  return (
                    <tr key={job.id}>
                      <td>{tickerLabel}</td>
                      <td>{job.company_name || '—'}</td>
                      <td>{renderStatus(job.status)}</td>
                      <td>{job.provider || 'default'}</td>
                      <td>{job.model || 'default'}</td>
                      <td>{formatDate(job.last_run_at)}</td>
                      <td>{job.attempts ?? 0}</td>
                      <td title={job.last_error || ''}>{job.last_error ? job.last_error.slice(0, 60) + (job.last_error.length > 60 ? '…' : '') : '—'}</td>
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
    </div>
  );
};

export default BatchQueueTab;

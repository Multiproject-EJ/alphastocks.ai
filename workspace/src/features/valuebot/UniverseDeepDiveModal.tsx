import { useMemo } from 'preact/hooks';
import { formatDateLabel } from '../dashboard/dashboardUtils.js';
import useFetchDeepDives, { ValueBotDeepDiveRow } from './useFetchDeepDives.ts';

interface UniverseDeepDiveModalProps {
  ticker: string | null;
  companyName?: string | null;
  onClose: () => void;
  onReopenDeepDive: (dive: ValueBotDeepDiveRow) => void;
  userId?: string | null;
}

const UniverseDeepDiveModal = ({ ticker, companyName, onClose, onReopenDeepDive, userId }: UniverseDeepDiveModalProps) => {
  const { deepDives, loading, error, refresh } = useFetchDeepDives(ticker, userId);
  const companyLabel = useMemo(
    () => companyName?.trim() || ticker || 'this ticker',
    [companyName, ticker]
  );

  const snippetFor = (value?: string | null) => {
    const trimmed = value?.trim();
    if (!trimmed) return '';
    return trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card" role="document">
        <div className="modal-header">
          <div>
            <p className="detail-meta">ValueBot Deep Dives</p>
            <h3>
              {ticker} • {companyLabel}
            </h3>
            <p className="detail-meta">
              Saved MASTER analyses from ValueBot Module 6. Re-open them directly from your Investing Universe.
            </p>
          </div>
          <div className="pill-list">
            <button className="btn-secondary" type="button" onClick={refresh} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              className="btn-tertiary modal-close"
              type="button"
              onClick={onClose}
              aria-label="Close deep dive modal"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading && <p className="detail-meta">Loading deep dives…</p>}
          {error && <div className="ai-error">{error}</div>}

          {!loading && !error && (
            <>
              {!deepDives?.length ? (
                <p className="detail-meta">
                  No deep dives saved for {ticker || 'this ticker'} yet. Run Module 6 in ValueBot and click “Save to Universe”
                  to archive the MASTER report here.
                </p>
              ) : (
                <div className="stack" style={{ display: 'grid', gap: '0.75rem' }}>
                  {deepDives.map((dive) => {
                    const hasFinalReport = Boolean(dive?.module6_markdown?.trim());
                    return (
                      <div
                        key={dive.id}
                        style={{
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '0.75rem'
                        }}
                      >
                        <div className="pill-list" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p className="detail-meta" style={{ marginBottom: '0.25rem' }}>
                              {formatDateLabel(dive.created_at)} • {dive.provider || '—'}
                              {dive.model ? ` • ${dive.model}` : ''}
                              {dive.timeframe ? ` • ${dive.timeframe}` : ''}
                            </p>
                            <p className="detail-meta" style={{ marginBottom: '0.5rem' }}>
                              {dive.currency ? `${dive.currency} • ` : ''}Ticker {dive.ticker}
                            </p>
                          </div>
                          <button
                            className={hasFinalReport ? 'btn-primary' : 'btn-secondary'}
                            type="button"
                            onClick={() => onReopenDeepDive(dive)}
                            disabled={!hasFinalReport}
                          >
                            Re-open in ValueBot
                          </button>
                        </div>
                        <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
                          {hasFinalReport
                            ? snippetFor(dive.module6_markdown) || 'MASTER report available.'
                            : 'This deep dive is missing a final report. Re-run Module 6 in ValueBot to regenerate it.'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <p className="detail-meta">
            Loads this saved deep dive into ValueBot so you can review or extend the MASTER analysis without leaving the
            universe view.
          </p>
          <div className="pill-list">
            <button className="btn-secondary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniverseDeepDiveModal;

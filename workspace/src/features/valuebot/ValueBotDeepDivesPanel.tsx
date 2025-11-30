import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import useFetchDeepDivesFromUniverse, { ValueBotDeepDiveSummary } from './useFetchDeepDivesFromUniverse.ts';

interface ValueBotDeepDiveRecord extends ValueBotDeepDiveSummary {
  user_id?: string;
  custom_question?: string | null;
  module0_markdown?: string | null;
  module1_markdown?: string | null;
  module2_markdown?: string | null;
  module3_markdown?: string | null;
  module4_markdown?: string | null;
  module5_markdown?: string | null;
  module6_markdown?: string | null;
  source?: string | null;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const MarkdownBlock = ({ content }: { content?: string | null }) => (
  <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
    {content?.trim() || 'No output saved for this module yet.'}
  </div>
);

const ModuleAccordion = ({
  label,
  content,
  defaultOpen
}: {
  label: string;
  content?: string | null;
  defaultOpen?: boolean;
}) => (
  <details open={defaultOpen} className="module-accordion">
    <summary>{label}</summary>
    <MarkdownBlock content={content} />
  </details>
);

const ValueBotDeepDivesPanel = () => {
  const { user } = useAuth();
  const { deepDives, loading, error, refresh } = useFetchDeepDivesFromUniverse();
  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<string | null>(null);
  const [selectedDeepDive, setSelectedDeepDive] = useState<ValueBotDeepDiveRecord | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'master' | 'modules'>('master');

  const handleSelectDeepDive = useCallback((id: string) => {
    setSelectedDeepDiveId(id);
  }, []);

  useEffect(() => {
    if (deepDives.length === 0) {
      setSelectedDeepDiveId(null);
      setSelectedDeepDive(null);
      return;
    }

    if (selectedDeepDiveId && deepDives.some((item) => item.id === selectedDeepDiveId)) {
      return;
    }

    setSelectedDeepDiveId(deepDives[0].id);
  }, [deepDives, selectedDeepDiveId]);

  const loadDeepDiveDetail = useCallback(
    async (id: string | null) => {
      if (!id) {
        setSelectedDeepDive(null);
        return;
      }

      if (typeof supabase?.from !== 'function') {
        setDetailError('Supabase client is not configured. Add Supabase credentials to view saved deep dives.');
        setSelectedDeepDive(null);
        return;
      }

      setDetailLoading(true);
      setDetailError(null);

      try {
        const baseQuery = supabase.from('valuebot_deep_dives').select('*').eq('id', id).limit(1);
        const query = user?.id ? baseQuery.eq('user_id', user.id) : baseQuery;
        const { data, error: supabaseError } = await query.single();

        if (supabaseError) {
          throw supabaseError;
        }

        setSelectedDeepDive(data ?? null);
      } catch (err) {
        setSelectedDeepDive(null);
        const message = err?.message || 'Unable to load that deep dive right now.';
        setDetailError(message);
      } finally {
        setDetailLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    loadDeepDiveDetail(selectedDeepDiveId);
  }, [loadDeepDiveDetail, selectedDeepDiveId]);

  const companyLabel = (item?: ValueBotDeepDiveSummary | null) =>
    item?.company_name?.trim() || item?.ticker || 'Unknown company';

  const listContent = useMemo(() => {
    if (loading) {
      return <p className="detail-meta">Loading deep dives…</p>;
    }

    if (error) {
      return (
        <div className="ai-error" role="alert">
          <p>{error}</p>
          <button className="btn-secondary" type="button" onClick={refresh} disabled={loading}>
            Retry
          </button>
        </div>
      );
    }

    if (!deepDives.length) {
      return (
        <p className="detail-meta">
          You haven’t saved any ValueBot deep dives yet. Run a deep-dive in the ValueBot tab and click ‘Save to Universe’ in
          Module 6.
        </p>
      );
    }

    return (
      <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table className="table subtle" role="listbox" aria-label="Saved ValueBot deep dives">
          <thead>
            <tr>
              <th scope="col">Ticker</th>
              <th scope="col">Company</th>
              <th scope="col">Created</th>
              <th scope="col">Provider / model</th>
            </tr>
          </thead>
          <tbody>
            {deepDives.map((item) => {
              const isSelected = item.id === selectedDeepDiveId;
              return (
                <tr
                  key={item.id}
                  onClick={() => handleSelectDeepDive(item.id)}
                  aria-selected={isSelected}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(79, 70, 229, 0.08)' : undefined,
                    borderLeft: isSelected ? '3px solid #4f46e5' : undefined
                  }}
                >
                  <td>{item.ticker}</td>
                  <td>{companyLabel(item)}</td>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td>
                    <span className="detail-meta">
                      {item.provider || '—'} {item.model ? `• ${item.model}` : ''}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [loading, error, deepDives, selectedDeepDiveId, handleSelectDeepDive, refresh]);

  const renderMasterTab = () => {
    if (detailLoading) {
      return <p className="detail-meta">Loading deep dive…</p>;
    }

    if (detailError) {
      return (
        <div className="ai-error" role="alert">
          {detailError}
        </div>
      );
    }

    if (!selectedDeepDive) {
      return (
        <div className="placeholder" role="status">
          <h4>No deep dive selected</h4>
          <p className="detail-meta">
            Run a ValueBot 0–6 deep dive and save it from Module 6, then it will appear here.
          </p>
        </div>
      );
    }

    return <MarkdownBlock content={selectedDeepDive.module6_markdown} />;
  };

  const renderModuleBreakdown = () => {
    if (detailLoading) {
      return <p className="detail-meta">Loading modules…</p>;
    }

    if (detailError) {
      return (
        <div className="ai-error" role="alert">
          {detailError}
        </div>
      );
    }

    if (!selectedDeepDive) {
      return (
        <div className="placeholder" role="status">
          <h4>No deep dive selected</h4>
          <p className="detail-meta">
            Run a ValueBot 0–6 deep dive and save it from Module 6, then it will appear here.
          </p>
        </div>
      );
    }

    const modules = [
      { label: 'Module 0 — Data Loader', content: selectedDeepDive.module0_markdown },
      { label: 'Module 1 — Core Risk & Quality Diagnostics', content: selectedDeepDive.module1_markdown },
      { label: 'Module 2 — Business Model & Growth Engine', content: selectedDeepDive.module2_markdown },
      { label: 'Module 3 — Scenario Engine', content: selectedDeepDive.module3_markdown },
      { label: 'Module 4 — Valuation Engine', content: selectedDeepDive.module4_markdown },
      { label: 'Module 5 — Timing & Momentum', content: selectedDeepDive.module5_markdown }
    ];

    return (
      <div className="module-breakdown">
        {modules.map((module, index) => (
          <ModuleAccordion key={module.label} label={module.label} content={module.content} defaultOpen={index === 0} />
        ))}
      </div>
    );
  };

  const renderDetailPanel = () => {
    const dive = selectedDeepDive;

    return (
      <div className="detail-card" style={{ minHeight: '380px' }}>
        <div className="detail-card__header">
          <div>
            <h4>ValueBot Deep Dive</h4>
            {dive ? (
              <p className="detail-meta">
                {dive.ticker} — {companyLabel(dive)} • {formatDateTime(dive?.created_at)}
              </p>
            ) : (
              <p className="detail-meta">Select a deep dive to view the MASTER report and module breakdown.</p>
            )}
          </div>
          <div className="pill-list" aria-label="Deep dive metadata">
            {dive?.provider && <span className="pill">{dive.provider}</span>}
            {dive?.model && <span className="pill">{dive.model}</span>}
            {dive?.timeframe && <span className="pill">{dive.timeframe}</span>}
            {dive?.currency && <span className="pill">{dive.currency}</span>}
          </div>
        </div>

        <div className="tab-list" role="tablist" aria-label="Deep dive detail view">
          <button
            type="button"
            className={activeTab === 'master' ? 'btn-secondary' : 'btn-tertiary'}
            role="tab"
            aria-selected={activeTab === 'master'}
            onClick={() => setActiveTab('master')}
          >
            MASTER report
          </button>
          <button
            type="button"
            className={activeTab === 'modules' ? 'btn-secondary' : 'btn-tertiary'}
            role="tab"
            aria-selected={activeTab === 'modules'}
            onClick={() => setActiveTab('modules')}
          >
            Module breakdown
          </button>
        </div>

        <div className="tab-panel" role="tabpanel">
          {activeTab === 'master' ? renderMasterTab() : renderModuleBreakdown()}
        </div>
      </div>
    );
  };

  return (
    <div className="detail-card" data-size="wide">
      <div className="detail-card__header">
        <div>
          <h3>ValueBot Deep Dives</h3>
          <p className="detail-meta">
            Browse and revisit the deep dives you saved from Module 6. Click a row to open the MASTER report and module outputs.
          </p>
        </div>
        <div className="pill-list">
          <button className="btn-secondary" type="button" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: '1rem' }}>
        <div className="detail-card" style={{ margin: 0 }}>
          <h4>Saved deep dives</h4>
          {listContent}
        </div>
        {renderDetailPanel()}
      </div>
    </div>
  );
};

export default ValueBotDeepDivesPanel;

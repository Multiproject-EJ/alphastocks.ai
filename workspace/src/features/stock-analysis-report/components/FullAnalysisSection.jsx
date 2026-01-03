const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Data freshness thresholds (in days)
const FRESHNESS_THRESHOLD_DAYS = 7;
const STALE_THRESHOLD_DAYS = 30;

const calculateFreshness = (analyzedAt) => {
  if (!analyzedAt) return 'fresh';
  const days = Math.floor((Date.now() - new Date(analyzedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= FRESHNESS_THRESHOLD_DAYS) return 'fresh';
  if (days <= STALE_THRESHOLD_DAYS) return 'stale';
  return 'outdated';
};

const FullAnalysisSection = ({ summary, analysisData }) => {
  if (!summary) return null;
  
  const analyzedAt = analysisData?.analyzed_at;
  const freshness = analysisData?.data_freshness || calculateFreshness(analyzedAt);
  
  const freshnessConfig = {
    fresh: { color: '#22c55e', label: 'Fresh (< 7 days)', icon: '✓' },
    stale: { color: '#f59e0b', label: 'Stale (7-30 days)', icon: '⚠' },
    outdated: { color: '#ef4444', label: 'Outdated (> 30 days)', icon: '⚠' }
  };
  
  const config = freshnessConfig[freshness] || freshnessConfig.fresh;
  
  return (
    <section className="report-section">
      <h2 className="report-section__title">📄 Full Analysis</h2>
      <div className="full-analysis-card">
        <p className="full-analysis-text">{summary}</p>
      </div>
      
      <div className="analysis-metadata">
        <div className="metadata-item">
          <span className="detail-meta">Analyzed</span>
          <span>{formatDate(analyzedAt)}</span>
        </div>
        <div className="metadata-item">
          <span className="detail-meta">Data Freshness</span>
          <span style={{ color: config.color, fontWeight: 600 }}>
            {config.icon} {config.label}
          </span>
        </div>
      </div>
    </section>
  );
};

export default FullAnalysisSection;

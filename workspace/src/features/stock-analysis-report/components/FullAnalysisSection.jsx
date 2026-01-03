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

const calculateFreshness = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const FullAnalysisSection = ({ summary, analyzed_at }) => {
  if (!summary) return null;
  
  return (
    <section className="report-section">
      <h2 className="report-section__title">📄 Full Analysis</h2>
      <div className="full-analysis-card">
        <p className="full-analysis-text">{summary}</p>
      </div>
      
      {analyzed_at && (
        <div className="analysis-metadata">
          <div className="metadata-item">
            <span className="detail-meta">Analyzed</span>
            <span>{formatDate(analyzed_at)}</span>
          </div>
          <div className="metadata-item">
            <span className="detail-meta">Data Freshness</span>
            <span>{calculateFreshness(analyzed_at)}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default FullAnalysisSection;

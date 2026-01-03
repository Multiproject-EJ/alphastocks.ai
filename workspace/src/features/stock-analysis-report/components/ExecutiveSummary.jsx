const renderStars = (label) => {
  const starMap = {
    'Investable': '⭐⭐⭐',
    'Monitor': '⭐⭐',
    'Hedge': '⭐',
    'Avoid': ''
  };
  return starMap[label] || '';
};

const ExecutiveSummary = ({ summary, label }) => {
  if (!summary) return null;
  
  return (
    <section className="report-section">
      <h2 className="report-section__title">🎯 Executive Summary</h2>
      <div className="verdict-card">
        <div className="verdict-card__rating">
          <span className="verdict-card__label">{label || 'Unknown'}</span>
          <div className="verdict-stars">{renderStars(label)}</div>
        </div>
        <p className="verdict-card__summary">{summary}</p>
      </div>
    </section>
  );
};

export default ExecutiveSummary;

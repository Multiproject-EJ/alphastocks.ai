const renderStars = (label) => {
  const starMap = {
    'Investable': '⭐⭐⭐⭐⭐',
    'Monitor': '⭐⭐⭐',
    'Hedge': '⭐',
    'Avoid': ''
  };
  return starMap[label] || '';
};

const ExecutiveSummary = ({ summary, label, analysisData }) => {
  if (!summary) return null;
  
  const rating = analysisData?.verdict_rating;
  const conviction = analysisData?.conviction_level;
  const upside = analysisData?.upside_potential;
  const strengths = analysisData?.key_strengths || [];
  const weaknesses = analysisData?.key_weaknesses || [];
  const catalysts = analysisData?.catalysts || [];
  const redFlags = analysisData?.red_flags || [];
  
  return (
    <section className="report-section">
      <h2 className="report-section__title">🎯 Executive Summary</h2>
      
      <div className="verdict-card">
        <div className="verdict-card__header">
          <div>
            <span className="verdict-card__label">{label || 'Unknown'}</span>
            <div className="verdict-stars">{renderStars(label)}</div>
          </div>
          
          {rating && (
            <div className="verdict-card__score">
              <span className="verdict-card__score-value">{rating}</span>
              <span className="verdict-card__score-label">/100</span>
            </div>
          )}
        </div>
        
        {(conviction || upside) && (
          <div className="verdict-card__meta">
            {conviction && (
              <span className={`conviction-badge conviction-badge--${conviction}`}>
                {conviction.toUpperCase()} CONVICTION
              </span>
            )}
            {upside && (
              <span className="upside-badge">
                +{upside.toFixed(1)}% Upside
              </span>
            )}
          </div>
        )}
        
        <p className="verdict-card__summary">{summary}</p>
      </div>
      
      {/* Key Insights Grid */}
      {(strengths.length > 0 || weaknesses.length > 0 || catalysts.length > 0 || redFlags.length > 0) && (
        <div className="insights-grid">
          {strengths.length > 0 && (
            <div className="insight-card insight-card--positive">
              <h3 className="insight-card__title">
                <span className="insight-card__icon">💪</span>
                Key Strengths
              </h3>
              <ul className="insight-list">
                {strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {weaknesses.length > 0 && (
            <div className="insight-card insight-card--caution">
              <h3 className="insight-card__title">
                <span className="insight-card__icon">⚠️</span>
                Key Weaknesses
              </h3>
              <ul className="insight-list">
                {weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}
          
          {catalysts.length > 0 && (
            <div className="insight-card insight-card--catalyst">
              <h3 className="insight-card__title">
                <span className="insight-card__icon">🚀</span>
                Catalysts
              </h3>
              <ul className="insight-list">
                {catalysts.map((catalyst, idx) => (
                  <li key={idx}>{catalyst}</li>
                ))}
              </ul>
            </div>
          )}
          
          {redFlags.length > 0 && (
            <div className="insight-card insight-card--warning">
              <h3 className="insight-card__title">
                <span className="insight-card__icon">🚩</span>
                Red Flags
              </h3>
              <ul className="insight-list">
                {redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ExecutiveSummary;

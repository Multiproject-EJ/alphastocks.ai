const renderStars = (label) => {
  const starMap = {
    'Investable': '⭐⭐⭐⭐⭐',
    'Monitor': '⭐⭐⭐',
    'Hedge': '⭐',
    'Avoid': ''
  };
  return starMap[label] || '';
};

const calculateUpside = (valuation) => {
  if (!valuation?.base) return 0;
  // Assume current price is base - 10% for demo
  const currentPrice = valuation.base * 0.9;
  return ((valuation.base - currentPrice) / currentPrice) * 100;
};

const ReportHeader = ({ symbol, label, valuation, analysisData, onClose }) => {
  const basePrice = valuation?.base || 0;
  const upside = analysisData?.upside_potential || calculateUpside(valuation);
  const rating = analysisData?.verdict_rating;
  
  return (
    <div className="report-header">
      <div className="report-header__content">
        <div>
          <h1 className="report-header__ticker">{symbol || 'N/A'}</h1>
          <div className="report-header__label">
            <span>{label || 'Unknown'}</span>
            <span className="verdict-stars">{renderStars(label)}</span>
            {rating && (
              <span className="rating-badge">{rating}/100</span>
            )}
          </div>
        </div>
        {valuation && valuation.base && (
          <div className="report-header__valuation">
            <span className="detail-meta">Base Target</span>
            <span className="report-header__price">${basePrice}</span>
            {upside > 0 && typeof upside === 'number' && (
              <span className="report-header__upside">
                +{upside.toFixed(1)}% upside
              </span>
            )}
          </div>
        )}
      </div>
      <button 
        className="report-header__close"
        onClick={onClose}
        aria-label="Close analysis report"
      >
        ✕
      </button>
    </div>
  );
};

export default ReportHeader;

const renderStars = (label) => {
  const starMap = {
    'Investable': '⭐⭐⭐',
    'Monitor': '⭐⭐',
    'Hedge': '⭐',
    'Avoid': ''
  };
  return starMap[label] || '';
};

const calculateUpside = (valuation, currentPrice = null) => {
  if (!valuation || !valuation.base) return '0';
  // If no current price is provided, we'll calculate upside from bear case
  const basePrice = currentPrice || valuation.bear || valuation.base;
  const upside = ((valuation.base - basePrice) / basePrice) * 100;
  return Math.round(upside);
};

const ReportHeader = ({ symbol, label, valuation, onClose }) => {
  return (
    <div className="report-header">
      <div className="report-header__content">
        <div>
          <h1 className="report-header__ticker">{symbol || 'N/A'}</h1>
          <div className="report-header__label">
            {label || 'Unknown'} {renderStars(label)}
          </div>
        </div>
        {valuation && valuation.base && (
          <div className="report-header__valuation">
            <span className="detail-meta">Base Target</span>
            <span className="report-header__price">${valuation.base}</span>
            <span className="report-header__upside">
              {calculateUpside(valuation)}% upside
            </span>
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

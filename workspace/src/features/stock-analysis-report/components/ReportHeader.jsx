import { useState } from 'preact/hooks';
import ShareMenu from './ShareMenu.jsx';

// Inline SVG Icon for ShareNetwork
const ShareNetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z"></path>
  </svg>
);

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
  // Demo calculation: assumes current price is 10% below base target
  // In production, this should use actual current market price
  const currentPrice = valuation.base * 0.9;
  return ((valuation.base - currentPrice) / currentPrice) * 100;
};

const ReportHeader = ({ symbol, label, valuation, analysisData, onClose }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
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
      
      <div className="report-header__actions">
        <button 
          className="report-header__share"
          onClick={() => setShowShareMenu(true)}
          aria-label="Share analysis"
        >
          <ShareNetworkIcon />
        </button>
        <button 
          className="report-header__close"
          onClick={onClose}
          aria-label="Close analysis report"
        >
          ✕
        </button>
      </div>
      
      {showShareMenu && (
        <ShareMenu 
          symbol={symbol} 
          onClose={() => setShowShareMenu(false)} 
        />
      )}
    </div>
  );
};

export default ReportHeader;

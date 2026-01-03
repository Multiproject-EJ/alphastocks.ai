const calculatePercentageFromBase = (price, basePrice) => {
  if (!price || !basePrice) return '0';
  const change = ((price - basePrice) / basePrice) * 100;
  return Math.abs(Math.round(change));
};

const ValuationSection = ({ valuation }) => {
  if (!valuation) return null;

  return (
    <section className="report-section">
      <h2 className="report-section__title">💰 Valuation Scenarios</h2>
      <div className="valuation-grid">
        <div className="valuation-card valuation-card--bear">
          <div className="valuation-card__icon">🐻</div>
          <div className="valuation-card__label">Bear Case</div>
          <div className="valuation-card__price">${valuation.bear}</div>
          <div className="valuation-card__change">
            -{calculatePercentageFromBase(valuation.bear, valuation.base)}%
          </div>
        </div>
        
        <div className="valuation-card valuation-card--base">
          <div className="valuation-card__icon">🎯</div>
          <div className="valuation-card__label">Base Case</div>
          <div className="valuation-card__price">${valuation.base}</div>
          <div className="valuation-card__change">Target</div>
        </div>
        
        <div className="valuation-card valuation-card--bull">
          <div className="valuation-card__icon">🐂</div>
          <div className="valuation-card__label">Bull Case</div>
          <div className="valuation-card__price">${valuation.bull}</div>
          <div className="valuation-card__change">
            +{calculatePercentageFromBase(valuation.bull, valuation.base)}%
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuationSection;

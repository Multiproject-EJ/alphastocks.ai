import { FunctionalComponent } from 'preact';
import { ValueBotMasterMeta } from '../types.ts';

interface VerdictCardProps {
  ticker: string;
  companyName?: string;
  masterMeta?: ValueBotMasterMeta | null;
  valuationRanges?: {
    bear?: string;
    base?: string;
    bull?: string;
  } | null;
}

/**
 * VerdictCard - A visual "snapshot" card inspired by collectible card design.
 * Displays key analysis metrics in an engaging, at-a-glance format.
 */
const VerdictCard: FunctionalComponent<VerdictCardProps> = ({
  ticker,
  companyName,
  masterMeta,
  valuationRanges
}) => {
  const displayName = companyName || ticker;
  const compositeScore = masterMeta?.composite_score ?? null;
  const riskLabel = masterMeta?.risk_label || 'Unknown';
  const qualityLabel = masterMeta?.quality_label || 'Unknown';
  const timingLabel = masterMeta?.timing_label || 'Unknown';

  // Determine card color theme based on composite score
  const getScoreGrade = (score: number | null): string => {
    if (score === null) return 'average';
    if (score >= 9) return 'world-class';
    if (score >= 7) return 'strong';
    if (score >= 5) return 'average';
    return 'weak';
  };

  const scoreGrade = getScoreGrade(compositeScore);

  // Format valuation range for display
  const formatValuationRange = (): string => {
    if (!valuationRanges?.base) return 'Not available';
    return valuationRanges.base;
  };

  return (
    <div className={`verdict-card verdict-card--${scoreGrade}`}>
      {/* Header - Company/Ticker */}
      <div className="verdict-card__header">
        <div className="verdict-card__ticker">{ticker}</div>
        {companyName && companyName !== ticker && (
          <div className="verdict-card__company-name">{companyName}</div>
        )}
      </div>

      {/* Main Score - Composite */}
      <div className="verdict-card__score-container">
        <div className="verdict-card__score-label">Composite Score</div>
        <div className="verdict-card__score-value">
          {compositeScore !== null && compositeScore !== undefined ? compositeScore.toFixed(1) : '—'}
          <span className="verdict-card__score-max">/10</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="verdict-card__metrics">
        <div className="verdict-card__metric">
          <div className="verdict-card__metric-label">Risk</div>
          <div className="verdict-card__metric-value">{riskLabel}</div>
        </div>
        <div className="verdict-card__metric">
          <div className="verdict-card__metric-label">Quality</div>
          <div className="verdict-card__metric-value">{qualityLabel}</div>
        </div>
        <div className="verdict-card__metric">
          <div className="verdict-card__metric-label">Timing</div>
          <div className="verdict-card__metric-value">{timingLabel}</div>
        </div>
      </div>

      {/* Valuation Insight */}
      <div className="verdict-card__footer">
        <div className="verdict-card__footer-label">Base Valuation</div>
        <div className="verdict-card__footer-value">{formatValuationRange()}</div>
      </div>
    </div>
  );
};

export default VerdictCard;

import ReportHeader from './components/ReportHeader.jsx';
import ExecutiveSummary from './components/ExecutiveSummary.jsx';
import ValuationSection from './components/ValuationSection.jsx';
import PorterForcesSection from './components/PorterForcesSection.jsx';
import StressTestsSection from './components/StressTestsSection.jsx';
import FullAnalysisSection from './components/FullAnalysisSection.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import './styles/stock-analysis-report.css';

/**
 * StockAnalysisReport Component
 * 
 * A mobile-first, scrollable modal that displays comprehensive Protools analysis data.
 * 
 * NOTE: This component depends on global CSS classes from app.css:
 * - .modal-backdrop: Modal overlay backdrop
 * - .detail-meta: Secondary text styling
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onOpenChange - Callback to handle modal open/close state
 * @param {Object} props.analysisData - Analysis data object
 * @param {string} props.analysisData.symbol - Stock ticker symbol
 * @param {string} props.analysisData.label - Investment label ("Investable", "Monitor", etc.)
 * @param {string} props.analysisData.summary - Executive summary text
 * @param {Object} props.analysisData.valuation - Valuation scenarios (base, bull, bear)
 * @param {Object} props.analysisData.porter_forces - Porter's Five Forces analysis
 * @param {Array} props.analysisData.stress_tests - Array of stress test scenarios
 * @param {string} props.analysisData.analyzed_at - Timestamp of analysis
 * @param {boolean} props.loading - Loading state
 * @param {string|null} props.error - Error message
 */
export default function StockAnalysisReport({ 
  open, 
  onOpenChange, 
  analysisData, 
  loading = false,
  error = null 
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stock-analysis-report" role="document">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onClose={() => onOpenChange(false)} />
        ) : analysisData ? (
          <>
            <ReportHeader 
              symbol={analysisData.symbol}
              label={analysisData.label}
              valuation={analysisData.valuation}
              onClose={() => onOpenChange(false)}
            />
            
            <div className="report-scroll-content">
              <ExecutiveSummary 
                summary={analysisData.summary} 
                label={analysisData.label} 
              />
              <ValuationSection valuation={analysisData.valuation} />
              <PorterForcesSection forces={analysisData.porter_forces} />
              <StressTestsSection tests={analysisData.stress_tests} />
              <FullAnalysisSection 
                summary={analysisData.summary}
                analyzedAt={analysisData.created_at}
              />
            </div>
          </>
        ) : (
          <ErrorState 
            error="No data available" 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </div>
    </div>
  );
}

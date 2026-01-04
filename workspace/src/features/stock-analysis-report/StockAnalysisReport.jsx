import { useEffect, useRef } from 'preact/hooks';
import ReportHeader from './components/ReportHeader.jsx';
import ExecutiveSummary from './components/ExecutiveSummary.jsx';
import ValuationSection from './components/ValuationSection.jsx';
import PorterForcesSection from './components/PorterForcesSection.jsx';
import StressTestsSection from './components/StressTestsSection.jsx';
import FullAnalysisSection from './components/FullAnalysisSection.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import { 
  setupSwipeToClose, 
  setupPullToRefresh, 
  lockBodyScroll, 
  setupBackButtonHandler,
  triggerHaptic 
} from './utils/gestures.js';
import './styles/stock-analysis-report.css';

/**
 * StockAnalysisReport Component
 * 
 * A mobile-first, scrollable modal that displays comprehensive Protools analysis data.
 * Now with mobile gesture support: swipe-to-close, pull-to-refresh, haptic feedback,
 * body scroll lock, and Android back button handling.
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
 * @param {string} props.analysisData.created_at - Timestamp of analysis creation
 * @param {boolean} props.loading - Loading state
 * @param {string|null} props.error - Error message
 * @param {Function} props.onRefresh - Optional callback for pull-to-refresh
 */
export default function StockAnalysisReport({ 
  open, 
  onOpenChange, 
  analysisData, 
  loading = false,
  error = null,
  onRefresh = null
}) {
  const reportRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  useEffect(() => {
    if (!open) return;
    
    // Lock body scroll when modal opens
    lockBodyScroll(true);
    triggerHaptic('light');
    
    const cleanupFunctions = [];
    
    // Setup swipe-to-close gesture
    if (reportRef.current) {
      const cleanup = setupSwipeToClose(reportRef.current, () => {
        onOpenChange(false);
      });
      cleanupFunctions.push(cleanup);
    }
    
    // Setup pull-to-refresh gesture if callback is provided
    if (scrollContainerRef.current && onRefresh) {
      const cleanup = setupPullToRefresh(scrollContainerRef.current, onRefresh);
      cleanupFunctions.push(cleanup);
    }
    
    // Setup Android back button handler
    const backButtonCleanup = setupBackButtonHandler(() => {
      onOpenChange(false);
    });
    cleanupFunctions.push(backButtonCleanup);
    
    // Cleanup function
    return () => {
      lockBodyScroll(false);
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [open, onOpenChange, onRefresh]);
  
  if (!open) return null;

  const handleClose = () => {
    triggerHaptic('light');
    onOpenChange(false);
  };

  return (
    <div 
      className="modal-backdrop" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target.classList.contains('modal-backdrop')) {
          handleClose();
        }
      }}
    >
      <div 
        className="stock-analysis-report" 
        role="document"
        ref={reportRef}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onClose={handleClose} />
        ) : analysisData ? (
          <>
            <ReportHeader 
              symbol={analysisData.symbol}
              label={analysisData.label}
              valuation={analysisData.valuation}
              analysisData={analysisData}
              onClose={handleClose}
            />
            
            <div className="report-scroll-content" ref={scrollContainerRef}>
              <ExecutiveSummary 
                summary={analysisData.summary} 
                label={analysisData.label}
                analysisData={analysisData}
              />
              <ValuationSection valuation={analysisData.valuation} />
              <PorterForcesSection forces={analysisData.porter_forces} />
              <StressTestsSection tests={analysisData.stress_tests} />
              <FullAnalysisSection 
                summary={analysisData.summary}
                analysisData={analysisData}
              />
            </div>
          </>
        ) : (
          <ErrorState 
            error="No data available" 
            onClose={handleClose} 
          />
        )}
      </div>
    </div>
  );
}

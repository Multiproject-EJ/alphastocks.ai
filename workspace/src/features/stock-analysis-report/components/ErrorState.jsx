export default function ErrorState({ error, onClose }) {
  return (
    <>
      <div className="report-header">
        <h1 className="report-header__ticker">Analysis Not Found</h1>
        <button 
          className="report-header__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      
      <div className="report-scroll-content">
        <div className="report-section">
          <div className="error-state">
            <div className="error-state__icon">⚠️</div>
            <h2 className="error-state__title">No Analysis Available</h2>
            <p className="error-state__message">{error}</p>
            <p className="detail-meta">
              To generate a full analysis report, run ValueBot Module 6 
              and save the MASTER report to your universe.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

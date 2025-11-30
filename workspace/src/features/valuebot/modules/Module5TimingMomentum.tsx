import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module5TimingMomentum: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 5 — Timing &amp; Momentum</h3>
        <p className="detail-meta">Blend technicals, catalysts, and positioning data to calibrate entry points.</p>
        <p className="detail-meta">Will merge price history with valuation ranges in a later step.</p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
        {context.timingNotes && <p className="detail-meta">Timing notes: {context.timingNotes}</p>}
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 5 – Timing &amp; Momentum (coming soon)
        </button>
        <p className="detail-meta">Momentum overlays and alerts will activate later.</p>
      </div>
    </div>
  );
};

export default Module5TimingMomentum;

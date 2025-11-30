import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module4ValuationEngine: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 4 — Valuation Engine (DCF + Reverse Engineering)</h3>
        <p className="detail-meta">Translate scenarios into intrinsic value ranges with forward and reverse math.</p>
        <p className="detail-meta">Ready to accept scenario outputs once wired.</p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
        {context.valuationNotes && <p className="detail-meta">Valuation notes: {context.valuationNotes}</p>}
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 4 – Valuation Engine (coming soon)
        </button>
        <p className="detail-meta">DCF, reverse engineering, and comps will be added here.</p>
      </div>
    </div>
  );
};

export default Module4ValuationEngine;

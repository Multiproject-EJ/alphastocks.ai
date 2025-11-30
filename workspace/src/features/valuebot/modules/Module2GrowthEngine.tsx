import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module2GrowthEngine: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 2 — Business Model &amp; Growth Engine</h3>
        <p className="detail-meta">Map how revenue, unit economics, and reinvestment create or erode advantage.</p>
        <p className="detail-meta">Will ingest Module 1 outputs when available.</p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
        {context.growthNarrative && <p className="detail-meta">Story so far: {context.growthNarrative}</p>}
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 2 – Growth Engine (coming soon)
        </button>
        <p className="detail-meta">Growth playbooks and flywheels will be generated later.</p>
      </div>
    </div>
  );
};

export default Module2GrowthEngine;

import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module3ScenarioEngine: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 3 — Scenario Engine (Bear / Base / Bull)</h3>
        <p className="detail-meta">Spin parallel futures with transparent assumptions for quick “what if” pivots.</p>
        <p className="detail-meta">Will leverage diagnostics and growth notes once they exist.</p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
        {context.scenarioNotes && <p className="detail-meta">Scenario memo: {context.scenarioNotes}</p>}
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 3 – Scenario Engine (coming soon)
        </button>
        <p className="detail-meta">Scenario math and visuals will plug in later.</p>
      </div>
    </div>
  );
};

export default Module3ScenarioEngine;

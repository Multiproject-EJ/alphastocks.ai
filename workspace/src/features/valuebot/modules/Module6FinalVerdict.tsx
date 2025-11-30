import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module6FinalVerdict: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 6 — Final Verdict Synthesizer</h3>
        <p className="detail-meta">Turn all prior module outputs into a concise verdict and scorecard.</p>
        <p className="detail-meta">Uses the full ValueBot analysis context once populated.</p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
        {context.finalVerdict && <p className="detail-meta">Draft verdict: {context.finalVerdict}</p>}
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 6 – Final Verdict (coming soon)
        </button>
        <p className="detail-meta">Scorecards and narratives will ship in future steps.</p>
      </div>
    </div>
  );
};

export default Module6FinalVerdict;

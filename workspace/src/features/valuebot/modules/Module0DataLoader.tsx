import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module0DataLoader: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 0 — Data Loader (Pre-Step)</h3>
        <p className="detail-meta">
          Aggregate raw inputs before any analysis starts so the copilot has a clean foundation.
        </p>
        <p className="detail-meta">
          {context.ticker ? `Preparing data for ${context.ticker}` : 'Ticker and company context will populate here.'}
        </p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 0 – Data Loader (coming soon)
        </button>
        <p className="detail-meta">AI automation will land here once wired up.</p>
      </div>
    </div>
  );
};

export default Module0DataLoader;

import { FunctionalComponent } from 'preact';
import { ValueBotModuleProps } from '../types.ts';

const Module1CoreDiagnostics: FunctionalComponent<ValueBotModuleProps> = ({ context }) => {
  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 1 — Core Risk &amp; Quality Diagnostics</h3>
        <p className="detail-meta">Assess durability, governance, and downside guardrails before sizing conviction.</p>
        <p className="detail-meta">Context will carry forward from prior modules once available.</p>
      </div>
      <div className="detail-card">
        <h4>Inputs</h4>
        <p>Inputs / parameters will go here.</p>
      </div>
      <div className="detail-card">
        <h4>Outputs</h4>
        <p>Module analysis results will appear here.</p>
        {context.riskQualitySummary && (
          <p className="detail-meta">Existing notes: {context.riskQualitySummary}</p>
        )}
      </div>
      <div className="detail-card">
        <button type="button" className="btn-primary" disabled>
          Run Module 1 – Core Risk &amp; Quality (coming soon)
        </button>
        <p className="detail-meta">AI scoring and narratives will be wired in next.</p>
      </div>
    </div>
  );
};

export default Module1CoreDiagnostics;

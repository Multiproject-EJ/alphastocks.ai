export interface ValueBotAnalysisContext {
  ticker?: string;
  companyName?: string;
  market?: string;
  currentPrice?: number;
  rawDataLoaded?: boolean;
  riskQualitySummary?: string;
  growthNarrative?: string;
  scenarioNotes?: string;
  valuationNotes?: string;
  timingNotes?: string;
  finalVerdict?: string;
}

export interface ValueBotModuleProps {
  context: ValueBotAnalysisContext;
  onUpdateContext?: (updates: Partial<ValueBotAnalysisContext>) => void;
}

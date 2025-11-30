export interface ValueBotAnalysisContext {
  provider?: string | null;
  model?: string | null;
  ticker?: string | null;
  timeframe?: string | null;
  customQuestion?: string | null;
  module0Data?: string | null;
  module1Markdown?: string | null;
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
  setContext?: (context: ValueBotAnalysisContext) => void;
}

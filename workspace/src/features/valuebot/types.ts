export interface ValueBotDeepDiveConfig {
  provider: string;
  model?: string | null;
  ticker: string;
  timeframe?: string | null;
  customQuestion?: string | null;
}

export interface ValueBotAnalysisContext {
  deepDiveConfig: ValueBotDeepDiveConfig;
  module0Output?: string | null;
  module1Output?: string | null;
  module2Output?: string | null;
  module3Output?: string | null;
  module4Output?: string | null;
  module5Output?: string | null;
  module6Output?: string | null;
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

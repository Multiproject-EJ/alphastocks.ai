import { createContext } from 'preact';

export interface ValueBotDeepDiveConfig {
  provider: string;
  model?: string | null;
  ticker?: string | null;
  companyName?: string | null;
  currency?: string | null;
  timeframe?: string | null;
  customQuestion?: string | null;
  profileId?: string | null;
}

export interface ValueBotPipelineResult {
  ticker: string;
  companyName?: string | null;
  market?: string | null;
  provider: string;
  model?: string | null;
  masterMarkdown?: string | null;
  module0Markdown: string;
  module1Markdown: string;
  module2Markdown: string;
  module3Markdown: string;
  module4Markdown: string;
  module5Markdown: string;
  module6Markdown: string;
  masterMeta?: {
    risk_label?: string | null;
    quality_label?: string | null;
    timing_label?: string | null;
    composite_score?: number | null;
  } | null;
}

export type DeepDivePipelineStatus = 'idle' | 'running' | 'success' | 'error';

export type DeepDiveStepStatus = 'pending' | 'running' | 'done' | 'error';

export interface DeepDiveStepProgress {
  status: DeepDiveStepStatus;
  attempts?: number;
  lastError?: string | null;
}

export interface DeepDivePipelineSteps {
  module0: DeepDiveStepProgress;
  module1: DeepDiveStepProgress;
  module2: DeepDiveStepProgress;
  module3: DeepDiveStepProgress;
  module4: DeepDiveStepProgress;
  module5: DeepDiveStepProgress;
  module6: DeepDiveStepProgress;
  scoreSummary: DeepDiveStepProgress;
}

export interface DeepDivePipelineProgress {
  status: DeepDivePipelineStatus;
  currentStep: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
  steps: DeepDivePipelineSteps;
  errorMessage?: string | null;
}

export type DeepDivePipelineStep =
  | 'module0'
  | 'module1'
  | 'module2'
  | 'module3'
  | 'module4'
  | 'module5'
  | 'module6'
  | 'scoreSummary';

export type ValueBotMasterMeta = {
  risk_label: string;
  quality_label: string;
  timing_label: string;
  composite_score: number;
};

export interface InvestmentUniverseRow {
  id: string;
  profile_id: string | null;
  symbol: string | null;
  name?: string | null;
  created_at?: string | null;
  last_deep_dive_at?: string | null;
  last_risk_label?: string | null;
  last_quality_label?: string | null;
  last_timing_label?: string | null;
  last_composite_score?: number | string | null;
  last_model?: string | null;
}

export type ValueBotQueueStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ValueBotQueueJob {
  id: string;
  created_at: string;
  user_id: string | null;
  ticker: string | null;
  company_name: string | null;
  provider: string;
  model: string | null;
  timeframe: string | null;
  custom_question: string | null;
  status: ValueBotQueueStatus;
  priority: number;
  attempts: number;
  last_error: string | null;
  error?: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_run?: string | null;
  last_run_at: string | null;
  deep_dive_id: string | null;
  source: string;
}

export interface ValueBotAnalysisContext {
  deepDiveConfig: ValueBotDeepDiveConfig;
  module0OutputMarkdown?: string | null;
  module0Data?: any;
  module1OutputMarkdown?: string | null;
  module2Markdown?: string | null;
  module3Markdown?: string | null;
  module4Markdown?: string;
  module5Markdown?: string;
  module6Markdown?: string;
  module3Output?: string | null;
  module4Output?: string | null;
  module5Output?: string | null;
  module6Output?: string | null;
  ticker?: string | null;
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
  masterMarkdown?: string | null;
  masterMeta?: ValueBotMasterMeta | null;
  resolvedIdentifiers?: { effectiveTicker?: string; effectiveCompanyName?: string } | null;
  lastPipelineResult?: { masterMarkdown?: string | null; masterMeta?: ValueBotMasterMeta | null } | null;
  pipelineProgress?: DeepDivePipelineProgress;
}

export interface ValueBotModuleProps {
  context?: ValueBotAnalysisContext;
  onUpdateContext?: (updates: Partial<ValueBotAnalysisContext>) => void;
  setContext?: (context: ValueBotAnalysisContext) => void;
}

export const defaultDeepDiveConfig: ValueBotDeepDiveConfig = {
  provider: 'openai',
  model: '',
  ticker: '',
  companyName: '',
  currency: '',
  timeframe: '',
  customQuestion: '',
  profileId: null
};

export const createDefaultStepProgress = (): DeepDiveStepProgress => ({
  status: 'pending',
  attempts: 0,
  lastError: null
});

export const createDefaultPipelineSteps = (): DeepDivePipelineSteps => ({
  module0: createDefaultStepProgress(),
  module1: createDefaultStepProgress(),
  module2: createDefaultStepProgress(),
  module3: createDefaultStepProgress(),
  module4: createDefaultStepProgress(),
  module5: createDefaultStepProgress(),
  module6: createDefaultStepProgress(),
  scoreSummary: createDefaultStepProgress()
});

export const defaultPipelineProgress: DeepDivePipelineProgress = {
  status: 'idle',
  currentStep: null,
  steps: createDefaultPipelineSteps(),
  errorMessage: null
};

export const defaultValueBotAnalysisContext: ValueBotAnalysisContext = {
  deepDiveConfig: { ...defaultDeepDiveConfig },
  module0OutputMarkdown: null,
  module0Data: null,
  module1OutputMarkdown: null,
  module2Markdown: '',
  module3Markdown: '',
  module4Markdown: '',
  module5Markdown: '',
  module6Markdown: '',
  masterMarkdown: '',
  module3Output: null,
  module4Output: null,
  module5Output: null,
  module6Output: null,
  ticker: '',
  companyName: '',
  market: '',
  currentPrice: null,
  rawDataLoaded: false,
  riskQualitySummary: '',
  growthNarrative: '',
  scenarioNotes: '',
  valuationNotes: '',
  timingNotes: '',
  finalVerdict: '',
  masterMeta: null,
  resolvedIdentifiers: null,
  lastPipelineResult: null,
  pipelineProgress: { ...defaultPipelineProgress }
};

export interface ValueBotContextValue {
  context: ValueBotAnalysisContext;
  updateContext: (updates: Partial<ValueBotAnalysisContext>) => void;
  setPipelineProgress: (
    progress:
      | DeepDivePipelineProgress
      | ((prev: DeepDivePipelineProgress) => DeepDivePipelineProgress)
  ) => void;
}

export const ValueBotContext = createContext<ValueBotContextValue | null>(null);

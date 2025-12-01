import { createContext } from 'preact';

export interface ValueBotDeepDiveConfig {
  provider: string;
  model?: string | null;
  ticker: string;
  timeframe?: string | null;
  customQuestion?: string | null;
}

export type DeepDivePipelineStatus = 'idle' | 'running' | 'success' | 'error';

export type DeepDiveStepStatus = 'pending' | 'running' | 'done' | 'error';

export interface DeepDivePipelineProgress {
  status: DeepDivePipelineStatus;
  currentStep: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
  steps: {
    module0: DeepDiveStepStatus;
    module1: DeepDiveStepStatus;
    module2: DeepDiveStepStatus;
    module3: DeepDiveStepStatus;
    module4: DeepDiveStepStatus;
    module5: DeepDiveStepStatus;
    module6: DeepDiveStepStatus;
    scoreSummary: DeepDiveStepStatus;
  };
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

export interface ValueBotAnalysisContext {
  deepDiveConfig: ValueBotDeepDiveConfig;
  module0OutputMarkdown?: string | null;
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
  masterMeta?: ValueBotMasterMeta | null;
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
  timeframe: '',
  customQuestion: ''
};

export const defaultPipelineProgress: DeepDivePipelineProgress = {
  status: 'idle',
  currentStep: null,
  steps: {
    module0: 'pending',
    module1: 'pending',
    module2: 'pending',
    module3: 'pending',
    module4: 'pending',
    module5: 'pending',
    module6: 'pending',
    scoreSummary: 'pending'
  },
  errorMessage: null
};

export const defaultValueBotAnalysisContext: ValueBotAnalysisContext = {
  deepDiveConfig: { ...defaultDeepDiveConfig },
  module0OutputMarkdown: null,
  module1OutputMarkdown: null,
  module2Markdown: '',
  module3Markdown: '',
  module4Markdown: '',
  module5Markdown: '',
  module6Markdown: '',
  module3Output: null,
  module4Output: null,
  module5Output: null,
  module6Output: null,
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

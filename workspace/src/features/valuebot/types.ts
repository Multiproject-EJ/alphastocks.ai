import { createContext } from 'preact';

export interface ValueBotDeepDiveConfig {
  provider: string;
  model?: string | null;
  ticker: string;
  timeframe?: string | null;
  customQuestion?: string | null;
}

export interface ValueBotAnalysisContext {
  deepDiveConfig: ValueBotDeepDiveConfig;
  module0OutputMarkdown?: string | null;
  module1OutputMarkdown?: string | null;
  module2Markdown?: string | null;
  module3Markdown?: string | null;
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

export const defaultValueBotAnalysisContext: ValueBotAnalysisContext = {
  deepDiveConfig: { ...defaultDeepDiveConfig },
  module0OutputMarkdown: null,
  module1OutputMarkdown: null,
  module2Markdown: null,
  module3Markdown: null,
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
  finalVerdict: ''
};

export interface ValueBotContextValue {
  context: ValueBotAnalysisContext;
  updateContext: (updates: Partial<ValueBotAnalysisContext>) => void;
}

export const ValueBotContext = createContext<ValueBotContextValue | null>(null);

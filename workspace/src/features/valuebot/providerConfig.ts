export const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openrouter', label: 'OpenRouter' }
];

export const modelOptions = {
  openai: [
    { value: '', label: 'Use default (gpt-4o-mini)' },
    { value: 'gpt-4o', label: 'gpt-4o (quality)' },
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini (fast & cost effective)' },
    { value: 'gpt-4.1', label: 'gpt-4.1 (premium)' }
  ],
  gemini: [
    { value: '', label: 'Use default (gemini-1.5-flash)' },
    { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (quality)' },
    { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash (fast)' }
  ],
  openrouter: [
    { value: '', label: 'Use default (openai/gpt-3.5-turbo)' },
    { value: 'openai/gpt-4o', label: 'openai/gpt-4o (quality)' },
    { value: 'openai/gpt-3.5-turbo', label: 'openai/gpt-3.5-turbo (fast & low cost)' },
    { value: 'mistralai/mistral-large', label: 'mistral-large (balanced)' }
  ]
};

export const getModelOptionsForProvider = (provider?: string) =>
  modelOptions[(provider as keyof typeof modelOptions) || 'openai'] ?? modelOptions.openai;

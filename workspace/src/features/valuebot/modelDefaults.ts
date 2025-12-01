export type ProviderId = 'openai' | string;

export function getDefaultModelForProvider(provider: ProviderId): string | null {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    default:
      return null;
  }
}

export function resolveEffectiveModelId(provider: ProviderId, rawModel?: string | null): string | null {
  const trimmedModel = rawModel?.trim();
  if (trimmedModel) return trimmedModel;

  return getDefaultModelForProvider(provider);
}

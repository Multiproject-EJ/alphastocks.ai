export function renderPromptTemplate(
  template: string | null | undefined,
  variables: Record<string, unknown> = {},
  templateName = 'prompt'
): string {
  if (!template || typeof template !== 'string') return template || '';

  const missingKeys: Set<string> = new Set();
  const rendered = template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
    const trimmedKey = String(key || '').trim();
    const value = trimmedKey.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, variables);

    if (value === undefined || value === null) {
      missingKeys.add(trimmedKey);
      return match;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch (err) {
      console.warn('[ValueBot] Unable to stringify template value', { key: trimmedKey, err });
      return match;
    }
  });

  if (missingKeys.size > 0) {
    console.warn('[ValueBot] Missing template variables encountered', {
      templateName,
      missingKeys: Array.from(missingKeys)
    });
  }

  return rendered;
}

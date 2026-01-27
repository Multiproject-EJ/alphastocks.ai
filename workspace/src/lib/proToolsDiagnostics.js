const STORAGE_KEY = 'protools.navigation.log.v1';
const MAX_ENTRIES = 100;
const UPDATE_EVENT = 'protools-diagnostics-updated';

const safeParse = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const getProToolsDiagnostics = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

export const logProToolsDiagnostic = (entry) => {
  if (typeof window === 'undefined') return;

  const nextEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  const existing = getProToolsDiagnostics();
  const updated = [nextEntry, ...existing].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

export const clearProToolsDiagnostics = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

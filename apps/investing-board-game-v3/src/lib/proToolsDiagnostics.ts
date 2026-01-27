import { logEvent } from '@/devtools/eventBus'

export type ProToolsDiagnosticEntry = {
  id: string
  timestamp: string
  source: 'board-game-v3' | 'workspace' | 'unknown'
  action: string
  details?: Record<string, unknown>
}

const STORAGE_KEY = 'protools.navigation.log.v1'
const MAX_ENTRIES = 100
const UPDATE_EVENT = 'protools-diagnostics-updated'

const safeParse = (raw: string | null): ProToolsDiagnosticEntry[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const getProToolsDiagnostics = (): ProToolsDiagnosticEntry[] => {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export const logProToolsDiagnostic = (
  entry: Omit<ProToolsDiagnosticEntry, 'id' | 'timestamp'>
): void => {
  if (typeof window === 'undefined') return

  const nextEntry: ProToolsDiagnosticEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  }

  const existing = getProToolsDiagnostics()
  const updated = [nextEntry, ...existing].slice(0, MAX_ENTRIES)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT))

  logEvent('protools', {
    action: entry.action,
    source: entry.source,
  })
}

export const clearProToolsDiagnostics = (): void => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
  logEvent('protools', { action: 'clear', source: 'board-game-v3' })
}

export const subscribeToProToolsDiagnostics = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined
  const handler = () => listener()
  window.addEventListener(UPDATE_EVENT, handler)
  return () => window.removeEventListener(UPDATE_EVENT, handler)
}

export interface TelemetryEvent {
  id: string
  name: string
  timestamp: string
  context: TelemetryContext
  payload?: Record<string, unknown>
}

export type TelemetrySink = (event: TelemetryEvent) => void

export interface TelemetryContext {
  app: string
  sessionId: string
  mode?: string
  build?: string
}

const TELEMETRY_CONSENT_KEY = 'alphastocks.telemetry.opt_in'
const TELEMETRY_EVENTS_KEY = 'alphastocks.telemetry.events'
const MAX_STORED_EVENTS = 50
const DEFAULT_CONTEXT: TelemetryContext = {
  app: 'board-game-v3',
  sessionId: createSessionId(),
}

const sinks = new Set<TelemetrySink>()
let telemetryContext: TelemetryContext = DEFAULT_CONTEXT

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getTelemetryConsent(): boolean {
  if (!isBrowser()) return false
  return window.localStorage.getItem(TELEMETRY_CONSENT_KEY) === 'true'
}

export function setTelemetryConsent(value: boolean) {
  if (!isBrowser()) return
  window.localStorage.setItem(TELEMETRY_CONSENT_KEY, value ? 'true' : 'false')
}

export function registerTelemetrySink(sink: TelemetrySink) {
  sinks.add(sink)
  return () => sinks.delete(sink)
}

export function setTelemetryContext(nextContext: Partial<TelemetryContext>) {
  telemetryContext = {
    ...telemetryContext,
    ...nextContext,
  }
}

export function getTelemetryContext(): TelemetryContext {
  return telemetryContext
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createEvent(name: string, payload?: Record<string, unknown>): TelemetryEvent {
  return {
    id: `${Date.now()}-${Math.random()}`,
    name,
    timestamp: new Date().toISOString(),
    context: telemetryContext,
    payload,
  }
}

export function trackTelemetryEvent(name: string, payload?: Record<string, unknown>) {
  if (!getTelemetryConsent()) return
  if (!sinks.size) return
  const event = createEvent(name, payload)
  sinks.forEach((sink) => sink(event))
}

function createConsoleSink(): TelemetrySink {
  return (event) => {
    if (!import.meta.env?.DEV) return
    console.info('[telemetry]', event.name, event.payload ?? {})
  }
}

function createLocalStorageSink(): TelemetrySink {
  return (event) => {
    if (!isBrowser()) return
    try {
      const existingRaw = window.localStorage.getItem(TELEMETRY_EVENTS_KEY)
      const existing = existingRaw ? (JSON.parse(existingRaw) as TelemetryEvent[]) : []
      const next = [event, ...existing].slice(0, MAX_STORED_EVENTS)
      window.localStorage.setItem(TELEMETRY_EVENTS_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage errors to avoid blocking gameplay
    }
  }
}

registerTelemetrySink(createConsoleSink())
registerTelemetrySink(createLocalStorageSink())

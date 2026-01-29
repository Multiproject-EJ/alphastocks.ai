export interface InstrumentationEvent {
  id: string
  name: string
  timestamp: string
  payload?: unknown
  scope?: string
}

export type InstrumentationSink = (event: InstrumentationEvent) => void

const INSTRUMENTATION_ENABLED_KEY = 'alphastocks.instrumentation.enabled'
const DEBUG_GAME_KEY = 'DEBUG_GAME'

const sinks = new Set<InstrumentationSink>()

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function isInstrumentationEnabled(): boolean {
  if (!isBrowser()) return false
  if (window.localStorage.getItem(DEBUG_GAME_KEY) === 'true') return true
  if (window.localStorage.getItem(INSTRUMENTATION_ENABLED_KEY) === 'true') return true
  return import.meta.env?.VITE_INSTRUMENTATION === '1'
}

export function setInstrumentationEnabled(value: boolean) {
  if (!isBrowser()) return
  window.localStorage.setItem(INSTRUMENTATION_ENABLED_KEY, value ? 'true' : 'false')
}

export function registerInstrumentationSink(sink: InstrumentationSink) {
  sinks.add(sink)
  return () => sinks.delete(sink)
}

function createEvent(
  name: string,
  payload?: unknown,
  scope = 'game'
): InstrumentationEvent {
  return {
    id: `${Date.now()}-${Math.random()}`,
    name,
    timestamp: new Date().toISOString(),
    payload,
    scope,
  }
}

export function trackInstrumentationEvent(
  name: string,
  payload?: unknown,
  scope?: string
) {
  if (!isInstrumentationEnabled()) return
  if (!sinks.size) return
  const event = createEvent(name, payload, scope)
  sinks.forEach((sink) => sink(event))
}

function createConsoleSink(): InstrumentationSink {
  return (event) => {
    if (!import.meta.env?.DEV) return
    console.info(`[instrumentation:${event.scope ?? 'game'}]`, event.name, event.payload ?? {})
  }
}

registerInstrumentationSink(createConsoleSink())

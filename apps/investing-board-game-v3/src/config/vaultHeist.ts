import rawVaultHeistConfig from '../../../../config/vault_heist.json'

import type { WindowSchedule, WindowScheduleType } from '@/lib/windowSchedule'

const DEFAULT_SCHEDULE: WindowSchedule = {
  type: 'weekly',
  days: [6],
  times: ['14:00'],
  durationMinutes: 60,
}

const DEFAULT_CONFIG = {
  freePickCount: 3,
  resetOnWindowStart: true,
  scheduleCopy: {
    overview:
      'Vault Heist goes live on Saturdays. Build your crew, pick a lane, and claim the biggest coin haul of the week.',
    windowDetail: 'Limited-time Saturday run with exclusive vault payouts.',
    signalHeadline: 'VAULT OPEN',
    signalDetail: 'Coin rewards spike during the Saturday window.',
    ctaLive: 'Heist live',
    ctaUpcoming: 'Next heist',
    ctaOffline: 'Heist standby',
  },
  schedule: DEFAULT_SCHEDULE,
}

const SCHEDULE_TYPES: WindowScheduleType[] = [
  'daily',
  'weekly',
  'monthly',
  'monthly-weekday',
  'monthly-random',
  'custom',
]

const coerceBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

const coerceNumber = (value: unknown, fallback: number): number =>
  Number.isFinite(Number(value)) ? Number(value) : fallback

const coerceStringArray = (value: unknown, fallback: string[] | undefined): string[] | undefined => {
  if (!Array.isArray(value)) return fallback
  const filtered = value.filter((entry): entry is string => typeof entry === 'string')
  return filtered.length > 0 ? filtered : fallback
}

const coerceNumberArray = (value: unknown, fallback: number[] | undefined): number[] | undefined => {
  if (!Array.isArray(value)) return fallback
  const filtered = value
    .map(entry => Number(entry))
    .filter(entry => Number.isFinite(entry))
  return filtered.length > 0 ? filtered : fallback
}

const coerceScheduleType = (value: unknown, fallback: WindowScheduleType): WindowScheduleType =>
  typeof value === 'string' && SCHEDULE_TYPES.includes(value as WindowScheduleType) ? (value as WindowScheduleType) : fallback

const coerceWindowSchedule = (value: unknown, fallback: WindowSchedule): WindowSchedule => {
  if (!value || typeof value !== 'object') {
    return fallback
  }
  const raw = value as Record<string, unknown>
  const type = coerceScheduleType(raw.type, fallback.type)
  const durationMinutes = Math.max(1, Math.floor(coerceNumber(raw.durationMinutes, fallback.durationMinutes)))

  return {
    type,
    durationMinutes,
    times: coerceStringArray(raw.times, fallback.times),
    days: coerceNumberArray(raw.days, fallback.days),
    dayOfMonth: coerceNumber(raw.dayOfMonth, fallback.dayOfMonth ?? 0) || undefined,
    weekOfMonth: coerceNumber(raw.weekOfMonth, fallback.weekOfMonth ?? 0) || undefined,
    seedKey: typeof raw.seedKey === 'string' ? raw.seedKey : fallback.seedKey,
    occurrences: raw.occurrences && typeof raw.occurrences === 'object'
      ? {
          min: Math.max(1, Math.floor(coerceNumber((raw.occurrences as { min?: number }).min, fallback.occurrences?.min ?? 1))),
          max: Math.max(1, Math.floor(coerceNumber((raw.occurrences as { max?: number }).max, fallback.occurrences?.max ?? 1))),
        }
      : fallback.occurrences,
  }
}

export const vaultHeistConfig = {
  freePickCount: Math.max(0, Math.floor(coerceNumber(rawVaultHeistConfig?.freePickCount, DEFAULT_CONFIG.freePickCount))),
  resetOnWindowStart: coerceBoolean(rawVaultHeistConfig?.resetOnWindowStart, DEFAULT_CONFIG.resetOnWindowStart),
  scheduleCopy: {
    overview: typeof rawVaultHeistConfig?.scheduleCopy?.overview === 'string'
      ? rawVaultHeistConfig.scheduleCopy.overview
      : DEFAULT_CONFIG.scheduleCopy.overview,
    windowDetail: typeof rawVaultHeistConfig?.scheduleCopy?.windowDetail === 'string'
      ? rawVaultHeistConfig.scheduleCopy.windowDetail
      : DEFAULT_CONFIG.scheduleCopy.windowDetail,
    signalHeadline: typeof rawVaultHeistConfig?.scheduleCopy?.signalHeadline === 'string'
      ? rawVaultHeistConfig.scheduleCopy.signalHeadline
      : DEFAULT_CONFIG.scheduleCopy.signalHeadline,
    signalDetail: typeof rawVaultHeistConfig?.scheduleCopy?.signalDetail === 'string'
      ? rawVaultHeistConfig.scheduleCopy.signalDetail
      : DEFAULT_CONFIG.scheduleCopy.signalDetail,
    ctaLive: typeof rawVaultHeistConfig?.scheduleCopy?.ctaLive === 'string'
      ? rawVaultHeistConfig.scheduleCopy.ctaLive
      : DEFAULT_CONFIG.scheduleCopy.ctaLive,
    ctaUpcoming: typeof rawVaultHeistConfig?.scheduleCopy?.ctaUpcoming === 'string'
      ? rawVaultHeistConfig.scheduleCopy.ctaUpcoming
      : DEFAULT_CONFIG.scheduleCopy.ctaUpcoming,
    ctaOffline: typeof rawVaultHeistConfig?.scheduleCopy?.ctaOffline === 'string'
      ? rawVaultHeistConfig.scheduleCopy.ctaOffline
      : DEFAULT_CONFIG.scheduleCopy.ctaOffline,
  },
  schedule: coerceWindowSchedule(rawVaultHeistConfig?.schedule, DEFAULT_CONFIG.schedule),
}

export const VAULT_HEIST_CONFIG = vaultHeistConfig

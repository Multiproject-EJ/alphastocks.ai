import rawVaultHeistConfig from '../../../../config/vault_heist.json'

const DEFAULT_CONFIG = {
  freePickCount: 3,
  resetOnWindowStart: true,
}

const coerceBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

const coerceNumber = (value: unknown, fallback: number): number =>
  Number.isFinite(Number(value)) ? Number(value) : fallback

export const vaultHeistConfig = {
  freePickCount: Math.max(0, Math.floor(coerceNumber(rawVaultHeistConfig?.freePickCount, DEFAULT_CONFIG.freePickCount))),
  resetOnWindowStart: coerceBoolean(rawVaultHeistConfig?.resetOnWindowStart, DEFAULT_CONFIG.resetOnWindowStart),
}

export const VAULT_HEIST_CONFIG = vaultHeistConfig

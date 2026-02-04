import rawEconomyConfig from '../../../../config/economy.json'

const DEFAULT_CONFIG = {
  energy: {
    MAX_ROLLS: 50,
    REGEN_RATE: 30,
    REGEN_INTERVAL_MINUTES: 120,
    DAILY_BONUS: 10,
    RESET_AMOUNT: 30
  },
  vaultRegenBonus: {
    LEVEL_STEP: 3,
    BONUS_PER_STEP: 2,
    MAX_BONUS: 10
  }
}

type EnergyConfig = typeof DEFAULT_CONFIG.energy
type VaultRegenBonusConfig = typeof DEFAULT_CONFIG.vaultRegenBonus

type EconomyConfig = {
  energy: EnergyConfig
  vaultRegenBonus: VaultRegenBonusConfig
}

function coerceNumber(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback
}

function normalizeEnergyConfig(config: Partial<EnergyConfig> | undefined): EnergyConfig {
  return {
    MAX_ROLLS: coerceNumber(config?.MAX_ROLLS, DEFAULT_CONFIG.energy.MAX_ROLLS),
    REGEN_RATE: coerceNumber(config?.REGEN_RATE, DEFAULT_CONFIG.energy.REGEN_RATE),
    REGEN_INTERVAL_MINUTES: coerceNumber(
      config?.REGEN_INTERVAL_MINUTES,
      DEFAULT_CONFIG.energy.REGEN_INTERVAL_MINUTES
    ),
    DAILY_BONUS: coerceNumber(config?.DAILY_BONUS, DEFAULT_CONFIG.energy.DAILY_BONUS),
    RESET_AMOUNT: coerceNumber(config?.RESET_AMOUNT, DEFAULT_CONFIG.energy.RESET_AMOUNT)
  }
}

function normalizeVaultRegenBonusConfig(
  config: Partial<VaultRegenBonusConfig> | undefined
): VaultRegenBonusConfig {
  return {
    LEVEL_STEP: coerceNumber(config?.LEVEL_STEP, DEFAULT_CONFIG.vaultRegenBonus.LEVEL_STEP),
    BONUS_PER_STEP: coerceNumber(config?.BONUS_PER_STEP, DEFAULT_CONFIG.vaultRegenBonus.BONUS_PER_STEP),
    MAX_BONUS: coerceNumber(config?.MAX_BONUS, DEFAULT_CONFIG.vaultRegenBonus.MAX_BONUS)
  }
}

const economyConfig: EconomyConfig = {
  energy: normalizeEnergyConfig(rawEconomyConfig?.energy),
  vaultRegenBonus: normalizeVaultRegenBonusConfig(rawEconomyConfig?.vaultRegenBonus)
}

export const ENERGY_CONFIG = economyConfig.energy
export const VAULT_REGEN_BONUS_CONFIG = economyConfig.vaultRegenBonus

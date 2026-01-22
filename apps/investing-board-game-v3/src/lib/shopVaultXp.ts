const VAULT_PURCHASE_XP_MIN = 25
const VAULT_PURCHASE_XP_RATE = 0.05
const VAULT_LEVEL_BASE_XP = 1000
const VAULT_LEVEL_STEP_XP = 250

export const getVaultPurchaseXp = (price: number) => {
  return Math.max(VAULT_PURCHASE_XP_MIN, Math.ceil(price * VAULT_PURCHASE_XP_RATE))
}

export const getVaultXpToNext = (level: number) => {
  const safeLevel = Math.max(1, Math.floor(level))
  return VAULT_LEVEL_BASE_XP + (safeLevel - 1) * VAULT_LEVEL_STEP_XP
}

type VaultProgressInput = {
  level: number
  xp: number
  xpToNext: number
}

type VaultProgressOutput = VaultProgressInput & {
  levelsGained: number
}

export const applyVaultXpGain = (progress: VaultProgressInput, xpEarned: number): VaultProgressOutput => {
  const safeEarned = Math.max(0, xpEarned)
  let nextLevel = Math.max(1, Math.floor(progress.level))
  let nextXp = Math.max(0, progress.xp) + safeEarned
  let nextXpToNext = progress.xpToNext > 0 ? progress.xpToNext : getVaultXpToNext(nextLevel)
  let levelsGained = 0

  while (nextXp >= nextXpToNext) {
    nextXp -= nextXpToNext
    nextLevel += 1
    levelsGained += 1
    nextXpToNext = getVaultXpToNext(nextLevel)
  }

  return {
    level: nextLevel,
    xp: nextXp,
    xpToNext: nextXpToNext,
    levelsGained,
  }
}

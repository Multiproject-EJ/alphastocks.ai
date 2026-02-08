import { VAULT_HEIST_PRIZES, type VaultPrize, type VaultPrizeTableEntry } from './vaultHeistRewards'

export interface VaultHeistPickInput {
  alarmWeight: number
  totalMultiplier: number
  prizeTable?: VaultPrizeTableEntry[]
  seed?: string
  rng?: () => number
}

export interface VaultHeistPickResult {
  prize: VaultPrize
  isAlarm: boolean
  totalMultiplier: number
}

const ALARM_PRIZE: VaultPrize = { type: 'alarm', amount: 0, emoji: '💣', label: 'ALARM!' }

export function resolveVaultHeistPick({
  alarmWeight,
  totalMultiplier,
  prizeTable = VAULT_HEIST_PRIZES,
  seed,
  rng,
}: VaultHeistPickInput): VaultHeistPickResult {
  const random = rng ?? (seed ? createSeededRandom(seed) : Math.random)
  const selectedPrize = selectPrize(prizeTable, alarmWeight, random)
  const isAlarm = selectedPrize.type === 'alarm'
  const resolvedPrize = isAlarm ? selectedPrize : applyMultiplier(selectedPrize, totalMultiplier)

  return {
    prize: resolvedPrize,
    isAlarm,
    totalMultiplier,
  }
}

function selectPrize(
  prizeTable: VaultPrizeTableEntry[],
  alarmWeight: number,
  rng: () => number,
): VaultPrize {
  const totalPrizeWeight = prizeTable.reduce((sum, entry) => sum + entry.weight, 0)
  const totalWeight = totalPrizeWeight + alarmWeight
  let roll = rng() * totalWeight

  if (alarmWeight > 0 && roll <= alarmWeight) return { ...ALARM_PRIZE }
  roll -= alarmWeight

  for (const { prize, weight } of prizeTable) {
    roll -= weight
    if (roll <= 0) return { ...prize }
  }

  return prizeTable[0]?.prize ?? { ...ALARM_PRIZE }
}

function applyMultiplier(prize: VaultPrize, multiplier: number): VaultPrize {
  if (prize.type === 'alarm' || prize.type === 'mystery') return prize

  const adjustedAmount = Math.round(prize.amount * multiplier)
  const label =
    prize.type === 'cash'
      ? `$${adjustedAmount.toLocaleString()}`
      : `${adjustedAmount.toLocaleString()} ${prize.type === 'stars' ? 'Stars' : 'Coins'}`

  return { ...prize, amount: adjustedAmount, label }
}

function createSeededRandom(seed: string): () => number {
  const seedFn = xmur3(seed)
  return mulberry32(seedFn())
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = seed += 0x6d2b79f5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

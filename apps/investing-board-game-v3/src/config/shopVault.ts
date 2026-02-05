import rawShopVaultConfig from '../../../../config/shop_vault.json'

export type VaultSeasonRecord = {
  id: string
  code: string
  name: string
  description: string
  theme: string
  startAt: string | null
  endAt: string | null
  isActive: boolean
}

export type VaultSetRecord = {
  id: string
  seasonId: string
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

export type VaultItemRecord = {
  id: string
  setId: string
  name: string
  description: string
  icon: string
  price: number
  currency: 'cash' | 'stars' | 'coins'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  isActive: boolean
}

export type VaultOwnershipRecord = {
  itemId: string
}

export type VaultProgressRecord = {
  level: number
  xp: number
  xpToNext: number
}

export type VaultLevelClaimRecord = {
  level: number
  claimedAt: string | null
}

type VaultFixtureConfig = {
  seasons: VaultSeasonRecord[]
  sets: VaultSetRecord[]
  items: VaultItemRecord[]
  ownership: VaultOwnershipRecord[]
  progress: VaultProgressRecord
  claims: VaultLevelClaimRecord[]
}

type VaultXpConfig = {
  PURCHASE_XP_MIN: number
  PURCHASE_XP_RATE: number
  LEVEL_BASE_XP: number
  LEVEL_STEP_XP: number
}

type VaultDiscountConfig = {
  EVENT: number
}

type ShopVaultConfig = {
  fixtures: VaultFixtureConfig
  xp: VaultXpConfig
  discounts: VaultDiscountConfig
}

const SEASON_NEON_ID = 'season-neon'
const SEASON_LUXE_ID = 'season-luxe'

const SET_NEON_CORE_ID = 'set-neon-core'
const SET_NEON_SKY_ID = 'set-neon-sky'
const SET_NEON_SHORE_ID = 'set-neon-shore'

const SET_LUXE_ART_ID = 'set-luxe-art'
const SET_LUXE_GOLD_ID = 'set-luxe-gold'
const SET_LUXE_ODYSSEY_ID = 'set-luxe-odyssey'

const buildItems = (
  setId: string,
  baseName: string,
  icon: string,
  basePrice: number,
  count: number
): VaultItemRecord[] => {
  return Array.from({ length: count }, (_value, index) => {
    const itemNumber = index + 1
    return {
      id: `${setId}-${itemNumber}`,
      setId,
      name: `${baseName} ${itemNumber}`,
      description: `Part ${itemNumber} of the ${baseName} collection.`,
      icon,
      price: basePrice + index * 150,
      currency: 'cash',
      rarity: itemNumber <= 2 ? 'rare' : itemNumber <= 6 ? 'uncommon' : 'common',
      isActive: true,
    }
  })
}

const DEFAULT_FIXTURES: VaultFixtureConfig = {
  seasons: [
    {
      id: SEASON_NEON_ID,
      code: 'S01',
      name: 'Neon Estates',
      description: 'Glow-up districts with bold city icons and skyline sets.',
      theme: 'Neon skyline',
      startAt: null,
      endAt: null,
      isActive: true,
    },
    {
      id: SEASON_LUXE_ID,
      code: 'S02',
      name: 'Luxe Horizons',
      description: 'Premium landmarks, gilded escapes, and prestige collections.',
      theme: 'Luxury travel',
      startAt: null,
      endAt: null,
      isActive: false,
    },
  ],
  sets: [
    {
      id: SET_NEON_CORE_ID,
      seasonId: SEASON_NEON_ID,
      code: 'CORE',
      name: 'Core Districts',
      description: 'Starter neighborhoods with high-footfall growth.',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: SET_NEON_SKY_ID,
      seasonId: SEASON_NEON_ID,
      code: 'SKY',
      name: 'Skyline Suite',
      description: 'Towering icons for elite investors.',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: SET_NEON_SHORE_ID,
      seasonId: SEASON_NEON_ID,
      code: 'SHORE',
      name: 'Harbor Lights',
      description: 'Resort-grade properties and marina exclusives.',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: SET_LUXE_ART_ID,
      seasonId: SEASON_LUXE_ID,
      code: 'ART',
      name: 'Gallery Row',
      description: 'Art-driven districts with premium prestige.',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: SET_LUXE_GOLD_ID,
      seasonId: SEASON_LUXE_ID,
      code: 'GOLD',
      name: 'Gold Coast',
      description: 'Ultra-high net worth estates.',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: SET_LUXE_ODYSSEY_ID,
      seasonId: SEASON_LUXE_ID,
      code: 'ODYSSEY',
      name: 'Odyssey Isles',
      description: 'Global resort chain to complete the season.',
      sortOrder: 3,
      isActive: true,
    },
  ],
  items: [
    ...buildItems(SET_NEON_CORE_ID, 'Core District', '🏙️', 1200, 12),
    ...buildItems(SET_NEON_SKY_ID, 'Skyline Suite', '🌆', 1800, 12),
    ...buildItems(SET_NEON_SHORE_ID, 'Harbor Light', '🛥️', 2000, 12),
    ...buildItems(SET_LUXE_ART_ID, 'Gallery Row', '🖼️', 2400, 12),
    ...buildItems(SET_LUXE_GOLD_ID, 'Gold Coast', '🏖️', 2600, 12),
    ...buildItems(SET_LUXE_ODYSSEY_ID, 'Odyssey Isle', '🏝️', 2800, 12),
  ],
  ownership: [
    { itemId: `${SET_NEON_CORE_ID}-1` },
    { itemId: `${SET_NEON_CORE_ID}-2` },
    { itemId: `${SET_NEON_CORE_ID}-3` },
    { itemId: `${SET_NEON_CORE_ID}-4` },
    { itemId: `${SET_NEON_CORE_ID}-5` },
    { itemId: `${SET_NEON_SKY_ID}-1` },
    { itemId: `${SET_NEON_SKY_ID}-2` },
    { itemId: `${SET_NEON_SKY_ID}-3` },
    { itemId: `${SET_NEON_SHORE_ID}-1` },
    { itemId: `${SET_NEON_SHORE_ID}-2` },
    { itemId: `${SET_NEON_SHORE_ID}-3` },
    { itemId: `${SET_LUXE_ART_ID}-1` },
    { itemId: `${SET_LUXE_ART_ID}-2` },
  ],
  progress: {
    level: 2,
    xp: 420,
    xpToNext: 1250,
  },
  claims: [],
}

const DEFAULT_XP: VaultXpConfig = {
  PURCHASE_XP_MIN: 25,
  PURCHASE_XP_RATE: 0.05,
  LEVEL_BASE_XP: 1000,
  LEVEL_STEP_XP: 250,
}

const DEFAULT_DISCOUNTS: VaultDiscountConfig = {
  EVENT: 20,
}

const coerceNumber = (value: unknown, fallback: number): number =>
  Number.isFinite(value) ? Number(value) : fallback

const normalizeProgress = (progress: Partial<VaultProgressRecord> | undefined): VaultProgressRecord => ({
  level: coerceNumber(progress?.level, DEFAULT_FIXTURES.progress.level),
  xp: coerceNumber(progress?.xp, DEFAULT_FIXTURES.progress.xp),
  xpToNext: coerceNumber(progress?.xpToNext, DEFAULT_FIXTURES.progress.xpToNext),
})

const normalizeFixtures = (fixtures: Partial<VaultFixtureConfig> | undefined): VaultFixtureConfig => ({
  seasons: Array.isArray(fixtures?.seasons) ? fixtures.seasons : DEFAULT_FIXTURES.seasons,
  sets: Array.isArray(fixtures?.sets) ? fixtures.sets : DEFAULT_FIXTURES.sets,
  items: Array.isArray(fixtures?.items) ? fixtures.items : DEFAULT_FIXTURES.items,
  ownership: Array.isArray(fixtures?.ownership) ? fixtures.ownership : DEFAULT_FIXTURES.ownership,
  progress: normalizeProgress(fixtures?.progress),
  claims: Array.isArray(fixtures?.claims) ? fixtures.claims : DEFAULT_FIXTURES.claims,
})

const normalizeXp = (xp: Partial<VaultXpConfig> | undefined): VaultXpConfig => ({
  PURCHASE_XP_MIN: coerceNumber(xp?.PURCHASE_XP_MIN, DEFAULT_XP.PURCHASE_XP_MIN),
  PURCHASE_XP_RATE: coerceNumber(xp?.PURCHASE_XP_RATE, DEFAULT_XP.PURCHASE_XP_RATE),
  LEVEL_BASE_XP: coerceNumber(xp?.LEVEL_BASE_XP, DEFAULT_XP.LEVEL_BASE_XP),
  LEVEL_STEP_XP: coerceNumber(xp?.LEVEL_STEP_XP, DEFAULT_XP.LEVEL_STEP_XP),
})

const normalizeDiscounts = (discounts: Partial<VaultDiscountConfig> | undefined): VaultDiscountConfig => ({
  EVENT: coerceNumber(discounts?.EVENT, DEFAULT_DISCOUNTS.EVENT),
})

const shopVaultConfig: ShopVaultConfig = {
  fixtures: normalizeFixtures((rawShopVaultConfig as Partial<ShopVaultConfig>)?.fixtures),
  xp: normalizeXp((rawShopVaultConfig as Partial<ShopVaultConfig>)?.xp),
  discounts: normalizeDiscounts((rawShopVaultConfig as Partial<ShopVaultConfig>)?.discounts),
}

export const VAULT_FIXTURE_SEASONS: VaultSeasonRecord[] = shopVaultConfig.fixtures.seasons

export const VAULT_FIXTURE_SETS: VaultSetRecord[] = shopVaultConfig.fixtures.sets

export const VAULT_FIXTURE_ITEMS: VaultItemRecord[] = shopVaultConfig.fixtures.items

export const VAULT_FIXTURE_OWNERSHIP: VaultOwnershipRecord[] = shopVaultConfig.fixtures.ownership

export const VAULT_FIXTURE_PROGRESS: VaultProgressRecord = shopVaultConfig.fixtures.progress

export const VAULT_FIXTURE_LEVEL_CLAIMS: VaultLevelClaimRecord[] = shopVaultConfig.fixtures.claims

export const VAULT_FIXTURE_DATA = {
  seasons: VAULT_FIXTURE_SEASONS,
  sets: VAULT_FIXTURE_SETS,
  items: VAULT_FIXTURE_ITEMS,
  ownership: VAULT_FIXTURE_OWNERSHIP,
  progress: VAULT_FIXTURE_PROGRESS,
  claims: VAULT_FIXTURE_LEVEL_CLAIMS,
}

export const VAULT_PURCHASE_XP_MIN = shopVaultConfig.xp.PURCHASE_XP_MIN
export const VAULT_PURCHASE_XP_RATE = shopVaultConfig.xp.PURCHASE_XP_RATE
export const VAULT_LEVEL_BASE_XP = shopVaultConfig.xp.LEVEL_BASE_XP
export const VAULT_LEVEL_STEP_XP = shopVaultConfig.xp.LEVEL_STEP_XP
export const VAULT_SHOP_EVENT_DISCOUNT = shopVaultConfig.discounts.EVENT

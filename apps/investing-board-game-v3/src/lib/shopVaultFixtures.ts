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

export const VAULT_FIXTURE_SEASONS: VaultSeasonRecord[] = [
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
]

export const VAULT_FIXTURE_SETS: VaultSetRecord[] = [
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
]

export const VAULT_FIXTURE_ITEMS: VaultItemRecord[] = [
  ...buildItems(SET_NEON_CORE_ID, 'Core District', '🏙️', 1200, 12),
  ...buildItems(SET_NEON_SKY_ID, 'Skyline Suite', '🌆', 1800, 12),
  ...buildItems(SET_NEON_SHORE_ID, 'Harbor Light', '🛥️', 2000, 12),
  ...buildItems(SET_LUXE_ART_ID, 'Gallery Row', '🖼️', 2400, 12),
  ...buildItems(SET_LUXE_GOLD_ID, 'Gold Coast', '🏖️', 2600, 12),
  ...buildItems(SET_LUXE_ODYSSEY_ID, 'Odyssey Isle', '🏝️', 2800, 12),
]

export const VAULT_FIXTURE_OWNERSHIP: VaultOwnershipRecord[] = [
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
]

export const VAULT_FIXTURE_DATA = {
  seasons: VAULT_FIXTURE_SEASONS,
  sets: VAULT_FIXTURE_SETS,
  items: VAULT_FIXTURE_ITEMS,
  ownership: VAULT_FIXTURE_OWNERSHIP,
}

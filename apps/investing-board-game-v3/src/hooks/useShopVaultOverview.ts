import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import {
  VAULT_FIXTURE_DATA,
  VaultItemRecord,
  VaultOwnershipRecord,
  VaultSeasonRecord,
  VaultSetRecord,
} from '@/lib/shopVaultFixtures'

export type VaultSetSummary = {
  id: string
  code: string
  name: string
  description: string
  itemsTotal: number
  itemsOwned: number
  isComplete: boolean
}

export type VaultItemSummary = {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: 'cash' | 'stars' | 'coins'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  isOwned: boolean
}

export type VaultSetDetail = {
  id: string
  code: string
  name: string
  description: string
  itemsTotal: number
  itemsOwned: number
  isComplete: boolean
  items: VaultItemSummary[]
}

export type VaultSeasonSummary = {
  id: string
  code: string
  name: string
  description: string
  theme: string
  isActive: boolean
  setsTotal: number
  setsCompleted: number
  sets: VaultSetSummary[]
}

type VaultOverview = {
  seasons: VaultSeasonSummary[]
  setDetails: Record<string, VaultSetDetail>
  loading: boolean
  error: string | null
  source: 'supabase' | 'mock'
  registerOwnership: (itemId: string) => void
}

type VaultSeasonRow = {
  id: string
  code: string
  name: string
  description: string | null
  theme: string | null
  start_at: string | null
  end_at: string | null
  is_active: boolean
}

type VaultSetRow = {
  id: string
  season_id: string
  code: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
}

type VaultItemRow = {
  id: string
  set_id: string
  name: string
  description: string | null
  icon: string | null
  price: number
  currency: 'cash' | 'stars' | 'coins'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  is_active: boolean
}

const normalizeSeasons = (rows: VaultSeasonRow[]): VaultSeasonRecord[] =>
  rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    theme: row.theme ?? 'Vault season',
    startAt: row.start_at,
    endAt: row.end_at,
    isActive: row.is_active,
  }))

const normalizeSets = (rows: VaultSetRow[]): VaultSetRecord[] =>
  rows.map((row) => ({
    id: row.id,
    seasonId: row.season_id,
    code: row.code,
    name: row.name,
    description: row.description ?? '',
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active,
  }))

const normalizeItems = (rows: VaultItemRow[]): VaultItemRecord[] =>
  rows.map((row) => ({
    id: row.id,
    setId: row.set_id,
    name: row.name,
    description: row.description ?? '',
    icon: row.icon ?? '🏛️',
    price: row.price,
    currency: row.currency,
    rarity: row.rarity,
    isActive: row.is_active,
  }))

const buildOverview = (
  seasons: VaultSeasonRecord[],
  sets: VaultSetRecord[],
  items: VaultItemRecord[],
  ownership: VaultOwnershipRecord[]
): VaultSeasonSummary[] => {
  const ownedSet = new Set(ownership.map((record) => record.itemId))
  const itemsBySet = items
    .filter((item) => item.isActive)
    .reduce<Record<string, VaultItemRecord[]>>((acc, item) => {
      acc[item.setId] = acc[item.setId] ? [...acc[item.setId], item] : [item]
      return acc
    }, {})

  const setSummaries = sets
    .filter((set) => set.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map<VaultSetSummary>((set) => {
      const setItems = itemsBySet[set.id] ?? []
      const itemsOwned = setItems.filter((item) => ownedSet.has(item.id)).length
      const itemsTotal = setItems.length
      return {
        id: set.id,
        code: set.code,
        name: set.name,
        description: set.description,
        itemsTotal,
        itemsOwned,
        isComplete: itemsTotal > 0 && itemsOwned >= itemsTotal,
      }
    })

  return seasons
    .slice()
    .sort((a, b) => (a.isActive === b.isActive ? a.code.localeCompare(b.code) : a.isActive ? -1 : 1))
    .map((season) => {
      const seasonSets = setSummaries.filter((set) => {
        const setRecord = sets.find((record) => record.id === set.id)
        return setRecord?.seasonId === season.id
      })
      const setsTotal = seasonSets.length
      const setsCompleted = seasonSets.filter((set) => set.isComplete).length
      return {
        id: season.id,
        code: season.code,
        name: season.name,
        description: season.description,
        theme: season.theme,
        isActive: season.isActive,
        setsTotal,
        setsCompleted,
        sets: seasonSets,
      }
    })
}

const buildSetDetails = (
  sets: VaultSetRecord[],
  items: VaultItemRecord[],
  ownership: VaultOwnershipRecord[]
): Record<string, VaultSetDetail> => {
  const ownedSet = new Set(ownership.map((record) => record.itemId))
  const itemsBySet = items
    .filter((item) => item.isActive)
    .reduce<Record<string, VaultItemRecord[]>>((acc, item) => {
      acc[item.setId] = acc[item.setId] ? [...acc[item.setId], item] : [item]
      return acc
    }, {})

  return sets
    .filter((set) => set.isActive)
    .reduce<Record<string, VaultSetDetail>>((acc, set) => {
      const setItems = itemsBySet[set.id] ?? []
      const itemsOwned = setItems.filter((item) => ownedSet.has(item.id)).length
      const itemsTotal = setItems.length
      acc[set.id] = {
        id: set.id,
        code: set.code,
        name: set.name,
        description: set.description,
        itemsTotal,
        itemsOwned,
        isComplete: itemsTotal > 0 && itemsOwned >= itemsTotal,
        items: setItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          icon: item.icon,
          price: item.price,
          currency: item.currency,
          rarity: item.rarity,
          isOwned: ownedSet.has(item.id),
        })),
      }
      return acc
    }, {})
}

type VaultRecords = {
  seasons: VaultSeasonRecord[]
  sets: VaultSetRecord[]
  items: VaultItemRecord[]
  ownership: VaultOwnershipRecord[]
}

export function useShopVaultOverview(): VaultOverview {
  const { user } = useAuth()
  const [records, setRecords] = useState<VaultRecords>({
    seasons: VAULT_FIXTURE_DATA.seasons,
    sets: VAULT_FIXTURE_DATA.sets,
    items: VAULT_FIXTURE_DATA.items,
    ownership: VAULT_FIXTURE_DATA.ownership,
  })
  const [loading, setLoading] = useState<boolean>(hasSupabaseConfig)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'supabase' | 'mock'>(hasSupabaseConfig ? 'supabase' : 'mock')

  const seasons = useMemo(
    () => buildOverview(records.seasons, records.sets, records.items, records.ownership),
    [records]
  )

  const setDetails = useMemo(
    () => buildSetDetails(records.sets, records.items, records.ownership),
    [records]
  )

  const applyRecords = useCallback(
    (nextRecords: VaultRecords, nextSource: 'supabase' | 'mock') => {
      setRecords(nextRecords)
      setSource(nextSource)
      setLoading(false)
    },
    []
  )

  const registerOwnership = useCallback((itemId: string) => {
    setRecords((prev) => {
      if (prev.ownership.some((record) => record.itemId === itemId)) {
        return prev
      }
      return {
        ...prev,
        ownership: [...prev.ownership, { itemId }],
      }
    })
  }, [])

  useEffect(() => {
    if (!supabaseClient || !hasSupabaseConfig) {
      setLoading(false)
      applyRecords(VAULT_FIXTURE_DATA, 'mock')
      return
    }

    let isActive = true

    const fetchVault = async () => {
      setLoading(true)

      const [seasonsResponse, setsResponse, itemsResponse] = await Promise.all([
        supabaseClient
          .from('shop_vault_seasons')
          .select('id, code, name, description, theme, start_at, end_at, is_active')
          .order('start_at', { ascending: true }),
        supabaseClient
          .from('shop_vault_sets')
          .select('id, season_id, code, name, description, sort_order, is_active')
          .order('sort_order', { ascending: true }),
        supabaseClient
          .from('shop_vault_items')
          .select('id, set_id, name, description, icon, price, currency, rarity, is_active')
          .order('sort_order', { ascending: true }),
      ])

      const ownershipResponse = user
        ? await supabaseClient
            .from('shop_vault_item_ownership')
            .select('item_id')
            .eq('profile_id', user.id)
        : { data: [], error: null }

      if (!isActive) return

      if (seasonsResponse.error || setsResponse.error || itemsResponse.error || ownershipResponse.error) {
        setError(
          seasonsResponse.error?.message ||
            setsResponse.error?.message ||
            itemsResponse.error?.message ||
            ownershipResponse.error?.message ||
            'Unable to load vault catalog.'
        )
        applyRecords(VAULT_FIXTURE_DATA, 'mock')
        return
      }

      const normalizedSeasons = normalizeSeasons((seasonsResponse.data ?? []) as VaultSeasonRow[])
      const normalizedSets = normalizeSets((setsResponse.data ?? []) as VaultSetRow[])
      const normalizedItems = normalizeItems((itemsResponse.data ?? []) as VaultItemRow[])
      const normalizedOwnership: VaultOwnershipRecord[] = (ownershipResponse.data ?? []).map((record) => ({
        itemId: record.item_id as string,
      }))

      if (normalizedSeasons.length === 0 || normalizedSets.length === 0 || normalizedItems.length === 0) {
        applyRecords(VAULT_FIXTURE_DATA, 'mock')
        return
      }

      setError(null)
      applyRecords(
        {
          seasons: normalizedSeasons,
          sets: normalizedSets,
          items: normalizedItems,
          ownership: normalizedOwnership,
        },
        'supabase'
      )
    }

    fetchVault()

    return () => {
      isActive = false
    }
  }, [applyRecords, user])

  return {
    seasons,
    setDetails,
    loading,
    error,
    source,
    registerOwnership,
  }
}

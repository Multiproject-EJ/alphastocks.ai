export type CasinoGameId =
  | 'scratchcard'
  | 'high-roller-dice'
  | 'market-blackjack'
  | 'roulette-ring'
  | 'macro-slots'
  | 'bull-bear-race'
  | 'insider-wheel'
  | 'vault-jackpot'

export type CasinoGameAvailability = 'live' | 'teaser' | 'placeholder'

export type CasinoGameCatalogEntry = {
  id: CasinoGameId
  label: string
  icon: string
  availability: CasinoGameAvailability
}

export const CASINO_GAME_CATALOG: readonly CasinoGameCatalogEntry[] = [
  { id: 'scratchcard', label: 'Scratchcard Vault', icon: '🎟️', availability: 'live' },
  { id: 'high-roller-dice', label: 'High Roller Dice', icon: '🎲', availability: 'live' },
  { id: 'market-blackjack', label: 'Market Blackjack', icon: '🂡', availability: 'live' },
  { id: 'roulette-ring', label: 'Roulette Ring', icon: '🎯', availability: 'live' },
  { id: 'macro-slots', label: 'Macro Slots', icon: '🎰', availability: 'placeholder' },
  { id: 'bull-bear-race', label: 'Bull/Bear Race', icon: '🐂', availability: 'placeholder' },
  { id: 'insider-wheel', label: 'Insider Wheel', icon: '🎡', availability: 'placeholder' },
  { id: 'vault-jackpot', label: 'Vault Jackpot', icon: '💎', availability: 'placeholder' },
]

export const getCasinoGameCatalogEntry = (id: CasinoGameId) =>
  CASINO_GAME_CATALOG.find((entry) => entry.id === id) ?? null

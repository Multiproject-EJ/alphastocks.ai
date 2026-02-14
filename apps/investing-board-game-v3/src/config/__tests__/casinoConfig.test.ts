import { describe, expect, it } from 'vitest'
import { casinoConfig } from '@/config/casino'
import { getCasinoGameCatalogEntry } from '@/lib/casinoCatalog'

describe('casino config', () => {
  it('keeps lobby game statuses aligned with the casino catalog', () => {
    const lobbyGames = casinoConfig.lobby.games.filter((game) =>
      ['scratchcard', 'high-roller-dice', 'market-blackjack'].includes(game.id),
    )

    expect(lobbyGames).toHaveLength(3)

    lobbyGames.forEach((game) => {
      const catalogEntry = getCasinoGameCatalogEntry(game.id as 'scratchcard' | 'high-roller-dice' | 'market-blackjack')
      expect(catalogEntry).not.toBeNull()
      expect(game.status).toBe(catalogEntry?.availability === 'live' ? 'live' : 'teaser')
      expect(game.icon).toBe(catalogEntry?.icon)
      if (game.id !== 'scratchcard') {
        expect(game.cta.startsWith('Play')).toBe(catalogEntry?.availability === 'live')
      }
    })
  })
})

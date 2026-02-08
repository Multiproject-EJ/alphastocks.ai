import rawCasinoConfig from '../../../../config/casino.json'

export type CasinoGameStatus = 'live' | 'teaser'

export type CasinoLobbyGame = {
  id: string
  name: string
  description: string
  status: CasinoGameStatus
  cta: string
  tag: string
  icon: string
}

export type CasinoLobbyConfig = {
  title: string
  description: string
  games: CasinoLobbyGame[]
}

type CasinoConfig = {
  lobby: CasinoLobbyConfig
}

const DEFAULT_CASINO_CONFIG: CasinoConfig = {
  lobby: {
    title: 'Casino Floor',
    description: 'Pick a table and chase a lucky streak. New games rotate in with special events.',
    games: [
      {
        id: 'scratchcard',
        name: 'Scratchcard Vault',
        description: 'Instant reveal tickets with boosted odds during Casino Happy Hour.',
        status: 'live',
        cta: 'Play scratchcards',
        tag: 'Signature',
        icon: '🎟️',
      },
      {
        id: 'high-roller-dice',
        name: 'High Roller Dice',
        description: 'Double-down dice throws with streak multipliers and VIP tables.',
        status: 'teaser',
        cta: 'Coming soon',
        tag: 'High Stakes',
        icon: '🎲',
      },
    ],
  },
}

const normalizeLobbyGames = (games: CasinoLobbyGame[]) =>
  games.filter((game) => game.id && game.name && game.description)

const normalizeCasinoConfig = (config: CasinoConfig): CasinoConfig => {
  return {
    lobby: {
      title: config.lobby.title || DEFAULT_CASINO_CONFIG.lobby.title,
      description: config.lobby.description || DEFAULT_CASINO_CONFIG.lobby.description,
      games: normalizeLobbyGames(config.lobby.games.length ? config.lobby.games : DEFAULT_CASINO_CONFIG.lobby.games),
    },
  }
}

export const casinoConfig = normalizeCasinoConfig(rawCasinoConfig as CasinoConfig)

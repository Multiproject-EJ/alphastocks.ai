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

export type CasinoDiceOption = {
  id: string
  label: string
  description: string
  target: number
  payout: number
  streakBonus: number
}

export type CasinoDiceConfig = {
  title: string
  description: string
  streakCap: number
  options: CasinoDiceOption[]
}

type CasinoConfig = {
  lobby: CasinoLobbyConfig
  dice: CasinoDiceConfig
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
  dice: {
    title: 'High Roller Dice',
    description: 'Pick your risk tier, roll two dice, and stack a streak multiplier.',
    streakCap: 3,
    options: [
      {
        id: 'blue-chip',
        label: 'Blue Chip 7+',
        description: 'Steady table with a softer win target.',
        target: 7,
        payout: 2500,
        streakBonus: 0.1,
      },
      {
        id: 'bull-run',
        label: 'Bull Run 9+',
        description: 'Mid-risk table with sharper upside.',
        target: 9,
        payout: 5000,
        streakBonus: 0.15,
      },
      {
        id: 'moonshot',
        label: 'Moonshot 11+',
        description: 'High stakes table for fearless rollers.',
        target: 11,
        payout: 9000,
        streakBonus: 0.25,
      },
    ],
  },
}

const normalizeLobbyGames = (games: CasinoLobbyGame[]) =>
  games.filter((game) => game.id && game.name && game.description)

const normalizeDiceOptions = (options: CasinoDiceOption[]) =>
  options.filter((option) => option.id && option.label && option.description)

const normalizeCasinoConfig = (config: CasinoConfig): CasinoConfig => {
  return {
    lobby: {
      title: config.lobby.title || DEFAULT_CASINO_CONFIG.lobby.title,
      description: config.lobby.description || DEFAULT_CASINO_CONFIG.lobby.description,
      games: normalizeLobbyGames(config.lobby.games.length ? config.lobby.games : DEFAULT_CASINO_CONFIG.lobby.games),
    },
    dice: {
      title: config.dice.title || DEFAULT_CASINO_CONFIG.dice.title,
      description: config.dice.description || DEFAULT_CASINO_CONFIG.dice.description,
      streakCap: Number.isFinite(config.dice.streakCap)
        ? Math.max(1, Math.floor(config.dice.streakCap))
        : DEFAULT_CASINO_CONFIG.dice.streakCap,
      options: normalizeDiceOptions(
        config.dice.options.length ? config.dice.options : DEFAULT_CASINO_CONFIG.dice.options,
      ),
    },
  }
}

export const casinoConfig = normalizeCasinoConfig(rawCasinoConfig as CasinoConfig)

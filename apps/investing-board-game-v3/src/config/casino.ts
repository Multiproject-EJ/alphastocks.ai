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

export type CasinoDiceBuyIn = {
  id: string
  label: string
  description: string
  entry: number
  multiplier: number
}

export type CasinoDiceBankrollGuidance = {
  buffer: number
  title: string
  description: string
  recovery: {
    title: string
    description: string
    cta: string
  }
}

export type CasinoDiceConfig = {
  title: string
  description: string
  streakCap: number
  buyIns: CasinoDiceBuyIn[]
  options: CasinoDiceOption[]
  bankrollGuidance: CasinoDiceBankrollGuidance
}

export type CasinoBlackjackSideBet = {
  id: string
  label: string
  description: string
  payout: number
}

export type CasinoBlackjackConfig = {
  title: string
  description: string
  tableLimits: {
    minBet: number
    maxBet: number
  }
  sideBets: CasinoBlackjackSideBet[]
  teaser: {
    headline: string
    details: string
  }
}

type CasinoConfig = {
  lobby: CasinoLobbyConfig
  dice: CasinoDiceConfig
  blackjack: CasinoBlackjackConfig
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
    buyIns: [
      {
        id: 'floor',
        label: 'Floor Seats',
        description: 'Warm up with the lowest buy-in.',
        entry: 2000,
        multiplier: 1,
      },
      {
        id: 'vip',
        label: 'VIP Lounge',
        description: 'Bigger chips, bigger upside.',
        entry: 5000,
        multiplier: 1.5,
      },
      {
        id: 'whale',
        label: 'Whale Suite',
        description: 'High-roller buy-in with max payouts.',
        entry: 10000,
        multiplier: 2,
      },
    ],
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
    bankrollGuidance: {
      buffer: 3,
      title: 'Bankroll coach',
      description: 'Keep a cushion of at least 3x the buy-in to ride a streak.',
      recovery: {
        title: 'Balance recovery',
        description: 'Need to rebuild cash? Take a lower-entry spin and return with a buffer.',
        cta: 'Play scratchcards',
      },
    },
  },
  blackjack: {
    title: 'Market Blackjack',
    description: 'Time the volatility tape, pick a side bet, and aim for a market-perfect hand.',
    tableLimits: {
      minBet: 1000,
      maxBet: 15000,
    },
    sideBets: [
      {
        id: 'earnings-beat',
        label: 'Earnings Beat',
        description: 'Bonus payout for dealer 17+ when the earnings bell rings.',
        payout: 4,
      },
      {
        id: 'macro-momentum',
        label: 'Macro Momentum',
        description: 'Boosted payout if the player hits 20 on the first draw.',
        payout: 6,
      },
    ],
    teaser: {
      headline: 'New table loading',
      details: 'Market Blackjack opens soon with volatility hands and earnings-season side bets.',
    },
  },
}

const normalizeLobbyGames = (games: CasinoLobbyGame[]) =>
  games.filter((game) => game.id && game.name && game.description)

const normalizeDiceOptions = (options: CasinoDiceOption[]) =>
  options.filter((option) => option.id && option.label && option.description)

const normalizeDiceBuyIns = (buyIns: CasinoDiceBuyIn[]) =>
  buyIns.filter((buyIn) => buyIn.id && buyIn.label && buyIn.description)

const normalizeBlackjackSideBets = (sideBets: CasinoBlackjackSideBet[]) =>
  sideBets.filter((sideBet) => sideBet.id && sideBet.label && sideBet.description)

const normalizeBankrollGuidance = (
  guidance: CasinoDiceBankrollGuidance | undefined,
  fallback: CasinoDiceBankrollGuidance,
): CasinoDiceBankrollGuidance => {
  const buffer =
    guidance && Number.isFinite(guidance.buffer) ? Math.max(1, Math.floor(guidance.buffer)) : fallback.buffer
  return {
    buffer,
    title: guidance?.title || fallback.title,
    description: guidance?.description || fallback.description,
    recovery: {
      title: guidance?.recovery?.title || fallback.recovery.title,
      description: guidance?.recovery?.description || fallback.recovery.description,
      cta: guidance?.recovery?.cta || fallback.recovery.cta,
    },
  }
}

const normalizeCasinoConfig = (config: CasinoConfig): CasinoConfig => {
  const blackjackConfig = config.blackjack ?? DEFAULT_CASINO_CONFIG.blackjack
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
      buyIns: normalizeDiceBuyIns(
        config.dice.buyIns?.length ? config.dice.buyIns : DEFAULT_CASINO_CONFIG.dice.buyIns,
      ).map((buyIn) => ({
        ...buyIn,
        entry: Number.isFinite(buyIn.entry) ? Math.max(0, buyIn.entry) : 0,
        multiplier: Number.isFinite(buyIn.multiplier) ? Math.max(0.1, buyIn.multiplier) : 1,
      })),
      options: normalizeDiceOptions(
        config.dice.options.length ? config.dice.options : DEFAULT_CASINO_CONFIG.dice.options,
      ),
      bankrollGuidance: normalizeBankrollGuidance(
        config.dice.bankrollGuidance,
        DEFAULT_CASINO_CONFIG.dice.bankrollGuidance,
      ),
    },
    blackjack: {
      title: blackjackConfig.title || DEFAULT_CASINO_CONFIG.blackjack.title,
      description: blackjackConfig.description || DEFAULT_CASINO_CONFIG.blackjack.description,
      tableLimits: {
        minBet: Number.isFinite(blackjackConfig.tableLimits?.minBet)
          ? Math.max(0, blackjackConfig.tableLimits.minBet)
          : DEFAULT_CASINO_CONFIG.blackjack.tableLimits.minBet,
        maxBet: Number.isFinite(blackjackConfig.tableLimits?.maxBet)
          ? Math.max(
              blackjackConfig.tableLimits?.minBet ?? DEFAULT_CASINO_CONFIG.blackjack.tableLimits.minBet,
              blackjackConfig.tableLimits.maxBet,
            )
          : DEFAULT_CASINO_CONFIG.blackjack.tableLimits.maxBet,
      },
      sideBets: normalizeBlackjackSideBets(
        blackjackConfig.sideBets?.length ? blackjackConfig.sideBets : DEFAULT_CASINO_CONFIG.blackjack.sideBets,
      ).map((sideBet) => ({
        ...sideBet,
        payout: Number.isFinite(sideBet.payout) ? Math.max(1, sideBet.payout) : 1,
      })),
      teaser: {
        headline: blackjackConfig.teaser?.headline || DEFAULT_CASINO_CONFIG.blackjack.teaser.headline,
        details: blackjackConfig.teaser?.details || DEFAULT_CASINO_CONFIG.blackjack.teaser.details,
      },
    },
  }
}

export const casinoConfig = normalizeCasinoConfig(rawCasinoConfig as CasinoConfig)

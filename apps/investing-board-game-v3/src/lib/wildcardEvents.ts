import { RingNumber, WildcardEvent } from './types'

// Special constant for percentage-based penalties
export const CASH_PERCENTAGE_PENALTY = -0.1 // Represents 10% loss

export const WILDCARD_EVENTS: WildcardEvent[] = [
  // Cash Reward Events
  {
    id: 'market-rally',
    title: 'Market Rally',
    description: 'The market surges on positive economic news! Your investments gain value.',
    type: 'cash',
    effect: { cash: 25000 },
    icon: '📈'
  },
  {
    id: 'dividend-windfall',
    title: 'Dividend Windfall',
    description: 'Multiple dividend payments arrive at once. Cash flows in!',
    type: 'cash',
    effect: { cash: 15000 },
    icon: '💰'
  },
  {
    id: 'stock-split-bonus',
    title: 'Stock Split Bonus',
    description: 'A favorable stock split increases your portfolio value.',
    type: 'cash',
    effect: { cash: 10000 },
    icon: '🎯'
  },
  {
    id: 'unexpected-refund',
    title: 'Unexpected Refund',
    description: 'You receive a surprise tax refund from last year.',
    type: 'cash',
    effect: { cash: 5000 },
    icon: '💵'
  },
  
  // Star Reward Events
  {
    id: 'lucky-streak',
    title: 'Lucky Streak',
    description: 'Fortune smiles upon you! Earn bonus stars for your momentum.',
    type: 'stars',
    effect: { stars: 50 },
    icon: '✨'
  },
  {
    id: 'investor-recognition',
    title: 'Investor Recognition',
    description: 'Your investment strategy is featured in a financial publication!',
    type: 'stars',
    effect: { stars: 30 },
    icon: '🏆'
  },
  {
    id: 'portfolio-milestone',
    title: 'Portfolio Milestone',
    description: 'You achieve a major investment milestone and gain recognition.',
    type: 'stars',
    effect: { stars: 25 },
    icon: '⭐'
  },
  
  // Teleport Events
  {
    id: 'express-lane',
    title: 'Express Lane',
    description: 'Take a shortcut! Jump directly to Start.',
    type: 'teleport',
    effect: { teleportTo: 0 },
    icon: '🚀'
  },
  {
    id: 'fast-track-casino',
    title: 'Fast Track to Casino',
    description: 'Feeling lucky? Instant transport to the Casino!',
    type: 'teleport',
    effect: { teleportTo: 7 },
    icon: '🎰'
  },
  {
    id: 'court-summons',
    title: 'Court Summons',
    description: 'You are summoned to the Court of Capital for a review.',
    type: 'teleport',
    effect: { teleportTo: 13 },
    icon: '⚖️'
  },
  {
    id: 'wisdom-call',
    title: 'Wisdom Call',
    description: 'Seek guidance at the Bias Sanctuary to improve your judgment.',
    type: 'teleport',
    effect: { teleportTo: 21 },
    icon: '🧘'
  },
  
  // Penalty Events
  {
    id: 'market-correction',
    title: 'Market Correction',
    description: 'A market downturn reduces your portfolio by 10%.',
    type: 'penalty',
    effect: { cash: CASH_PERCENTAGE_PENALTY }, // Special: -10% will be calculated in handler
    icon: '📉'
  },
  {
    id: 'surprise-tax',
    title: 'Surprise Tax Bill',
    description: 'The IRS sends an unexpected tax bill that must be paid immediately.',
    type: 'penalty',
    effect: { cash: -10000 },
    icon: '🧾'
  },
  {
    id: 'portfolio-audit',
    title: 'Portfolio Audit',
    description: 'An audit reveals some discrepancies. Lose investor confidence.',
    type: 'penalty',
    effect: { stars: -20 },
    icon: '🔍'
  },
  {
    id: 'trading-fee',
    title: 'Trading Fee',
    description: 'Excessive trading results in substantial brokerage fees.',
    type: 'penalty',
    effect: { cash: -5000 },
    icon: '💸'
  },
  
  // Mixed Events
  {
    id: 'risky-bet-payoff',
    title: 'Risky Bet Pays Off',
    description: 'Your speculative investment succeeds! Gain cash and recognition.',
    type: 'mixed',
    effect: { cash: 20000, stars: 15 },
    icon: '🎲'
  },
  {
    id: 'margin-call',
    title: 'Margin Call',
    description: 'A tough lesson learned. Lose cash but gain valuable experience.',
    type: 'mixed',
    effect: { cash: -15000, stars: 10 },
    icon: '📞'
  }
]

const MIDDLE_RING_WILDCARD_EVENTS: Array<{ event: WildcardEvent; weight: number }> = [
  {
    event: {
      id: 'hidden-gem',
      title: 'Hidden Gem',
      description: 'You uncover an overlooked winner. Take the profit and the prestige.',
      type: 'mixed',
      effect: { cash: 20000, stars: 20 },
      icon: '💎'
    },
    weight: 0.2,
  },
  {
    event: {
      id: 'fraud-alert',
      title: 'Fraud Alert',
      description: 'The opportunity was a trap. Losses hit before you can exit.',
      type: 'penalty',
      effect: { cash: -15000, stars: -10 },
      icon: '🚨'
    },
    weight: 0.8,
  }
]

/**
 * Get a random wildcard event from the pool
 */
export function getRandomWildcardEvent(ringNumber?: RingNumber): WildcardEvent {
  if (ringNumber === 2) {
    const roll = Math.random()
    let threshold = 0
    for (const { event, weight } of MIDDLE_RING_WILDCARD_EVENTS) {
      threshold += weight
      if (roll <= threshold) {
        return event
      }
    }
    return MIDDLE_RING_WILDCARD_EVENTS[0].event
  }

  const randomIndex = Math.floor(Math.random() * WILDCARD_EVENTS.length)
  return WILDCARD_EVENTS[randomIndex]
}

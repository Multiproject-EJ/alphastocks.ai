/**
 * Dice rolling utilities for the board game
 * Implements true dual dice system with doubles detection
 */

export interface DiceRoll {
  die1: number
  die2: number
  total: number
  isDoubles: boolean
  timestamp?: Date
}

/**
 * Roll two independent dice (1-6 each)
 * Returns both individual values and their sum
 */
export function rollDice(): DiceRoll {
  const die1 = Math.floor(Math.random() * 6) + 1
  const die2 = Math.floor(Math.random() * 6) + 1
  
  return {
    die1,
    die2,
    total: die1 + die2,
    isDoubles: die1 === die2,
    timestamp: new Date()
  }
}

/**
 * Bonus rewards awarded when rolling doubles
 */
export const DOUBLES_BONUS = {
  stars: 25,
  coins: 50,
  xp: 15,
  description: '🎲 DOUBLES! 🎲'
}

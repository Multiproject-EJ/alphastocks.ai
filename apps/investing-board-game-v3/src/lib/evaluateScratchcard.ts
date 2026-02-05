import type { ScratchcardPrize, ScratchcardPrizeResult, ScratchcardTier } from '@/lib/scratchcardTiers'

const weightedPick = (prizes: ScratchcardPrize[]) => {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
  let roll = Math.random() * totalWeight
  for (const prize of prizes) {
    roll -= prize.weight
    if (roll <= 0) {
      return prize
    }
  }
  return prizes[0]
}

const jackpotPick = (prizes: ScratchcardPrize[]) =>
  prizes.reduce((best, prize) => (prize.maxAmount > best.maxAmount ? prize : best), prizes[0])

const rollAmount = (prize: ScratchcardPrize) =>
  Math.floor(prize.minAmount + Math.random() * (prize.maxAmount - prize.minAmount + 1))

const getIndex = (row: number, col: number, columns: number) => row * columns + col

export const buildScratchcardGrid = (tier: ScratchcardTier, luckBoost: number) => {
  const { rows, columns } = tier.grid
  const totalCells = rows * columns
  const symbols = Array.from({ length: totalCells }, () => {
    return tier.symbolPool[Math.floor(Math.random() * tier.symbolPool.length)]
  })
  const winChance = tier.odds.winChance + luckBoost
  const patterns = tier.winPatterns.filter((pattern) => pattern !== 'multiplier')
  if (Math.random() < winChance && patterns.length > 0) {
    const winningSymbol = tier.symbolPool[Math.floor(Math.random() * tier.symbolPool.length)]
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    if (pattern === 'row') {
      const row = Math.floor(Math.random() * rows)
      for (let col = 0; col < columns; col += 1) {
        symbols[getIndex(row, col, columns)] = winningSymbol
      }
    } else if (pattern === 'diagonal') {
      const size = Math.min(rows, columns)
      const isMain = Math.random() < 0.5
      for (let step = 0; step < size; step += 1) {
        const col = isMain ? step : columns - 1 - step
        symbols[getIndex(step, col, columns)] = winningSymbol
      }
    } else if (pattern === 'bonus') {
      const centerRow = Math.floor(rows / 2)
      const centerCol = Math.floor(columns / 2)
      symbols[getIndex(centerRow, centerCol, columns)] = winningSymbol
      const extraCells = Math.min(2, totalCells - 1)
      for (let i = 0; i < extraCells; i += 1) {
        const randomIndex = Math.floor(Math.random() * totalCells)
        symbols[randomIndex] = winningSymbol
      }
    }
  }
  return symbols
}

const evaluatePatterns = (grid: string[], tier: ScratchcardTier) => {
  const { rows, columns } = tier.grid
  const wins: Array<ScratchcardPrizeResult['pattern']> = []
  if (tier.winPatterns.includes('row')) {
    for (let row = 0; row < rows; row += 1) {
      const startIndex = getIndex(row, 0, columns)
      const symbol = grid[startIndex]
      let isMatch = true
      for (let col = 1; col < columns; col += 1) {
        if (grid[getIndex(row, col, columns)] !== symbol) {
          isMatch = false
          break
        }
      }
      if (isMatch) wins.push('row')
    }
  }

  if (tier.winPatterns.includes('diagonal')) {
    const size = Math.min(rows, columns)
    const mainSymbol = grid[getIndex(0, 0, columns)]
    let mainMatch = true
    for (let step = 1; step < size; step += 1) {
      if (grid[getIndex(step, step, columns)] !== mainSymbol) {
        mainMatch = false
        break
      }
    }
    if (mainMatch) wins.push('diagonal')

    const antiSymbol = grid[getIndex(0, columns - 1, columns)]
    let antiMatch = true
    for (let step = 1; step < size; step += 1) {
      if (grid[getIndex(step, columns - 1 - step, columns)] !== antiSymbol) {
        antiMatch = false
        break
      }
    }
    if (antiMatch) wins.push('diagonal')
  }

  if (tier.winPatterns.includes('bonus')) {
    const centerRow = Math.floor(rows / 2)
    const centerCol = Math.floor(columns / 2)
    const centerSymbol = grid[getIndex(centerRow, centerCol, columns)]
    const centerCount = grid.filter((symbol) => symbol === centerSymbol).length
    if (centerCount >= Math.min(3, rows)) {
      wins.push('bonus')
    }
  }

  return wins
}

export const evaluateScratchcardResults = (grid: string[], tier: ScratchcardTier) => {
  const wins = evaluatePatterns(grid, tier).slice(0, tier.prizeSlots)
  if (wins.length === 0) {
    return []
  }

  const multiplierRoll =
    tier.winPatterns.includes('multiplier') && Math.random() < tier.odds.multiplierChance
      ? [2, 3, 5][Math.floor(Math.random() * 3)]
      : 1

  return wins.map((pattern) => {
    const prize =
      Math.random() < tier.odds.jackpotChance ? jackpotPick(tier.prizes) : weightedPick(tier.prizes)
    const amount = rollAmount(prize)
    return {
      label: prize.label,
      amount: amount * multiplierRoll,
      currency: prize.currency,
      pattern,
      multiplier: multiplierRoll > 1 ? multiplierRoll : undefined,
    }
  })
}

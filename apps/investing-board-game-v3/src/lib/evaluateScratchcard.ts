import type { ScratchcardPrize, ScratchcardPrizeResult, ScratchcardTier } from '@/lib/scratchcardTiers'

const weightedPick = (prizes: ScratchcardPrize[], rng: () => number) => {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
  let roll = rng() * totalWeight
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

const rollAmount = (prize: ScratchcardPrize, rng: () => number) =>
  Math.floor(prize.minAmount + rng() * (prize.maxAmount - prize.minAmount + 1))

const getIndex = (row: number, col: number, columns: number) => row * columns + col

export const buildScratchcardGrid = (
  tier: ScratchcardTier,
  luckBoost: number,
  rng: () => number = Math.random,
  guaranteedWin = false,
) => {
  const { rows, columns } = tier.grid
  const totalCells = rows * columns
  const symbols = Array.from({ length: totalCells }, () => {
    return tier.symbolPool[Math.floor(rng() * tier.symbolPool.length)]
  })
  const winChance = guaranteedWin
    ? 1
    : Math.max(0, Math.min(1, tier.odds.winChance + luckBoost))
  const patterns = tier.winPatterns.filter((pattern) => pattern !== 'multiplier')
  if (rng() < winChance && patterns.length > 0) {
    const winningSymbol = tier.symbolPool[Math.floor(rng() * tier.symbolPool.length)]
    const pattern = patterns[Math.floor(rng() * patterns.length)]
    if (pattern === 'row') {
      const row = Math.floor(rng() * rows)
      for (let col = 0; col < columns; col += 1) {
        symbols[getIndex(row, col, columns)] = winningSymbol
      }
    } else if (pattern === 'diagonal') {
      const size = Math.min(rows, columns)
      const isMain = rng() < 0.5
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
        const randomIndex = Math.floor(rng() * totalCells)
        symbols[randomIndex] = winningSymbol
      }
    }
  }
  return symbols
}

export const getScratchcardWinningLines = (grid: string[], tier: ScratchcardTier) => {
  const { rows, columns } = tier.grid
  const lines: Array<{ pattern: ScratchcardPrizeResult['pattern']; indices: number[] }> = []

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
      if (isMatch) {
        const indices = Array.from({ length: columns }, (_, col) => getIndex(row, col, columns))
        lines.push({ pattern: 'row', indices })
      }
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
    if (mainMatch) {
      const indices = Array.from({ length: size }, (_, step) => getIndex(step, step, columns))
      lines.push({ pattern: 'diagonal', indices })
    }

    const antiSymbol = grid[getIndex(0, columns - 1, columns)]
    let antiMatch = true
    for (let step = 1; step < size; step += 1) {
      if (grid[getIndex(step, columns - 1 - step, columns)] !== antiSymbol) {
        antiMatch = false
        break
      }
    }
    if (antiMatch) {
      const indices = Array.from({ length: size }, (_, step) =>
        getIndex(step, columns - 1 - step, columns),
      )
      lines.push({ pattern: 'diagonal', indices })
    }
  }

  if (tier.winPatterns.includes('bonus')) {
    const centerRow = Math.floor(rows / 2)
    const centerCol = Math.floor(columns / 2)
    const centerSymbol = grid[getIndex(centerRow, centerCol, columns)]
    const bonusIndices = grid
      .map((symbol, index) => (symbol === centerSymbol ? index : -1))
      .filter((index) => index !== -1)
    if (bonusIndices.length >= Math.min(3, rows)) {
      lines.push({ pattern: 'bonus', indices: bonusIndices })
    }
  }

  return lines
}

export const evaluateScratchcardResults = (
  grid: string[],
  tier: ScratchcardTier,
  rng: () => number = Math.random,
) => {
  const wins = getScratchcardWinningLines(grid, tier)
    .map((line) => line.pattern)
    .slice(0, tier.prizeSlots)
  if (wins.length === 0) {
    return []
  }

  const multiplierRoll =
    tier.winPatterns.includes('multiplier') && rng() < tier.odds.multiplierChance
      ? [2, 3, 5][Math.floor(rng() * 3)]
      : 1

  return wins.map((pattern) => {
    const prize =
      rng() < tier.odds.jackpotChance
        ? jackpotPick(tier.prizes)
        : weightedPick(tier.prizes, rng)
    const amount = rollAmount(prize, rng)
    return {
      label: prize.label,
      amount: amount * multiplierRoll,
      currency: prize.currency,
      pattern,
      multiplier: multiplierRoll > 1 ? multiplierRoll : undefined,
    }
  })
}

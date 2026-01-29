/**
 * Games Hub Page
 * Central hub for all mini-games with grid layout
 */

import { ArrowLeft, GameController } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { GameCard } from '@/components/games/GameCard'
import { GameOverlay } from '@/components/games/GameOverlay'
import { GameLoadingScreen } from '@/components/games/GameLoadingScreen'
import { WheelOfFortuneModal } from '@/components/WheelOfFortuneModal'
import { GAMES_CONFIG } from '@/lib/gamesConfig'
import { useGameOverlay } from '@/hooks/useGameOverlay'
import { useSound } from '@/hooks/useSound'

// Import all game placeholders
import { StockRush } from '@/components/games/placeholders/StockRush'
import { VaultHeist } from '@/components/games/placeholders/VaultHeist'
import { MarketMayhem } from '@/components/games/placeholders/MarketMayhem'
import { PortfolioPoker } from '@/components/games/placeholders/PortfolioPoker'
import { DividendDerby } from '@/components/games/placeholders/DividendDerby'
import { BullRun } from '@/components/games/placeholders/BullRun'
import { BearTrap } from '@/components/games/placeholders/BearTrap'
import { IpoFrenzy } from '@/components/games/placeholders/IpoFrenzy'
import { MergerMania } from '@/components/games/placeholders/MergerMania'

interface GamesHubProps {
  onBack?: () => void
}

const DEMO_WHEEL_SPINS_LIMIT = 3
const DEMO_WHEEL_FREE_SPINS = 1
const DEMO_WHEEL_STARTING_COINS = 250

export function GamesHub({ onBack }: GamesHubProps) {
  const { activeGame, isLoading, openGame, closeGame } = useGameOverlay()
  const { play: playSound } = useSound()
  const [wheelCoins, setWheelCoins] = useState(DEMO_WHEEL_STARTING_COINS)
  const [wheelSpinsRemaining, setWheelSpinsRemaining] = useState(DEMO_WHEEL_SPINS_LIMIT)
  const [wheelFreeSpins, setWheelFreeSpins] = useState(DEMO_WHEEL_FREE_SPINS)
  const [wheelCash, setWheelCash] = useState(0)
  const [wheelStars, setWheelStars] = useState(0)
  const [wheelRolls, setWheelRolls] = useState(0)
  const [wheelXp, setWheelXp] = useState(0)

  // Map game IDs to their components
  const gameComponents: Record<string, React.ComponentType<{ onClose: () => void }>> = {
    'stock-rush': StockRush,
    'vault-heist': VaultHeist,
    'market-mayhem': MarketMayhem,
    'portfolio-poker': PortfolioPoker,
    'dividend-derby': DividendDerby,
    'bull-run': BullRun,
    'bear-trap': BearTrap,
    'ipo-frenzy': IpoFrenzy,
    'merger-mania': MergerMania,
  }

  const ActiveGameComponent = activeGame ? gameComponents[activeGame] : null
  const activeGameConfig = activeGame ? GAMES_CONFIG.find(g => g.id === activeGame) : null

  const resetWheelDemo = useCallback(() => {
    setWheelCoins(DEMO_WHEEL_STARTING_COINS)
    setWheelSpinsRemaining(DEMO_WHEEL_SPINS_LIMIT)
    setWheelFreeSpins(DEMO_WHEEL_FREE_SPINS)
    setWheelCash(0)
    setWheelStars(0)
    setWheelRolls(0)
    setWheelXp(0)
  }, [])

  useEffect(() => {
    if (activeGame === 'wheel-of-fortune') {
      resetWheelDemo()
    }
  }, [activeGame, resetWheelDemo])

  const handleGameSelect = useCallback((gameId: string, status: 'coming-soon' | 'playable') => {
    if (status !== 'playable') return
    openGame(gameId)
  }, [openGame])

  const handleWheelSpinComplete = useCallback((prize: { id: string; type: string; value: number }, value: number) => {
    setWheelSpinsRemaining(prev => Math.max(0, prev - 1))

    switch (prize.type) {
      case 'coins':
        setWheelCoins(prev => prev + value)
        break
      case 'stars':
        setWheelStars(prev => prev + value)
        break
      case 'cash':
        setWheelCash(prev => prev + value)
        break
      case 'rolls':
        setWheelRolls(prev => prev + value)
        break
      case 'xp':
        setWheelXp(prev => prev + value)
        break
      case 'spin-again':
        setWheelFreeSpins(prev => prev + 1)
        break
      case 'jackpot':
        if (prize.id === 'jackpot-stars') {
          setWheelStars(prev => prev + value)
        } else {
          setWheelCash(prev => prev + value)
        }
        break
      default:
        break
    }
  }, [])

  const wheelBalances = useMemo(() => ([
    { label: '💵 Cash', value: `$${wheelCash.toLocaleString()}` },
    { label: '⭐ Stars', value: wheelStars.toLocaleString() },
    { label: '🎲 Rolls', value: wheelRolls.toLocaleString() },
    { label: '⚡ XP', value: wheelXp.toLocaleString() },
  ]), [wheelCash, wheelRolls, wheelStars, wheelXp])

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        {/* Header */}
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-4">
              <GameController size={48} weight="fill" className="text-purple-500" />
              <div>
                <h1 className="text-4xl font-bold text-white">Mini-Games Hub</h1>
                <p className="text-slate-400">Choose a game to play</p>
              </div>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {/* Games Grid */}
          <div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="grid"
            aria-label="Mini-games collection"
          >
            {GAMES_CONFIG.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleGameSelect(game.id, game.status)}
              />
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center text-slate-500">
            <p className="text-sm">
              More games coming soon! Each mini-game offers unique challenges and rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Screen */}
      {isLoading && activeGameConfig && (
        <GameLoadingScreen
          gameName={activeGameConfig.name}
          emoji={activeGameConfig.emoji}
        />
      )}

      {activeGame === 'wheel-of-fortune' && !isLoading ? (
        <WheelOfFortuneModal
          isOpen
          onClose={closeGame}
          coins={wheelCoins}
          balanceLabel="Demo balance"
          secondaryBalances={wheelBalances}
          currentRing={1}
          spinsRemaining={wheelSpinsRemaining}
          spinsLimit={DEMO_WHEEL_SPINS_LIMIT}
          freeSpinsRemaining={wheelFreeSpins}
          onSpinComplete={handleWheelSpinComplete}
          onSpendCoins={(amount) => {
            if (wheelSpinsRemaining <= 0) {
              return false
            }
            if (amount > 0) {
              if (wheelCoins >= amount) {
                setWheelCoins(prev => prev - amount)
                return true
              }
              return false
            }
            if (wheelFreeSpins > 0) {
              setWheelFreeSpins(prev => prev - 1)
              return true
            }
            return false
          }}
          playSound={playSound}
        />
      ) : (
        <GameOverlay isOpen={!!activeGame && !isLoading} onClose={closeGame}>
          {ActiveGameComponent && <ActiveGameComponent onClose={closeGame} />}
        </GameOverlay>
      )}
    </>
  )
}

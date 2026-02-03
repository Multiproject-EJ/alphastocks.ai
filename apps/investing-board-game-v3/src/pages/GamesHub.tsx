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
import { useMiniGames } from '@/hooks/useMiniGames'
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
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
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

  const handleGameSelect = useCallback((gameId: string, isPlayable: boolean) => {
    if (!isPlayable) return
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

  const wheelAvailability = useMemo(() => {
    const activeHappyHour = activeMiniGames.find(game => game.id === 'happy-hour-wheel')
    const upcomingHappyHour = upcomingMiniGames.find(game => game.id === 'happy-hour-wheel')
    const remaining = activeHappyHour ? getTimeRemaining(activeHappyHour) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeHappyHour) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Happy Hour live • ${remaining.display} left` : 'Happy Hour live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingHappyHour
        ? `Next happy hour • ${formatTime(upcomingHappyHour.startsAt)}`
        : 'Happy Hour schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const stockRushAvailability = useMemo(() => {
    const activeRush = activeMiniGames.find(game => game.id === 'stock-rush')
    const upcomingRush = upcomingMiniGames.find(game => game.id === 'stock-rush')
    const remaining = activeRush ? getTimeRemaining(activeRush) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeRush) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Rush live • ${remaining.display} left` : 'Rush live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingRush
        ? `Next rush • ${formatTime(upcomingRush.startsAt)}`
        : 'Rush schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const vaultHeistAvailability = useMemo(() => {
    const activeHeist = activeMiniGames.find(game => game.id === 'vault-heist')
    const upcomingHeist = upcomingMiniGames.find(game => game.id === 'vault-heist')
    const remaining = activeHeist ? getTimeRemaining(activeHeist) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeHeist) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Heist live • ${remaining.display} left` : 'Heist live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingHeist
        ? `Next heist • ${formatTime(upcomingHeist.startsAt)}`
        : 'Heist schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const marketMayhemAvailability = useMemo(() => {
    const activeMayhem = activeMiniGames.find(game => game.id === 'market-mayhem')
    const upcomingMayhem = upcomingMiniGames.find(game => game.id === 'market-mayhem')
    const remaining = activeMayhem ? getTimeRemaining(activeMayhem) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeMayhem) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Mayhem live • ${remaining.display} left` : 'Mayhem live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingMayhem
        ? `Next surge • ${formatTime(upcomingMayhem.startsAt)}`
        : 'Mayhem schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const portfolioPokerAvailability = useMemo(() => {
    const activePoker = activeMiniGames.find(game => game.id === 'portfolio-poker')
    const upcomingPoker = upcomingMiniGames.find(game => game.id === 'portfolio-poker')
    const remaining = activePoker ? getTimeRemaining(activePoker) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activePoker) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Poker live • ${remaining.display} left` : 'Poker live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingPoker
        ? `Next table • ${formatTime(upcomingPoker.startsAt)}`
        : 'Poker schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const dividendDerbyAvailability = useMemo(() => {
    const activeDerby = activeMiniGames.find(game => game.id === 'dividend-derby')
    const upcomingDerby = upcomingMiniGames.find(game => game.id === 'dividend-derby')
    const remaining = activeDerby ? getTimeRemaining(activeDerby) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeDerby) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Derby live • ${remaining.display} left` : 'Derby live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingDerby
        ? `Next derby • ${formatTime(upcomingDerby.startsAt)}`
        : 'Derby schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const bullRunAvailability = useMemo(() => {
    const activeBullRun = activeMiniGames.find(game => game.id === 'bull-run')
    const upcomingBullRun = upcomingMiniGames.find(game => game.id === 'bull-run')
    const remaining = activeBullRun ? getTimeRemaining(activeBullRun) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeBullRun) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Bull Run live • ${remaining.display} left` : 'Bull Run live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingBullRun
        ? `Next run • ${formatTime(upcomingBullRun.startsAt)}`
        : 'Bull Run schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const bearTrapAvailability = useMemo(() => {
    const activeBearTrap = activeMiniGames.find(game => game.id === 'bear-trap')
    const upcomingBearTrap = upcomingMiniGames.find(game => game.id === 'bear-trap')
    const remaining = activeBearTrap ? getTimeRemaining(activeBearTrap) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeBearTrap) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Bear Trap live • ${remaining.display} left` : 'Bear Trap live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingBearTrap
        ? `Next drop • ${formatTime(upcomingBearTrap.startsAt)}`
        : 'Bear Trap schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const ipoFrenzyAvailability = useMemo(() => {
    const activeIpo = activeMiniGames.find(game => game.id === 'ipo-frenzy')
    const upcomingIpo = upcomingMiniGames.find(game => game.id === 'ipo-frenzy')
    const remaining = activeIpo ? getTimeRemaining(activeIpo) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeIpo) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `IPO Frenzy live • ${remaining.display} left` : 'IPO Frenzy live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingIpo
        ? `Next IPO window • ${formatTime(upcomingIpo.startsAt)}`
        : 'IPO schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

  const mergerManiaAvailability = useMemo(() => {
    const activeMerger = activeMiniGames.find(game => game.id === 'merger-mania')
    const upcomingMerger = upcomingMiniGames.find(game => game.id === 'merger-mania')
    const remaining = activeMerger ? getTimeRemaining(activeMerger) : null
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (activeMerger) {
      return {
        isPlayable: true,
        statusLabel: 'Play',
        availabilityLabel: remaining ? `Merger Mania live • ${remaining.display} left` : 'Merger Mania live',
      }
    }

    return {
      isPlayable: false,
      statusLabel: 'Closed',
      availabilityLabel: upcomingMerger
        ? `Next deal window • ${formatTime(upcomingMerger.startsAt)}`
        : 'Deal schedule pending',
    }
  }, [activeMiniGames, upcomingMiniGames, getTimeRemaining])

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
                onClick={() => handleGameSelect(
                game.id,
                game.id === 'wheel-of-fortune'
                  ? wheelAvailability.isPlayable
                  : game.id === 'stock-rush'
                    ? stockRushAvailability.isPlayable
                    : game.id === 'vault-heist'
                      ? vaultHeistAvailability.isPlayable
                      : game.id === 'market-mayhem'
                        ? marketMayhemAvailability.isPlayable
                        : game.id === 'portfolio-poker'
                          ? portfolioPokerAvailability.isPlayable
                          : game.id === 'dividend-derby'
                            ? dividendDerbyAvailability.isPlayable
                            : game.id === 'bull-run'
                            ? bullRunAvailability.isPlayable
                            : game.id === 'bear-trap'
                              ? bearTrapAvailability.isPlayable
                              : game.id === 'ipo-frenzy'
                                ? ipoFrenzyAvailability.isPlayable
                                : game.id === 'merger-mania'
                                  ? mergerManiaAvailability.isPlayable
                        : game.status === 'playable',
                )}
                isPlayable={game.id === 'wheel-of-fortune'
                  ? wheelAvailability.isPlayable
                  : game.id === 'stock-rush'
                    ? stockRushAvailability.isPlayable
                    : game.id === 'vault-heist'
                      ? vaultHeistAvailability.isPlayable
                      : game.id === 'market-mayhem'
                      ? marketMayhemAvailability.isPlayable
                      : game.id === 'portfolio-poker'
                        ? portfolioPokerAvailability.isPlayable
                        : game.id === 'dividend-derby'
                          ? dividendDerbyAvailability.isPlayable
                          : game.id === 'bull-run'
                            ? bullRunAvailability.isPlayable
                            : game.id === 'bear-trap'
                              ? bearTrapAvailability.isPlayable
                              : game.id === 'ipo-frenzy'
                                ? ipoFrenzyAvailability.isPlayable
                                : game.id === 'merger-mania'
                                  ? mergerManiaAvailability.isPlayable
                        : undefined}
                statusLabel={game.id === 'wheel-of-fortune'
                  ? wheelAvailability.statusLabel
                  : game.id === 'stock-rush'
                    ? stockRushAvailability.statusLabel
                    : game.id === 'vault-heist'
                      ? vaultHeistAvailability.statusLabel
                      : game.id === 'market-mayhem'
                      ? marketMayhemAvailability.statusLabel
                      : game.id === 'portfolio-poker'
                        ? portfolioPokerAvailability.statusLabel
                        : game.id === 'dividend-derby'
                        ? dividendDerbyAvailability.statusLabel
                        : game.id === 'bull-run'
                          ? bullRunAvailability.statusLabel
                          : game.id === 'bear-trap'
                            ? bearTrapAvailability.statusLabel
                            : game.id === 'ipo-frenzy'
                              ? ipoFrenzyAvailability.statusLabel
                              : game.id === 'merger-mania'
                                ? mergerManiaAvailability.statusLabel
                        : undefined}
                availabilityLabel={game.id === 'wheel-of-fortune'
                  ? wheelAvailability.availabilityLabel
                  : game.id === 'stock-rush'
                    ? stockRushAvailability.availabilityLabel
                    : game.id === 'vault-heist'
                      ? vaultHeistAvailability.availabilityLabel
                      : game.id === 'market-mayhem'
                      ? marketMayhemAvailability.availabilityLabel
                      : game.id === 'portfolio-poker'
                        ? portfolioPokerAvailability.availabilityLabel
                        : game.id === 'dividend-derby'
                        ? dividendDerbyAvailability.availabilityLabel
                        : game.id === 'bull-run'
                          ? bullRunAvailability.availabilityLabel
                          : game.id === 'bear-trap'
                            ? bearTrapAvailability.availabilityLabel
                            : game.id === 'ipo-frenzy'
                              ? ipoFrenzyAvailability.availabilityLabel
                              : game.id === 'merger-mania'
                                ? mergerManiaAvailability.availabilityLabel
                        : undefined}
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

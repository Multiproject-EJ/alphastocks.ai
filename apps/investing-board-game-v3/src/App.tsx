import { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { WealthThrone } from '@/components/WealthThrone'
import { Tile } from '@/components/Tile'
import { DiceHUD } from '@/components/DiceHUD'
import { HubModal } from '@/components/HubModal'
import { CentralStockCard } from '@/components/CentralStockCard'
import { StockModal } from '@/components/StockModal'
import { EventModal } from '@/components/EventModal'
import { ThriftyPathModal } from '@/components/ThriftyPathModal'
import { PortfolioModal } from '@/components/PortfolioModal'
import { ProToolsOverlay } from '@/components/ProToolsOverlay'
import { BiasSanctuaryModal } from '@/components/BiasSanctuaryModal'
import { GameState, Stock, BiasCaseStudy } from '@/lib/types'
import {
  BOARD_TILES,
  getRandomMarketEvent,
  getRandomBiasCaseStudy,
  THRIFTY_CHALLENGES,
} from '@/lib/mockData'
import { Info, Star, ChartLine, Toolbox } from '@phosphor-icons/react'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'

type Phase = 'idle' | 'rolling' | 'moving' | 'landed'

const DAILY_ROLL_LIMIT = 10

function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow
}

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const stockSourceAnnounced = useRef<'supabase' | 'mock' | null>(null)

  const [gameState, setGameState] = useState<GameState>({
    cash: 100000,
    position: 0,
    netWorth: 100000,
    portfolioValue: 0,
    stars: 0,
    holdings: [],
  })

  const [phase, setPhase] = useState<Phase>('idle')
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [rollsRemaining, setRollsRemaining] = useState(DAILY_ROLL_LIMIT)
  const [nextResetTime, setNextResetTime] = useState(getNextMidnight())
  const [hoppingTiles, setHoppingTiles] = useState<number[]>([])

  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [currentStock, setCurrentStock] = useState<Stock | null>(null)
  const [showCentralStock, setShowCentralStock] = useState(false)

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState('')

  const [thriftyModalOpen, setThriftyModalOpen] = useState(false)

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)

  const [hubModalOpen, setHubModalOpen] = useState(false)

  const [proToolsOpen, setProToolsOpen] = useState(false)

  const [biasSanctuaryModalOpen, setBiasSanctuaryModalOpen] = useState(false)
  const [currentCaseStudy, setCurrentCaseStudy] = useState<BiasCaseStudy | null>(null)

  const rollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const landingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { getStockForCategory, loading: loadingUniverse, error: universeError, source: stockSource, universeCount } =
    useUniverseStocks()

  useEffect(() => {
    const checkReset = setInterval(() => {
      const now = new Date()
      if (now >= nextResetTime) {
        setRollsRemaining(DAILY_ROLL_LIMIT)
        setNextResetTime(getNextMidnight())
        toast.info('Daily dice rolls refreshed!', {
          description: `You have ${DAILY_ROLL_LIMIT} new rolls available`,
        })
      }
    }, 1000)

    return () => clearInterval(checkReset)
  }, [nextResetTime])

  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
      if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
      if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (universeError) {
      toast.error('Unable to load your Supabase universe', {
        description: universeError,
      })
    }
  }, [universeError])

  useEffect(() => {
    if (loadingUniverse || universeError || !stockSource) return
    if (stockSourceAnnounced.current === stockSource) return

    if (stockSource === 'supabase') {
      toast.success('Using your Supabase investment universe', {
        description: universeCount
          ? `Loaded ${universeCount} saved stocks for board draws.`
          : 'Add stocks to your universe to personalize the board.',
      })
    } else {
      toast.info('Using built-in demo stocks', {
        description: 'Connect Supabase and add symbols to see your picks here.',
      })
    }

    stockSourceAnnounced.current = stockSource
  }, [loadingUniverse, stockSource, universeCount, universeError])

  useEffect(() => {
    const noActiveOverlays =
      !stockModalOpen &&
      !eventModalOpen &&
      !thriftyModalOpen &&
      !biasSanctuaryModalOpen &&
      !showCentralStock

    if (phase === 'landed' && noActiveOverlays) {
      setPhase('idle')
    }
  }, [stockModalOpen, eventModalOpen, thriftyModalOpen, biasSanctuaryModalOpen, showCentralStock, phase])

  const handleRoll = () => {
    if (phase !== 'idle') {
      toast.info('Finish your current action first', {
        description: 'Close any open cards or modals before rolling again.',
      })
      return
    }

    if (rollsRemaining <= 0) {
      toast.error('No rolls remaining', {
        description: 'Daily rolls refresh at midnight.',
      })
      return
    }

    // clear any lingering timers from a previous roll to keep movement predictable
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
    if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)

    setPhase('rolling')
    const roll = Math.floor(Math.random() * 6) + 1
    setLastRoll(roll)

    rollTimeoutRef.current = setTimeout(() => {
      setPhase('moving')
      const startPosition = gameState.position
      const tilesToHop: number[] = []

      for (let i = 1; i <= roll; i++) {
        tilesToHop.push((startPosition + i) % BOARD_TILES.length)
      }

      let currentHop = 0
      hopIntervalRef.current = setInterval(() => {
        if (currentHop < tilesToHop.length) {
          setHoppingTiles([tilesToHop[currentHop]])
          setGameState((prev) => ({ ...prev, position: tilesToHop[currentHop] }))
          currentHop++
        } else {
          if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
          setHoppingTiles([])

          landingTimeoutRef.current = setTimeout(() => {
            setPhase('landed')
            const newPosition = tilesToHop[tilesToHop.length - 1]
            handleTileLanding(newPosition)
            setRollsRemaining((prev) => prev - 1)
          }, 200)
        }
      }, 200)
    }, 600)
  }

  const handleTileLanding = (position: number) => {
    const tile = BOARD_TILES[position]

    if (tile.type === 'category' && tile.category) {
      const stock = getStockForCategory(tile.category)
      setCurrentStock(stock)

      setShowCentralStock(true)

      setTimeout(() => {
        const showThrifty = Math.random() > 0.6
        if (showThrifty) {
          setThriftyModalOpen(true)
        } else {
          setStockModalOpen(true)
        }
      }, 2000)
    } else if (tile.type === 'event') {
      if (tile.title === 'Quiz') {
        setThriftyModalOpen(true)
      } else {
        const event = getRandomMarketEvent()
        setCurrentEvent(event)
        setEventModalOpen(true)
      }
    } else if (tile.type === 'corner') {
      if (tile.title === 'Start / ThriftyPath') {
        setGameState((prev) => ({
          ...prev,
          cash: prev.cash + 20000,
          netWorth: prev.netWorth + 20000,
        }))
        toast.success('Passed Start! Collected $20,000', {
          description: 'Keep building your portfolio',
        })
      } else if (tile.title === 'Free Parking') {
        toast.info('Free Parking', {
          description: 'Feature coming soon',
        })
      } else if (tile.title === 'Court of Capital') {
        toast.info('Court of Capital', {
          description: 'Feature coming soon',
        })
      } else if (tile.title === 'Bias Sanctuary') {
        const caseStudy = getRandomBiasCaseStudy()
        setCurrentCaseStudy(caseStudy)
        setBiasSanctuaryModalOpen(true)
      }
      setTimeout(() => setPhase('idle'), 1000)
    }
  }

  const handleBuyStock = (multiplier: number) => {
    if (!currentStock) return

    const baseShares = 10
    const shares = Math.floor(baseShares * multiplier)
    const totalCost = currentStock.price * shares

    if (gameState.cash < totalCost) {
      toast.error('Insufficient funds', {
        description: `You need $${totalCost.toLocaleString()} but only have $${gameState.cash.toLocaleString()}`,
      })
      return
    }

    setGameState((prev) => {
      const newCash = prev.cash - totalCost
      const newPortfolioValue = prev.portfolioValue + totalCost
      const newNetWorth = newCash + newPortfolioValue

      return {
        ...prev,
        cash: newCash,
        portfolioValue: newPortfolioValue,
        netWorth: newNetWorth,
        holdings: [
          ...prev.holdings,
          {
            stock: currentStock,
            shares,
            totalCost,
          },
        ],
      }
    })

    toast.success(`Purchased ${shares} shares of ${currentStock.ticker}`, {
      description: `Total cost: $${totalCost.toLocaleString()}`,
    })

    setStockModalOpen(false)
    setShowCentralStock(false)
    setCurrentStock(null)
    setTimeout(() => setPhase('idle'), 500)
  }

  const handleChooseChallenge = (challenge: typeof THRIFTY_CHALLENGES[0]) => {
    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + challenge.reward,
    }))

    toast.success(`Challenge accepted: ${challenge.title}`, {
      description: `Earned ${challenge.reward} stars! ⭐`,
    })

    setTimeout(() => {
      if (currentStock) {
        setStockModalOpen(true)
      } else {
        setPhase('idle')
      }
    }, 500)
  }

  const handleBiasQuizComplete = (correct: number, total: number) => {
    const percentage = (correct / total) * 100
    const starsEarned = correct === total ? 5 : correct >= total / 2 ? 3 : 1

    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + starsEarned,
    }))

    toast.success(`Quiz complete: ${correct}/${total} correct`, {
      description: `Earned ${starsEarned} stars! ⭐ ${percentage >= 100 ? 'Perfect score!' : ''}`,
    })
  }

  const netWorthChange = ((gameState.netWorth - 100000) / 100000) * 100

  return (
    <div className="relative isolate min-h-screen bg-background p-8 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-cover bg-center opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <Toaster position="top-center" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div
          ref={boardRef}
          className="relative bg-gradient-to-br from-white/15 via-white/8 to-white/12 backdrop-blur-2xl rounded-2xl border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)] p-8 min-h-[900px]"
        >
          <header className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
            <img
              src="/board-game-v3/Logo.webp"
              alt="Investing Board Game logo"
              className="mx-auto mb-4 h-56 w-auto max-w-[420px] drop-shadow-xl md:h-64"
            />
            <div className="flex items-center justify-center gap-6 pointer-events-auto">
              <button
                onClick={() => setHubModalOpen(true)}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <Star size={20} className="text-accent" weight="fill" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Stars</div>
                    <div className="text-2xl font-bold text-accent font-mono">{gameState.stars}</div>
                  </div>
                  <Info size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </button>
              <WealthThrone netWorthChange={netWorthChange} holdingsCount={gameState.holdings.length} />
              <button
                onClick={() => setPortfolioModalOpen(true)}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <ChartLine size={20} className="text-accent" weight="bold" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio</div>
                    <div className="text-2xl font-bold text-accent font-mono">${(gameState.portfolioValue / 1000).toFixed(0)}k</div>
                  </div>
                  <Info size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </button>
            </div>
          </header>

          <CentralStockCard
            stock={currentStock}
            isVisible={showCentralStock}
            onClose={() => setShowCentralStock(false)}
          />

          {/* Pro Tools Button */}
          <div className="absolute bottom-8 right-8 z-40">
            <Button
              onClick={() => {
                const proToolsUrl = 'https://www.alphastocks.ai/?proTools=1'
                if (typeof window !== 'undefined') {
                  window.location.href = proToolsUrl
                  return
                }
                setProToolsOpen(true)
              }}
              className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full w-14 h-14 p-0"
              size="icon"
              aria-label="Open Pro Tools"
            >
              <Toolbox size={20} weight="bold" />
            </Button>
          </div>

          <DiceHUD
            onRoll={handleRoll}
            lastRoll={lastRoll}
            phase={phase}
            rollsRemaining={rollsRemaining}
            nextResetTime={nextResetTime}
            boardRef={boardRef}
          />

          <div className="absolute inset-8 pointer-events-none">
            <div className="relative w-full h-full">
              <div className="absolute bottom-0 left-0 right-0 flex gap-0 pointer-events-auto">
                {BOARD_TILES.slice(0, 8).map((tile, index) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="bottom"
                  />
                ))}
              </div>

              <div className="absolute top-[200px] bottom-[200px] right-0 flex flex-col gap-0 pointer-events-auto">
                {BOARD_TILES.slice(8, 11).map((tile) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="right"
                  />
                ))}
              </div>

              <div className="absolute top-0 left-0 right-0 flex flex-row-reverse gap-0 pointer-events-auto">
                {BOARD_TILES.slice(11, 18).map((tile, index) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="top"
                  />
                ))}
              </div>

              <div className="absolute top-[200px] bottom-[200px] left-0 flex flex-col flex-col-reverse gap-0 pointer-events-auto">
                {BOARD_TILES.slice(18).map((tile) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="left"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HubModal
        open={hubModalOpen}
        onOpenChange={setHubModalOpen}
        gameState={gameState}
      />

      <StockModal
        open={stockModalOpen}
        onOpenChange={(open) => {
          setStockModalOpen(open)
          if (!open) {
            setShowCentralStock(false)
            setCurrentStock(null)
            setTimeout(() => setPhase('idle'), 300)
          }
        }}
        stock={currentStock}
        onBuy={handleBuyStock}
        cash={gameState.cash}
      />

      <EventModal
        open={eventModalOpen}
        onOpenChange={(open) => {
          setEventModalOpen(open)
          if (!open) {
            setTimeout(() => setPhase('idle'), 300)
          }
        }}
        eventText={currentEvent}
      />

      <ThriftyPathModal
        open={thriftyModalOpen}
        onOpenChange={(open) => {
          setThriftyModalOpen(open)
          if (!open && !currentStock) {
            setTimeout(() => setPhase('idle'), 300)
          }
        }}
        challenges={THRIFTY_CHALLENGES}
        onChoose={handleChooseChallenge}
      />

      <PortfolioModal
        open={portfolioModalOpen}
        onOpenChange={setPortfolioModalOpen}
        gameState={gameState}
      />

      <ProToolsOverlay
        open={proToolsOpen}
        onOpenChange={setProToolsOpen}
        gameState={gameState}
      />

      <BiasSanctuaryModal
        open={biasSanctuaryModalOpen}
        onOpenChange={(open) => {
          setBiasSanctuaryModalOpen(open)
          if (!open) {
            setCurrentCaseStudy(null)
            setTimeout(() => setPhase('idle'), 300)
          }
        }}
        caseStudy={currentCaseStudy}
        onComplete={handleBiasQuizComplete}
      />
    </div>
  )
}

export default App

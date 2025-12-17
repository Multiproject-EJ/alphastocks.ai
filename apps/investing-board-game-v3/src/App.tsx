import { useState, useEffect, useRef, useCallback } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { CenterCarousel } from '@/components/CenterCarousel'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { CasinoModal } from '@/components/CasinoModal'
import { UserIndicator } from '@/components/UserIndicator'
import { GameState, Stock, BiasCaseStudy } from '@/lib/types'
import {
  BOARD_TILES,
  getRandomMarketEvent,
  getRandomBiasCaseStudy,
  THRIFTY_CHALLENGES,
} from '@/lib/mockData'
import {
  DAILY_ROLL_LIMIT,
  AUTO_SAVE_DEBOUNCE_MS,
  AUTO_SAVE_TIMEOUT_MS,
  getNextMidnight,
} from '@/lib/constants'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'
import { useGameSave } from '@/hooks/useGameSave'
import { useAuth } from '@/context/AuthContext'

type Phase = 'idle' | 'rolling' | 'moving' | 'landed'

// Debug helper function - logs only when DEBUG_GAME is enabled in localStorage
const debugGame = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && localStorage.getItem('DEBUG_GAME') === 'true') {
    console.log('[DEBUG]', ...args)
  }
}

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const stockSourceAnnounced = useRef<'supabase' | 'mock' | null>(null)
  const gameLoadedFromSave = useRef(false)
  const lastSaveTimeRef = useRef<Date | null>(null)

  // Default initial game state
  const defaultGameState: GameState = {
    cash: 100000,
    position: 0,
    netWorth: 100000,
    portfolioValue: 0,
    stars: 0,
    holdings: [],
  }

  const [gameState, setGameState] = useState<GameState>(defaultGameState)

  const [phase, setPhase] = useState<Phase>('idle')
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [rollsRemaining, setRollsRemaining] = useState(DAILY_ROLL_LIMIT)
  const [nextResetTime, setNextResetTime] = useState(getNextMidnight())
  const [hoppingTiles, setHoppingTiles] = useState<number[]>([])
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

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

  const [casinoModalOpen, setCasinoModalOpen] = useState(false)

  const [diceResetKey, setDiceResetKey] = useState(0)

  const [showCelebration, setShowCelebration] = useState(false)

  const rollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const landingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { getStockForCategory, loading: loadingUniverse, error: universeError, source: stockSource, universeCount } =
    useUniverseStocks()

  // Authentication and game save hooks
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
    loading: saveLoading,
    saving,
    savedGameState,
    savedRolls,
    saveGame,
  } = useGameSave()

  // Load saved game state when available
  useEffect(() => {
    if (saveLoading || authLoading || gameLoadedFromSave.current) return
    
    if (savedGameState && isAuthenticated) {
      debugGame('Loading saved game state:', savedGameState)
      setGameState(savedGameState)
      gameLoadedFromSave.current = true
      toast.success('Welcome back!', {
        description: 'Your game progress has been restored.',
      })
    }
  }, [savedGameState, saveLoading, authLoading, isAuthenticated])

  // Load saved rolls when available
  useEffect(() => {
    if (saveLoading || authLoading || !savedRolls) return
    
    const now = new Date()
    if (now >= savedRolls.resetAt) {
      // Rolls have expired, reset them
      setRollsRemaining(DAILY_ROLL_LIMIT)
      setNextResetTime(getNextMidnight())
    } else {
      setRollsRemaining(savedRolls.remaining)
      setNextResetTime(savedRolls.resetAt)
    }
  }, [savedRolls, saveLoading, authLoading])

  // Auto-save game state when it changes (debounced)
  const debouncedSave = useCallback(() => {
    if (!isAuthenticated || phase !== 'idle') return
    
    // Debounce saves to avoid excessive API calls
    const now = Date.now()
    const lastSave = lastSaveTimeRef.current?.getTime() || 0
    const timeSinceLastSave = now - lastSave
    
    // Only save if enough time has passed since last save
    if (timeSinceLastSave < AUTO_SAVE_DEBOUNCE_MS) {
      debugGame('Skipping save - too soon since last save')
      return
    }
    
    debugGame('Auto-saving game state...')
    lastSaveTimeRef.current = new Date()
    setLastSavedTime(lastSaveTimeRef.current)
    saveGame(gameState, rollsRemaining, nextResetTime)
  }, [isAuthenticated, phase, gameState, rollsRemaining, nextResetTime, saveGame])

  // Trigger auto-save when game state changes and player is idle
  useEffect(() => {
    if (!isAuthenticated || phase !== 'idle' || authLoading || saveLoading) return
    
    // Don't save if we just loaded the game
    if (!gameLoadedFromSave.current && savedGameState) return
    
    const saveTimeout = setTimeout(() => {
      debouncedSave()
    }, AUTO_SAVE_TIMEOUT_MS)

    return () => clearTimeout(saveTimeout)
  }, [gameState, phase, isAuthenticated, authLoading, saveLoading, savedGameState, debouncedSave])

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
      !casinoModalOpen &&
      !showCentralStock

    if (phase === 'landed' && noActiveOverlays) {
      debugGame('Phase transition: landed -> idle (no active overlays)')
      setPhase('idle')
    }
  }, [stockModalOpen, eventModalOpen, thriftyModalOpen, biasSanctuaryModalOpen, casinoModalOpen, showCentralStock, phase])

  const handleRoll = () => {
    if (phase !== 'idle') {
      debugGame('Cannot roll - phase is not idle:', { phase, currentPosition: gameState.position })
      toast.info('Finish your current action first', {
        description: 'Close any open cards or modals before rolling again.',
      })
      return
    }

    if (rollsRemaining <= 0) {
      debugGame('No rolls remaining:', { rollsRemaining })
      toast.error('No rolls remaining', {
        description: 'Daily rolls refresh at midnight.',
      })
      return
    }

    // clear any lingering timers from a previous roll to keep movement predictable
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
    if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)

    const roll = Math.floor(Math.random() * 6) + 1
    debugGame('Dice roll started:', { roll, currentPosition: gameState.position, targetPosition: (gameState.position + roll) % BOARD_TILES.length })
    setPhase('rolling')
    setLastRoll(roll)

    rollTimeoutRef.current = setTimeout(() => {
      debugGame('Movement started')
      setPhase('moving')
      const startPosition = gameState.position
      const tilesToHop: number[] = []

      for (let i = 1; i <= roll; i++) {
        tilesToHop.push((startPosition + i) % BOARD_TILES.length)
      }

      // Check if player passes Start (position 0) - detect wrapping around the board
      const passedStart = startPosition + roll > BOARD_TILES.length - 1 && tilesToHop[tilesToHop.length - 1] !== 0

      let currentHop = 0
      hopIntervalRef.current = setInterval(() => {
        if (currentHop < tilesToHop.length) {
          // Capture position value before incrementing to avoid closure issues
          const nextPosition = tilesToHop[currentHop]
          setHoppingTiles([nextPosition])
          setGameState((prev) => ({ ...prev, position: nextPosition }))
          currentHop++
        } else {
          if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
          setHoppingTiles([])

          landingTimeoutRef.current = setTimeout(() => {
            const newPosition = tilesToHop[tilesToHop.length - 1]
            debugGame('Landing on tile:', { position: newPosition, tile: BOARD_TILES[newPosition] })
            setPhase('landed')
            handleTileLanding(newPosition, passedStart)
            setRollsRemaining((prev) => prev - 1)
          }, 200)
        }
      }, 200)
    }, 600)
  }

  const handleTileLanding = (position: number, passedStart = false) => {
    setDiceResetKey((prev) => prev + 1)

    const tile = BOARD_TILES[position]
    debugGame('handleTileLanding:', { position, tile, passedStart })

    // Handle passing Start (but not landing on it)
    if (passedStart) {
      setGameState((prev) => ({
        ...prev,
        stars: prev.stars + 200,
      }))
      toast.success('Passed Start! Collected 200 stars ⭐', {
        description: 'Keep moving around the board',
      })
    }

    if (tile.type === 'category' && tile.category) {
      debugGame('Category tile - showing stock card')
      const stock = getStockForCategory(tile.category)
      setCurrentStock(stock)

      setShowCentralStock(true)

      setTimeout(() => {
        const showThrifty = Math.random() > 0.6
        if (showThrifty) {
          debugGame('Opening Thrifty Path modal')
          setThriftyModalOpen(true)
        } else {
          debugGame('Opening Stock modal')
          setStockModalOpen(true)
        }
      }, 2000)
    } else if (tile.type === 'event') {
      debugGame('Event tile:', tile.title)
      if (tile.title === 'Quiz') {
        debugGame('Opening Thrifty Path modal for Quiz')
        setThriftyModalOpen(true)
      } else if (tile.title === 'Market Event') {
        debugGame('Opening Event modal')
        const event = getRandomMarketEvent()
        setCurrentEvent(event)
        setEventModalOpen(true)
      } else {
        // Fallback for event tiles without specific handlers (Wildcard, "?", etc.)
        debugGame('Event tile without handler - showing generic message and returning to idle')
        toast.info(tile.title, {
          description: 'This feature is coming soon!',
        })
        // Transition back to idle after a short delay
        setTimeout(() => {
          debugGame('Phase transition: landed -> idle (event fallback)')
          setPhase('idle')
        }, 1000)
      }
    } else if (tile.type === 'corner') {
      debugGame('Corner tile:', tile.title)
      if (tile.title === 'Start / ThriftyPath') {
        setGameState((prev) => ({
          ...prev,
          cash: prev.cash + 20000,
          netWorth: prev.netWorth + 20000,
        }))
        toast.success('Passed Start! Collected $20,000', {
          description: 'Keep building your portfolio',
        })
        // Transition back to idle after a short delay
        setTimeout(() => {
          debugGame('Phase transition: landed -> idle (Start corner)')
          setPhase('idle')
        }, 1000)
      } else if (tile.title === 'Casino') {
        setShowCelebration(true)
        toast.info('🎰 Welcome to the Casino!', {
          description: 'Feeling lucky today?',
        })
        debugGame('Opening Casino modal')
        setTimeout(() => {
          setCasinoModalOpen(true)
        }, 1000)
      } else if (tile.title === 'Court of Capital') {
        toast.info('Court of Capital', {
          description: 'Feature coming soon',
        })
        // Transition back to idle after a short delay
        setTimeout(() => {
          debugGame('Phase transition: landed -> idle (Court corner)')
          setPhase('idle')
        }, 1000)
      } else if (tile.title === 'Bias Sanctuary') {
        debugGame('Opening Bias Sanctuary modal')
        const caseStudy = getRandomBiasCaseStudy()
        setCurrentCaseStudy(caseStudy)
        setBiasSanctuaryModalOpen(true)
      }
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

    debugGame('Stock purchased - closing modals and returning to idle')
    setStockModalOpen(false)
    setShowCentralStock(false)
    setCurrentStock(null)
    setTimeout(() => {
      debugGame('Phase transition: landed -> idle (after stock purchase)')
      setPhase('idle')
    }, 500)
  }

  const handleChooseChallenge = (challenge: typeof THRIFTY_CHALLENGES[0]) => {
    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + challenge.reward,
    }))

    toast.success(`Challenge accepted: ${challenge.title}`, {
      description: `Earned ${challenge.reward} stars! ⭐`,
    })

    debugGame('Challenge chosen - checking if stock modal should open')
    setTimeout(() => {
      if (currentStock) {
        debugGame('Opening stock modal after challenge')
        setStockModalOpen(true)
      } else {
        debugGame('Phase transition: landed -> idle (after challenge, no stock)')
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

  const handleCasinoWin = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      netWorth: prev.netWorth + amount,
    }))
  }

  const netWorthChange = ((gameState.netWorth - 100000) / 100000) * 100

  return (
    <div className="relative isolate min-h-screen bg-background p-8 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-cover bg-center opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <Toaster position="top-center" />
      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div
          ref={boardRef}
          className="relative bg-gradient-to-br from-white/15 via-white/8 to-white/12 backdrop-blur-2xl rounded-2xl border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)] p-8 min-h-[900px]"
        >
          <header className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <CenterCarousel
              gameState={gameState}
              netWorthChange={netWorthChange}
              onStarsClick={() => setHubModalOpen(true)}
              onPortfolioClick={() => setPortfolioModalOpen(true)}
            />
          </header>

          <CentralStockCard
            stock={currentStock}
            isVisible={showCentralStock}
            onClose={() => setShowCentralStock(false)}
          />

          {/* User Indicator - Top Left */}
          <div className="absolute top-4 left-4 z-40">
            <UserIndicator saving={saving} lastSaved={lastSavedTime} />
          </div>

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
              className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold"
              aria-label="Open Pro Tools"
            >
              ProTools
            </Button>
          </div>

          <DiceHUD
            onRoll={handleRoll}
            lastRoll={lastRoll}
            phase={phase}
            rollsRemaining={rollsRemaining}
          nextResetTime={nextResetTime}
          boardRef={boardRef}
          resetPositionKey={diceResetKey}
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

              <div className="absolute top-[140px] bottom-[140px] right-0 flex flex-col-reverse gap-0 pointer-events-auto">
                {BOARD_TILES.slice(8, 13).map((tile) => (
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
                {BOARD_TILES.slice(13, 22).map((tile, index) => (
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

              <div className="absolute top-[140px] bottom-[140px] left-0 flex flex-col gap-0 pointer-events-auto">
                {BOARD_TILES.slice(22).map((tile) => (
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
          debugGame('Stock modal open change:', open)
          setStockModalOpen(open)
          if (!open) {
            debugGame('Stock modal closed - cleaning up')
            setShowCentralStock(false)
            setCurrentStock(null)
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (stock modal closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        stock={currentStock}
        onBuy={handleBuyStock}
        cash={gameState.cash}
      />

      <EventModal
        open={eventModalOpen}
        onOpenChange={(open) => {
          debugGame('Event modal open change:', open)
          setEventModalOpen(open)
          if (!open) {
            debugGame('Event modal closed')
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (event modal closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        eventText={currentEvent}
      />

      <ThriftyPathModal
        open={thriftyModalOpen}
        onOpenChange={(open) => {
          debugGame('Thrifty modal open change:', open)
          setThriftyModalOpen(open)
          if (!open) {
            debugGame('Thrifty modal closed - checking if stock modal should open')
            if (currentStock) {
              setTimeout(() => {
                debugGame('Opening stock modal after Thrifty modal close')
                setStockModalOpen(true)
              }, 300)
            } else {
              setTimeout(() => {
                debugGame('Phase transition: landed -> idle (thrifty modal closed, no stock)')
                setPhase('idle')
              }, 300)
            }
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
          debugGame('Bias Sanctuary modal open change:', open)
          setBiasSanctuaryModalOpen(open)
          if (!open) {
            debugGame('Bias Sanctuary modal closed')
            setCurrentCaseStudy(null)
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (bias sanctuary closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        caseStudy={currentCaseStudy}
        onComplete={handleBiasQuizComplete}
      />

      <CasinoModal
        open={casinoModalOpen}
        onOpenChange={(open) => {
          debugGame('Casino modal open change:', open)
          setCasinoModalOpen(open)
          if (!open) {
            debugGame('Casino modal closed')
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (casino modal closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        onWin={handleCasinoWin}
      />
    </div>
  )
}

export default App

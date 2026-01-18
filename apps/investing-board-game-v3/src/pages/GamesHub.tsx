/**
 * Games Hub Page
 * Central hub for all mini-games with grid layout
 */

import { ArrowLeft, GameController } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { GameCard } from '@/components/games/GameCard'
import { GameOverlay } from '@/components/games/GameOverlay'
import { GameLoadingScreen } from '@/components/games/GameLoadingScreen'
import { GAMES_CONFIG } from '@/lib/gamesConfig'
import { useGameOverlay } from '@/hooks/useGameOverlay'

// Import all game placeholders
import { WheelOfFortune } from '@/components/games/placeholders/WheelOfFortune'
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

export function GamesHub({ onBack }: GamesHubProps) {
  const { activeGame, isLoading, openGame, closeGame } = useGameOverlay()

  // Map game IDs to their components
  const gameComponents: Record<string, React.ComponentType<{ onClose: () => void }>> = {
    'wheel-of-fortune': WheelOfFortune,
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GAMES_CONFIG.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => openGame(game.id)}
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

      {/* Game Overlay */}
      <GameOverlay isOpen={!!activeGame && !isLoading} onClose={closeGame}>
        {ActiveGameComponent && <ActiveGameComponent onClose={closeGame} />}
      </GameOverlay>
    </>
  )
}

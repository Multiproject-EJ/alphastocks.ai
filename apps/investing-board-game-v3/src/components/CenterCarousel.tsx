import { useState, useEffect, useCallback } from 'react'
import { Star, ChartLine, Info } from '@phosphor-icons/react'
import { WealthThrone } from '@/components/WealthThrone'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { GameState } from '@/lib/types'

interface CenterCarouselProps {
  gameState: GameState
  netWorthChange: number
  onStarsClick: () => void
  onPortfolioClick: () => void
}

export function CenterCarousel({
  gameState,
  netWorthChange,
  onStarsClick,
  onPortfolioClick,
}: CenterCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const totalPanels = 4

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  return (
    <div className="text-center pointer-events-none">
      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mb-4 pointer-events-auto">
        {Array.from({ length: totalPanels }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              current === index
                ? 'bg-accent w-6'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to panel ${index + 1}`}
          />
        ))}
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
        }}
        className="w-full max-w-[600px] mx-auto pointer-events-auto"
      >
        <CarouselContent>
          {/* Panel 1 - Stats */}
          <CarouselItem>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onStarsClick}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <Star size={20} className="text-accent" weight="fill" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Stars
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      {gameState.stars}
                    </div>
                  </div>
                  <Info
                    size={16}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
              </button>
              <WealthThrone
                netWorthChange={netWorthChange}
                holdingsCount={gameState.holdings.length}
              />
              <button
                onClick={onPortfolioClick}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <ChartLine size={20} className="text-accent" weight="bold" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Portfolio
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      ${(gameState.portfolioValue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <Info
                    size={16}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
              </button>
            </div>
          </CarouselItem>

          {/* Panel 2 - Placeholder for future content */}
          <CarouselItem>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onStarsClick}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <Star size={20} className="text-accent" weight="fill" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Stars
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      {gameState.stars}
                    </div>
                  </div>
                  <Info
                    size={16}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
              </button>
              <WealthThrone
                netWorthChange={netWorthChange}
                holdingsCount={gameState.holdings.length}
              />
              <button
                onClick={onPortfolioClick}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <ChartLine size={20} className="text-accent" weight="bold" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Portfolio
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      ${(gameState.portfolioValue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <Info
                    size={16}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
              </button>
            </div>
          </CarouselItem>

          {/* Panel 3 - Placeholder for future content */}
          <CarouselItem>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onStarsClick}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <Star size={20} className="text-accent" weight="fill" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Stars
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      {gameState.stars}
                    </div>
                  </div>
                  <Info
                    size={16}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
              </button>
              <WealthThrone
                netWorthChange={netWorthChange}
                holdingsCount={gameState.holdings.length}
              />
              <button
                onClick={onPortfolioClick}
                className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <ChartLine size={20} className="text-accent" weight="bold" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Portfolio
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      ${(gameState.portfolioValue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <Info
                    size={16}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
              </button>
            </div>
          </CarouselItem>

          {/* Panel 4 - Logo */}
          <CarouselItem>
            <div className="flex flex-col items-center justify-center gap-4">
              <img
                src="/board-game-v3/Logo.webp"
                alt="Investing Board Game logo"
                className="mx-auto h-56 w-auto max-w-[420px] drop-shadow-xl md:h-64"
              />
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={onStarsClick}
                  className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                      <Star size={20} className="text-accent" weight="fill" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Stars
                      </div>
                      <div className="text-2xl font-bold text-accent font-mono">
                        {gameState.stars}
                      </div>
                    </div>
                    <Info
                      size={16}
                      className="text-muted-foreground group-hover:text-accent transition-colors"
                    />
                  </div>
                </button>
                <WealthThrone
                  netWorthChange={netWorthChange}
                  holdingsCount={gameState.holdings.length}
                />
                <button
                  onClick={onPortfolioClick}
                  className="group bg-black/75 backdrop-blur-xl border-2 border-white/10 hover:border-accent/60 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[200px]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                      <ChartLine size={20} className="text-accent" weight="bold" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Portfolio
                      </div>
                      <div className="text-2xl font-bold text-accent font-mono">
                        ${(gameState.portfolioValue / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <Info
                      size={16}
                      className="text-muted-foreground group-hover:text-accent transition-colors"
                    />
                  </div>
                </button>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  )
}

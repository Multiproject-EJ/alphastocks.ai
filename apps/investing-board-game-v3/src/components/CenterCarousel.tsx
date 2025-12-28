import { useState, useEffect, useCallback } from 'react'
import { WealthThrone } from '@/components/WealthThrone'
import { PortfolioWheel } from '@/components/PortfolioWheel'
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
  onPanelChange?: (panelIndex: number) => void
}

export function CenterCarousel({
  gameState,
  netWorthChange,
  onPanelChange,
}: CenterCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const totalPanels = 3

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      const newPanel = api.selectedScrollSnap()
      setCurrent(newPanel)
      onPanelChange?.(newPanel)
    })
  }, [api, onPanelChange])

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
          {/* Panel 1 - Wealth Throne */}
          <CarouselItem>
            <div className="flex items-center justify-center">
              <WealthThrone
                netWorthChange={netWorthChange}
                holdingsCount={gameState.holdings.length}
              />
            </div>
          </CarouselItem>

          {/* Panel 2 - Logo only, centered */}
          <CarouselItem>
            <div className="flex items-center justify-center">
              <img
                src="/board-game-v3/Logo.webp"
                alt="Investing Board Game logo"
                className="mx-auto h-56 w-auto max-w-[420px] drop-shadow-xl md:h-64"
              />
            </div>
          </CarouselItem>

          {/* Panel 3 - Net Worth */}
          <CarouselItem>
            <div className="flex items-center justify-center">
              <PortfolioWheel gameState={gameState} />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  )
}

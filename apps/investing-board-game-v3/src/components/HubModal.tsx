import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Coins, TrendUp, Trophy, Target, CalendarBlank, Crown, Buildings } from '@phosphor-icons/react'
import { GameState } from '@/lib/types'
import { AI_PLAYERS } from '@/lib/mockData'

interface HubModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
  onOpenChallenges?: () => void
  onOpenEventCalendar?: () => void
  onOpenNetWorthGallery?: () => void
  onOpenCityBuilder?: () => void
}

export function HubModal({ open, onOpenChange, gameState, onOpenChallenges, onOpenEventCalendar, onOpenNetWorthGallery, onOpenCityBuilder }: HubModalProps) {
  // Combine human player with AI players for leaderboard
  const allPlayers = [
    {
      id: 'human',
      name: 'You',
      avatar: '👤',
      gameState,
    },
    ...AI_PLAYERS,
  ]

  // Sort by net worth descending
  const sortedPlayers = [...allPlayers].sort((a, b) => b.gameState.netWorth - a.gameState.netWorth)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-accent/30 shadow-2xl max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            Investing Board Game – Hub
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Mission: Build a resilient portfolio without going broke.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Coins size={16} className="text-accent" />
                  Cash
                </div>
                <div className="font-mono font-semibold text-foreground">
                  ${gameState.cash.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendUp size={16} className="text-accent" />
                  Net Worth
                </div>
                <div className="font-mono font-semibold text-foreground">
                  ${gameState.netWorth.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Holdings</div>
                <div className="font-mono font-semibold text-foreground">
                  {gameState.holdings.length}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Stars</div>
                <div className="font-mono font-semibold text-accent">
                  {gameState.stars} ⭐
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  onOpenChange(false)
                  onOpenChallenges?.()
                }}
              >
                <Target size={16} className="mr-2" />
                Challenges
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onOpenChange(false)
                  onOpenEventCalendar?.()
                }}
              >
                <CalendarBlank size={16} className="mr-2" />
                Events
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onOpenChange(false)
                  onOpenCityBuilder?.()
                }}
              >
                <Buildings size={16} className="mr-2" />
                City Builder
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onOpenChange(false)
                  onOpenNetWorthGallery?.()
                }}
              >
                <Crown size={16} className="mr-2" />
                Net Worth Gallery
              </Button>
            </div>

            <Button variant="outline" className="w-full" disabled>
              Support development (coming soon)
            </Button>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Compete against AI players for the top spot!
            </p>

            <div className="space-y-2">
              {sortedPlayers.map((player, index) => {
                const isHuman = player.id === 'human'
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
                
                return (
                  <div
                    key={player.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg
                      ${isHuman ? 'bg-accent/20 border border-accent/40' : 'bg-muted/30'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold min-w-[2rem]">{rankIcon}</span>
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="font-semibold text-sm">
                          {player.name}
                          {isHuman && <span className="text-accent ml-1">(You)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.gameState.stars} ⭐
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">
                        ${player.gameState.netWorth.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Net Worth
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

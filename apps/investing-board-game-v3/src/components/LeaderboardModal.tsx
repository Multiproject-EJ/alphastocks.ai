/**
 * LeaderboardModal Component
 * Display global, weekly, and seasonal leaderboards
 */

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { LeaderboardEntry } from '@/lib/types'
import { ArrowUp, ArrowDown, Minus, Crown, Medal, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface LeaderboardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  globalLeaderboard: LeaderboardEntry[]
  weeklyLeaderboard: LeaderboardEntry[]
  playerRank: number | null
  loading: boolean
  fetchLeaderboard: (type: 'global' | 'weekly' | 'seasonal', sortBy?: string) => Promise<void>
  currentUserId?: string
}

export function LeaderboardModal({
  open,
  onOpenChange,
  globalLeaderboard,
  weeklyLeaderboard,
  playerRank,
  loading,
  fetchLeaderboard,
  currentUserId,
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'seasonal'>('global')
  const [sortBy, setSortBy] = useState<'net_worth' | 'level' | 'season_tier' | 'stars'>('net_worth')

  // Fetch leaderboard when modal opens or tab changes
  useEffect(() => {
    if (open) {
      fetchLeaderboard(activeTab, sortBy)
    }
  }, [open, activeTab, sortBy, fetchLeaderboard])

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} weight="fill" />
    if (rank === 2) return <Medal className="text-gray-400" size={24} weight="fill" />
    if (rank === 3) return <Medal className="text-amber-600" size={24} weight="fill" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.userId === currentUserId
    const rank = entry.rank || index + 1

    return (
      <motion.div
        key={entry.userId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          flex items-center gap-4 p-4 rounded-lg border-2 transition-all
          ${isCurrentUser 
            ? 'bg-accent/20 border-accent shadow-lg' 
            : 'bg-card/50 border-border hover:bg-card'
          }
        `}
      >
        {/* Rank */}
        <div className="w-12 flex items-center justify-center">
          {renderRankIcon(rank)}
        </div>

        {/* Username */}
        <div className="flex-1">
          <div className={`font-bold ${isCurrentUser ? 'text-accent' : 'text-foreground'}`}>
            {entry.username}
            {isCurrentUser && <span className="ml-2 text-xs text-accent">(You)</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="text-right space-y-1">
          {sortBy === 'net_worth' && (
            <div className="font-mono font-bold text-green-400">
              ${entry.netWorth.toLocaleString()}
            </div>
          )}
          {sortBy === 'level' && (
            <div className="font-mono font-bold text-purple-400">
              Level {entry.level}
            </div>
          )}
          {sortBy === 'season_tier' && (
            <div className="font-mono font-bold text-blue-400">
              Tier {entry.seasonTier}
            </div>
          )}
          {sortBy === 'stars' && (
            <div className="font-mono font-bold text-yellow-400">
              ⭐ {entry.totalStarsEarned.toLocaleString()}
            </div>
          )}
        </div>

        {/* Change indicator */}
        {entry.change && (
          <div className="w-6">
            {entry.change === 'up' && <ArrowUp className="text-green-400" weight="bold" />}
            {entry.change === 'down' && <ArrowDown className="text-red-400" weight="bold" />}
            {entry.change === 'same' && <Minus className="text-muted-foreground" />}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] bg-card border-2 border-accent/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-accent flex items-center gap-3">
            <Trophy className="text-yellow-400" size={32} weight="fill" />
            Leaderboards
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          </TabsList>

          {/* Sort options (for global/seasonal) */}
          {activeTab !== 'weekly' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button
                size="sm"
                variant={sortBy === 'net_worth' ? 'default' : 'outline'}
                onClick={() => setSortBy('net_worth')}
              >
                Net Worth
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'level' ? 'default' : 'outline'}
                onClick={() => setSortBy('level')}
              >
                Level
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'season_tier' ? 'default' : 'outline'}
                onClick={() => setSortBy('season_tier')}
              >
                Season Tier
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'stars' ? 'default' : 'outline'}
                onClick={() => setSortBy('stars')}
              >
                Stars
              </Button>
            </div>
          )}

          <TabsContent value="global" className="flex-1 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {globalLeaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))}
                  
                  {globalLeaderboard.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No leaderboard data yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="flex-1 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {weeklyLeaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))}
                  
                  {weeklyLeaderboard.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No weekly data yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="seasonal" className="flex-1 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {globalLeaderboard
                    .filter(e => e.seasonTier > 0)
                    .map((entry, index) => renderLeaderboardEntry(entry, index))}
                  
                  {globalLeaderboard.filter(e => e.seasonTier > 0).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No seasonal data yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Player rank display */}
        {playerRank && playerRank > 100 && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="text-sm text-center">
              <span className="text-muted-foreground">Your Rank: </span>
              <span className="font-bold text-accent">#{playerRank}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * LeaderboardModal Component
 * Display global, weekly, and seasonal leaderboards with virtual scrolling
 */

import { useEffect, useState, useRef, memo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LeaderboardEntry } from '@/lib/types'
import { ArrowUp, ArrowDown, Minus, Crown, Medal, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useVirtualizer } from '@tanstack/react-virtual'

interface LeaderboardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  globalLeaderboard: LeaderboardEntry[]
  weeklyLeaderboard: LeaderboardEntry[]
  ringLeaders: LeaderboardEntry[]
  playerRank: number | null
  loading: boolean
  fetchLeaderboard: (type: 'global' | 'weekly' | 'seasonal', sortBy?: string) => Promise<void>
  fetchRingLeaders: () => Promise<void>
  currentUserId?: string
}

export function LeaderboardModal({
  open,
  onOpenChange,
  globalLeaderboard,
  weeklyLeaderboard,
  ringLeaders,
  playerRank,
  loading,
  fetchLeaderboard,
  fetchRingLeaders,
  currentUserId,
}: LeaderboardModalProps) {
  const dialogClass = useResponsiveDialogClass('large')
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'seasonal' | 'rings' | 'thrones'>('global')
  const [activeRingTab, setActiveRingTab] = useState<'ring1' | 'ring2' | 'ring3'>('ring1')
  const [sortBy, setSortBy] = useState<'net_worth' | 'level' | 'season_tier' | 'stars'>('net_worth')
  const parentRef = useRef<HTMLDivElement>(null)

  // Fetch leaderboard when modal opens or tab changes
  useEffect(() => {
    if (open) {
      if (activeTab === 'rings' || activeTab === 'thrones') {
        fetchRingLeaders()
      } else {
        fetchLeaderboard(activeTab as 'global' | 'weekly' | 'seasonal', sortBy)
      }
    }
  }, [open, activeTab, sortBy, fetchLeaderboard, fetchRingLeaders])

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} weight="fill" />
    if (rank === 2) return <Medal className="text-gray-400" size={24} weight="fill" />
    if (rank === 3) return <Medal className="text-amber-600" size={24} weight="fill" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const LeaderboardRow = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => {
    const isCurrentUser = entry.userId === currentUserId || entry.isCurrentUser
    const rank = entry.rank || index + 1

    // Ring badge configuration
    const ringBadge = {
      1: { bg: 'bg-slate-600', text: 'Ring 1', icon: '🏠' },
      2: { bg: 'bg-blue-600', text: 'Ring 2', icon: '🏢' },
      3: { bg: 'bg-purple-600', text: 'Ring 3', icon: '👑' },
    }[entry.currentRing] || { bg: 'bg-slate-600', text: 'Ring 1', icon: '🏠' }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5) }}
        className={`
          flex items-center gap-3 p-3 rounded-xl border-2 transition-all
          ${isCurrentUser 
            ? 'bg-gradient-to-r from-accent/20 to-accent/10 border-accent shadow-lg shadow-accent/20' 
            : 'bg-card/50 border-border hover:bg-card'
          }
        `}
      >
        {/* Rank */}
        <div className="w-10 flex items-center justify-center">
          {renderRankIcon(rank)}
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {entry.avatarUrl ? (
            <img src={entry.avatarUrl} alt={`${entry.username} avatar`} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">👤</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold truncate ${isCurrentUser ? 'text-accent' : ''}`}>
              {entry.username}
            </span>
            {entry.throneCount > 0 && (
              <span className="text-yellow-400" title={`Reached throne ${entry.throneCount} time(s)`}>
                👑{entry.throneCount > 1 ? `×${entry.throneCount}` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`px-1.5 py-0.5 rounded text-white text-[10px] ${ringBadge.bg}`}>
              {ringBadge.icon} {ringBadge.text}
            </span>
            <span>Lv.{entry.level}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right">
          {sortBy === 'net_worth' && (
            <>
              <div className="font-bold text-accent">
                ${(entry.netWorth / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.totalStarsEarned.toLocaleString()} ⭐
              </div>
            </>
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

  const VirtualLeaderboard = ({ data }: { data: LeaderboardEntry[] }) => {
    const rowVirtualizer = useVirtualizer({
      count: data.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 80, // Estimated row height
      overscan: 5,
    })

    return (
      <div
        ref={parentRef}
        className="h-full overflow-auto pr-4"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="pb-2">
                <LeaderboardRow entry={data[virtualRow.index]} index={virtualRow.index} />
              </div>
            </div>
          ))}
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No leaderboard data yet
          </div>
        )}
      </div>
    )
  }

  const ringLeaderboards = {
    ring1: ringLeaders
      .filter((entry) => entry.currentRing === 1)
      .sort((a, b) => b.netWorth - a.netWorth)
      .map((entry, index) => ({ ...entry, rank: index + 1 })),
    ring2: ringLeaders
      .filter((entry) => entry.currentRing === 2)
      .sort((a, b) => b.netWorth - a.netWorth)
      .map((entry, index) => ({ ...entry, rank: index + 1 })),
    ring3: ringLeaders
      .filter((entry) => entry.currentRing === 3)
      .sort((a, b) => b.netWorth - a.netWorth)
      .map((entry, index) => ({ ...entry, rank: index + 1 })),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} h-[80vh] bg-card border-2 border-accent/30 shadow-2xl`}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-accent flex items-center gap-3">
            <Trophy className="text-yellow-400" size={32} weight="fill" />
            Leaderboards
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="weekly">📅 Weekly</TabsTrigger>
            <TabsTrigger value="seasonal">🏆 Seasonal</TabsTrigger>
            <TabsTrigger value="rings">🎯 Ring Leaders</TabsTrigger>
            <TabsTrigger value="thrones">👑 Hall of Fame</TabsTrigger>
          </TabsList>

          {/* Sort options (for global/seasonal) */}
          {(activeTab === 'global' || activeTab === 'seasonal') && (
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
              <VirtualLeaderboard data={globalLeaderboard} />
            )}
          </TabsContent>

          <TabsContent value="weekly" className="flex-1 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <VirtualLeaderboard data={weeklyLeaderboard} />
            )}
          </TabsContent>

          <TabsContent value="seasonal" className="flex-1 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <VirtualLeaderboard data={globalLeaderboard.filter(e => e.seasonTier > 0)} />
            )}
          </TabsContent>

          <TabsContent value="rings" className="flex-1 mt-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Button
                size="sm"
                variant={activeRingTab === 'ring1' ? 'default' : 'outline'}
                onClick={() => setActiveRingTab('ring1')}
              >
                🏠 Ring 1
              </Button>
              <Button
                size="sm"
                variant={activeRingTab === 'ring2' ? 'default' : 'outline'}
                onClick={() => setActiveRingTab('ring2')}
              >
                🏢 Ring 2
              </Button>
              <Button
                size="sm"
                variant={activeRingTab === 'ring3' ? 'default' : 'outline'}
                onClick={() => setActiveRingTab('ring3')}
              >
                👑 Ring 3
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <VirtualLeaderboard data={ringLeaderboards[activeRingTab]} />
            )}
          </TabsContent>

          <TabsContent value="thrones" className="flex-1 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <VirtualLeaderboard data={ringLeaders.filter(e => e.throneCount > 0).sort((a, b) => b.throneCount - a.throneCount)} />
            )}
          </TabsContent>
        </Tabs>

        {/* Current user's position - sticky footer */}
        {currentUserId && (() => {
          const currentUserEntry = 
            activeTab === 'rings'
              ? ringLeaderboards[activeRingTab].find(e => e.userId === currentUserId)
              : activeTab === 'thrones'
              ? ringLeaders.find(e => e.userId === currentUserId)
              : activeTab === 'weekly'
              ? weeklyLeaderboard.find(e => e.userId === currentUserId)
              : globalLeaderboard.find(e => e.userId === currentUserId)
          
          if (!currentUserEntry) return null

          const ringBadges = {
            1: { bg: 'bg-slate-600', text: 'Ring 1', icon: '🏠' },
            2: { bg: 'bg-blue-600', text: 'Ring 2', icon: '🏢' },
            3: { bg: 'bg-purple-600', text: 'Ring 3', icon: '👑' },
          }
          const currentRingBadge = ringBadges[currentUserEntry.currentRing] || ringBadges[1]

          return (
            <div className="sticky bottom-0 mt-4 p-3 bg-card/95 backdrop-blur-sm border-t-2 border-accent rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-accent">
                    #{currentUserEntry.rank || playerRank || '?'}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {currentUserEntry.avatarUrl ? (
                      <img src={currentUserEntry.avatarUrl} alt={`${currentUserEntry.username} avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">You</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-white text-[10px] ${currentRingBadge.bg}`}>
                        {currentRingBadge.icon} {currentRingBadge.text}
                      </span>
                      <span>• Lv.{currentUserEntry.level}</span>
                      {currentUserEntry.throneCount > 0 && (
                        <span className="text-yellow-400">
                          • 👑×{currentUserEntry.throneCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent">
                    ${(currentUserEntry.netWorth / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentUserEntry.totalStarsEarned.toLocaleString()} ⭐
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}

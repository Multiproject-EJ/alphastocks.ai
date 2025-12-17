/**
 * AchievementsModal Component
 * Display all achievements with categories, filters, and progress tracking
 */

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Achievement } from '@/lib/types'
import { ACHIEVEMENTS, getAchievementsByCategory, getVisibleAchievements } from '@/lib/achievements'
import { motion } from 'framer-motion'
import { Lock, Check } from '@phosphor-icons/react'

interface AchievementsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unlockedAchievements: string[]
  getAchievementProgress: (achievement: Achievement) => number
}

export function AchievementsModal({
  open,
  onOpenChange,
  unlockedAchievements,
  getAchievementProgress,
}: AchievementsModalProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all')

  // Calculate stats
  const totalAchievements = ACHIEVEMENTS.length
  const unlockedCount = unlockedAchievements.length
  const unlockedPercentage = (unlockedCount / totalAchievements) * 100

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let achievements = getVisibleAchievements(unlockedAchievements)

    // Filter by category
    if (selectedCategory !== 'all') {
      achievements = achievements.filter(a => a.category === selectedCategory)
    }

    // Filter by unlock status
    if (filter === 'unlocked') {
      achievements = achievements.filter(a => unlockedAchievements.includes(a.id))
    } else if (filter === 'locked') {
      achievements = achievements.filter(a => !unlockedAchievements.includes(a.id))
    }

    return achievements
  }, [filter, selectedCategory, unlockedAchievements])

  // Category tabs
  const categories: Array<{ value: Achievement['category'] | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'dice', label: 'Dice' },
    { value: 'investing', label: 'Investing' },
    { value: 'stars', label: 'Stars' },
    { value: 'challenges', label: 'Challenges' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'casino', label: 'Casino' },
    { value: 'exploration', label: 'Exploration' },
    { value: 'time', label: 'Time' },
    { value: 'hidden', label: 'Hidden' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-card border-2 border-accent/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-accent flex items-center gap-3">
            <span>🏆</span>
            Achievements
          </DialogTitle>
          
          {/* Overall progress */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {unlockedCount} / {totalAchievements} Unlocked ({unlockedPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={unlockedPercentage} className="h-2" />
          </div>
        </DialogHeader>

        {/* Category tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
            {categories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filter buttons */}
          <div className="flex gap-2 mt-3">
            <Badge
              variant={filter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge
              variant={filter === 'unlocked' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('unlocked')}
            >
              Unlocked
            </Badge>
            <Badge
              variant={filter === 'locked' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('locked')}
            >
              Locked
            </Badge>
          </div>

          {/* Achievements grid */}
          <ScrollArea className="flex-1 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {filteredAchievements.map((achievement) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id)
                const progress = getAchievementProgress(achievement)

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-400/50' 
                        : 'bg-card border-border'
                      }
                    `}
                  >
                    {/* Unlocked indicator */}
                    {isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <Check className="text-green-400" size={20} weight="bold" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-4xl mb-2">{achievement.icon}</div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-yellow-400' : 'text-foreground'}`}>
                      {achievement.isSecret && !isUnlocked ? '???' : achievement.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.isHidden && !isUnlocked ? '???' : achievement.description}
                    </p>

                    {/* Progress bar (for locked achievements) */}
                    {!isUnlocked && !achievement.isSecret && (
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Reward */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span>⭐</span>
                        <span className="font-bold text-yellow-400">{achievement.reward}</span>
                      </div>
                      
                      {!isUnlocked && (
                        <Lock className="text-muted-foreground" size={16} />
                      )}
                    </div>

                    {/* Category badge */}
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {achievement.category}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No achievements found
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

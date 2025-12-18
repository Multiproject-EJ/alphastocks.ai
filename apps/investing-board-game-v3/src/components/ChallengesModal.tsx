/**
 * ChallengesModal Component
 * Full modal displaying daily and weekly challenges with progress
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Challenge } from '@/lib/challenges'
import { motion } from 'framer-motion'
import { Check, Star } from '@phosphor-icons/react'

interface ChallengesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dailyChallenges: Challenge[]
  weeklyChallenges: Challenge[]
}

export function ChallengesModal({
  open,
  onOpenChange,
  dailyChallenges,
  weeklyChallenges,
}: ChallengesModalProps) {
  const dailyCompleted = dailyChallenges.filter(c => c.completed).length
  const weeklyCompleted = weeklyChallenges.filter(c => c.completed).length

  // Calculate time until reset
  const getTimeUntilReset = (type: 'daily' | 'weekly') => {
    const now = new Date()
    let resetTime: Date

    if (type === 'daily') {
      resetTime = new Date()
      resetTime.setHours(24, 0, 0, 0)
    } else {
      // Next Monday
      resetTime = new Date()
      const day = resetTime.getDay()
      const daysUntilMonday = day === 0 ? 1 : 8 - day
      resetTime.setDate(resetTime.getDate() + daysUntilMonday)
      resetTime.setHours(0, 0, 0, 0)
    }

    const diff = resetTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    return `${hours}h ${minutes}m`
  }

  const renderChallenge = (challenge: Challenge, index: number) => {
    const progressPercent = (challenge.progress / challenge.requirement.target) * 100
    const tierColor = {
      easy: 'bg-green-500/20 text-green-500 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      hard: 'bg-red-500/20 text-red-500 border-red-500/30',
    }[challenge.tier]

    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-4 rounded-lg border-2 ${
          challenge.completed
            ? 'bg-accent/10 border-accent/30'
            : 'bg-card/50 border-border/30'
        } relative overflow-hidden`}
      >
        {/* Completion overlay */}
        {challenge.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <div className="bg-accent rounded-full p-1">
              <Check size={16} className="text-accent-foreground" weight="bold" />
            </div>
          </motion.div>
        )}

        {/* Tier badge */}
        <Badge className={`mb-2 ${tierColor} border`}>
          {challenge.tier.toUpperCase()}
        </Badge>

        {/* Title and description */}
        <h3 className="font-bold text-foreground mb-1">{challenge.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

        {/* Progress bar (if not completed) */}
        {!challenge.completed && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>
                {challenge.progress}/{challenge.requirement.target}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-accent">
            <Star size={14} weight="fill" />
            <span className="font-semibold">{challenge.reward.stars}</span>
          </div>
          <div className="text-muted-foreground">
            +{challenge.reward.xp} XP
          </div>
          <div className="text-muted-foreground">
            +{challenge.reward.seasonPoints} SP
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-2 border-accent/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
            <span>🎯</span>
            Challenges
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)] pr-4">
          {/* Daily Challenges Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Daily Challenges
                <Badge variant="outline" className="ml-2">
                  {dailyCompleted}/{dailyChallenges.length}
                </Badge>
              </h2>
              <div className="text-sm text-muted-foreground">
                Resets in {getTimeUntilReset('daily')}
              </div>
            </div>

            <div className="space-y-3">
              {dailyChallenges.length > 0 ? (
                dailyChallenges.map((challenge, index) => renderChallenge(challenge, index))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No daily challenges available
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Weekly Challenges Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                📅 Weekly Challenges
                <Badge variant="outline" className="ml-2">
                  {weeklyCompleted}/{weeklyChallenges.length}
                </Badge>
              </h2>
              <div className="text-sm text-muted-foreground">
                Resets in {getTimeUntilReset('weekly')}
              </div>
            </div>

            <div className="space-y-3">
              {weeklyChallenges.length > 0 ? (
                weeklyChallenges.map((challenge, index) =>
                  renderChallenge(challenge, index + dailyChallenges.length)
                )
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No weekly challenges available
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ChallengesModal

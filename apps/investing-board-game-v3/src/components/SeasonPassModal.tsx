/**
 * SeasonPassModal Component
 * Display season pass with free and premium tracks
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Season } from '@/lib/types'
import { getDaysRemaining, getProgressToNextTier } from '@/lib/seasons'
import { Lock, Check, Star, CurrencyDollar, Palette, Dice, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface SeasonPassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  season: Season | null
  seasonPoints: number
  currentTier: number
  hasPremiumPass: boolean
  claimedTiers: number[]
  onClaimReward: (tier: number, isPremium: boolean) => void
  onUpgradePremium: () => void
  canClaimTierReward: (tier: number, isPremium: boolean) => boolean
}

export function SeasonPassModal({
  open,
  onOpenChange,
  season,
  seasonPoints,
  currentTier,
  hasPremiumPass,
  claimedTiers,
  onClaimReward,
  onUpgradePremium,
  canClaimTierReward,
}: SeasonPassModalProps) {
  if (!season) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active season</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const daysRemaining = getDaysRemaining(season)
  const progress = getProgressToNextTier(seasonPoints, season)

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'stars': return <Star weight="fill" className="text-yellow-400" />
      case 'cash': return <CurrencyDollar weight="fill" className="text-green-400" />
      case 'theme': return <Palette weight="fill" className="text-purple-400" />
      case 'dice_skin': return <Dice weight="fill" className="text-blue-400" />
      case 'badge': return <Trophy weight="fill" className="text-amber-400" />
      default: return <Star weight="fill" className="text-yellow-400" />
    }
  }

  const isRewardClaimed = (tier: number, isPremium: boolean) => {
    const claimKey = isPremium ? tier : -tier
    return claimedTiers.includes(claimKey)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] bg-card border-2 border-accent/30 shadow-2xl">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-bold text-accent">
              {season.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{season.theme}</p>
            
            {/* Season info bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Current Tier: </span>
                <span className="font-bold text-accent">{currentTier}</span>
                <span className="text-muted-foreground"> / {season.tiers.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Ends in: </span>
                <span className="font-bold text-accent">{daysRemaining} days</span>
              </div>
              <div className="text-sm font-mono">
                <span className="text-accent">{seasonPoints.toLocaleString()}</span>
                <span className="text-muted-foreground"> SP</span>
              </div>
            </div>

            {/* Progress to next tier */}
            {currentTier < season.tiers.length && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress to Tier {currentTier + 1}</span>
                  <span>{progress.percentage.toFixed(0)}%</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Premium pass upgrade button */}
        {!hasPremiumPass && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-2 border-yellow-400/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-yellow-400">Upgrade to Premium Pass</h3>
                <p className="text-sm text-muted-foreground">Unlock premium rewards for all tiers</p>
              </div>
              <Button
                onClick={onUpgradePremium}
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold"
              >
                5,000 ⭐
              </Button>
            </div>
          </div>
        )}

        {/* Tiers grid */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {season.tiers.map((tier) => {
              const isUnlocked = tier.tier <= currentTier
              const freeRewardClaimed = isRewardClaimed(tier.tier, false)
              const premiumRewardClaimed = isRewardClaimed(tier.tier, true)

              return (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tier.tier * 0.02 }}
                  className={`
                    grid grid-cols-[auto_1fr_1fr] gap-4 p-4 rounded-lg border-2
                    ${isUnlocked 
                      ? 'bg-accent/10 border-accent/30' 
                      : 'bg-card/50 border-border opacity-60'
                    }
                  `}
                >
                  {/* Tier number */}
                  <div className="flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-sm text-muted-foreground">Tier</div>
                    <div className="text-3xl font-bold text-accent">{tier.tier}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tier.pointsRequired.toLocaleString()} SP
                    </div>
                  </div>

                  {/* Free reward */}
                  <div className={`border rounded-lg p-3 ${isUnlocked ? 'border-green-400/30 bg-green-900/10' : 'border-border'}`}>
                    <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">Free</div>
                    <div className="flex items-center gap-2 mb-2">
                      {getRewardIcon(tier.freeReward.type)}
                      <span className="text-sm font-bold">
                        {tier.freeReward.type === 'stars' && `${tier.freeReward.value} Stars`}
                        {tier.freeReward.type === 'cash' && `$${Number(tier.freeReward.value).toLocaleString()}`}
                        {tier.freeReward.type === 'theme' && 'Theme'}
                        {tier.freeReward.type === 'dice_skin' && 'Dice Skin'}
                        {tier.freeReward.type === 'badge' && 'Badge'}
                      </span>
                    </div>
                    
                    {isUnlocked && (
                      <Button
                        size="sm"
                        onClick={() => onClaimReward(tier.tier, false)}
                        disabled={freeRewardClaimed || !canClaimTierReward(tier.tier, false)}
                        className="w-full"
                        variant={freeRewardClaimed ? 'outline' : 'default'}
                      >
                        {freeRewardClaimed ? (
                          <>
                            <Check size={16} className="mr-1" />
                            Claimed
                          </>
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    )}
                    {!isUnlocked && (
                      <Badge variant="outline" className="w-full justify-center">
                        <Lock size={14} className="mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  {/* Premium reward */}
                  <div className={`border rounded-lg p-3 ${isUnlocked && hasPremiumPass ? 'border-yellow-400/30 bg-yellow-900/10' : 'border-border'}`}>
                    <div className="text-xs text-yellow-400 mb-2 uppercase font-semibold">Premium</div>
                    <div className="flex items-center gap-2 mb-2">
                      {getRewardIcon(tier.premiumReward.type)}
                      <span className="text-sm font-bold">
                        {tier.premiumReward.type === 'stars' && `${tier.premiumReward.value} Stars`}
                        {tier.premiumReward.type === 'cash' && `$${Number(tier.premiumReward.value).toLocaleString()}`}
                        {tier.premiumReward.type === 'theme' && 'Theme'}
                        {tier.premiumReward.type === 'dice_skin' && 'Dice Skin'}
                        {tier.premiumReward.type === 'badge' && 'Badge'}
                      </span>
                    </div>
                    
                    {isUnlocked && hasPremiumPass && (
                      <Button
                        size="sm"
                        onClick={() => onClaimReward(tier.tier, true)}
                        disabled={premiumRewardClaimed || !canClaimTierReward(tier.tier, true)}
                        className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                        variant={premiumRewardClaimed ? 'outline' : 'default'}
                      >
                        {premiumRewardClaimed ? (
                          <>
                            <Check size={16} className="mr-1" />
                            Claimed
                          </>
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    )}
                    {(!isUnlocked || !hasPremiumPass) && (
                      <Badge variant="outline" className="w-full justify-center">
                        <Lock size={14} className="mr-1" />
                        {!hasPremiumPass ? 'Premium' : 'Locked'}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

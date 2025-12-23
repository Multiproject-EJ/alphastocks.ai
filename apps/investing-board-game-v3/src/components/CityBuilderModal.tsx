/**
 * City Builder Modal Component
 * Monopoly Go-style city building with daily upgrades and sequential city unlocking
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Buildings,
  Lock,
  Star,
  Clock,
  ArrowRight,
  Check,
  CaretLeft,
  CaretRight,
  Gift,
  Trophy,
  Sparkle,
} from '@phosphor-icons/react'
import {
  City,
  Building,
  CityProgress,
  CITIES,
  MAX_BUILDING_LEVEL,
  getCityCompletionPercentage,
  getUpgradeCost,
} from '@/lib/cityBuilder'
import { useSound } from '@/hooks/useSound'

interface CityBuilderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stars: number
  currentCity: City
  currentCityProgress: CityProgress
  allCities: City[]
  citiesProgress: CityProgress[]
  canUpgrade: boolean
  timeUntilNextUpgrade: { hours: number; minutes: number } | null
  onUpgradeBuilding: (cityId: string, buildingId: string) => boolean
  onUnlockNextCity: () => boolean
  onSelectCity: (cityIndex: number) => void
  nextCityToUnlock: City | null
  canUnlockNext: boolean
  totalBuildingsCompleted: number
  totalCitiesCompleted: number
  totalCitiesUnlocked: number
}

// Building Card Component
function BuildingCard({
  building,
  level,
  cityId,
  canUpgrade,
  stars,
  onUpgrade,
}: {
  building: Building
  level: number
  cityId: string
  canUpgrade: boolean
  stars: number
  onUpgrade: () => void
}) {
  const isMaxLevel = level >= MAX_BUILDING_LEVEL
  const cost = getUpgradeCost(cityId, building.id, level)
  const canAfford = cost !== null && stars >= cost
  const canPerformUpgrade = canUpgrade && canAfford && !isMaxLevel
  
  return (
    <motion.div
      className={`
        relative rounded-xl border-2 p-4 transition-all
        ${isMaxLevel 
          ? 'bg-gradient-to-br from-accent/20 to-accent/5 border-accent/50 shadow-lg shadow-accent/20' 
          : 'bg-card/80 border-border hover:border-accent/30'}
      `}
      whileHover={{ scale: isMaxLevel ? 1 : 1.02 }}
      whileTap={{ scale: isMaxLevel ? 1 : 0.98 }}
    >
      {/* Building Icon & Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-4xl">{building.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate">{building.name}</h4>
            {isMaxLevel && (
              <Badge className="bg-accent text-accent-foreground text-xs">MAX</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {building.description}
          </p>
        </div>
      </div>
      
      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Level</span>
          <span className="font-mono font-bold">
            {level} / {MAX_BUILDING_LEVEL}
          </span>
        </div>
        <Progress 
          value={(level / MAX_BUILDING_LEVEL) * 100} 
          className="h-2"
        />
        
        {/* Level indicators */}
        <div className="flex justify-between px-0.5">
          {Array.from({ length: MAX_BUILDING_LEVEL }, (_, i) => i + 1).map((lvl) => (
            <div
              key={lvl}
              className={`w-2 h-2 rounded-full transition-colors ${
                lvl <= level ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Upgrade Button */}
      {!isMaxLevel && (
        <div className="mt-4">
          <Button
            onClick={onUpgrade}
            disabled={!canPerformUpgrade}
            className="w-full"
            variant={canPerformUpgrade ? "default" : "outline"}
            size="sm"
          >
            {!canUpgrade ? (
              <span className="flex items-center gap-2">
                <Clock size={14} />
                Upgrade Tomorrow
              </span>
            ) : !canAfford ? (
              <span className="flex items-center gap-2">
                <Star size={14} />
                Need {cost} Stars
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkle size={14} weight="fill" />
                Upgrade ({cost} ⭐)
              </span>
            )}
          </Button>
        </div>
      )}
      
      {/* Max Level Badge */}
      {isMaxLevel && (
        <div className="mt-4 flex items-center justify-center gap-2 text-accent">
          <Check size={16} weight="bold" />
          <span className="text-sm font-medium">Complete!</span>
        </div>
      )}
    </motion.div>
  )
}

// City Overview Card (for navigation)
function CityOverviewCard({
  city,
  progress,
  isSelected,
  onSelect,
}: {
  city: City
  progress: CityProgress
  isSelected: boolean
  onSelect: () => void
}) {
  const completionPercentage = getCityCompletionPercentage(progress)
  
  return (
    <motion.button
      onClick={onSelect}
      className={`
        relative p-3 rounded-xl border-2 transition-all text-left w-full
        ${!progress.isUnlocked && 'opacity-50 grayscale'}
        ${isSelected 
          ? 'border-accent bg-accent/10 ring-2 ring-accent/50' 
          : 'border-border hover:border-accent/30 bg-card/50'}
      `}
      whileHover={{ scale: progress.isUnlocked ? 1.02 : 1 }}
      style={{ borderColor: isSelected ? city.theme : undefined }}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{city.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate" style={{ color: city.theme }}>
              {city.name}
            </h4>
            {!progress.isUnlocked && <Lock size={14} className="text-muted-foreground" />}
            {progress.isCompleted && <Trophy size={14} className="text-accent" weight="fill" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={completionPercentage} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground font-mono">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

export function CityBuilderModal({
  open,
  onOpenChange,
  stars,
  currentCity,
  currentCityProgress,
  allCities,
  citiesProgress,
  canUpgrade,
  timeUntilNextUpgrade,
  onUpgradeBuilding,
  onUnlockNextCity,
  onSelectCity,
  nextCityToUnlock,
  canUnlockNext,
  totalBuildingsCompleted,
  totalCitiesCompleted,
  totalCitiesUnlocked,
}: CityBuilderModalProps) {
  const { play: playSound } = useSound()
  const dialogClass = useResponsiveDialogClass('full')
  const [selectedCityIndex, setSelectedCityIndex] = useState(
    allCities.findIndex(c => c.id === currentCity.id)
  )
  
  const selectedCity = allCities[selectedCityIndex]
  const selectedCityProgress = citiesProgress[selectedCityIndex]
  
  const handleSelectCity = (index: number) => {
    if (!citiesProgress[index].isUnlocked) {
      playSound('error')
      return
    }
    playSound('button-click')
    setSelectedCityIndex(index)
    onSelectCity(index)
  }
  
  const handleUpgrade = (buildingId: string) => {
    playSound('button-click')
    onUpgradeBuilding(selectedCity.id, buildingId)
  }
  
  const handleUnlockNext = () => {
    playSound('celebration')
    onUnlockNextCity()
  }
  
  const completionPercentage = getCityCompletionPercentage(selectedCityProgress)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} h-[90vh] overflow-hidden bg-card border-2 border-accent/50 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.4)] p-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                  <Buildings size={32} weight="fill" className="text-accent" />
                  City Builder
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Build and upgrade your investment empire! One upgrade per day.
                </DialogDescription>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4">
                {/* Daily Upgrade Status */}
                <div className={`
                  px-4 py-2 rounded-lg border-2 
                  ${canUpgrade 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                    : 'bg-muted/50 border-border text-muted-foreground'}
                `}>
                  <div className="flex items-center gap-2">
                    {canUpgrade ? (
                      <>
                        <Check size={18} weight="bold" />
                        <span className="text-sm font-medium">Upgrade Available</span>
                      </>
                    ) : (
                      <>
                        <Clock size={18} />
                        <span className="text-sm font-medium">
                          Next in {timeUntilNextUpgrade?.hours}h {timeUntilNextUpgrade?.minutes}m
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Stars Balance */}
                <div className="bg-black/75 backdrop-blur-xl border-2 border-accent/30 rounded-xl px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Star size={24} className="text-accent" weight="fill" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Your Stars
                      </div>
                      <div className="text-2xl font-bold text-accent font-mono">
                        {stars}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* City Navigation Sidebar */}
            <div className="w-72 border-r border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Cities
                </h3>
                <Badge variant="outline">
                  {totalCitiesUnlocked}/{allCities.length}
                </Badge>
              </div>
              
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-2 pr-4">
                  {allCities.map((city, index) => (
                    <CityOverviewCard
                      key={city.id}
                      city={city}
                      progress={citiesProgress[index]}
                      isSelected={index === selectedCityIndex}
                      onSelect={() => handleSelectCity(index)}
                    />
                  ))}
                </div>
              </ScrollArea>
              
              {/* Unlock Next City Button */}
              {nextCityToUnlock && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={handleUnlockNext}
                    disabled={!canUnlockNext}
                    className="w-full"
                    variant={canUnlockNext ? "default" : "outline"}
                  >
                    {canUnlockNext ? (
                      <span className="flex items-center gap-2">
                        <Gift size={16} weight="fill" />
                        Unlock {nextCityToUnlock.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock size={16} />
                        Need {nextCityToUnlock.unlockRequirement} ⭐
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {/* City Details */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* City Header */}
              <div 
                className="px-6 py-4 border-b border-border"
                style={{ backgroundColor: `${selectedCity.theme}10` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedCity.icon}</div>
                    <div>
                      <h2 
                        className="text-2xl font-bold"
                        style={{ color: selectedCity.theme }}
                      >
                        {selectedCity.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCity.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* City Progress */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Progress</div>
                      <div className="text-2xl font-bold" style={{ color: selectedCity.theme }}>
                        {completionPercentage}%
                      </div>
                    </div>
                    <div className="w-32">
                      <Progress value={completionPercentage} className="h-3" />
                    </div>
                    {selectedCityProgress.isCompleted && (
                      <Badge className="bg-accent text-accent-foreground">
                        <Trophy size={14} weight="fill" className="mr-1" />
                        Complete!
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Buildings Grid */}
              <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {selectedCity.buildings.map((building) => (
                    <BuildingCard
                      key={building.id}
                      building={building}
                      level={selectedCityProgress.buildingProgress[building.id] || 0}
                      cityId={selectedCity.id}
                      canUpgrade={canUpgrade}
                      stars={stars}
                      onUpgrade={() => handleUpgrade(building.id)}
                    />
                  ))}
                </div>
                
                {/* Completion Reward */}
                {selectedCityProgress.isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-xl border-2 border-accent/50 bg-gradient-to-br from-accent/20 to-accent/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Trophy size={48} weight="fill" className="text-accent" />
                        <div>
                          <h3 className="text-xl font-bold text-accent">City Complete!</h3>
                          <p className="text-sm text-muted-foreground">
                            You've fully upgraded all buildings in {selectedCity.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {selectedCity.completionReward.coins}
                          </div>
                          <div className="text-xs text-muted-foreground">Coins Earned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {selectedCity.completionReward.stars}
                          </div>
                          <div className="text-xs text-muted-foreground">Stars Earned</div>
                        </div>
                        {selectedCity.completionReward.specialItem && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-accent">
                              🎁 {selectedCity.completionReward.specialItem}
                            </div>
                            <div className="text-xs text-muted-foreground">Special Reward</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          {/* Footer Stats */}
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Buildings size={20} className="text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{totalBuildingsCompleted}</strong> buildings completed
                  </span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{totalCitiesCompleted}</strong> / {allCities.length} cities complete
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                💡 Tip: Upgrade buildings daily to progress faster!
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CityBuilderModal

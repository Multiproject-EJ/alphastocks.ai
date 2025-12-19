import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  CityBuilderState,
  CityProgress,
  City,
  Building,
  CITIES,
  getInitialCityBuilderState,
  canUpgradeToday,
  getUpgradeCost,
  getUpgradeReward,
  isCityComplete,
  getCityCompletionPercentage,
  canUnlockNextCity,
  getNextCityToUnlock,
  getTotalBuildingsCompleted,
  getTimeUntilNextUpgrade,
  MAX_BUILDING_LEVEL,
} from '@/lib/cityBuilder'

interface UseCityBuilderProps {
  initialState?: CityBuilderState
  stars: number
  onSpendStars: (amount: number, reason: string) => boolean
  onEarnCoins: (amount: number, source: string) => void
  onEarnStars?: (amount: number, source: string) => void
}

export function useCityBuilder({
  initialState,
  stars,
  onSpendStars,
  onEarnCoins,
  onEarnStars,
}: UseCityBuilderProps) {
  const [cityBuilderState, setCityBuilderState] = useState<CityBuilderState>(
    initialState || getInitialCityBuilderState()
  )
  
  // Check if upgrade is available today
  const canUpgrade = canUpgradeToday(cityBuilderState.lastUpgradeDate)
  
  // Get time until next upgrade
  const timeUntilNextUpgrade = getTimeUntilNextUpgrade(cityBuilderState.lastUpgradeDate)
  
  // Get current city
  const currentCity = CITIES[cityBuilderState.currentCityIndex]
  const currentCityProgress = cityBuilderState.cities[cityBuilderState.currentCityIndex]
  
  // Get all unlocked cities
  const unlockedCities = cityBuilderState.cities
    .filter(cp => cp.isUnlocked)
    .map(cp => ({
      city: CITIES.find(c => c.id === cp.cityId)!,
      progress: cp,
    }))
  
  // Upgrade a building
  const upgradeBuilding = useCallback((cityId: string, buildingId: string): boolean => {
    // Check daily limit
    if (!canUpgradeToday(cityBuilderState.lastUpgradeDate)) {
      toast.error("Daily upgrade limit reached", {
        description: "Come back tomorrow for another upgrade!"
      })
      return false
    }
    
    // Find city progress
    const cityProgressIndex = cityBuilderState.cities.findIndex(c => c.cityId === cityId)
    if (cityProgressIndex === -1) {
      toast.error("City not found")
      return false
    }
    
    const cityProgress = cityBuilderState.cities[cityProgressIndex]
    if (!cityProgress.isUnlocked) {
      toast.error("City is locked", {
        description: "Unlock this city first!"
      })
      return false
    }
    
    // Get current level
    const currentLevel = cityProgress.buildingProgress[buildingId] || 0
    if (currentLevel >= MAX_BUILDING_LEVEL) {
      toast.info("Building is already at max level!")
      return false
    }
    
    // Get cost
    const cost = getUpgradeCost(cityId, buildingId, currentLevel)
    if (cost === null) {
      toast.error("Unable to calculate upgrade cost")
      return false
    }
    
    // Check if player can afford
    if (stars < cost) {
      toast.error("Not enough stars", {
        description: `You need ${cost} stars, but only have ${stars}`
      })
      return false
    }
    
    // Spend stars
    const success = onSpendStars(cost, `Upgrade ${buildingId}`)
    if (!success) {
      return false
    }
    
    // Get reward
    const reward = getUpgradeReward(cityId, buildingId, currentLevel) || 0
    
    // Update state
    setCityBuilderState(prev => {
      const newCities = [...prev.cities]
      const newCityProgress = { ...newCities[cityProgressIndex] }
      const newBuildingProgress = { ...newCityProgress.buildingProgress }
      
      // Increment building level
      newBuildingProgress[buildingId] = currentLevel + 1
      newCityProgress.buildingProgress = newBuildingProgress
      
      // Check if building is now complete
      const buildingComplete = newBuildingProgress[buildingId] >= MAX_BUILDING_LEVEL
      
      // Check if city is now complete
      const wasComplete = newCityProgress.isCompleted
      newCityProgress.isCompleted = isCityComplete({
        ...newCityProgress,
        buildingProgress: newBuildingProgress
      })
      
      if (newCityProgress.isCompleted && !wasComplete) {
        newCityProgress.completedAt = new Date().toISOString()
      }
      
      newCities[cityProgressIndex] = newCityProgress
      
      return {
        ...prev,
        cities: newCities,
        lastUpgradeDate: new Date().toISOString(),
        totalUpgrades: prev.totalUpgrades + 1,
        totalBuildingsCompleted: buildingComplete 
          ? prev.totalBuildingsCompleted + 1 
          : prev.totalBuildingsCompleted,
      }
    })
    
    // Award coins
    if (reward > 0) {
      onEarnCoins(reward, `Building upgrade reward`)
    }
    
    // Get building and city names for toast
    const city = CITIES.find(c => c.id === cityId)
    const building = city?.buildings.find(b => b.id === buildingId)
    
    toast.success(`${building?.icon} ${building?.name} upgraded!`, {
      description: `Level ${currentLevel + 1} • Earned ${reward} coins`
    })
    
    // Check if building is now max level
    if (currentLevel + 1 >= MAX_BUILDING_LEVEL) {
      toast.success("🎉 Building Complete!", {
        description: `${building?.name} is now at maximum level!`
      })
    }
    
    return true
  }, [cityBuilderState, stars, onSpendStars, onEarnCoins])
  
  // Unlock next city
  // Design Note: City unlocking is based on reaching a star THRESHOLD, not spending stars.
  // This follows Monopoly Go's design where reaching milestones unlocks new content.
  // Players keep their stars for use on building upgrades.
  const unlockNextCity = useCallback((): boolean => {
    const nextCity = getNextCityToUnlock(cityBuilderState)
    if (!nextCity) {
      toast.info("All cities are unlocked!")
      return false
    }
    
    if (stars < nextCity.unlockRequirement) {
      toast.error("Not enough stars to unlock", {
        description: `You need ${nextCity.unlockRequirement} stars`
      })
      return false
    }
    
    // City unlocking is milestone-based: stars are checked but NOT spent
    // This allows players to save stars for building upgrades
    
    setCityBuilderState(prev => {
      const nextCityIndex = prev.cities.findIndex(c => c.cityId === nextCity.id)
      if (nextCityIndex === -1) return prev
      
      const newCities = [...prev.cities]
      newCities[nextCityIndex] = {
        ...newCities[nextCityIndex],
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      }
      
      return {
        ...prev,
        cities: newCities,
        currentCityIndex: nextCityIndex,
      }
    })
    
    toast.success(`${nextCity.icon} ${nextCity.name} Unlocked!`, {
      description: nextCity.description
    })
    
    return true
  }, [cityBuilderState, stars])
  
  // Claim city completion reward
  const claimCityReward = useCallback((cityId: string): boolean => {
    const cityProgress = cityBuilderState.cities.find(c => c.cityId === cityId)
    if (!cityProgress || !cityProgress.isCompleted) {
      toast.error("City is not complete yet")
      return false
    }
    
    const city = CITIES.find(c => c.id === cityId)
    if (!city) return false
    
    // Award completion rewards
    if (city.completionReward.coins > 0) {
      onEarnCoins(city.completionReward.coins, `${city.name} completion reward`)
    }
    
    if (city.completionReward.stars > 0 && onEarnStars) {
      onEarnStars(city.completionReward.stars, `${city.name} completion reward`)
    }
    
    toast.success(`🎊 ${city.name} Complete!`, {
      description: `Earned ${city.completionReward.coins} coins and ${city.completionReward.stars} stars!`
    })
    
    if (city.completionReward.specialItem) {
      toast.success(`🎁 Special Reward: ${city.completionReward.specialItem}`, {
        duration: 5000
      })
    }
    
    return true
  }, [cityBuilderState, onEarnCoins, onEarnStars])
  
  // Select a different city to view
  const selectCity = useCallback((cityIndex: number) => {
    if (cityIndex < 0 || cityIndex >= CITIES.length) return
    
    const cityProgress = cityBuilderState.cities[cityIndex]
    if (!cityProgress.isUnlocked) {
      toast.info("This city is locked", {
        description: "Earn more stars to unlock it!"
      })
      return
    }
    
    setCityBuilderState(prev => ({
      ...prev,
      currentCityIndex: cityIndex,
    }))
  }, [cityBuilderState])
  
  // Get city stats
  const getCityStats = useCallback((cityId: string) => {
    const cityProgress = cityBuilderState.cities.find(c => c.cityId === cityId)
    if (!cityProgress) return null
    
    return {
      completionPercentage: getCityCompletionPercentage(cityProgress),
      isUnlocked: cityProgress.isUnlocked,
      isCompleted: cityProgress.isCompleted,
    }
  }, [cityBuilderState])
  
  // Overall stats
  const totalBuildingsCompleted = getTotalBuildingsCompleted(cityBuilderState)
  const totalCitiesCompleted = cityBuilderState.cities.filter(c => c.isCompleted).length
  const totalCitiesUnlocked = cityBuilderState.cities.filter(c => c.isUnlocked).length
  
  // Check if next city can be unlocked
  const nextCityToUnlock = getNextCityToUnlock(cityBuilderState)
  const canUnlockNext = canUnlockNextCity(cityBuilderState, stars)
  
  return {
    // State
    cityBuilderState,
    setCityBuilderState,
    
    // Current city
    currentCity,
    currentCityProgress,
    
    // All cities
    unlockedCities,
    allCities: CITIES,
    
    // Actions
    upgradeBuilding,
    unlockNextCity,
    claimCityReward,
    selectCity,
    
    // Daily upgrade status
    canUpgrade,
    timeUntilNextUpgrade,
    
    // Stats
    getCityStats,
    totalBuildingsCompleted,
    totalCitiesCompleted,
    totalCitiesUnlocked,
    
    // Next city
    nextCityToUnlock,
    canUnlockNext,
  }
}

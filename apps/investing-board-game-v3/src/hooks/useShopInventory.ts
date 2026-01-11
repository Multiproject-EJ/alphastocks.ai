/**
 * Hook for managing shop purchases and inventory
 */

import { useCallback } from 'react'
import { GameState, InventoryItem, ActiveEffect } from '@/lib/types'
import { getShopItemById, ShopItem } from '@/lib/shopItems'
import { useSound } from '@/hooks/useSound'
import { toast } from 'sonner'
import { DAILY_ROLL_LIMIT, ENERGY_MAX } from '@/lib/constants'

interface UseShopInventoryProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  tierBenefits?: Map<string, number>
  onAddRolls?: (amount: number) => void
}

interface UseShopInventoryReturn {
  purchaseItem: (itemId: string) => boolean
  hasItem: (itemId: string) => boolean
  activatePowerUp: (itemId: string) => boolean
  getItemQuantity: (itemId: string) => number
  isPermanentOwned: (itemId: string) => boolean
  equipCosmetic: (itemId: string, type: 'theme' | 'diceSkin' | 'trail') => void
  canAfford: (price: number) => boolean
  getFinalPrice: (basePrice: number) => number
  shopDiscount: number
}

export function useShopInventory({
  gameState,
  setGameState,
  tierBenefits,
  onAddRolls,
}: UseShopInventoryProps): UseShopInventoryReturn {
  const { play: playSound } = useSound()

  // Get shop discount from tier benefits
  const shopDiscount = tierBenefits?.get('shop_discount') || 0

  /**
   * Calculate final price with tier discount
   * Using Math.ceil to ensure prices are always whole numbers and round up
   * to prevent exploiting fractional star costs
   */
  const getFinalPrice = useCallback(
    (basePrice: number): number => {
      const discountedPrice = basePrice * (1 - shopDiscount)
      return Math.ceil(discountedPrice)
    },
    [shopDiscount]
  )

  /**
   * Check if player can afford an item
   */
  const canAfford = useCallback(
    (price: number): boolean => {
      return gameState.stars >= price
    },
    [gameState.stars]
  )

  /**
   * Check if player has an item in inventory
   */
  const hasItem = useCallback(
    (itemId: string): boolean => {
      return gameState.inventory.some((item) => item.itemId === itemId)
    },
    [gameState.inventory]
  )

  /**
   * Get quantity of a stackable item
   */
  const getItemQuantity = useCallback(
    (itemId: string): number => {
      const item = gameState.inventory.find((inv) => inv.itemId === itemId)
      return item?.quantity || 0
    },
    [gameState.inventory]
  )

  /**
   * Check if a permanent item is owned
   */
  const isPermanentOwned = useCallback(
    (itemId: string): boolean => {
      const item = getShopItemById(itemId)
      if (!item || !item.isPermanent) return false
      return hasItem(itemId)
    },
    [hasItem]
  )

  /**
   * Purchase an item from the shop
   */
  const purchaseItem = useCallback(
    (itemId: string): boolean => {
      const item = getShopItemById(itemId)
      if (!item) {
        toast.error('Item not found')
        return false
      }

      const finalPrice = getFinalPrice(item.price)

      // Check if can afford
      if (!canAfford(finalPrice)) {
        playSound('error')
        toast.error('Insufficient stars', {
          description: `You need ${finalPrice} stars but only have ${gameState.stars}`,
        })
        return false
      }

      // Check if permanent item already owned
      if (item.isPermanent && isPermanentOwned(itemId)) {
        playSound('error')
        toast.error('Already owned', {
          description: 'You already own this item',
        })
        return false
      }

      // Process purchase
      playSound('cash-register')

      const shouldGrantExtraRolls = itemId === 'extra-dice-rolls'
      const extraRollsAmount = 3

      setGameState((prev) => {
        const newStars = prev.stars - finalPrice
        const now = new Date()

        // Update inventory
        let newInventory = [...prev.inventory]
        const existingItemIndex = newInventory.findIndex(
          (inv) => inv.itemId === itemId
        )

        if (!shouldGrantExtraRolls) {
          if (existingItemIndex >= 0 && item.stackable) {
            // Increase quantity for stackable items
            newInventory[existingItemIndex] = {
              ...newInventory[existingItemIndex],
              quantity: newInventory[existingItemIndex].quantity + 1,
            }
          } else {
            // Add new item
            newInventory.push({
              itemId,
              quantity: 1,
              purchasedAt: now,
            })
          }
        }

        // Handle immediate effects for certain items
        let updatedState = {
          ...prev,
          stars: newStars,
          inventory: newInventory,
        }

        // Apply immediate effects based on item type
        if (itemId === 'extra-dice-rolls') {
          updatedState.energyRolls = Math.min(
            (prev.energyRolls ?? DAILY_ROLL_LIMIT) + extraRollsAmount,
            ENERGY_MAX
          )
          toast.success('Dice rolls added!', {
            description: `+${extraRollsAmount} rolls available`,
          })
        } else if (itemId === 'cash-small') {
          updatedState.cash += 100000
          updatedState.netWorth += 100000
          toast.success('Cash added!', {
            description: '+$100,000 to your balance',
          })
        } else if (itemId === 'cash-medium') {
          updatedState.cash += 250000
          updatedState.netWorth += 250000
          toast.success('Cash added!', {
            description: '+$250,000 to your balance',
          })
        } else if (itemId === 'cash-large') {
          updatedState.cash += 500000
          updatedState.netWorth += 500000
          toast.success('Cash added!', {
            description: '+$500,000 to your balance',
          })
        } else if (item.isPermanent) {
          // Add to active effects for permanent upgrades
          const newEffect: ActiveEffect = {
            itemId,
            activated: true,
          }
          updatedState.activeEffects = [...prev.activeEffects, newEffect]
          toast.success('Upgrade purchased!', {
            description: item.name + ' is now active',
          })
        } else {
          toast.success('Item purchased!', {
            description: item.name + ' added to inventory',
          })
        }

        return updatedState
      })

      if (shouldGrantExtraRolls) {
        onAddRolls?.(extraRollsAmount)
      }

      return true
    },
    [
      canAfford,
      gameState.stars,
      isPermanentOwned,
      onAddRolls,
      playSound,
      setGameState,
      getFinalPrice,
    ]
  )

  /**
   * Activate a power-up from inventory
   */
  const activatePowerUp = useCallback(
    (itemId: string): boolean => {
      const item = getShopItemById(itemId)
      if (!item || item.isPermanent) {
        toast.error('Cannot activate this item')
        return false
      }

      const quantity = getItemQuantity(itemId)
      if (quantity <= 0) {
        toast.error('Item not in inventory')
        return false
      }

      // Activate the power-up
      setGameState((prev) => {
        // Decrease quantity in inventory
        const newInventory = prev.inventory
          .map((inv) => {
            if (inv.itemId === itemId) {
              return { ...inv, quantity: inv.quantity - 1 }
            }
            return inv
          })
          .filter((inv) => inv.quantity > 0) // Remove if quantity reaches 0

        // Add to active effects
        const newEffect: ActiveEffect = {
          itemId,
          activated: true,
        }

        return {
          ...prev,
          inventory: newInventory,
          activeEffects: [...prev.activeEffects, newEffect],
        }
      })

      playSound('button-click')
      toast.success('Power-up activated!', {
        description: item.name + ' is now active',
      })

      return true
    },
    [getItemQuantity, playSound, setGameState]
  )

  /**
   * Equip a cosmetic item
   */
  const equipCosmetic = useCallback(
    (itemId: string, type: 'theme' | 'diceSkin' | 'trail') => {
      if (!isPermanentOwned(itemId)) {
        toast.error("You don't own this cosmetic")
        return
      }

      setGameState((prev) => {
        const updates: Partial<GameState> = {}
        
        if (type === 'theme') {
          updates.equippedTheme = itemId
        } else if (type === 'diceSkin') {
          updates.equippedDiceSkin = itemId
        } else if (type === 'trail') {
          updates.equippedTrail = itemId
        }

        return { ...prev, ...updates }
      })

      playSound('button-click')
      toast.success('Cosmetic equipped!')
    },
    [isPermanentOwned, playSound, setGameState]
  )

  return {
    purchaseItem,
    hasItem,
    activatePowerUp,
    getItemQuantity,
    isPermanentOwned,
    equipCosmetic,
    canAfford,
    getFinalPrice,
    shopDiscount,
  }
}

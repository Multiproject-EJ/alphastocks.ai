/**
 * Shop Modal Component
 * Full-screen shop interface for purchasing items with stars
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, Package, Lightning, Palette, CurrencyDollar } from '@phosphor-icons/react'
import { ShopItemCard } from '@/components/ShopItemCard'
import { GameState } from '@/lib/types'
import {
  getShopItemsByCategory,
  ShopItem,
  POWER_UPS,
  UPGRADES,
  COSMETICS,
  CURRENCY_PACKS,
  SHOP_ITEMS,
} from '@/lib/shopItems'
import { useSound } from '@/hooks/useSound'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileShop } from '@/components/shop/MobileShop'

interface ShopModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
  onPurchase: (itemId: string) => void
  onMobilePurchase?: (itemId: string) => boolean
  isPermanentOwned: (itemId: string) => boolean
  getItemQuantity: (itemId: string) => number
  canAfford: (price: number) => boolean
  onEquipCosmetic?: (itemId: string, type: 'theme' | 'diceSkin' | 'trail') => void
  getFinalPrice?: (basePrice: number) => number
  shopDiscount?: number
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'newest'

export function ShopModal({
  open,
  onOpenChange,
  gameState,
  onPurchase,
  onMobilePurchase,
  isPermanentOwned,
  getItemQuantity,
  canAfford,
  onEquipCosmetic,
  getFinalPrice,
  shopDiscount = 0,
}: ShopModalProps) {
  const { play: playSound } = useSound()
  const isMobile = useIsMobile()
  const [selectedCategory, setSelectedCategory] = useState<'powerup' | 'upgrade' | 'cosmetic' | 'currency'>('powerup')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null)

  // Handle mobile shop purchase (uses cash instead of stars)
  const handleMobilePurchase = (itemId: string, cost: number) => {
    if (onMobilePurchase) {
      onMobilePurchase(itemId)
    }
  }

  // Show mobile shop on mobile devices
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[100vw] max-w-[100vw] h-[100vh] overflow-hidden bg-background p-0 gap-0 border-0">
          <MobileShop 
            cash={gameState.cash}
            onPurchase={handleMobilePurchase}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // Get items for current category
  const categoryItems = useMemo(() => {
    let items = getShopItemsByCategory(selectedCategory)
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        items = [...items].sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        items = [...items].sort((a, b) => b.price - a.price)
        break
      case 'newest':
        items = [...items].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        // Keep default order
        break
    }
    
    return items
  }, [selectedCategory, sortBy])

  const handleTabChange = (value: string) => {
    playSound('button-click')
    setSelectedCategory(value as typeof selectedCategory)
  }

  const handlePurchaseClick = (item: ShopItem) => {
    if (!canAfford(item.price)) {
      playSound('error')
      return
    }

    if (item.isPermanent && isPermanentOwned(item.id)) {
      playSound('error')
      return
    }

    // Show confirmation dialog
    setConfirmItem(item)
  }

  const handleConfirmPurchase = () => {
    if (confirmItem) {
      onPurchase(confirmItem.id)
      setConfirmItem(null)
    }
  }

  const handleCancelPurchase = () => {
    playSound('button-click')
    setConfirmItem(null)
  }

  const handleEquipCosmetic = (itemId: string) => {
    if (!onEquipCosmetic) return
    
    // Determine cosmetic type based on item ID
    let type: 'theme' | 'diceSkin' | 'trail'
    
    if (itemId.startsWith('theme-')) {
      type = 'theme'
    } else if (itemId.startsWith('dice-')) {
      type = 'diceSkin'
    } else if (itemId.startsWith('trail-')) {
      type = 'trail'
    } else {
      return
    }
    
    onEquipCosmetic(itemId, type)
  }

  const isCosmeticEquipped = (itemId: string): boolean => {
    if (itemId.startsWith('theme-')) {
      return gameState.equippedTheme === itemId
    } else if (itemId.startsWith('dice-')) {
      return gameState.equippedDiceSkin === itemId
    } else if (itemId.startsWith('trail-')) {
      return gameState.equippedTrail === itemId
    }
    return false
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] max-w-[95vw] h-[90vh] overflow-hidden bg-card border-2 border-accent/50 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.4)] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-3xl font-bold text-accent flex items-center gap-3">
                    <Package size={32} weight="fill" />
                    Shop
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Purchase power-ups, upgrades, and cosmetics with your stars
                  </DialogDescription>
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
                        {gameState.stars}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs and Content */}
            <Tabs
              value={selectedCategory}
              onValueChange={handleTabChange}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-6 pt-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid grid-cols-4 w-[600px]">
                    <TabsTrigger value="powerup" className="flex items-center gap-2">
                      <Lightning size={16} weight="fill" />
                      Power-Ups
                      <span className="text-xs opacity-60">({POWER_UPS.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="upgrade" className="flex items-center gap-2">
                      <Star size={16} weight="fill" />
                      Upgrades
                      <span className="text-xs opacity-60">({UPGRADES.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="cosmetic" className="flex items-center gap-2">
                      <Palette size={16} weight="fill" />
                      Cosmetics
                      <span className="text-xs opacity-60">({COSMETICS.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="currency" className="flex items-center gap-2">
                      <CurrencyDollar size={16} weight="fill" />
                      Currency
                      <span className="text-xs opacity-60">({CURRENCY_PACKS.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tab Content with Items Grid */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryItems.map((item) => (
                        <ShopItemCard
                          key={item.id}
                          item={item}
                          owned={item.isPermanent ? isPermanentOwned(item.id) : getItemQuantity(item.id) > 0}
                          quantity={getItemQuantity(item.id)}
                          canAfford={canAfford(getFinalPrice ? getFinalPrice(item.price) : item.price)}
                          onPurchase={() => handlePurchaseClick(item)}
                          isEquipped={item.category === 'cosmetic' ? isCosmeticEquipped(item.id) : undefined}
                          onEquip={item.category === 'cosmetic' && isPermanentOwned(item.id) ? () => handleEquipCosmetic(item.id) : undefined}
                          shopDiscount={shopDiscount}
                          finalPrice={getFinalPrice ? getFinalPrice(item.price) : item.price}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={!!confirmItem} onOpenChange={(open) => !open && handleCancelPurchase()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <span className="text-4xl">{confirmItem?.icon}</span>
              Confirm Purchase
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to purchase <strong>{confirmItem?.name}</strong> for{' '}
                <strong className="text-accent">{confirmItem?.price} stars</strong>?
              </p>
              {confirmItem?.isPermanent && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                  <p className="text-sm text-accent font-medium">
                    ⚠️ This is a permanent upgrade. Once purchased, it cannot be refunded.
                  </p>
                </div>
              )}
              {confirmItem?.effect && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    <strong>Effect:</strong> {confirmItem.effect}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPurchase}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase}>
              Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ShopModal

/**
 * Shop Item Card Component
 * Displays individual shop items with purchase button
 */

import { motion } from 'framer-motion'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Check, ShoppingCart } from '@phosphor-icons/react'
import { ShopItem } from '@/lib/shopItems'

interface ShopItemCardProps {
  item: ShopItem
  owned: boolean
  quantity?: number
  canAfford: boolean
  onPurchase: () => void
  isEquipped?: boolean
  onEquip?: () => void
}

const ShopItemCardComponent = ({
  item,
  owned,
  quantity = 0,
  canAfford,
  onPurchase,
  isEquipped,
  onEquip,
}: ShopItemCardProps) => {
  const isDisabled = !canAfford || (owned && !item.stackable)

  return (
    <motion.div
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative overflow-hidden border-2 transition-all ${
          !canAfford
            ? 'opacity-50 border-border bg-card/50'
            : owned && item.isPermanent
            ? 'border-accent/50 bg-accent/5 shadow-[0_0_20px_oklch(0.75_0.15_85_/_0.2)]'
            : 'border-border hover:border-accent/60 hover:shadow-[0_0_30px_oklch(0.75_0.15_85_/_0.3)]'
        }`}
      >
        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex gap-2 absolute top-3 right-3">
            {item.isNew && (
              <Badge variant="default" className="bg-accent text-accent-foreground">
                NEW
              </Badge>
            )}
            {isEquipped && (
              <Badge variant="default" className="bg-green-600 text-white flex items-center gap-1">
                <Check size={12} weight="bold" />
                EQUIPPED
              </Badge>
            )}
            {owned && item.isPermanent && !isEquipped && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check size={12} weight="bold" />
                OWNED
              </Badge>
            )}
            {quantity > 0 && item.stackable && (
              <Badge variant="outline" className="font-mono">
                ×{quantity}
              </Badge>
            )}
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="text-6xl mb-2">{item.icon}</div>
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-center text-foreground">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center min-h-[2.5rem]">
            {item.description}
          </p>

          {/* Effect */}
          {item.effect && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-2">
              <p className="text-xs text-accent text-center font-medium">
                {item.effect}
              </p>
            </div>
          )}

          {/* Price and Buy Button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-center gap-2 text-accent">
              <Star size={20} weight="fill" />
              <span className="text-xl font-bold font-mono">{item.price}</span>
            </div>

            {owned && item.isPermanent && onEquip && (
              <Button
                onClick={onEquip}
                disabled={isEquipped}
                className="w-full"
                variant={isEquipped ? 'default' : 'secondary'}
              >
                {isEquipped ? (
                  <>
                    <Check size={16} className="mr-2" weight="bold" />
                    Equipped
                  </>
                ) : (
                  'Equip'
                )}
              </Button>
            )}
            
            {(!owned || !item.isPermanent || !onEquip) && (
              <Button
                onClick={onPurchase}
                disabled={isDisabled}
                className="w-full"
                variant={owned && item.isPermanent ? 'secondary' : 'default'}
              >
                {owned && item.isPermanent ? (
                  <>
                    <Check size={16} className="mr-2" weight="bold" />
                    Owned
                  </>
                ) : owned && item.stackable ? (
                  <>
                    <ShoppingCart size={16} className="mr-2" weight="bold" />
                    Buy More
                  </>
                ) : !canAfford ? (
                  'Insufficient Stars'
                ) : (
                  <>
                    <ShoppingCart size={16} className="mr-2" weight="bold" />
                    Purchase
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export const ShopItemCard = memo(ShopItemCardComponent)

import { useCallback, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import type { GameState } from '@/lib/types'
import type { VaultItemSummary } from '@/hooks/useShopVaultOverview'

type UseShopVaultPurchaseParams = {
  gameState: GameState
  setGameState: Dispatch<SetStateAction<GameState>>
}

const formatCurrencyLabel = (currency: VaultItemSummary['currency']) => {
  if (currency === 'cash') return 'cash'
  if (currency === 'stars') return 'stars'
  return 'coins'
}

export function useShopVaultPurchase({ gameState, setGameState }: UseShopVaultPurchaseParams) {
  const { user } = useAuth()
  const [isPurchasing, setIsPurchasing] = useState(false)

  const purchaseVaultItem = useCallback(
    async (item: VaultItemSummary): Promise<boolean> => {
      if (item.isOwned) {
        toast.info('Already owned', {
          description: `${item.name} is already in your collection.`,
        })
        return false
      }

      const balance = item.currency === 'cash'
        ? gameState.cash
        : item.currency === 'stars'
        ? gameState.stars
        : gameState.coins

      if (balance < item.price) {
        toast.error(`Not enough ${formatCurrencyLabel(item.currency)}`, {
          description: `You need ${item.price.toLocaleString()} ${formatCurrencyLabel(item.currency)}.`,
        })
        return false
      }

      setIsPurchasing(true)

      try {
        if (supabaseClient && hasSupabaseConfig && user) {
          const { error } = await supabaseClient.rpc('shop_vault_purchase', {
            item_id: item.id,
          })

          if (error) {
            toast.error('Vault purchase failed', {
              description: error.message,
            })
            return false
          }
        } else {
          toast.message('Preview purchase', {
            description: 'Vault items are saved locally until sync is enabled.',
          })
        }

        setGameState((prev) => {
          if (item.currency === 'cash') {
            return { ...prev, cash: prev.cash - item.price }
          }
          if (item.currency === 'stars') {
            return { ...prev, stars: prev.stars - item.price }
          }
          return { ...prev, coins: prev.coins - item.price }
        })

        toast.success('Vault item secured!', {
          description: `${item.name} has been added to your vault.`,
        })
        return true
      } catch (err) {
        console.error('[shop vault purchase]', err)
        toast.error('Vault purchase failed', {
          description: 'Please try again.',
        })
        return false
      } finally {
        setIsPurchasing(false)
      }
    },
    [gameState.cash, gameState.coins, gameState.stars, setGameState, user]
  )

  return {
    purchaseVaultItem,
    isPurchasing,
  }
}

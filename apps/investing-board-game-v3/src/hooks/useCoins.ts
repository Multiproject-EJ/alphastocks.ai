import { useState } from 'react'
import { toast } from 'sonner'
import { CoinsTransaction, COIN_EARNINGS, canAffordCoins } from '@/lib/coins'

export const useCoins = (initialCoins: number = 0) => {
  const [coins, setCoins] = useState(initialCoins)
  const [coinHistory, setCoinHistory] = useState<CoinsTransaction[]>([])
  
  const addCoins = (amount: number, source: string) => {
    setCoins(prev => prev + amount)
    setCoinHistory(prev => [...prev, { amount, source, timestamp: new Date() }])
    
    // Show toast
    toast.success(`+${amount} 🪙`, {
      description: source,
      duration: 2000
    })
    
    // Play sound
    // Show coin animation
  }
  
  const spendCoins = (amount: number, purpose: string): boolean => {
    if (coins < amount) {
      toast.error('Insufficient coins', {
        description: `You need ${amount} coins but only have ${coins}`
      })
      return false
    }
    
    setCoins(prev => prev - amount)
    setCoinHistory(prev => [...prev, { amount: -amount, source: purpose, timestamp: new Date() }])
    
    toast.info(`-${amount} 🪙`, {
      description: purpose,
      duration: 2000
    })
    
    return true
  }
  
  const earnFromSource = (source: keyof typeof COIN_EARNINGS) => {
    const amount = COIN_EARNINGS[source]
    addCoins(amount, source.replace(/_/g, ' '))
  }
  
  return {
    coins,
    setCoins,
    addCoins,
    spendCoins,
    earnFromSource,
    coinHistory,
    canAfford: (cost: number) => canAffordCoins(coins, cost)
  }
}

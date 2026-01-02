import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  STOCK_EXCHANGES,
  StockExchangeBuilderState,
  StockExchangeDefinition,
  StockExchangePillarKey,
  StockExchangeProgress,
  getInitialStockExchangeState,
  recordStockView,
  upgradePillar,
} from '@/lib/stockExchangeBuilder'

interface UseStockExchangeBuilderProps {
  initialState?: StockExchangeBuilderState
  availableCapital: number
  onSpendCapital: (amount: number, reason: string) => boolean
}

export function useStockExchangeBuilder({
  initialState,
  availableCapital,
  onSpendCapital,
}: UseStockExchangeBuilderProps) {
  const [stockExchangeState, setStockExchangeState] = useState<StockExchangeBuilderState>(
    initialState || getInitialStockExchangeState()
  )

  const [selectedExchangeId, setSelectedExchangeId] = useState<string>(() => {
    const initialExchange = initialState?.exchanges?.[0]?.exchangeId
    return initialExchange ?? STOCK_EXCHANGES[0]?.id ?? ''
  })

  const progressByExchangeId = useMemo(
    () => new Map(stockExchangeState.exchanges.map(entry => [entry.exchangeId, entry])),
    [stockExchangeState.exchanges]
  )

  const updateExchangeProgress = useCallback(
    (exchangeId: string, nextProgress: StockExchangeProgress) => {
      setStockExchangeState(prev => ({
        ...prev,
        exchanges: prev.exchanges.map(entry =>
          entry.exchangeId === exchangeId ? nextProgress : entry
        ),
      }))
    },
    []
  )

  const selectExchange = useCallback((exchangeId: string) => {
    setSelectedExchangeId(exchangeId)
  }, [])

  const handleUpgradePillar = useCallback(
    (exchangeId: string, pillarKey: StockExchangePillarKey) => {
      const exchange = STOCK_EXCHANGES.find(item => item.id === exchangeId)
      const progress = progressByExchangeId.get(exchangeId)

      if (!exchange || !progress) {
        toast.error('Exchange not found')
        return
      }

      const result = upgradePillar(progress, exchange, pillarKey)
      if (!result.wasUpgraded) {
        toast.info('Pillar already at max level')
        return
      }

      if (availableCapital < result.cost) {
        toast.error('Not enough capital', {
          description: `Requires ${result.cost} capital.`
        })
        return
      }

      const spent = onSpendCapital(result.cost, `Upgrade ${exchange.name} pillar`)
      if (!spent) {
        return
      }

      updateExchangeProgress(exchangeId, result.progress)

      toast.success('Pillar upgraded', {
        description: `${exchange.name} • Spent ${result.cost} capital`,
      })
    },
    [availableCapital, onSpendCapital, progressByExchangeId, updateExchangeProgress]
  )

  const handleViewStock = useCallback(
    (exchangeId: string, stockId: string) => {
      const exchange = STOCK_EXCHANGES.find(item => item.id === exchangeId)
      const progress = progressByExchangeId.get(exchangeId)

      if (!exchange || !progress) {
        toast.error('Exchange not found')
        return
      }

      if (progress.stocksViewed.includes(stockId)) {
        toast.info(`${stockId} already discovered`)
        return
      }

      const nextProgress = recordStockView(progress, exchange, stockId)
      updateExchangeProgress(exchangeId, nextProgress)

      toast.success(`Discovered ${stockId}`, {
        description: `${exchange.name} stock discovery +1`,
      })
    },
    [progressByExchangeId, updateExchangeProgress]
  )

  const selectedExchange = useMemo<StockExchangeDefinition | undefined>(
    () => STOCK_EXCHANGES.find(exchange => exchange.id === selectedExchangeId) ?? STOCK_EXCHANGES[0],
    [selectedExchangeId]
  )

  return {
    exchanges: STOCK_EXCHANGES,
    stockExchangeState,
    setStockExchangeState,
    selectedExchangeId: selectedExchange?.id ?? '',
    selectExchange,
    onUpgradePillar: handleUpgradePillar,
    onViewStock: handleViewStock,
  }
}

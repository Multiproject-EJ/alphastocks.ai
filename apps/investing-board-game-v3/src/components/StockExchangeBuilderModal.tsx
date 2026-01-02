/**
 * Stock Exchange Builder Modal
 * Responsive UI for managing stock exchange progression and pillars.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import {
  Bank,
  Compass,
  ChartLineUp,
  Lightbulb,
  Globe,
  Sparkle,
} from '@phosphor-icons/react'
import {
  StockExchangeDefinition,
  StockExchangeProgress,
  STOCK_EXCHANGE_PILLARS,
  StockExchangePillarKey,
  StockExchangeArchiveEntry,
  STOCK_EXCHANGE_PREMIUM_OFFERS,
  getViewedStockCount,
  getPillarProgressPercentage,
  getOverallProgressPercentage,
  getArchiveEntries,
} from '@/lib/stockExchangeBuilder'

const pillarIcons: Record<StockExchangePillarKey, JSX.Element> = {
  capitalInfrastructure: <Bank size={20} weight="fill" className="text-emerald-400" />,
  marketActivity: <ChartLineUp size={20} weight="fill" className="text-sky-400" />,
  knowledgeDiscovery: <Lightbulb size={20} weight="fill" className="text-amber-400" />,
  investorSkill: <Compass size={20} weight="fill" className="text-violet-400" />,
}

interface StockExchangeBuilderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exchanges: StockExchangeDefinition[]
  progress: StockExchangeProgress[]
  selectedExchangeId: string
  onSelectExchange: (exchangeId: string) => void
  availableCapital: number
  onUpgradePillar?: (exchangeId: string, pillarKey: StockExchangePillarKey) => void
  onViewStock?: (exchangeId: string, stockId: string) => void
  onPurchaseOffer?: (offerId: string) => void
}

function StockExchangeArchive({ entries }: { entries: StockExchangeArchiveEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        No exchanges archived yet. Complete an exchange to add it to your album.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(entry => (
        <div
          key={entry.exchange.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-card/70 p-3"
        >
          <div className="h-14 w-20 overflow-hidden rounded-lg border border-border bg-black/20">
            <img
              src={entry.progress.cardImage}
              alt={`${entry.exchange.name} archive card`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h5 className="truncate text-sm font-semibold">
                {entry.exchange.name}
              </h5>
              {entry.progress.isGlossy && (
                <Badge className="bg-amber-400 text-amber-950 text-[10px]">Glossy</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{entry.exchange.region}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Completed {new Date(entry.completedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExchangeOverviewCard({
  exchange,
  progress,
  isSelected,
  onSelect,
}: {
  exchange: StockExchangeDefinition
  progress: StockExchangeProgress
  isSelected: boolean
  onSelect: () => void
}) {
  const viewedStockCount = getViewedStockCount(exchange, progress)
  const totalStocks = exchange.stockIds.length
  const pillarProgress = getPillarProgressPercentage(progress)

  return (
    <motion.button
      onClick={onSelect}
      className={`
        w-full rounded-xl border-2 p-3 text-left transition-all
        ${isSelected ? 'border-accent bg-accent/10 ring-2 ring-accent/40' : 'border-border bg-card/60 hover:border-accent/30'}
      `}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/20 text-2xl">
          <Globe size={28} weight="fill" className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold">{exchange.name}</h4>
            {progress.isGlossy && (
              <Badge className="bg-amber-400 text-amber-950 text-[10px]">Glossy</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{exchange.region}</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Pillar Progress</span>
              <span>{pillarProgress}%</span>
            </div>
            <Progress value={pillarProgress} className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Stocks Discovered</span>
              <span>
                {viewedStockCount}/{totalStocks}
              </span>
            </div>
            <Progress value={(viewedStockCount / totalStocks) * 100} className="h-1.5" />
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function PillarCard({
  exchangeId,
  pillar,
  level,
  onUpgrade,
}: {
  exchangeId: string
  pillar: (typeof STOCK_EXCHANGE_PILLARS)[number]
  level: number
  onUpgrade?: (exchangeId: string, pillarKey: StockExchangePillarKey) => void
}) {
  const isMaxed = level >= pillar.maxLevel

  return (
    <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-black/20 p-2">{pillarIcons[pillar.key]}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{pillar.name}</h4>
            {isMaxed && (
              <Badge variant="outline" className="text-[10px]">
                MAX
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{pillar.description}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Level</span>
          <span>
            {level}/{pillar.maxLevel}
          </span>
        </div>
        <Progress value={(level / pillar.maxLevel) * 100} className="h-2" />
      </div>
      <div className="mt-4">
        <Button
          size="sm"
          className="w-full"
          variant={isMaxed ? 'outline' : 'default'}
          disabled={isMaxed || !onUpgrade}
          onClick={() => onUpgrade?.(exchangeId, pillar.key)}
        >
          {isMaxed ? 'Pillar Complete' : 'Upgrade Pillar'}
        </Button>
      </div>
    </div>
  )
}

function StockDiscoveryCard({
  exchange,
  progress,
  onViewStock,
}: {
  exchange: StockExchangeDefinition
  progress: StockExchangeProgress
  onViewStock?: (exchangeId: string, stockId: string) => void
}) {
  const viewed = new Set(progress.stocksViewed)

  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Stock Discovery</h4>
          <p className="text-xs text-muted-foreground">
            Discover stocks to unlock exchange progression bonuses.
          </p>
        </div>
        <Badge variant="outline" className="text-[11px]">
          {getViewedStockCount(exchange, progress)}/{exchange.stockIds.length} viewed
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {exchange.stockIds.map(stockId => {
          const isViewed = viewed.has(stockId)

          return (
            <Button
              key={stockId}
              size="sm"
              variant={isViewed ? 'default' : 'outline'}
              className="h-8 px-3 text-xs"
              onClick={() => onViewStock?.(exchange.id, stockId)}
              disabled={isViewed || !onViewStock}
            >
              {isViewed ? '✓' : '+'} {stockId}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function PremiumOfferCard({
  offer,
  onPurchase,
}: {
  offer: (typeof STOCK_EXCHANGE_PREMIUM_OFFERS)[number]
  onPurchase?: (offerId: string) => void
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold">{offer.title}</h5>
            {offer.badge && (
              <Badge className="bg-amber-400 text-amber-950 text-[10px]">
                {offer.badge}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{offer.description}</p>
        </div>
        <Badge variant="outline" className="text-[11px]">
          {offer.priceLabel}
        </Badge>
      </div>
      <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
        {offer.perks.map(perk => (
          <li key={perk} className="flex items-center gap-2">
            <span className="text-accent">•</span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>
      <Button
        size="sm"
        className="mt-4 w-full"
        variant={onPurchase ? 'default' : 'outline'}
        onClick={() => onPurchase?.(offer.id)}
        disabled={!onPurchase}
      >
        {onPurchase ? 'Unlock Boost' : 'Coming Soon'}
      </Button>
    </div>
  )
}

export function StockExchangeBuilderModal({
  open,
  onOpenChange,
  exchanges,
  progress,
  selectedExchangeId,
  onSelectExchange,
  availableCapital,
  onUpgradePillar,
  onViewStock,
  onPurchaseOffer,
}: StockExchangeBuilderModalProps) {
  const dialogClass = useResponsiveDialogClass('full')

  const selectedExchange = useMemo(
    () => exchanges.find(exchange => exchange.id === selectedExchangeId) ?? exchanges[0],
    [exchanges, selectedExchangeId]
  )

  const selectedProgress = useMemo(
    () => progress.find(entry => entry.exchangeId === selectedExchange?.id) ?? progress[0],
    [progress, selectedExchange]
  )

  if (!selectedExchange || !selectedProgress) {
    return null
  }

  const pillarProgress = getPillarProgressPercentage(selectedProgress)
  const overallProgress = getOverallProgressPercentage(selectedExchange, selectedProgress)
  const viewedStockCount = getViewedStockCount(selectedExchange, selectedProgress)
  const archiveEntries = useMemo(
    () => getArchiveEntries(exchanges, progress),
    [exchanges, progress]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${dialogClass} h-[90vh] overflow-hidden border-2 border-accent/40 bg-card p-0 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.35)]`}
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
                  <Sparkle size={30} weight="fill" className="text-accent" />
                  Stock Exchange Builder
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Strengthen exchange pillars and discover stocks to level up your market hubs.
                </DialogDescription>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Available Capital
                  </div>
                  <div className="text-2xl font-bold text-accent">{availableCapital}</div>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Exchange Level
                  </div>
                  <div className="text-2xl font-bold">Lv. {selectedProgress.level}</div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <aside className="flex w-full flex-col border-b border-border bg-muted/30 lg:w-80 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between px-4 pb-3 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Exchanges
                </h3>
                <Badge variant="outline" className="text-[11px]">
                  {exchanges.length} total
                </Badge>
              </div>
              <ScrollArea className="flex-1 px-4 pb-4">
                <div className="space-y-3">
                  {exchanges.map(exchange => {
                    const entry = progress.find(item => item.exchangeId === exchange.id)

                    if (!entry) return null

                    return (
                      <ExchangeOverviewCard
                        key={exchange.id}
                        exchange={exchange}
                        progress={entry}
                        isSelected={exchange.id === selectedExchange.id}
                        onSelect={() => onSelectExchange(exchange.id)}
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            </aside>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 overflow-hidden rounded-lg border border-border bg-black/20">
                      <img
                        src={selectedProgress.cardImage}
                        alt={`${selectedExchange.name} card`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedExchange.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedExchange.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Overall Progress</div>
                      <div className="text-2xl font-bold text-accent">{overallProgress}%</div>
                    </div>
                    <div className="w-32">
                      <Progress value={overallProgress} className="h-3" />
                    </div>
                    <Badge className="bg-accent/20 text-accent">
                      {viewedStockCount}/{selectedExchange.stockIds.length} stocks
                    </Badge>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 px-6 py-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  {STOCK_EXCHANGE_PILLARS.map(pillar => (
                    <PillarCard
                      key={pillar.key}
                      exchangeId={selectedExchange.id}
                      pillar={pillar}
                      level={selectedProgress.pillarLevels[pillar.key] ?? 0}
                      onUpgrade={onUpgradePillar}
                    />
                  ))}
                </div>

                <div className="my-6">
                  <Separator />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                  <StockDiscoveryCard
                    exchange={selectedExchange}
                    progress={selectedProgress}
                    onViewStock={onViewStock}
                  />
                  <div className="rounded-xl border border-border bg-card/70 p-4">
                    <h4 className="text-sm font-semibold">Exchange Insights</h4>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Balance pillar upgrades and stock discovery to unlock higher exchange
                      levels. Each level improves rewards, card art, and premium bonuses.
                    </p>
                    <div className="mt-4 space-y-3 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Capital Invested</span>
                        <span className="font-semibold text-foreground">
                          {selectedProgress.capitalInvested}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Card Finish</span>
                        <span className="font-semibold text-foreground">
                          {selectedProgress.isGlossy ? 'Glossy' : 'Standard'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Completion</span>
                        <span className="font-semibold text-foreground">
                          {selectedProgress.completedAt ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="my-6">
                  <Separator />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Premium Boosts</h4>
                      <p className="text-xs text-muted-foreground">
                        Optional boosts to accelerate exchange progression and card finishes.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      Limited-time
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {STOCK_EXCHANGE_PREMIUM_OFFERS.map(offer => (
                      <PremiumOfferCard
                        key={offer.id}
                        offer={offer}
                        onPurchase={onPurchaseOffer}
                      />
                    ))}
                  </div>
                </div>

                <div className="my-6">
                  <Separator />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Archive Album</h4>
                      <p className="text-xs text-muted-foreground">
                        Completed exchanges are saved here for quick review.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {archiveEntries.length} archived
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <StockExchangeArchive entries={archiveEntries} />
                  </div>
                </div>
              </ScrollArea>
            </section>
          </div>

          <div className="border-t border-border bg-muted/30 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>
                  {selectedExchange.name} • {selectedExchange.region}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span>Progression across {STOCK_EXCHANGE_PILLARS.length} pillars</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: Keep pillars balanced to maximize exchange rewards.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StockExchangeBuilderModal

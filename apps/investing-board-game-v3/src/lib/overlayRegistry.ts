/**
 * Overlay Registry
 * 
 * Central registry mapping overlay IDs to their component implementations.
 * Used by OverlayRenderer to dynamically render the correct modal component.
 */

import { lazy } from 'react'
import { StockModal } from '@/components/StockModal'
import { EventModal } from '@/components/EventModal'
import { ThriftyPathModal } from '@/components/ThriftyPathModal'
import { PortfolioModal } from '@/components/PortfolioModal'
import { HubModal } from '@/components/HubModal'
import { BiasSanctuaryModal } from '@/components/BiasSanctuaryModal'
import { CasinoModal } from '@/components/CasinoModal'
import { NetWorthGalleryModal } from '@/components/NetWorthGalleryModal'
import { TierUpModal } from '@/components/TierUpModal'
import { OutOfRollsModal } from '@/components/OutOfRollsModal'
import { LevelUpModal } from '@/components/LevelUpModal'
import { LeaderboardModal } from '@/components/LeaderboardModal'
import { AchievementNotification } from '@/components/AchievementNotification'

// Lazy-loaded modals for better performance
const ShopModal = lazy(() => import('@/components/ShopModal'))
const ChallengesModal = lazy(() => import('@/components/ChallengesModal'))
const EventCalendar = lazy(() => import('@/components/EventCalendar'))
const SettingsModal = lazy(() => import('@/components/SettingsModal'))
const CityBuilderModal = lazy(() => import('@/components/CityBuilderModal'))

export const OVERLAY_REGISTRY = {
  'stock': StockModal,
  'event': EventModal,
  'thriftyPath': ThriftyPathModal,
  'portfolio': PortfolioModal,
  'hub': HubModal,
  'biasSanctuary': BiasSanctuaryModal,
  'casino': CasinoModal,
  'shop': ShopModal,
  'challenges': ChallengesModal,
  'eventCalendar': EventCalendar,
  'netWorthGallery': NetWorthGalleryModal,
  'tierUp': TierUpModal,
  'outOfRolls': OutOfRollsModal,
  'settings': SettingsModal,
  'cityBuilder': CityBuilderModal,
  'levelUp': LevelUpModal,
  'leaderboard': LeaderboardModal,
  'achievement': AchievementNotification,
} as const

export type OverlayType = keyof typeof OVERLAY_REGISTRY

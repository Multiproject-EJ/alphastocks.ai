/**
 * Utility functions for stock score display and color coding
 */

// Score thresholds
const SCORE_GOOD_THRESHOLD = 8
const SCORE_MODERATE_THRESHOLD = 6
const RISK_LOW_THRESHOLD = 4
const RISK_MODERATE_THRESHOLD = 7

// Color classes
const COLOR_GREEN = 'text-green-500'
const COLOR_YELLOW = 'text-yellow-500'
const COLOR_RED = 'text-red-500'
const BG_GREEN = 'bg-green-500/20 border-green-500/50'
const BG_YELLOW = 'bg-yellow-500/20 border-yellow-500/50'
const BG_RED = 'bg-red-500/20 border-red-500/50'

/**
 * Determine score category based on thresholds
 * @param score - Score value (0-10)
 * @param isRisk - If true, inverse logic is used (lower is better)
 * @returns Category: 'good', 'moderate', or 'poor'
 */
function getScoreCategory(score: number, isRisk: boolean = false): 'good' | 'moderate' | 'poor' {
  if (isRisk) {
    if (score <= RISK_LOW_THRESHOLD) return 'good'
    if (score <= RISK_MODERATE_THRESHOLD) return 'moderate'
    return 'poor'
  } else {
    if (score >= SCORE_GOOD_THRESHOLD) return 'good'
    if (score >= SCORE_MODERATE_THRESHOLD) return 'moderate'
    return 'poor'
  }
}

/**
 * Get color class based on score value
 * @param score - Score value (0-10)
 * @param isRisk - If true, inverse coloring is used (lower is better)
 * @returns Tailwind color class
 */
export function getScoreColor(score: number, isRisk: boolean = false): string {
  const category = getScoreCategory(score, isRisk)
  switch (category) {
    case 'good': return COLOR_GREEN
    case 'moderate': return COLOR_YELLOW
    case 'poor': return COLOR_RED
  }
}

/**
 * Get background color class for score badge
 * @param score - Score value (0-10)
 * @param isRisk - If true, inverse coloring is used (lower is better)
 * @returns Tailwind background and border color classes
 */
export function getScoreBgColor(score: number, isRisk: boolean = false): string {
  const category = getScoreCategory(score, isRisk)
  switch (category) {
    case 'good': return BG_GREEN
    case 'moderate': return BG_YELLOW
    case 'poor': return BG_RED
  }
}

/**
 * Get human-readable risk level label
 * @param score - Risk score value (0-10)
 * @returns Risk level label
 */
export function getRiskLabel(score: number): string {
  const category = getScoreCategory(score, true)
  switch (category) {
    case 'good': return 'Low'
    case 'moderate': return 'Medium'
    case 'poor': return 'High'
  }
}

/**
 * Get short risk level label for compact displays
 * @param score - Risk score value (0-10)
 * @returns Short risk level label
 */
export function getRiskLabelShort(score: number): string {
  const label = getRiskLabel(score)
  return label === 'Medium' ? 'Med' : label
}

/**
 * Get color classes for risk label badges
 * @param label - Risk label string (e.g., "Low Risk", "High Risk")
 * @returns Tailwind color classes for badge
 */
export function getRiskLabelColor(label: string | null | undefined): string {
  if (!label) return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
  const normalized = label.toLowerCase()
  if (normalized.includes('low')) {
    return 'bg-green-500/20 text-green-700 border-green-500/50'
  } else if (normalized.includes('moderate') || normalized.includes('medium')) {
    return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50'
  } else if (normalized.includes('high')) {
    return 'bg-red-500/20 text-red-700 border-red-500/50'
  }
  return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
}

/**
 * Get color classes for quality label badges
 * @param label - Quality label string (e.g., "Excellent", "Good", "Average")
 * @returns Tailwind color classes for badge
 */
export function getQualityLabelColor(label: string | null | undefined): string {
  if (!label) return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
  const normalized = label.toLowerCase()
  if (normalized.includes('excellent')) {
    return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/50'
  } else if (normalized.includes('good') || normalized.includes('strong')) {
    return 'bg-green-500/20 text-green-700 border-green-500/50'
  } else if (normalized.includes('average') || normalized.includes('fair')) {
    return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
  } else if (normalized.includes('below') || normalized.includes('weak')) {
    return 'bg-orange-500/20 text-orange-700 border-orange-500/50'
  }
  return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
}

/**
 * Get color classes for timing label badges
 * @param label - Timing label string (e.g., "Buy", "Hold", "Wait")
 * @returns Tailwind color classes for badge
 */
export function getTimingLabelColor(label: string | null | undefined): string {
  if (!label) return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
  const normalized = label.toLowerCase()
  if (normalized.includes('buy') || normalized.includes('strong buy')) {
    return 'bg-green-500/20 text-green-700 border-green-500/50'
  } else if (normalized.includes('hold')) {
    return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50'
  } else if (normalized.includes('wait') || normalized.includes('overvalued') || normalized.includes('sell')) {
    return 'bg-red-500/20 text-red-700 border-red-500/50'
  }
  return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
}

/**
 * Format timestamp to relative time (e.g., "2 days ago", "3 weeks ago")
 * @param timestamp - ISO timestamp string or null
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Unknown'
  
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  
  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
}

/**
 * Get warning flag information
 * @param flags - addon_flags object from database
 * @returns Array of warning flag objects with icon, label, and color
 */
export function getWarningFlags(flags: Record<string, boolean> | null | undefined): Array<{ icon: string; label: string; color: string }> {
  if (!flags || typeof flags !== 'object') return []
  
  const warnings: Array<{ icon: string; label: string; color: string }> = []
  
  if (flags.high_debt) {
    warnings.push({ icon: '⚠️', label: 'High Debt Warning', color: 'bg-orange-500/20 text-orange-700 border-orange-500/50' })
  }
  if (flags.liquidity_warning) {
    warnings.push({ icon: '💧', label: 'Liquidity Risk', color: 'bg-blue-500/20 text-blue-700 border-blue-500/50' })
  }
  if (flags.dividend_risk) {
    warnings.push({ icon: '📉', label: 'Dividend Risk', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50' })
  }
  if (flags.fraud_risk) {
    warnings.push({ icon: '🚨', label: 'Fraud Alert', color: 'bg-red-500/20 text-red-700 border-red-500/50' })
  }
  
  return warnings
}

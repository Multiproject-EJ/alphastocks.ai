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

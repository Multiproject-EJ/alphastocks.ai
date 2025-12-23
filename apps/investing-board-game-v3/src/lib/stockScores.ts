/**
 * Utility functions for stock score display and color coding
 */

/**
 * Get color class based on score value
 * @param score - Score value (0-10)
 * @param isRisk - If true, inverse coloring is used (lower is better)
 * @returns Tailwind color class
 */
export function getScoreColor(score: number, isRisk: boolean = false): string {
  if (isRisk) {
    // For risk: lower is better (green), higher is worse (red)
    if (score <= 4) return 'text-green-500'
    if (score <= 7) return 'text-yellow-500'
    return 'text-red-500'
  } else {
    // For other scores: higher is better
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }
}

/**
 * Get background color class for score badge
 * @param score - Score value (0-10)
 * @param isRisk - If true, inverse coloring is used (lower is better)
 * @returns Tailwind background and border color classes
 */
export function getScoreBgColor(score: number, isRisk: boolean = false): string {
  if (isRisk) {
    if (score <= 4) return 'bg-green-500/20 border-green-500/50'
    if (score <= 7) return 'bg-yellow-500/20 border-yellow-500/50'
    return 'bg-red-500/20 border-red-500/50'
  } else {
    if (score >= 8) return 'bg-green-500/20 border-green-500/50'
    if (score >= 6) return 'bg-yellow-500/20 border-yellow-500/50'
    return 'bg-red-500/20 border-red-500/50'
  }
}

/**
 * Get human-readable risk level label
 * @param score - Risk score value (0-10)
 * @returns Risk level label
 */
export function getRiskLabel(score: number): string {
  if (score <= 4) return 'Low'
  if (score <= 7) return 'Medium'
  return 'High'
}

/**
 * Get short risk level label for compact displays
 * @param score - Risk score value (0-10)
 * @returns Short risk level label
 */
export function getRiskLabelShort(score: number): string {
  if (score <= 4) return 'Low'
  if (score <= 7) return 'Med'
  return 'High'
}

/**
 * auditTouchTargets - Programmatic audit of touch target compliance
 * 
 * This tool scans the DOM for interactive elements and checks if they meet
 * the minimum touch target size requirements (44x44px per Apple/Android guidelines)
 */

export interface TouchTargetAuditResult {
  element: Element
  tagName: string
  identifier: string
  width: number
  height: number
  isCompliant: boolean
  location: { x: number; y: number }
  computedStyle: {
    cursor: string
    display: string
    visibility: string
  }
}

export interface TouchTargetAuditSummary {
  totalElements: number
  compliantElements: number
  nonCompliantElements: number
  complianceRate: number
  results: TouchTargetAuditResult[]
  timestamp: Date
}

// Minimum touch target size (44x44px per Apple/Android guidelines)
const MIN_TOUCH_SIZE = 44

/**
 * Get a readable identifier for an element
 */
function getElementIdentifier(element: Element): string {
  const tag = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ''
  const classes = element.className 
    ? `.${Array.from(element.classList).slice(0, 3).join('.')}` 
    : ''
  const ariaLabel = element.getAttribute('aria-label') 
    ? `[aria-label="${element.getAttribute('aria-label')}"]` 
    : ''
  const text = element.textContent?.trim().slice(0, 20) || ''
  
  let identifier = `${tag}${id}${classes}${ariaLabel}`
  if (text && !ariaLabel) {
    identifier += ` "${text}"`
  }
  
  return identifier.slice(0, 100)
}

/**
 * Check if an element is visible
 */
function isElementVisible(element: Element): boolean {
  const style = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0
  )
}

/**
 * Check if an element is interactive
 */
function isInteractiveElement(element: Element): boolean {
  // Check tag names
  if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
    return true
  }
  
  // Check for button-like inputs
  if (element.tagName === 'INPUT') {
    const inputType = (element as HTMLInputElement).type
    if (['button', 'submit', 'reset', 'checkbox', 'radio'].includes(inputType)) {
      return true
    }
  }
  
  // Check roles
  const role = element.getAttribute('role')
  if (['button', 'link', 'checkbox', 'radio', 'switch', 'tab'].includes(role || '')) {
    return true
  }
  
  // Check for event handlers
  if (
    element.hasAttribute('onclick') ||
    element.hasAttribute('onmousedown') ||
    element.hasAttribute('ontouchstart')
  ) {
    return true
  }
  
  // Check for touch-target class
  if (element.classList.contains('touch-target')) {
    return true
  }
  
  // Check cursor style
  const style = window.getComputedStyle(element)
  if (style.cursor === 'pointer') {
    return true
  }
  
  // Check tabindex (but not -1 which means not focusable)
  const tabindex = element.getAttribute('tabindex')
  if (tabindex !== null && tabindex !== '-1') {
    return true
  }
  
  return false
}

/**
 * Check if an element meets minimum touch target requirements
 */
function checkTouchTarget(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= MIN_TOUCH_SIZE && rect.height >= MIN_TOUCH_SIZE
}

/**
 * Audit all interactive elements on the current page
 */
export function auditTouchTargets(): TouchTargetAuditSummary {
  const results: TouchTargetAuditResult[] = []
  
  // Get all elements in the document
  const allElements = document.querySelectorAll('*')
  
  allElements.forEach((element) => {
    // Skip non-visible elements
    if (!isElementVisible(element)) {
      return
    }
    
    // Skip non-interactive elements
    if (!isInteractiveElement(element)) {
      return
    }
    
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)
    const isCompliant = checkTouchTarget(element)
    
    results.push({
      element,
      tagName: element.tagName,
      identifier: getElementIdentifier(element),
      width: rect.width,
      height: rect.height,
      isCompliant,
      location: { x: rect.left, y: rect.top },
      computedStyle: {
        cursor: style.cursor,
        display: style.display,
        visibility: style.visibility,
      },
    })
  })
  
  const compliantElements = results.filter((r) => r.isCompliant).length
  const nonCompliantElements = results.filter((r) => !r.isCompliant).length
  const totalElements = results.length
  const complianceRate = totalElements > 0 ? (compliantElements / totalElements) * 100 : 100
  
  return {
    totalElements,
    compliantElements,
    nonCompliantElements,
    complianceRate,
    results,
    timestamp: new Date(),
  }
}

/**
 * Format audit results as a readable report
 */
export function formatAuditReport(summary: TouchTargetAuditSummary): string {
  const lines: string[] = []
  
  lines.push('='.repeat(80))
  lines.push('TOUCH TARGET AUDIT REPORT')
  lines.push('='.repeat(80))
  lines.push(`Timestamp: ${summary.timestamp.toISOString()}`)
  lines.push(`Minimum required size: ${MIN_TOUCH_SIZE}×${MIN_TOUCH_SIZE}px`)
  lines.push('')
  
  lines.push('SUMMARY')
  lines.push('-'.repeat(80))
  lines.push(`Total interactive elements: ${summary.totalElements}`)
  lines.push(`Compliant elements: ${summary.compliantElements}`)
  lines.push(`Non-compliant elements: ${summary.nonCompliantElements}`)
  lines.push(`Compliance rate: ${summary.complianceRate.toFixed(1)}%`)
  lines.push('')
  
  if (summary.nonCompliantElements > 0) {
    lines.push('NON-COMPLIANT ELEMENTS')
    lines.push('-'.repeat(80))
    
    const nonCompliant = summary.results.filter((r) => !r.isCompliant)
    nonCompliant.forEach((result, index) => {
      lines.push(`${index + 1}. ${result.identifier}`)
      lines.push(`   Size: ${result.width.toFixed(1)}×${result.height.toFixed(1)}px`)
      lines.push(`   Location: (${result.location.x.toFixed(0)}, ${result.location.y.toFixed(0)})`)
      lines.push(`   Tag: <${result.tagName.toLowerCase()}>`)
      lines.push('')
    })
  } else {
    lines.push('✓ All interactive elements are compliant!')
    lines.push('')
  }
  
  lines.push('='.repeat(80))
  
  return lines.join('\n')
}

/**
 * Log audit results to console with formatting
 */
export function logAuditResults(summary: TouchTargetAuditSummary): void {
  console.group('🎯 Touch Target Audit')
  console.log(formatAuditReport(summary))
  
  if (summary.nonCompliantElements > 0) {
    console.group('Non-compliant elements (detailed)')
    summary.results
      .filter((r) => !r.isCompliant)
      .forEach((result) => {
        console.log(result.identifier, result.element)
      })
    console.groupEnd()
  }
  
  console.groupEnd()
}

/**
 * Run audit and return summary (can be called from console or DevTools)
 */
export function runTouchTargetAudit(): TouchTargetAuditSummary {
  const summary = auditTouchTargets()
  logAuditResults(summary)
  return summary
}

// Make available on window for easy console access in dev mode
if (typeof window !== 'undefined' && (import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === '1')) {
  (window as any).auditTouchTargets = runTouchTargetAudit
}

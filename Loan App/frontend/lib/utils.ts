import { RiskGrade } from '@/types'

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date strings
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format datetime strings
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get risk grade color
 */
export function getRiskGradeColor(grade: RiskGrade): string {
  switch (grade) {
    case RiskGrade.A:
      return 'bg-success-100 text-success-700'
    case RiskGrade.B:
      return 'bg-primary-100 text-primary-700'
    case RiskGrade.C:
      return 'bg-warning-100 text-warning-700'
    case RiskGrade.D:
      return 'bg-danger-100 text-danger-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Get risk grade label
 */
export function getRiskGradeLabel(grade: RiskGrade): string {
  switch (grade) {
    case RiskGrade.A:
      return 'Low Risk'
    case RiskGrade.B:
      return 'Medium-Low Risk'
    case RiskGrade.C:
      return 'Medium-High Risk'
    case RiskGrade.D:
      return 'High Risk'
    default:
      return 'Unknown'
  }
}

/**
 * Calculate basis points as percentage
 */
export function basisPointsToPercentage(bp: number): number {
  return bp / 100
}

/**
 * Format basis points
 */
export function formatBasisPoints(bp: number): string {
  return `${basisPointsToPercentage(bp).toFixed(2)}%`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Calculate payment ratio
 */
export function calculatePaymentRatio(emisPaid: number, emisMissed: number): number {
  const total = emisPaid + emisMissed
  if (total === 0) return 100
  return (emisPaid / total) * 100
}

/**
 * Validate NEAR account ID format
 */
export function isValidNEARAccount(accountId: string): boolean {
  // Basic validation for NEAR account format
  const regex = /^[a-z0-9_-]+\.(testnet|near)$/
  return regex.test(accountId)
}

/**
 * Calculate ROI
 */
export function calculateROI(currentValue: number, initialValue: number): number {
  if (initialValue === 0) return 0
  return ((currentValue - initialValue) / initialValue) * 100
}

/**
 * Sort array of objects by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

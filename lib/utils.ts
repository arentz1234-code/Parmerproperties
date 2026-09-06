import { cn as _cn } from 'cn'

// ─── Tailwind Class Merger ────────────────────────────────────────────────────

// Re-export cn from the 'cn' package (drop-in for twMerge + clsx combined)
export function cn(...inputs: unknown[]): string {
  return _cn(...(inputs as Parameters<typeof _cn>))
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 5) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${diffYears}y ago`
}

// ─── String Utilities ─────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '…'
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// ─── Financial ────────────────────────────────────────────────────────────────

/**
 * Calculate late fee based on rent amount, days late, and a daily rate.
 * Defaults to 5% of rent for the first day, plus 0.1% per additional day.
 */
export function calculateLateFee(
  rentAmount: number,
  daysLate: number,
  dailyRate: number = 0.001,
): number {
  if (daysLate <= 0) return 0
  const baseFee = rentAmount * 0.05
  const additionalFee = daysLate > 1 ? rentAmount * dailyRate * (daysLate - 1) : 0
  return Math.round((baseFee + additionalFee) * 100) / 100
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffMs = targetMidnight.getTime() - nowMidnight.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function isOverdue(dueDate: Date | string): boolean {
  return getDaysUntil(dueDate) < 0
}

import Link from 'next/link'
import { CreditCard, Zap, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { RentRollTable } from '@/components/payments/rent-roll-table'
import { getRentRoll, generateMonthlyCharges } from '@/lib/actions/payment-actions'
import { PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

// ─── Generate Charges Button ──────────────────────────────────────────────────

import { GenerateChargesButton } from '@/components/payments/generate-charges-button'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PaymentsPage() {
  const result = await getRentRoll()
  const rows = result.success ? result.data : []

  // Summary stats
  const occupied = rows.filter((r) => r.lease !== null)
  const totalExpected = occupied.reduce((sum, r) => sum + (r.lease?.rentAmount ?? 0), 0)
  const totalCollected = occupied.reduce((sum, r) => {
    if (!r.currentPayment) return sum
    if (
      r.currentPayment.status === PaymentStatus.PAID ||
      r.currentPayment.status === PaymentStatus.PARTIAL
    ) {
      return sum + r.currentPayment.amount
    }
    return sum
  }, 0)
  const outstanding = totalExpected - totalCollected
  const overdueCount = occupied.filter(
    (r) => r.currentPayment?.status === PaymentStatus.OVERDUE,
  ).length

  const summaryCards = [
    {
      label: 'Total Expected',
      value: formatCurrency(totalExpected),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Collected',
      value: formatCurrency(totalCollected),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(outstanding),
      icon: CreditCard,
      color: outstanding > 0 ? 'text-orange-600' : 'text-gray-500',
      bg: outstanding > 0 ? 'bg-orange-50' : 'bg-gray-50',
    },
    {
      label: 'Overdue Tenants',
      value: String(overdueCount),
      icon: AlertTriangle,
      color: overdueCount > 0 ? 'text-red-600' : 'text-gray-500',
      bg: overdueCount > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Payments & Rent Roll"
        description="September 2026 — monthly overview"
      >
        <Link href="/manager/payments/history" className={buttonVariants({ variant: 'outline' })}>
          Payment History
        </Link>
        <GenerateChargesButton />
        <Link href="/manager/payments/record" className={buttonVariants({})}>
          <CreditCard size={14} />
          Record Payment
        </Link>
      </PageHeader>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} size="sm">
              <CardContent className="flex items-center gap-3 pt-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon size={16} className={card.color} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Rent Roll Table */}
      <RentRollTable rows={rows} />
    </div>
  )
}

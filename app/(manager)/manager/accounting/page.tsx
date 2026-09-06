import { DollarSign, TrendingUp, TrendingDown, Landmark } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { getPayments } from '@/lib/actions/payment-actions'
import { getLeases } from '@/lib/actions/lease-actions'
import { getTenants } from '@/lib/actions/tenant-actions'
import { getUnits } from '@/lib/actions/unit-actions'
import { LeaseStatus, PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AccountingPage() {
  const [paymentsResult, leasesResult, activeLeaseResult, tenantsResult, unitsResult] =
    await Promise.all([
      getPayments(),
      getLeases(),
      getLeases({ status: LeaseStatus.ACTIVE }),
      getTenants(),
      getUnits(),
    ])

  const payments = paymentsResult.success ? paymentsResult.data : []
  const allLeases = leasesResult.success ? leasesResult.data : []
  const activeLeases = activeLeaseResult.success ? activeLeaseResult.data : []
  const tenants = tenantsResult.success ? tenantsResult.data : []
  const units = unitsResult.success ? unitsResult.data : []

  // Compute monthly stats (current month = Sept 2026)
  const now = new Date('2026-09-01')
  const currentMonthPayments = payments.filter(
    (p) =>
      p.dueDate.getFullYear() === now.getFullYear() &&
      p.dueDate.getMonth() === now.getMonth(),
  )

  const totalIncome = currentMonthPayments
    .filter((p) => p.status === PaymentStatus.PAID || p.status === PaymentStatus.PARTIAL)
    .reduce((sum, p) => sum + p.amount, 0)

  // Simulated expenses (maintenance costs etc.)
  const totalExpenses = 2340
  const noi = totalIncome - totalExpenses

  const totalDeposits = activeLeases.reduce((sum, l) => sum + l.deposit + (l.petDeposit ?? 0), 0)

  return (
    <div>
      <PageHeader title="Accounting" description="Financial overview for September 2026" />

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Income This Month"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp size={18} />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Total Expenses This Month"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown size={18} />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <StatCard
          title="Net Operating Income"
          value={formatCurrency(noi)}
          icon={<DollarSign size={18} />}
          iconColor={noi >= 0 ? 'text-blue-600' : 'text-red-600'}
          iconBgColor={noi >= 0 ? 'bg-blue-100' : 'bg-red-100'}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Security Deposits</TabsTrigger>
          <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Tenant</th>
                      <th className="pb-3 pr-4">Unit</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4 text-right">Amount</th>
                      <th className="pb-3 pr-4">Method</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      payments
                        .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
                        .map((payment) => {
                          const tenant = tenants.find((t) => t.id === payment.tenantId)
                          const lease = allLeases.find((l) => l.id === payment.leaseId)
                          const unit = lease ? units.find((u) => u.id === lease.unitId) : undefined
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="py-3 pr-4 text-gray-700">
                                {formatDate(payment.paidAt ?? payment.dueDate)}
                              </td>
                              <td className="py-3 pr-4 text-gray-900 font-medium">
                                {tenant
                                  ? `${tenant.firstName} ${tenant.lastName}`
                                  : payment.tenantId}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {unit ? `Unit ${unit.unitNumber}` : '—'}
                              </td>
                              <td className="py-3 pr-4 text-gray-700">Rent</td>
                              <td className="py-3 pr-4 text-right font-medium text-gray-900">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="py-3 pr-4 text-gray-600">
                                {payment.method ?? '—'}
                              </td>
                              <td className="py-3">
                                <StatusBadge status={payment.status} />
                              </td>
                            </tr>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Deposits Tab */}
        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Security Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="pb-3 pr-4">Tenant</th>
                      <th className="pb-3 pr-4">Unit</th>
                      <th className="pb-3 pr-4 text-right">Deposit Held</th>
                      <th className="pb-3">Move-in Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeLeases.map((lease) => {
                      const tenant = tenants.find((t) => t.id === lease.tenantId)
                      const unit = units.find((u) => u.id === lease.unitId)
                      return (
                        <tr key={lease.id} className="hover:bg-gray-50">
                          <td className="py-3 pr-4 font-medium text-gray-900">
                            {tenant ? `${tenant.firstName} ${tenant.lastName}` : lease.tenantId}
                          </td>
                          <td className="py-3 pr-4 text-gray-600">
                            {unit ? `Unit ${unit.unitNumber}` : '—'}
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-gray-900">
                            {formatCurrency(lease.deposit + (lease.petDeposit ?? 0))}
                          </td>
                          <td className="py-3 text-gray-600">{formatDate(lease.startDate)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={2} className="pt-3 pr-4 font-semibold text-gray-900">
                        Total Deposits Held
                      </td>
                      <td className="pt-3 pr-4 text-right font-bold text-gray-900 text-base">
                        {formatCurrency(totalDeposits)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Reconciliation Tab */}
        <TabsContent value="reconciliation">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-gray-100">
                <Landmark size={24} className="text-gray-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  Connect your bank account to enable automatic reconciliation
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Sync transactions directly from your bank to reconcile payments automatically.
                </p>
              </div>
              <Button disabled>Connect Bank</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

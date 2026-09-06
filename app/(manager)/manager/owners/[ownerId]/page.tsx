import { notFound } from 'next/navigation'
import { Mail, Phone, MapPin, Building2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOwnerById } from '@/lib/actions/owner-actions'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ ownerId: string }>
}

// Simulated owner statement data
const MONTHS = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026']

function buildStatement(ownedCount: number) {
  const baseRent = ownedCount * 2400
  return MONTHS.map((month, i) => {
    const income = baseRent + (i * 120)
    const expenses = 340 + (i * 30)
    return { month, income, expenses, net: income - expenses }
  })
}

export default async function OwnerDetailPage({ params }: PageProps) {
  const { ownerId } = await params

  const result = await getOwnerById(ownerId)
  if (!result.success) notFound()
  const owner = result.data

  const statement = buildStatement(owner.properties.length)

  const incomeYTD = statement.reduce((sum, r) => sum + r.income, 0)
  const expensesYTD = statement.reduce((sum, r) => sum + r.expenses, 0)
  const netYTD = incomeYTD - expensesYTD

  return (
    <div>
      <PageHeader
        title={`${owner.firstName} ${owner.lastName}`}
        description="Owner profile and financial overview"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={16} className="shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{owner.email}</p>
              </div>
            </div>
            {owner.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{owner.phone}</p>
                </div>
              </div>
            )}
            {owner.address && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{owner.address}</p>
                </div>
              </div>
            )}
            {owner.taxId && (
              <div>
                <p className="text-xs text-gray-500">Tax ID</p>
                <p className="font-medium text-gray-900">***-**-{owner.taxId.slice(-4)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Owner since</p>
              <p className="font-medium text-gray-900">{formatDate(owner.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Properties Owned */}
        <Card>
          <CardHeader>
            <CardTitle>Properties Owned</CardTitle>
          </CardHeader>
          <CardContent>
            {owner.properties.length === 0 ? (
              <p className="text-sm text-gray-500">No properties currently assigned.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {owner.properties.map((prop) => (
                  <div key={prop.id} className="flex items-start justify-between py-3 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50">
                        <Building2 size={14} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{prop.name}</p>
                        <p className="text-xs text-gray-500">{prop.address}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {prop.ownershipShare}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Income YTD</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(incomeYTD)}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <TrendingDown size={16} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Expenses YTD</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(expensesYTD)}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <DollarSign size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Income YTD</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(netYTD)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Owner Statement Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Owner Statement — 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 pr-4 text-right">Gross Rent</th>
                  <th className="pb-3 pr-4 text-right">Expenses</th>
                  <th className="pb-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statement.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{row.month}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">
                      {formatCurrency(row.income)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-red-600">
                      ({formatCurrency(row.expenses)})
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">
                      {formatCurrency(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="pt-3 pr-4 font-semibold text-gray-900">YTD Total</td>
                  <td className="pt-3 pr-4 text-right font-semibold text-gray-900">
                    {formatCurrency(incomeYTD)}
                  </td>
                  <td className="pt-3 pr-4 text-right font-semibold text-red-600">
                    ({formatCurrency(expensesYTD)})
                  </td>
                  <td className="pt-3 text-right font-bold text-gray-900">
                    {formatCurrency(netYTD)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

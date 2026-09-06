'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRevenueByMonth } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

// Simulated expense data alongside revenue
const MOCK_EXPENSES: Record<string, number> = {
  'Apr 2026': 1850,
  'May 2026': 2100,
  'Jun 2026': 1650,
  'Jul 2026': 2340,
  'Aug 2026': 1920,
  'Sep 2026': 2280,
}

export default function IncomeExpensePage() {
  const revenueData = getRevenueByMonth(6)

  const chartData = revenueData.map((row) => ({
    month: row.month,
    income: row.collected,
    expenses: MOCK_EXPENSES[row.month] ?? 2000,
    net: row.collected - (MOCK_EXPENSES[row.month] ?? 2000),
  }))

  const totalIncome = chartData.reduce((sum, r) => sum + r.income, 0)
  const totalExpenses = chartData.reduce((sum, r) => sum + r.expenses, 0)
  const totalNet = totalIncome - totalExpenses

  return (
    <div>
      <PageHeader
        title="Income &amp; Expense"
        description="Profit &amp; Loss overview across your portfolio"
      />

      {/* Date Range Selector (UI only) */}
      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center gap-4 py-3">
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="month"
              defaultValue="2026-04"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
              readOnly
            />
            <span className="text-gray-500">to</span>
            <input
              type="month"
              defaultValue="2026-09"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Income vs. Expenses — Last 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  formatCurrency(value as number),
                  (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
                ]}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, fill: '#ef4444' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 pr-4 text-right">Income</th>
                  <th className="pb-3 pr-4 text-right">Expenses</th>
                  <th className="pb-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {chartData.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{row.month}</td>
                    <td className="py-2.5 pr-4 text-right text-green-600">
                      {formatCurrency(row.income)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-red-600">
                      ({formatCurrency(row.expenses)})
                    </td>
                    <td
                      className={`py-2.5 text-right font-semibold ${
                        row.net >= 0 ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="pt-3 pr-4 font-semibold text-gray-900">Total</td>
                  <td className="pt-3 pr-4 text-right font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </td>
                  <td className="pt-3 pr-4 text-right font-bold text-red-600">
                    ({formatCurrency(totalExpenses)})
                  </td>
                  <td className="pt-3 text-right font-bold text-gray-900">
                    {formatCurrency(totalNet)}
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

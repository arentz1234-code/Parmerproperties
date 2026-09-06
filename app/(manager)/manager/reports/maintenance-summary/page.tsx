'use client'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { maintenanceRequests } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#6366f1',
  PENDING_PARTS: '#f97316',
  COMPLETED: '#22c55e',
  CANCELLED: '#9ca3af',
}

const CATEGORY_COLORS = [
  '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444',
  '#eab308', '#06b6d4', '#ec4899',
]

export default function MaintenanceSummaryPage() {
  const requests = maintenanceRequests

  // Status distribution for pie chart
  const statusCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // Category distribution for bar chart
  const categoryCounts = requests.reduce<Record<string, number>>((acc, r) => {
    const cat = r.category ?? 'General'
    acc[cat] = (acc[cat] ?? 0) + 1
    return acc
  }, {})

  const categoryData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  const totalCost = requests.reduce(
    (sum, r) => sum + (r.actualCost ?? r.estimatedCost ?? 0),
    0,
  )

  return (
    <div>
      <PageHeader title="Maintenance Summary" description="Request trends, costs, and status breakdown" />

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${(name ?? '').replace('_', ' ')} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] ?? '#9ca3af'}
                    />
                  ))}
                </Pie>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip formatter={(value: any) => [value as number, 'Requests']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Requests by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip />
                <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Maintenance Requests</CardTitle>
            <span className="text-sm text-gray-500">
              Total cost: <strong>{formatCurrency(totalCost)}</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Unit</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Est. Cost</th>
                  <th className="pb-3 text-right">Actual Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900 max-w-[220px] truncate">
                        {req.title}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(req.createdAt)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {req.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{req.unitId}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 pr-4 text-right text-gray-600">
                      {req.estimatedCost != null ? formatCurrency(req.estimatedCost) : '—'}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {req.actualCost != null ? formatCurrency(req.actualCost) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

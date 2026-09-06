import { Home, Building2, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { getUnits } from '@/lib/actions/unit-actions'
import { getProperties } from '@/lib/actions/property-actions'
import { UnitStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'

// Simulated days vacant (would come from lease end dates in production)
const DAYS_VACANT_MAP: Record<string, number> = {
  unit_rv1_102: 5,
  unit_rv1_103: 30,
  unit_rv1_202: 12,
  unit_rv1_302: 60,
  unit_rv3_1a: 8,
}

export default async function VacancyReportPage() {
  const [unitsResult, propertiesResult] = await Promise.all([
    getUnits(),
    getProperties(),
  ])

  const units = unitsResult.success ? unitsResult.data : []
  const properties = propertiesResult.success ? propertiesResult.data : []

  const residentialUnits = units.filter((u) => u.bedrooms > 0)
  const vacantUnits = residentialUnits.filter((u) => u.status === UnitStatus.VACANT)
  const totalResidential = residentialUnits.length

  const vacancyRate =
    totalResidential > 0 ? Math.round((vacantUnits.length / totalResidential) * 100) : 0

  const estimatedMonthlyLost = vacantUnits.reduce((sum, u) => sum + u.rentAmount, 0)

  return (
    <div>
      <PageHeader title="Vacancy Report" description="Current vacant units and revenue impact" />

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Current Vacancy Rate"
          value={`${vacancyRate}%`}
          icon={<Building2 size={18} />}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <StatCard
          title="Vacant Units"
          value={vacantUnits.length}
          icon={<Home size={18} />}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatCard
          title="Est. Monthly Lost Revenue"
          value={formatCurrency(estimatedMonthlyLost)}
          icon={<DollarSign size={18} />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Vacant Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vacant Units</CardTitle>
        </CardHeader>
        <CardContent>
          {vacantUnits.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Building2 size={32} className="text-green-400" />
              <p className="font-medium text-gray-700">Full occupancy</p>
              <p className="text-sm text-gray-500">All residential units are currently occupied.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">Unit</th>
                    <th className="pb-3 pr-4">Property</th>
                    <th className="pb-3 pr-4 text-right">Sqft</th>
                    <th className="pb-3 pr-4 text-right">Rent</th>
                    <th className="pb-3 pr-4 text-right">Days Vacant</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vacantUnits.map((unit) => {
                    const property = properties.find((p) => p.id === unit.propertyId)
                    const daysVacant = DAYS_VACANT_MAP[unit.id] ?? 14

                    return (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">Unit {unit.unitNumber}</p>
                          <p className="text-xs text-gray-500">
                            {unit.bedrooms}bd / {unit.bathrooms}ba
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{property?.name ?? '—'}</td>
                        <td className="py-3 pr-4 text-right text-gray-600">
                          {unit.sqft ? `${unit.sqft.toLocaleString()} sqft` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-gray-900">
                          {formatCurrency(unit.rentAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span
                            className={`font-semibold ${
                              daysVacant > 30
                                ? 'text-red-600'
                                : daysVacant > 14
                                ? 'text-orange-600'
                                : 'text-yellow-600'
                            }`}
                          >
                            {daysVacant}d
                          </span>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={unit.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

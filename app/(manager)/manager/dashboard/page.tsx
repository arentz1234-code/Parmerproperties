import {
  Building2,
  CheckCircle2,
  Home,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Wrench,
  ClipboardList,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { OccupancyChart } from '@/components/dashboard/occupancy-chart'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { MaintenanceSnapshot } from '@/components/dashboard/maintenance-snapshot'
import {
  getDashboardKPIs,
  getOccupancyByProperty,
  getRevenueByMonth,
  getRecentActivity,
  type ActivityItem,
} from '@/lib/mock-data'
import { getMaintenanceRequests } from '@/lib/actions/maintenance-actions'
import { MaintenanceStatus, UnitStatus, type DashboardKPIs, type MaintenanceRequest } from '@/types'
import { units } from '@/lib/mock-data'

export default async function DashboardPage() {
  let kpis: DashboardKPIs
  let occupancy: ReturnType<typeof getOccupancyByProperty>
  let revenue: ReturnType<typeof getRevenueByMonth>
  let activity: ActivityItem[]
  let maintenance: MaintenanceRequest[]

  try {
    kpis = getDashboardKPIs()
    occupancy = getOccupancyByProperty()
    revenue = getRevenueByMonth(6)
    activity = getRecentActivity()
  } catch (e) {
    console.error('Dashboard data error:', e)
    kpis = {
      totalUnits: 0,
      occupiedUnits: 0,
      vacantUnits: 0,
      occupancyRate: 0,
      rentCollectedThisMonth: 0,
      overduePayments: 0,
      openMaintenanceRequests: 0,
      pendingApplications: 0,
      totalProperties: 0,
      activeLeases: 0,
    }
    occupancy = []
    revenue = []
    activity = []
  }

  try {
    const maintResult = await getMaintenanceRequests({ status: MaintenanceStatus.OPEN })
    maintenance = maintResult.success ? maintResult.data : []
  } catch (e) {
    console.error('Maintenance data error:', e)
    maintenance = []
  }

  // Build unit status counts for occupancy donut
  const unitCounts = {
    occupied: units.filter((u) => u.status === UnitStatus.OCCUPIED).length,
    vacant: units.filter((u) => u.status === UnitStatus.VACANT).length,
    notice: units.filter((u) => u.status === UnitStatus.NOTICE).length,
    maintenance: units.filter((u) => u.status === UnitStatus.MAINTENANCE).length,
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Welcome back, Andrew" />

      {/* KPI Stat Cards — 4 per row on xl, 2 on md */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
        <StatCard
          title="Total Units"
          value={kpis.totalUnits}
          icon={<Building2 size={18} />}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          href="/manager/properties"
        />
        <StatCard
          title="Occupied"
          value={kpis.occupiedUnits}
          icon={<CheckCircle2 size={18} />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Vacant"
          value={kpis.vacantUnits}
          icon={<Home size={18} />}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${kpis.occupancyRate}%`}
          icon={<TrendingUp size={18} />}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Rent Collected"
          value={fmt(kpis.rentCollectedThisMonth)}
          icon={<DollarSign size={18} />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Overdue"
          value={kpis.overduePayments}
          icon={<AlertCircle size={18} />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          href="/manager/payments"
        />
        <StatCard
          title="Open Maintenance"
          value={kpis.openMaintenanceRequests}
          icon={<Wrench size={18} />}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          href="/manager/maintenance"
        />
        <StatCard
          title="Pending Apps"
          value={kpis.pendingApplications}
          icon={<ClipboardList size={18} />}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          href="/manager/applications"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Unit Occupancy</h2>
          <p className="mb-4 text-xs text-gray-500">Current status across all units</p>
          <OccupancyChart
            occupied={unitCounts.occupied}
            vacant={unitCounts.vacant}
            notice={unitCounts.notice}
            maintenance={unitCounts.maintenance}
            occupancyRate={kpis.occupancyRate}
          />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Revenue</h2>
          <p className="mb-4 text-xs text-gray-500">Collected vs expected — last 6 months</p>
          <RevenueChart data={revenue} />
        </div>
      </div>

      {/* Activity + Maintenance row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Recent Activity</h2>
          <p className="mb-4 text-xs text-gray-500">Latest events across your portfolio</p>
          <RecentActivity items={activity} />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Open Maintenance</h2>
          <p className="mb-4 text-xs text-gray-500">Top open requests needing attention</p>
          <MaintenanceSnapshot requests={maintenance} />
        </div>
      </div>
    </div>
  )
}

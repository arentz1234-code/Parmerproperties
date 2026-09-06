import Link from 'next/link'
import {
  FileText,
  Home,
  DollarSign,
  Wrench,
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'

const REPORTS = [
  {
    icon: FileText,
    title: 'Rent Roll',
    description: 'Current month rent collection status across all units',
    href: '/manager/reports/rent-roll',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    icon: Home,
    title: 'Vacancy',
    description: 'Vacant units, days on market, and estimated lost revenue',
    href: '/manager/reports/vacancy',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
  },
  {
    icon: DollarSign,
    title: 'Income & Expense',
    description: 'P&L report with monthly income vs. expense breakdown',
    href: '/manager/reports/income-expense',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    icon: Wrench,
    title: 'Maintenance Summary',
    description: 'Maintenance requests by status, category, and cost',
    href: '/manager/reports/maintenance-summary',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    icon: Users,
    title: 'Owner Statement',
    description: 'Monthly owner statements with income and expense detail',
    href: '/manager/owners',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
  {
    icon: Shield,
    title: 'Security Deposits',
    description: 'Deposit balances held for all active leases',
    href: '/manager/accounting',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    icon: AlertTriangle,
    title: 'Delinquency',
    description: 'Overdue accounts, days past due, and collection status',
    href: '/manager/delinquency',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  {
    icon: TrendingUp,
    title: 'Occupancy History',
    description: 'Historical occupancy trends by property over time',
    href: '/manager/reports/vacancy',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
  },
]

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and view financial and operational reports for your portfolio"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORTS.map((report) => {
          const Icon = report.icon
          return (
            <div
              key={report.title}
              className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${report.iconBg}`}>
                <Icon size={20} className={report.iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{report.description}</p>
              </div>
              <Link
                href={report.href}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Run Report
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

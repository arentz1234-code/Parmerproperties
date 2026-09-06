import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from 'cn'

interface StatCardProps {
  title: string
  value: string | number
  change?: number // percentage change, positive or negative
  changeLabel?: string
  icon: React.ReactNode
  iconColor?: string // tailwind text color class
  iconBgColor?: string // tailwind bg class like "bg-blue-100"
  href?: string
}

function StatCardInner({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className="relative flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 h-full">
      {/* Icon */}
      <div
        className={cn(
          'absolute top-5 right-5 flex size-10 items-center justify-center rounded-full',
          iconBgColor
        )}
      >
        <span className={cn('flex items-center justify-center', iconColor)}>{icon}</span>
      </div>

      {/* Value + title */}
      <div className="pr-14">
        <p className="text-sm font-medium text-gray-500 leading-none mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 leading-none tabular-nums">
          {value}
        </p>
      </div>

      {/* Delta chip */}
      {change !== undefined && (
        <div className="mt-auto pt-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive && 'bg-green-100 text-green-700',
              isNegative && 'bg-red-100 text-red-700',
              change === 0 && 'bg-gray-100 text-gray-600'
            )}
          >
            {isPositive && <TrendingUp size={11} />}
            {isNegative && <TrendingDown size={11} />}
            {isPositive ? '+' : ''}
            {change}%
            {changeLabel && (
              <span className="font-normal text-[11px] opacity-80 ml-0.5">{changeLabel}</span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export function StatCard(props: StatCardProps) {
  if (props.href) {
    return (
      <Link href={props.href} className="block h-full group">
        <div className="h-full transition-shadow group-hover:shadow-md rounded-xl">
          <StatCardInner {...props} />
        </div>
      </Link>
    )
  }
  return <StatCardInner {...props} />
}

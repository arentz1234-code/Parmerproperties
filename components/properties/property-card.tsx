'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, Building2, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Property } from '@/types'
import { deleteProperty } from '@/lib/actions/property-actions'

const TYPE_BADGE_COLORS: Record<string, string> = {
  APARTMENT: 'bg-blue-100 text-blue-700',
  HOUSE: 'bg-green-100 text-green-700',
  COMMERCIAL: 'bg-gray-100 text-gray-700',
  CONDO: 'bg-purple-100 text-purple-700',
  TOWNHOUSE: 'bg-orange-100 text-orange-700',
}

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  COMMERCIAL: 'Commercial',
  CONDO: 'Condo',
  TOWNHOUSE: 'Townhouse',
}

interface PropertyCardProps {
  property: Property
  stats: {
    total: number
    occupied: number
    vacant: number
    notice: number
    avgRent: number
    occupancyRate: number
  }
}

export function PropertyCard({ property, stats }: PropertyCardProps) {
  const router = useRouter()

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${property.name}"? This cannot be undone.`)) return
    try {
      await deleteProperty(property.id)
      router.refresh()
    } catch {
      alert('Failed to delete property.')
    }
  }

  function navigateTo(path: string, e: React.MouseEvent) {
    e.stopPropagation()
    router.push(path)
  }

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/manager/properties/${property.id}`)}
    >
      {/* Three-dot menu */}
      <div
        className="absolute right-3 top-3"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            }
          >
            <MoreHorizontal size={15} />
            <span className="sr-only">Property actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={(e) => navigateTo(`/manager/properties/${property.id}`, e)}>
              <Eye size={14} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => navigateTo(`/manager/properties/${property.id}/edit`, e)}>
              <Pencil size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Icon + name */}
      <div className="flex items-start gap-3 pr-8">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2D3561]/10">
          <Building2 size={18} className="text-[#2D3561]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {property.name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
            {property.address}, {property.city}, {property.state}
          </p>
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            TYPE_BADGE_COLORS[property.type] ?? 'bg-gray-100 text-gray-700'
          )}
        >
          {TYPE_LABELS[property.type] ?? property.type}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">{stats.total}</p>
          <p className="mt-0.5 text-xs text-gray-500">Units</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">
            {stats.occupancyRate}%
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Occupied</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">
            ${Math.round(stats.avgRent / 100) * 100 === stats.avgRent
              ? stats.avgRent.toLocaleString()
              : Math.round(stats.avgRent).toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Avg Rent</p>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
            stats.vacant > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          <span className={cn('size-1.5 rounded-full', stats.vacant > 0 ? 'bg-red-500' : 'bg-gray-400')} />
          {stats.vacant} vacant
        </span>
        {stats.notice > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-700">
            <span className="size-1.5 rounded-full bg-yellow-500" />
            {stats.notice} notice
          </span>
        )}
      </div>
    </div>
  )
}

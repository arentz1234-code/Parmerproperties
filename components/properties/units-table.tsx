'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { cn } from 'cn'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/status-badge'
import { deleteUnit } from '@/lib/actions/unit-actions'
import type { Unit } from '@/types'

interface UnitsTableProps {
  units: Unit[]
  propertyId: string
  /** When true, shows a "Property" column — used on the global /units page */
  showProperty?: boolean
  propertyName?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export function UnitsTable({
  units,
  propertyId,
  showProperty = false,
  propertyName,
}: UnitsTableProps) {
  const router = useRouter()

  async function handleDelete(unitId: string, unitNumber: string) {
    if (!confirm(`Delete unit ${unitNumber}? This cannot be undone.`)) return
    try {
      await deleteUnit(unitId)
      router.refresh()
    } catch {
      alert('Failed to delete unit.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{units.length} unit{units.length !== 1 ? 's' : ''}</p>
        <a href={`/manager/properties/${propertyId}/units/new`} className={buttonVariants({ size: 'sm' })}>
          <Plus size={13} />
          Add Unit
        </a>
      </div>

      <div className="w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
              {showProperty && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Floor Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Bed/Bath</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sqft</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.length === 0 ? (
              <tr>
                <td
                  colSpan={showProperty ? 8 : 7}
                  className="px-4 py-14 text-center text-sm text-gray-400"
                >
                  No units yet.{' '}
                  <a
                    href={`/manager/properties/${propertyId}/units/new`}
                    className="text-blue-600 hover:underline"
                  >
                    Add the first unit.
                  </a>
                </td>
              </tr>
            ) : (
              units.map((unit, i) => (
                <tr
                  key={unit.id}
                  className={cn(
                    'transition-colors cursor-pointer hover:bg-blue-50/60',
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  )}
                  onClick={() => router.push(`/manager/properties/${propertyId}/units/${unit.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {unit.unitNumber}
                  </td>
                  {showProperty && (
                    <td className="px-4 py-3 text-gray-600">{propertyName ?? '—'}</td>
                  )}
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {unit.notes
                      ? unit.notes.split('—')[0].trim().replace(' floor plan', '')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {unit.bedrooms}bd / {unit.bathrooms}ba
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {unit.sqft ? unit.sqft.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 tabular-nums">
                    {fmt(unit.rentAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={unit.status} />
                  </td>
                  <td
                    className="px-4 py-3 text-right w-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-gray-400 hover:text-gray-600"
                          />
                        }
                      >
                        <MoreHorizontal size={15} />
                        <span className="sr-only">Unit actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => router.push(`/manager/properties/${propertyId}/units/${unit.id}`)}
                        >
                          <Eye size={14} className="mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/manager/properties/${propertyId}/units/${unit.id}/edit`)}
                        >
                          <Pencil size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(unit.id, unit.unitNumber)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

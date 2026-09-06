'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from 'cn'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { deleteUnit } from '@/lib/actions/unit-actions'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import type { Unit, Property } from '@/types'

// Build enriched unit list
const enrichedUnits = units.map((unit) => ({
  ...unit,
  propertyName: properties.find((p: Property) => p.id === unit.propertyId)?.name ?? '—',
}))

type EnrichedUnit = (typeof enrichedUnits)[number]

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'VACANT', label: 'Vacant' },
  { value: 'NOTICE', label: 'Notice' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
]

export default function UnitsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  const propertyOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Properties' },
      ...properties.map((p: Property) => ({ value: p.id, label: p.name })),
    ]
  }, [])

  const filtered = useMemo(() => {
    let result = enrichedUnits

    if (selectedProperty !== 'ALL') {
      result = result.filter((u) => u.propertyId === selectedProperty)
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((u) => u.status === selectedStatus)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.unitNumber.toLowerCase().includes(q) ||
          u.propertyName.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q) ||
          (u.notes ?? '').toLowerCase().includes(q)
      )
    }

    return result
  }, [searchQuery, selectedProperty, selectedStatus])

  async function handleDelete(unit: EnrichedUnit) {
    if (!confirm(`Delete unit ${unit.unitNumber}? This cannot be undone.`)) return
    try {
      await deleteUnit(unit.id)
      router.refresh()
    } catch {
      alert('Failed to delete unit.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Units"
        description={`${enrichedUnits.length} total units across ${properties.length} properties`}
      >
        <a href="/manager/properties" className={buttonVariants({ size: 'sm' })}>
          <Plus size={13} />
          Add Unit
        </a>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search units..."
            className="pl-8"
          />
        </div>

        <Select
          value={selectedProperty}
          onValueChange={(v) => setSelectedProperty(v ?? 'ALL')}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            {propertyOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(v) => setSelectedStatus(v ?? 'ALL')}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(selectedProperty !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedProperty('ALL')
              setSelectedStatus('ALL')
            }}
          >
            Clear filters
          </Button>
        )}

        <p className="ml-auto text-xs text-gray-400">
          {filtered.length} of {enrichedUnits.length} units
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Property</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Bed / Bath</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Sqft</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Rent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-gray-400">
                  No units match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((unit, i) => (
                <tr
                  key={unit.id}
                  className={cn(
                    'transition-colors cursor-pointer hover:bg-blue-50/60',
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  )}
                  onClick={() =>
                    router.push(`/manager/properties/${unit.propertyId}/units/${unit.id}`)
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{unit.unitNumber}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <button
                      className="hover:underline hover:text-blue-600 text-left"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/manager/properties/${unit.propertyId}`)
                      }}
                    >
                      {unit.propertyName}
                    </button>
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
                          onClick={() =>
                            router.push(
                              `/manager/properties/${unit.propertyId}/units/${unit.id}`
                            )
                          }
                        >
                          <Eye size={14} className="mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/manager/properties/${unit.propertyId}/units/${unit.id}/edit`
                            )
                          }
                        >
                          <Pencil size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(unit)}
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
